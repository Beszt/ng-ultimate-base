# ✅ Quick Setup Checklist (ng-ultimate-base)

Follow these steps after creating a new project from this template.

---

## 1. Install & Verify

- [ ] Run `npm ci`
- [ ] Ensure Angular CLI is available (`ng version`)

---

## 2. Git & Repo

- [ ] Set default branch to `develop`
- [ ] Confirm branch protections (`develop`, `release/*`)
- [ ] Enable GitHub Actions → Workflow permissions: **Read and write**

---

## 3. VSCode

- [ ] Install recommended extensions (`.vscode/extensions.json`)
- [ ] Test debug configs (`launch.json`)

---

## 4. Lint & Format

- [ ] Run `npm run lint` → no errors
- [ ] Verify Husky hooks work (`pre-commit` with lint-staged)
- [ ] IntelliSense suggests utilities in `class=""`
- [ ] Check if IntelliSense Classes are sorted automatically when they are in the wrong order (Tailwind plugin) (Tailwind plugin)

---

## 5. Tailwind & UI

- [ ] Theme switch (light/dark) works

---

## 6. Environments & i18n

- [ ] Update `environment.ts` & `environment.prod.ts`
- [ ] Add/update translations in `assets/i18n/` if your language is missing

---

## 7. CI/CD

- [ ] Open PR → `develop` → CI runs (lint, test, build)
- [ ] Trigger Release workflow with version (X.Y.Z) → branch, tag, GitHub Release created

---