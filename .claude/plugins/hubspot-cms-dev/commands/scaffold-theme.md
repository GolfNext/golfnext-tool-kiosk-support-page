---
name: scaffold-hubspot-theme
description: Scaffold a complete HubSpot CMS theme with templates, modules, CSS, JS, and configuration files. Use when starting a new HubSpot theme from scratch.
allowed-tools: Bash, Write, Edit, Read, Glob, Grep, AskUserQuestion
---

# Scaffold HubSpot Theme

Generate a complete, production-ready HubSpot CMS theme scaffold.

## Workflow

1. **Ask the user** for theme details:
   - Theme name (used for directory name and theme.json label)
   - Primary brand color (default: `#c0e66e`)
   - Secondary brand color (default: `#053e3f`)
   - Whether to include blog templates (default: yes)
   - Whether to include starter modules (default: yes)

2. **Read the project-structure skill** to understand the directory layout:
   ```
   Read skills/project-structure/SKILL.md
   ```

3. **Create the directory structure:**

```
<theme-name>/
├── hubspot.config.yml.example
├── .hsignore
├── package.json
├── .gitignore
├── src/
│   ├── theme.json
│   ├── fields.json
│   ├── templates/
│   │   ├── layouts/
│   │   │   └── base.html
│   │   ├── pages/
│   │   │   ├── home.html
│   │   │   └── landing.html
│   │   ├── blog/ (if selected)
│   │   │   ├── blog-listing.html
│   │   │   └── blog-post.html
│   │   ├── system/
│   │   │   ├── 404.html
│   │   │   └── search-results.html
│   │   └── partials/
│   │       ├── header.html
│   │       └── footer.html
│   ├── modules/ (if selected)
│   │   ├── hero-banner.module/
│   │   │   ├── module.html
│   │   │   ├── module.css
│   │   │   ├── meta.json
│   │   │   └── fields.json
│   │   └── cta-section.module/
│   │       ├── module.html
│   │       ├── module.css
│   │       ├── meta.json
│   │       └── fields.json
│   ├── sections/
│   │   └── hero-section.html
│   ├── css/
│   │   ├── layout.css
│   │   ├── theme-overrides.css
│   │   └── components/
│   │       ├── buttons.css
│   │       └── typography.css
│   ├── js/
│   │   └── main.js
│   ├── macros/
│   │   └── components.html
│   └── images/
└── README.md
```

4. **Populate each file** with production-ready content:
   - `base.html` should include `standard_header_includes`, `standard_footer_includes`, CSS variable injection from theme fields, and proper block structure
   - `fields.json` should include color, typography, layout, header, and footer groups using the user's brand colors
   - `theme.json` should use the theme name and correct paths
   - Starter modules should have complete `fields.json`, `meta.json`, and `module.html` with sensible defaults
   - CSS should use CSS custom properties pattern (`:root` variables from theme fields)
   - `.hsignore` should exclude node_modules, hubspot.config.yml, and dev files
   - `package.json` should include npm scripts for watch, upload, and deploy

5. **Report to the user** what was created and next steps:
   - How to install the HubSpot CLI
   - How to configure `hubspot.config.yml`
   - How to start development with `npm run watch`

## Quality Standards

- Every template must have the correct annotation comment (`templateType`, `label`, `isAvailableForNewContent`)
- base.html must include both `{{ standard_header_includes }}` and `{{ standard_footer_includes }}`
- All modules must have complete `meta.json` with valid `host_template_types`
- Theme fields must use CSS custom properties pattern for maximum performance
- All HTML should be semantic and accessible
- Images should use `loading="lazy"` where appropriate
- Module CSS should use BEM naming convention
