# Quick Setup Checklist (ng-ultimate-base)

Follow these steps after creating a new project from this template.

---

## 1. Install and Verify

- [ ] Run `npm ci`
- [ ] Ensure Angular CLI is available (`ng version`)

---

## 2. Git and Repo

- [ ] Set default branch to `develop`
- [ ] Disable **Allow merge commits** and **Allow rebase merging**; keep squash merges enabled
- [ ] Enable **Automatically delete head branches** after merging pull requests
- [ ] Import GitHub rulesets from `documentation/rulesets/Develop.json`, `Release.json`, and `Tag.json` (Settings -> Rules -> Rulesets -> Import)
- [ ] Enable GitHub Actions workflow permissions: Read and write + allow Actions to create and approve pull requests
- [ ] Confirm protections/rulesets apply to `develop`, `release/*`, and tags

---

## 3. VS Code

- [ ] Install recommended extensions (`.vscode/extensions.json`)
- [ ] Test debug configurations (`launch.json`)

---

## 4. Lint and Format

- [ ] Run `npm run lint`
- [ ] Verify Husky hooks work (pre-commit with lint-staged)
- [ ] Confirm Tailwind IntelliSense suggests utilities inside `class=""`
- [ ] Check that Tailwind classes are auto-sorted by the Prettier plugin

---

## 5. Demo Features and UI

- [ ] Fetching posts works
- [ ] Toast shows after loading posts
- [ ] Spinner overlay displays while posts load
- [ ] Local and session storage actions succeed
- [ ] Theme switch (light/dark) works

---

## 6. Runtime Config and i18n

- [ ] Update `src/assets/settings.json` with your app name and storage namespace
- [ ] Verify overrides via `APP_NAME` / `APP_STORAGE_NAMESPACE` when running the Docker image
- [ ] Add or update translations in `assets/i18n/`

---

## 7. CI/CD

- [ ] Open a PR into `develop` and confirm CI runs lint, test, and build
- [ ] Create the `Production` environment with required reviewers; add variables `DOCKERHUB_USERNAME`, `DOCKERHUB_REPOSITORY` and the secret `DOCKERHUB_TOKEN` if you want Docker pushes
- [ ] Trigger the release workflow with a version (X.Y.Z); optionally enable the Docker toggle and confirm branch, tag, artifacts, and (when enabled) Docker image
- [ ] Run workflow helper scripts locally when prepping a release (example values shown) to test auto changelog and update version mechanincs work:
  ```bash
  python .github/workflows/tools/update_changelog.py 9.9.9 "Test Release"
  python .github/workflows/tools/update_app_version.py 9.9.9
  python .github/workflows/tools/verify_release_readiness.py 9.9.9 "Test Release"
  ```
