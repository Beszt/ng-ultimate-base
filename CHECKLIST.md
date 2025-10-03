# Quick Setup Checklist (ng-ultimate-base)

Follow these steps after creating a new project from this template.

---

## 1. Install and Verify

- [ ] Run `npm ci`
- [ ] Ensure Angular CLI is available (`ng version`)

---

## 2. Git and Repo

- [ ] Set default branch to `develop`
- [ ] Confirm branch protections for `develop` and `release/*`
- [ ] Enable GitHub Actions workflow permissions: Read and write

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
- [ ] Configure Docker Hub secrets (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `DOCKERHUB_REPOSITORY`) if you want Docker pushes
- [ ] Trigger the release workflow with a version (X.Y.Z); optionally enable the Docker toggle and confirm branch, tag, artifacts, and (when enabled) Docker image
