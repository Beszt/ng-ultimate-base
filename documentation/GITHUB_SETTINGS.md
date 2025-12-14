# GitHub settings

Use these repository settings after creating a project from this template so CI/CD and release automation work as expected.

## Pull requests and merges

- Set the default branch to `develop`.
- Disable **Allow merge commits** and **Allow rebase merging**; keep squash merges enabled to match the ruleset.
- Enable **Automatically delete head branches** after merging pull requests.

## Repository rulesets (exports included)

- Import the JSON exports under `documentation/rulesets/` via **Settings -> Rules -> Rulesets -> Import** and upload each file (`Develop.json`, `Release.json`, `Tag.json`).
- Summaries:
  - **Develop** (`refs/heads/develop`): blocks deletions/force pushes, enforces linear history, allows only squash merges, requires 1 approving review with resolved threads, and dismisses stale reviews on new pushes.
  - **Release** (`refs/heads/release/*`): blocks deletions/force pushes and enforces linear history on release branches.
  - **Tag** (all tags): blocks tag deletions and force updates.
- Keep enforcement active and adjust bypass actors or reviewer counts if your team needs different defaults.

## Actions workflow permissions

- In **Settings -> Actions -> General**, set Workflow permissions to **Read and write permissions** and enable **Allow GitHub Actions to create and approve pull requests**.

## Production environment

- Create an environment named `Production` with required reviewers enabled.
- Add environment variables `DOCKERHUB_USERNAME` and `DOCKERHUB_REPOSITORY` (values matching your Docker Hub account and target repository).
- Add the environment secret `DOCKERHUB_TOKEN` for authentication.
- The `release.yml` workflow reads the username/repository from variables and the token from the secret when Docker publishing is enabled.
