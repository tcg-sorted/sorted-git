# G18 — the two supported credential methods are SSH keys and access tokens

From §8 Hard-won gotchas. [All gotchas](README.md) · [Back to the index](../../../CLAUDE.md)

- **G18 — the two supported credential methods are SSH keys and access tokens**;
  OAuth sign-in was built (GitHub device flow) and then **deliberately removed** —
  it only ever helps github.com, ties the client id to the maintainer's personal
  OAuth app registration (forks cannot use it, deleting it breaks every user), and
  leaves Bitbucket/self-hosted second-class. Do not re-add it without a reason that
  survives those three points. Consequences to keep in mind: GitLab and Bitbucket
  OAuth tokens expire in **2 hours** with refresh tokens (GitHub's do not), so any
  future OAuth work needs refresh support in the credential callback FIRST — a bare
  access token there is worse than a PAT. Atlassian has no device grant at all.
