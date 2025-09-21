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

## 6. Environments and i18n

- [ ] Update `environment.ts` and `environment.prod.ts`
- [ ] Add or update translations in `assets/i18n/`

---

## 7. CI/CD

- [ ] Open a PR into `develop` and confirm CI runs lint, test, and build
- [ ] Trigger the release workflow with a version (X.Y.Z) and confirm branch, tag, and release creation
