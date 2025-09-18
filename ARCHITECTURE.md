# 📄 ARCHITECTURE.md

## 1. Overview
This repository (**ng-ultimate-base**) is a **template Angular project** that provides a ready-to-use foundation for new applications.  
It contains a preconfigured architecture, opinionated folder structure, and basic tooling (linting, formatting, CI/CD, VSCode setup).  

**Goal:** reduce project setup time → clone, install, and start coding features.

---

## 2. Folder Structure

```text
src/
 └── app/
     ├── core/             # cross-cutting concerns (services, interceptors, config)
     │   ├── interceptors/
     │   ├── services/
     │   ├── store/
     │   └── theme/
     │
     ├── shared/           # reusable building blocks
     │   ├── components/   # e.g. common-button, common-card
     │   ├── directives/
     │   ├── pipes/
     │   └── models/
     │
     ├── features/         # domain-specific features
     │   └── demo/         # example feature (Signal Store ↔ Http ↔ Storage)
     │
     └── app.component.*   # root bootstrap component
```

Other important folders:
- `src/assets/i18n/` → language JSON files (`en.json`, `pl.json`, etc.).  
- `src/environments/` → environment configs (`environment.ts`, `environment.prod.ts`).  
- `dist/` → build output (ignored in Git).

---

## 3. Core Layer
Contains functionality shared across the whole app:
- **Configuration & init** → root providers, app config.  
- **HTTP interceptors** → base URL, error handling, logging.  
- **ThemeService** → light/dark theme switching via CSS variables.  
- **StorageService** → wrapper for local/session storage with optional namespacing/TTL.  
- **Root Signal Store** → global state (e.g. theme, user, language).  

---

## 4. Shared Layer
Reusable utilities and UI elements:
- **Components** → small building blocks (`common-button`, `common-card`).  
- **Directives** → cross-cutting DOM logic (e.g. autofocus).  
- **Pipes** → formatters (e.g. date, currency).  
- **Models** → shared TypeScript interfaces/DTOs.  

---

## 5. Feature Layer
Each feature lives in its own folder:
- Contains: components, feature-specific Signal Store, services, models.  
- Designed to be **standalone** (lazy-loadable).  

Template includes an **example feature (`demo/`)** that demonstrates:
- Fetching data from a public API,  
- Managing state with a Signal Store,  
- Saving to local/session storage,  
- Reacting to theme changes.  

---

## 6. Internationalization (i18n)
- Language files: `src/assets/i18n/{lang}.json`.  
- Auto-detect language via `navigator.language`.  
- Default fallback: **English**.  
- Integrated with Angular pipes for usage inside templates.

---

## 7. Styling & UI
- **Angular Material** → base component library & design tokens.  
- **Tailwind CSS** → utility-first styling & layout.  
- **Light/Dark mode** → powered by CSS variables (`--var`) + `ThemeService`.  

---

## 8. Testing
- **Unit tests** → Karma/Jasmine by default (can be swapped to Jest/Vitest).  
- Template provides example:
  - A component test,  
  - A service test (HTTP).  

---

## 9. Configuration
- **Environments** → `dev` and `prod` (switch via Angular CLI file replacements).  
- **Linting & formatting** → ESLint + Prettier (aligned).  
- **Husky + lint-staged** → enforce lint/format on commit.  
- **VSCode setup** → included `.vscode` folder (settings, tasks, launch, extensions).  

---

## 10. CI/CD
- **CI (Continuous Integration)**  
  - Trigger: Pull Request → `develop`.  
  - Runs lint, unit tests, production build.  
  - Uploads build artifact for review.  

- **CD (Continuous Delivery/Release)**  
  - Trigger: manual (`workflow_dispatch`) with version input (`X.Y.Z`).  
  - Creates release branch `release/X.Y.Z`,  
  - Tags commit `vX.Y.Z`,  
  - Builds production bundle,  
  - Publishes GitHub Release with artifact `.zip`.  

---

## 11. Contribution Workflow
- Development happens on `develop` branch.  
- New features: create a feature branch → open PR into `develop`.  
- Releases: run Release workflow → creates `release/*` branch + tag + Release.  
- Branch protection: `develop` and `release/*` require PR + status checks.  

---

## 12. How to Extend
- Add new **features** under `src/app/features/`.  
- Add new **services** in `core/services/`.  
- Add reusable **UI** under `shared/components/`.  
- Extend i18n by adding `{lang}.json` files in `assets/i18n/`.  
- Extend CI/CD pipelines if deploying to hosting platforms (e.g. Vercel, Netlify, Firebase).  
