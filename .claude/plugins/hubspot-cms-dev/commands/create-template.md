---
name: create-hubspot-template
description: Generate a new HubSpot CMS page template with proper annotation, layout inheritance, and drag-and-drop areas. Use when adding a new page template to a HubSpot theme.
allowed-tools: Bash, Write, Edit, Read, Glob, Grep, AskUserQuestion
---

# Create HubSpot Template

Generate a new page template for a HubSpot CMS theme.

## Workflow

1. **Ask the user** for template details:
   - Template type: page, blog_listing, blog_post, landing page, error_page
   - Template name/label (e.g., "Product Page", "Team Page")
   - Layout description — what sections should the page have?
   - Whether to pre-populate with default modules

2. **Read the relevant skills:**
   ```
   Read skills/hubl-templating/SKILL.md     # For HubL syntax and inheritance
   Read skills/theme-development/SKILL.md   # For section patterns
   Read skills/custom-modules/SKILL.md      # For dnd_module usage
   ```

3. **Find the existing theme structure:**
   - Look for `theme.json` to determine theme root
   - Find the base layout in `templates/layouts/base.html`
   - Check existing templates for naming patterns
   - Look for available modules in the `modules/` directory

4. **Create the template** in the correct location:
   - Page templates → `templates/pages/<name>.html`
   - Blog templates → `templates/blog/<name>.html`
   - System templates → `templates/system/<name>.html`

### Template Structure

Every template must include:

**Annotation comment** (required):
```html
<!--
  templateType: page
  label: Product Page
  isAvailableForNewContent: true
  screenshotPath: ../../images/screenshots/<name>.png
-->
```

**Layout inheritance:**
```hubl
{% extends "../layouts/base.html" %}
```

**Content block with DnD areas:**
```hubl
{% block content %}
  {% dnd_area "main_content" label="Main Content" %}
    {% dnd_section %}
      {% dnd_column %}
        {% dnd_row %}
          {% dnd_module path="..." %}
          {% end_dnd_module %}
        {% end_dnd_row %}
      {% end_dnd_column %}
    {% end_dnd_section %}
  {% end_dnd_area %}
{% endblock content %}
```

5. **Design the default page layout:**
   - Use sections to create logical page areas
   - Pre-populate with existing theme modules where possible
   - Use the 12-column grid for multi-column layouts
   - Include sensible default content in modules
   - Reference theme sections from `sections/` if they exist

6. **Optionally create a matching section** in `sections/` if the template has unique page sections worth reusing.

7. **Report to the user:**
   - Template file path
   - How it extends the base layout
   - What blocks are overridden
   - How to create a new page using this template in HubSpot

## Quality Standards

- Must have correct `templateType` in annotation
- Must extend the base layout via `{% extends %}`
- Must use `{% block content %}` (not raw HTML outside blocks)
- DnD hierarchy must be correct: area → section → column → row → module
- Column widths must sum to 12 within each section
- Pre-populated modules should use existing theme modules, not inline HTML
- `isAvailableForNewContent: true` unless it's a system template
- Template should render correctly even with no editor modifications
