---
name: hubspot-cli
description: "HubSpot CLI (hs) setup, commands, development workflow, and deployment patterns. Use this skill whenever working with the HubSpot CLI, running hs commands, setting up local development, deploying to HubSpot, or configuring CI/CD for HubSpot CMS. Triggers on: hs CLI, hubspot CLI, hs watch, hs upload, hs create, deployment, local development, hubspot.config.yml, hs init, HubSpot deploy, CI/CD HubSpot."
---

# HubSpot CLI Workflow

The HubSpot CLI (`hs`) is the bridge between your local development environment and HubSpot's cloud CMS. It lets you develop locally with your preferred editor, version control with Git, and deploy changes via command line.

## Installation

The CLI is an npm package. Install it globally:

```bash
npm install -g @hubspot/cli
```

Or as a project dev dependency (recommended for teams):

```bash
npm install --save-dev @hubspot/cli
```

When installed locally, run commands with `npx hs` or define npm scripts.

Verify installation:

```bash
hs --version
```

## Initial Setup

### Authentication

Run the init command to set up your first account connection:

```bash
hs init
```

This walks you through:
1. Choose authentication type (Personal Access Key is recommended)
2. Opens HubSpot in your browser to generate the key
3. Creates `hubspot.config.yml` with your credentials

**Generate a Personal Access Key manually:**
1. Go to HubSpot → Settings → Integrations → Private Apps (or visit `https://app.hubspot.com/l/personal-access-key`)
2. Create a key with these scopes: `content`, `design_manager`, `file_manager`
3. Copy the key into your config

### hubspot.config.yml

```yaml
defaultPortal: sandbox
portals:
  - name: sandbox
    portalId: 12345678
    authType: personalaccesskey
    personalAccessKey: >-
      YOUR_KEY_HERE

  - name: production
    portalId: 87654321
    authType: personalaccesskey
    personalAccessKey: >-
      YOUR_PRODUCTION_KEY_HERE
```

**Security rules:**
- Add `hubspot.config.yml` to `.gitignore` — it contains secrets
- Each developer should have their own config with their own keys
- Use separate sandbox and production accounts

### Adding More Accounts

```bash
hs auth personalaccesskey --account=production
```

## Core Commands

### hs watch — Live Development

Watches a local directory and uploads changes on every file save:

```bash
# Basic watch
hs watch src my-theme

# Watch with initial upload (syncs everything first)
hs watch src my-theme --initial-upload

# Watch a specific account
hs watch src my-theme --account=sandbox

# Watch with file removal (deletes from HubSpot when local file is deleted)
hs watch src my-theme --remove
```

**How watch works:**
- Monitors your local `src` directory for file changes
- On save, uploads the changed file to the `my-theme` directory on HubSpot
- Does NOT delete files from HubSpot when you delete locally (unless `--remove` is passed)
- Respects `.hsignore` patterns

**Development workflow:**
1. Start watch: `hs watch src my-theme --account=sandbox`
2. Edit files in your IDE
3. Save → file automatically uploads to HubSpot
4. Preview changes in HubSpot's page editor or live site

### hs upload — Deploy

Upload an entire directory to HubSpot:

```bash
# Upload to sandbox
hs upload src my-theme --account=sandbox

# Upload to production
hs upload src my-theme --account=production

# Upload with overwrite
hs upload src my-theme --account=production --overwrite
```

**Upload vs Watch:**
- `upload` is a one-time bulk operation — use for deployments
- `watch` is continuous — use during development

### hs fetch — Download from HubSpot

Pull files from HubSpot to your local machine:

```bash
# Fetch an entire theme
hs fetch my-theme src

# Fetch a specific file
hs fetch my-theme/templates/pages/home.html src/templates/pages/

# Fetch with overwrite
hs fetch my-theme src --overwrite
```

Useful when: inheriting an existing HubSpot project, syncing changes made in the design manager, or recovering files.

### hs create — Scaffolding

Generate new HubSpot assets:

```bash
# Create a new module
hs create module my-module

# Create a new template
hs create template my-template

# Create a new theme (from boilerplate)
hs create website-theme my-new-theme

# Create a React-based module
hs create react-app my-react-module

# Create a Vue-based module
hs create vue-app my-vue-module
```

### hs lint — Validation

Check your HubL templates for syntax errors:

```bash
# Lint a specific file
hs lint src/templates/pages/home.html

# Lint an entire directory
hs lint src/templates/
```

### hs sandbox — Sandbox Management

```bash
# Create a development sandbox
hs sandbox create --name=dev-sandbox --account=production

# List sandboxes
hs sandbox list

# Delete a sandbox
hs sandbox delete --name=dev-sandbox
```

### hs theme — Theme Commands

```bash
# Preview a theme
hs theme preview my-theme --account=sandbox

# Generate a theme from marketplace
hs theme marketplace-download
```

## File Manager Commands

For uploading static assets (images, PDFs) to HubSpot's file manager:

```bash
# Upload a file
hs filemanager upload src/images/logo.png images/logo.png

# Upload a directory
hs filemanager upload src/images images

# Fetch from file manager
hs filemanager fetch images src/images
```

## .hsignore Configuration

Controls which files are excluded from upload/watch. Place at project root:

```
# Dependencies
node_modules

# Config (contains secrets)
hubspot.config.yml

# Build artifacts
dist
.cache
*.map

# Development files
.env
.env.*
*.log
.DS_Store
Thumbs.db

# Documentation (not needed on HubSpot)
README.md
LICENSE
CONTRIBUTING.md
CHANGELOG.md
docs/

# Test files
__tests__
*.test.js
*.spec.js

# Git
.git
.gitignore

# IDE
.vscode
.idea
*.swp
```

## Development Workflow

### Solo Developer

```
1. hs init                          → Set up authentication
2. hs create website-theme my-theme → Scaffold theme
3. hs watch src my-theme            → Start live development
4. [develop in your IDE]            → Changes auto-upload
5. hs upload src my-theme --account=production → Deploy
```

### Team Workflow

```
1. Clone Git repo
2. cp hubspot.config.yml.example hubspot.config.yml
3. [Fill in personal access key]
4. npm install
5. npm run watch                    → hs watch via npm script
6. [develop on feature branch]
7. [PR review]
8. npm run deploy:staging           → Upload to staging account
9. [QA approval]
10. npm run deploy:prod             → Upload to production
```

### Recommended npm Scripts

```json
{
  "scripts": {
    "watch": "hs watch src my-theme --account=sandbox --initial-upload",
    "upload": "hs upload src my-theme --account=sandbox",
    "deploy:staging": "hs upload src my-theme --account=staging",
    "deploy:prod": "hs upload src my-theme --account=production",
    "lint": "hs lint src/",
    "fetch": "hs fetch my-theme src --overwrite"
  }
}
```

## CI/CD Patterns

### GitHub Actions Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy to HubSpot

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci

      - name: Deploy to HubSpot
        env:
          HUBSPOT_PORTAL_ID: ${{ secrets.HUBSPOT_PORTAL_ID }}
          HUBSPOT_ACCESS_KEY: ${{ secrets.HUBSPOT_ACCESS_KEY }}
        run: |
          # Create config from secrets
          cat > hubspot.config.yml << EOF
          defaultPortal: production
          portals:
            - name: production
              portalId: ${HUBSPOT_PORTAL_ID}
              authType: personalaccesskey
              personalAccessKey: ${HUBSPOT_ACCESS_KEY}
          EOF

          # Deploy
          npx hs upload src my-theme --account=production
```

### Branch-Based Deployments

```yaml
# Deploy to different environments based on branch
- name: Deploy
  run: |
    if [ "${{ github.ref }}" = "refs/heads/main" ]; then
      npx hs upload src my-theme --account=production
    elif [ "${{ github.ref }}" = "refs/heads/staging" ]; then
      npx hs upload src my-theme --account=staging
    fi
```

## Troubleshooting

**"File not found" errors:**
- Check that file paths in templates use relative paths from the file's location
- Verify `.hsignore` isn't excluding needed files

**"Unauthorized" errors:**
- Regenerate your Personal Access Key
- Check that your key has the required scopes
- Verify the portal ID in `hubspot.config.yml`

**Watch not picking up changes:**
- Some editors use "safe write" (write to temp file, then rename) — most work fine with `hs watch`
- Check that the file isn't in `.hsignore`
- Restart the watch process

**HubL syntax errors:**
- Run `hs lint` to check templates before uploading
- Common issues: missing `{% endif %}`, unclosed `{{ }}`, wrong variable paths
- Use `{{ variable|pprint }}` to debug variable contents

**Upload conflicts:**
- If someone edited in HubSpot while you worked locally: `hs fetch` the latest, merge manually, then `hs upload`
- Use `--overwrite` flag to force your version (careful in production)
