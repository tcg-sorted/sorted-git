use base64::Engine;
use serde::Serialize;

use crate::core::accounts::{self, AccountInfo};
use crate::error::{AppError, AppResult};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountCheckResult {
    pub status: String,
    pub expires_at: Option<String>,
    pub accounts: Vec<AccountInfo>,
}

enum Verdict {
    Valid { expires_at: Option<String> },
    Unauthorized,
    Unreachable,
    Unsupported,
}

pub async fn check(host: String, username: String) -> AppResult<AccountCheckResult> {
    let account = run_blocking({
        let host = host.clone();
        let username = username.clone();
        move || accounts::find(&host, &username)
    })
    .await?
    .ok_or_else(|| AppError::other(format!("no account for {username} on {host}")))?;

    let token = run_blocking({
        let host = account.host.clone();
        let username = account.username.clone();
        move || accounts::token_of(&host, &username)
    })
    .await?;

    let Some(token) = token else {
        return Ok(AccountCheckResult {
            status: "no_token".into(),
            expires_at: None,
            accounts: run_blocking(accounts::list).await?,
        });
    };

    let verdict = probe(&account, &token).await;
    let (status, expires_at, outcome) = match verdict {
        Verdict::Valid { expires_at } => ("ok", expires_at.clone(), Some((true, expires_at))),
        Verdict::Unauthorized => ("unauthorized", None, Some((false, None))),
        Verdict::Unreachable => ("unreachable", None, None),
        Verdict::Unsupported => ("unsupported", None, None),
    };

    let accounts = match outcome {
        Some((ok, expires)) => {
            run_blocking({
                let host = account.host.clone();
                let username = account.username.clone();
                move || accounts::update_check(&host, &username, ok, expires)
            })
            .await??
        }
        None => run_blocking(accounts::list).await?,
    };

    Ok(AccountCheckResult {
        status: status.into(),
        expires_at,
        accounts,
    })
}

async fn run_blocking<T: Send + 'static>(
    task: impl FnOnce() -> T + Send + 'static,
) -> AppResult<T> {
    tauri::async_runtime::spawn_blocking(task)
        .await
        .map_err(|e| AppError::other(e.to_string()))
}

async fn probe(account: &AccountInfo, token: &str) -> Verdict {
    match account.provider.as_str() {
        "github" => probe_github(token).await,
        "bitbucket" => match &account.email {
            Some(email) => probe_bitbucket(email, token).await,
            None => Verdict::Unsupported,
        },
        _ => Verdict::Unsupported,
    }
}

async fn probe_github(token: &str) -> Verdict {
    let Ok(client) = crate::http::credentialed_client() else {
        return Verdict::Unreachable;
    };
    let response = client
        .get("https://api.github.com/user")
        .header("authorization", format!("Bearer {token}"))
        .header("accept", "application/vnd.github+json")
        .header("user-agent", "AngKorGit")
        .send()
        .await;
    match response {
        Ok(res) if res.status().is_success() => {
            let expires_at = res
                .headers()
                .get("github-authentication-token-expiration")
                .and_then(|value| value.to_str().ok())
                .map(str::to_string);
            Verdict::Valid { expires_at }
        }
        Ok(res) if res.status().as_u16() == 401 => Verdict::Unauthorized,
        _ => Verdict::Unreachable,
    }
}

async fn probe_bitbucket(email: &str, token: &str) -> Verdict {
    let Ok(client) = crate::http::credentialed_client() else {
        return Verdict::Unreachable;
    };
    let basic = base64::engine::general_purpose::STANDARD.encode(format!("{email}:{token}"));
    match client
        .get("https://api.bitbucket.org/2.0/user")
        .header("authorization", format!("Basic {basic}"))
        .header("user-agent", "AngKorGit")
        .send()
        .await
    {
        Ok(res) if res.status().is_success() => Verdict::Valid { expires_at: None },
        Ok(res) if res.status().as_u16() == 401 => Verdict::Unauthorized,
        _ => Verdict::Unreachable,
    }
}
