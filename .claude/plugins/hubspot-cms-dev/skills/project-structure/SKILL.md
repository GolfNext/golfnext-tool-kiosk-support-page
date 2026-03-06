---
name: project-structure
description: "HubSpot CMS project structure, file organization, and configuration patterns. Use this skill whenever setting up a new HubSpot CMS project, organizing theme files, configuring hubspot.config.yml, or deciding where files should live. Triggers on: project setup, file organization, hubspot.config.yml, .hsignore, directory layout, HubSpot project scaffold."
---

# HubSpot CMS Project Structure

This skill defines the standard file organization and configuration for HubSpot CMS projects. Every HubSpot CMS project you build should follow these conventions — they match what the HubSpot CLI expects and ensure smooth deployment.

## Standard Directory Layout

```
my-hubspot-theme/
├── hubspot.config.yml          # CLI authentication & account config
├── .hsignore                   # Files to exclude from upload
├── package.json                # Node dependencies (if using build tools)
├── src/
│   ├── theme.json              # Theme metadata & configuration
│   ├── fields.json             # Theme-level editable fields
│   ├── templates/
│   │   ├── layouts/
│   │   │   └── base.html       # Base layout (extends into all pages)
│   │   ├── pages/
│   │   │   ├── home.html       # Home page template
│   │   │   ├── about.html      # About page template
│   │   │   └── landing.html    # Landing page template
│   │   ├── blog/
│   │   │   ├── blog-listing.html
│   │   │   └── blog-post.html
│   │   ├── system/
│   │   │   ├── 404.html
│   │   │   ├── 500.html
│   │   │   ├── password-prompt.html
│   │   │   └── search-results.html
│   │   └── partials/
│   │       ├── header.html
│   │       ├── footer.html
│   │       └── nav.html
│   ├── modules/
│   │   ├── hero-banner.module/
│   │   │   ├── module.html
│   │   │   ├── module.css
│   │   │   ├── module.js
│   │   │   ├── meta.json
│   │   │   └── fields.json
│   │   ├── card-grid.module/
│   │   ├── cta-section.module/
│   │   └── testimonials.module/
│   ├── css/
│   │   ├── layout.css           # Required: base layout styles
│   │   ├── theme-overrides.css  # Theme field-driven dynamic styles
│   │   ├── components/
│   │   │   ├── buttons.css
│   │   │   ├── forms.css
│   │   │   └── typography.css
│   │   └── utilities.css
│   ├── js/
│   │   ├── main.js
│   │   └── modules/             # Shared JS for modules
│   ├── images/
│   │   └── theme-screenshot.png
│   └── macros/
│       ├── utils.html           # Reusable HubL macros
│       └── components.html
└── README.md
```

## Key Configuration Files

### hubspot.config.yml

This file lives at the project root and configures the HubSpot CLI connection. It stores your portal ID and authentication details. Never commit the `personalAccessKey` to version control.

```yaml
defaultPortal: my-sandbox
portals:
  - name: my-sandbox
    portalId: 12345678
    authType: personalaccesskey
    personalAccessKey: >-
      YOUR_KEY_HERE
  - name: production
    portalId: 87654321
    authType: personalaccesskey
    personalAccessKey: >-
      YOUR_KEY_HERE
```

The `defaultPortal` setting determines which account gets used when you run `hs` commands without specifying `--account`.

### .hsignore

Controls which files the CLI skips during upload. Follows the same pattern syntax as `.gitignore`:

```
# Node dependencies — never upload
node_modules

# Build artifacts
dist
.cache

# Development files
*.log
.env
.DS_Store
hubspot.config.yml

# Source maps
*.map

# README and docs (not needed on HubSpot)
README.md
LICENSE
CONTRIBUTING.md
```

The CLI respects `.hsignore` for both `hs upload` and `hs watch` commands. If you delete a local file while watching, it does NOT delete it from HubSpot unless you pass the `--remove` flag.

### theme.json

Lives inside `src/` and defines your theme's identity:

```json
{
  "label": "My Custom Theme",
  "preview_path": "./templates/pages/home.html",
  "screenshot_path": "./images/theme-screenshot.png",
  "enable_domain_stylesheets": false,
  "responsive": true,
  "version": "1.0.0"
}
```

### package.json (optional)

Only needed if you use build tools (Sass compilation, JS bundling, etc.). Keep it minimal:

```json
{
  "name": "my-hubspot-theme",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "watch": "hs watch src theme-name --account=my-sandbox",
    "upload": "hs upload src theme-name --account=my-sandbox",
    "deploy:prod": "hs upload src theme-name --account=production"
  },
  "devDependencies": {
    "@hubspot/cli": "^6.0.0"
  }
}
```

## File Naming Conventions

Follow these naming patterns consistently:

- **Templates**: lowercase kebab-case, e.g. `blog-listing.html`, `landing-page.html`
- **Modules**: kebab-case with `.module` suffix, e.g. `hero-banner.module/`, `card-grid.module/`
- **CSS files**: kebab-case, e.g. `theme-overrides.css`, `layout.css`
- **JS files**: kebab-case, e.g. `main.js`, `scroll-effects.js`
- **Partials**: kebab-case, prefixed with purpose, e.g. `header.html`, `footer.html`
- **Macros**: kebab-case, grouped by function, e.g. `utils.html`, `components.html`

## Template Annotation

Every template file needs an annotation comment at the top so HubSpot knows what type of template it is and how to label it in the UI:

```html
<!--
  templateType: page
  label: Home Page
  isAvailableForNewContent: true
  screenshotPath: ../images/home-screenshot.png
-->
```

Valid `templateType` values: `page`, `blog_listing`, `blog_post`, `error_page`, `password_prompt`, `search_results`, `membership`, `email`.

## Cross-References

When you need deeper guidance on specific areas, refer to these sibling skills:

- **HubL syntax, filters, functions** → read the `hubl-templating` skill
- **Building custom modules** → read the `custom-modules` skill
- **Theme configuration & sections** → read the `theme-development` skill
- **CLI commands & deployment** → read the `hubspot-cli` skill
- **HubDB & serverless** → read the `hubdb-serverless` skill
