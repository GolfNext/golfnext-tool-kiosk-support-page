---
name: create-hubspot-module
description: Generate a new HubSpot CMS custom module with all required files (module.html, module.css, module.js, meta.json, fields.json). Use when adding a new module to a HubSpot theme.
allowed-tools: Bash, Write, Edit, Read, Glob, Grep, AskUserQuestion
---

# Create HubSpot Module

Generate a complete custom module for a HubSpot CMS theme.

## Workflow

1. **Ask the user** for module details:
   - Module name (e.g., "testimonials", "pricing-table", "team-grid")
   - Brief description of what the module should display
   - Where it should be usable: PAGE, BLOG_POST, BLOG_LISTING, EMAIL (default: PAGE)
   - Whether to include JavaScript (default: no, unless the module needs interactivity)

2. **Read the custom-modules skill** for field type reference:
   ```
   Read skills/custom-modules/SKILL.md
   Read skills/custom-modules/references/field-types.md
   ```

3. **Determine the module location** by looking for an existing theme:
   - Search for `theme.json` in the project to find the theme root
   - Place the module in `<theme-root>/modules/<module-name>.module/`
   - If no theme exists, ask the user where to create it

4. **Create all module files:**

### meta.json
```json
{
  "label": "<Module Label>",
  "css_assets": [],
  "external_js": [],
  "global": false,
  "host_template_types": ["PAGE"],
  "is_available_for_new_content": true,
  "categories": ["<appropriate category>"]
}
```

### fields.json
Design fields based on the module description:
- Group related fields logically
- Use `tab: "STYLE"` for appearance fields
- Add `visibility` rules when fields depend on each other
- Set meaningful `default` values — the module should look presentable with defaults only
- Use repeater groups (occurrence) for lists of items
- Add `help_text` for non-obvious fields

### module.html
- Use semantic HTML
- Access fields via `{{ module.field_name }}`
- Always check for empty/missing values with `{% if %}`
- Use BEM class naming: `.module-name`, `.module-name__element`, `.module-name--modifier`
- Add `loading="lazy"` to images
- Include `{% require_css %}` blocks for field-dependent styles

### module.css
- Use BEM naming matching the module.html classes
- Include responsive breakpoints
- Keep selectors flat (avoid deep nesting)
- Use CSS custom properties for theme integration (`var(--color-primary)`)

### module.js (if needed)
- Wrap in IIFE to avoid globals
- Use `DOMContentLoaded` event
- Query elements by module-specific class names
- Handle multiple instances on the same page

5. **Report to the user** what was created and how to use it:
   - Show the module path
   - Explain how to add it to a template with `{% module %}` or `{% dnd_module %}`
   - Mention that `hs watch` will auto-upload the new module

## Quality Standards

- All fields must have `default` values
- `module.html` must handle empty states gracefully
- CSS must be responsive (mobile-first recommended)
- BEM naming convention throughout
- No hardcoded text in module.html — everything editable via fields
- Images must include alt text and lazy loading
- Module should look good with only default values (no editor configuration needed)
