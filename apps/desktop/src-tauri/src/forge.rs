use base64::Engine;
use reqwest::Url;

use crate::core::accounts;
use crate::error::{AppError, AppResult};
use crate::http::{HttpRequest, HttpResponse};

fn normalize(host: &str) -> String {
    host.trim().trim_end_matches('/').to_lowercase()
}

const NEEDS_HTTPS: &str = "forge requests need an absolute https URL";

fn remote_origin(host: &str) -> Option<(String, u16)> {
    let parsed = Url::parse(&format!("https://{}", normalize(host))).ok()?;
    let bare = parsed.username().is_empty()
        && parsed.password().is_none()
        && parsed.path() == "/"
        && parsed.query().is_none()
        && parsed.fragment().is_none();
    if !bare {
        return None;
    }
    let name = parsed.host_str()?.to_string();
    Some((name, parsed.port_or_known_default()?))
}

fn checked_request_url(host: &str, url: &str) -> AppResult<Url> {
    let parsed = Url::parse(url).map_err(|_| AppError::other(NEEDS_HTTPS))?;
    if parsed.scheme() != "https" {
        return Err(AppError::other(NEEDS_HTTPS));
    }
    if !parsed.username().is_empty() || parsed.password().is_some() {
        return Err(AppError::other(
            "forge request URLs must not carry userinfo",
        ));
    }
    let Some((remote_host, remote_port)) = remote_origin(host) else {
        return Err(AppError::other(format!("invalid remote host {host}")));
    };
    let url_host = parsed.host_str().unwrap_or_default();
    let api_host = format!("api.{remote_host}");
    let host_ok = url_host == remote_host || url_host == api_host;
    if !host_ok || parsed.port_or_known_default() != Some(remote_port) {
        let authority = parsed.authority();
        return Err(AppError::other(format!(
            "forge request to {authority} does not match the remote host {host}"
        )));
    }
    Ok(parsed)
}

fn auth_headers(
    provider: &str,
    token: &str,
    email: Option<&str>,
) -> AppResult<Vec<(String, String)>> {
    let mut headers = vec![("user-agent".to_string(), "AngKorGit".to_string())];
    match provider {
        "github" => {
            headers.push(("authorization".to_string(), format!("Bearer {token}")));
            headers.push((
                "accept".to_string(),
                "application/vnd.github+json".to_string(),
            ));
            headers.push(("x-github-api-version".to_string(), "2022-11-28".to_string()));
        }
        "bitbucket" => {
            let email = email.ok_or_else(|| {
                AppError::other(
                    "the Bitbucket account has no Atlassian email stored — reconnect it in \
                     Settings → Authentication",
                )
            })?;
            let basic =
                base64::engine::general_purpose::STANDARD.encode(format!("{email}:{token}"));
            headers.push(("authorization".to_string(), format!("Basic {basic}")));
        }
        other => {
            return Err(AppError::other(format!(
                "unsupported hosting provider '{other}'"
            )));
        }
    }
    Ok(headers)
}

fn bound_username(repo_path: Option<&str>, host: &str) -> Option<String> {
    let repo = crate::core::repo::open(repo_path?).ok()?;
    crate::core::remote::read_account_bindings(&repo)
        .get(&normalize(host))
        .cloned()
}

fn missing_account_message(host: &str, has_metadata: bool) -> String {
    if has_metadata {
        format!(
            "the token for {host} is missing from the system keychain — reconnect the account in Settings → Authentication"
        )
    } else {
        format!("no connected {host} account — connect one in Settings → Authentication")
    }
}

pub async fn request(
    repo_path: Option<String>,
    host: String,
    mut request: HttpRequest,
) -> AppResult<HttpResponse> {
    let url = checked_request_url(&host, &request.url)?;
    request.url = url.to_string();

    let headers = tauri::async_runtime::spawn_blocking({
        let host = host.clone();
        move || -> AppResult<Vec<(String, String)>> {
            let preferred = bound_username(repo_path.as_deref(), &host);
            let (account, token) = accounts::account_with_token(&host, preferred.as_deref())
                .ok_or_else(|| {
                    AppError::other(missing_account_message(&host, accounts::has_account(&host)))
                })?;
            auth_headers(&account.provider, &token, account.email.as_deref())
        }
    })
    .await
    .map_err(|e| AppError::other(e.to_string()))??;

    for (name, value) in headers {
        request.headers.insert(name, value);
    }
    crate::http::request_credentialed(request).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn missing_token_is_reported_differently_from_no_account() {
        let missing = missing_account_message("github.com", true);
        assert!(missing.contains("missing from the system keychain"));
        assert!(missing.contains("reconnect"));
        let none = missing_account_message("github.com", false);
        assert!(none.starts_with("no connected github.com account"));
    }

    fn allowed(host: &str, url: &str) -> bool {
        checked_request_url(host, url).is_ok()
    }

    #[test]
    fn github_com_requests_may_target_the_api_subdomain() {
        assert!(allowed("github.com", "https://api.github.com/user"));
        assert!(allowed("github.com", "https://github.com/a/b"));
        assert!(allowed("GitHub.com/", "https://API.github.com/user"));
        assert!(!allowed("github.com", "https://evilgithub.com/user"));
        assert!(!allowed(
            "github.com",
            "https://api.github.com.evil.dev/user"
        ));
    }

    #[test]
    fn enterprise_requests_stay_on_the_remote_host_and_port() {
        let port = "https://github.corp.dev:8443/api/v3/user";
        let default = "https://github.corp.dev/api/v3/user";
        assert!(allowed("github.corp.dev:8443", port));
        assert!(allowed("github.corp.dev:443", default));
        assert!(!allowed("github.corp.dev:8443", default));
        assert!(!allowed("github.corp.dev", port));
        assert!(!allowed("github.corp.dev", "https://github.com/user"));
    }

    #[test]
    fn credentials_are_never_sent_over_plain_http() {
        assert!(!allowed("github.com", "http://api.github.com/user"));
        assert!(!allowed("git.corp.dev", "http://git.corp.dev/api/user"));
        assert!(!allowed("github.com", "ftp://api.github.com/user"));
        assert!(!allowed("github.com", "api.github.com/user"));
    }

    #[test]
    fn urls_carrying_userinfo_are_refused() {
        assert!(!allowed("github.com", "https://x:y@api.github.com/user"));
        assert!(!allowed(
            "github.com",
            "https://api.github.com@evil.dev/user"
        ));
    }

    #[test]
    fn github_auth_uses_a_bearer_token_and_api_version() {
        let headers = auth_headers("github", "tok", None).unwrap();
        assert!(headers.contains(&("authorization".to_string(), "Bearer tok".to_string())));
        assert!(headers
            .iter()
            .any(|(name, _)| name == "x-github-api-version"));
        assert!(headers.contains(&("user-agent".to_string(), "AngKorGit".to_string())));
    }

    #[test]
    fn bitbucket_auth_requires_the_stored_email() {
        assert!(auth_headers("bitbucket", "tok", None).is_err());
        let headers = auth_headers("bitbucket", "tok", Some("dev@example.com")).unwrap();
        let basic = base64::engine::general_purpose::STANDARD.encode("dev@example.com:tok");
        assert!(headers.contains(&("authorization".to_string(), format!("Basic {basic}"))));
    }

    #[test]
    fn unknown_providers_are_rejected() {
        assert!(auth_headers("sourcehut", "tok", None).is_err());
        assert!(auth_headers("gitlab", "tok", None).is_err());
        assert!(auth_headers("gitlab-self", "tok", None).is_err());
    }
}
