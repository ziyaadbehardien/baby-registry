# TJ Assets Theme

The shared MUI theme lives in a standalone Bitbucket repository (`tj-assets`) and is distributed to each app as a plain file — `src/assets/theme.js`. There is no git submodule.

## File Location

```
src/assets/theme.js   ← the theme file, committed to the app repo
src/assets/fonts/     ← fonts referenced by theme.js
```

## Importing the Theme

```js
// In App.jsx
import { theme } from './assets/theme';

// In feature components
import { theme, tjTableRowOddBg } from '../../assets/theme';
```

## Developer Workflow

### Pull latest theme

```bash
npm run theme:pull
```

Downloads the latest `theme.js` from the `tj-assets` Bitbucket repo and overwrites `src/assets/theme.js`.

### Push theme changes

```bash
npm run theme:push
# or with a message
npm run theme:push --message="added new color token"
```

Clones `tj-assets`, copies your local `theme.js` into it, bumps the patch version, commits, tags and pushes.

### On fresh clone

`postinstall` runs automatically on `npm install` / `npm ci`, which calls `theme-pull.sh` to fetch the latest theme.

## Setup for New Apps

### 1. Add `VITE_BITBUCKET_TOKEN` to `.env`

```
VITE_BITBUCKET_TOKEN=<your-bitbucket-repository-access-token>
```

The token needs **Repositories: Read** scope for pull, **Repositories: Write** for push.

To create one: **Bitbucket → Repository Settings → Access tokens → Create token**

### 2. Add scripts

Copy `scripts/theme-pull.sh` and `scripts/theme-push.sh` from an existing app (e.g. recon-ui).

### 3. Add npm scripts to `package.json`

```json
"theme:pull": "bash scripts/theme-pull.sh",
"theme:push": "bash scripts/theme-push.sh",
"postinstall": "bash scripts/theme-pull.sh"
```

### 4. Run initial pull

```bash
npm run theme:pull
```

### 5. Commit `theme.js`

```bash
git add src/assets/theme.js
git commit -m "chore: add theme.js from tj-assets"
```

## Amplify CI/CD Setup

### 1. Add environment variable in Amplify Console

- **Key:** `VITE_BITBUCKET_TOKEN`
- **Value:** A Bitbucket **Repository Access Token** (not personal) with **Repositories: Read** scope
- Created at: **tj-assets → Repository Settings → Access tokens**

### 2. `amplify.yml`

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

`npm ci` triggers `postinstall` → `theme-pull.sh` → fetches `theme.js` using `VITE_BITBUCKET_TOKEN`. No submodule auth issues.

## How It Works

```
scripts/theme-pull.sh
  └── reads VITE_BITBUCKET_TOKEN from env or .env
  └── calls Bitbucket API to download theme.js
  └── writes to src/assets/theme.js

scripts/theme-push.sh
  └── reads VITE_BITBUCKET_TOKEN from env or .env
  └── clones tj-assets into a temp dir
  └── copies src/assets/theme.js into the clone
  └── bumps patch version tag (v0.0.x)
  └── commits, tags, and pushes to tj-assets main
```
