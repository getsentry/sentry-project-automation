# Automation for Sentry Github Projects

## Configuration

The repository must contain a
[secret](https://docs.github.com/en/actions/reference/encrypted-secrets) called
`MY_GITHUB_TOKEN` with a GitHub Personal Access Token with at least
`public_repo`, and `write:org` permissions.

| Permission | Reason |
| ---------- | ------ |
| `public_repo` | Required to search issues in public repositories |
| `write:org` | Required to create cards in an organization project (the team board) |

If running the code locally, the configuration is done through environment
variables. Requirements:

| Variable       | Description |
| -------------- | ----------- |
| `GITHUB_TOKEN` | A GitHub (Personal Access) Token with at least `public_repo` and `write:org` permissions (see above) |
