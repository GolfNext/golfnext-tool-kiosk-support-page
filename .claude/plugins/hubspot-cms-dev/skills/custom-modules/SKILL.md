---
name: custom-modules
description: "HubSpot CMS custom module development — structure, fields, templates, CSS, JS, and drag-and-drop patterns. Use this skill whenever creating, editing, or debugging HubSpot modules, working with fields.json, meta.json, module.html, module.css, module.js, or building drag-and-drop areas. Triggers on: module, custom module, fields.json, meta.json, module.html, drag-and-drop, dnd_area, dnd_section, HubSpot component, module field, repeater field."
---

# HubSpot Custom Modules

Custom modules are the building blocks of HubSpot CMS pages. They're self-contained components that content editors can drag onto pages and configure through the page editor. Think of them as reusable UI components with a built-in editing interface.

Each module lives in its own `.module` directory and contains everything it needs: template, styles, scripts, field definitions, and metadata.

## Module File Structure

Every module directory follows this exact pattern:

```
hero-banner.module/
├── module.html      # HubL template (required)
├── module.css       # Module-scoped styles (optional)
├── module.js        # Module JavaScript (optional)
├── meta.json        # Module metadata (required)
└── fields.json      # Editable field definitions (required)
```

The `.module` suffix on the directory name is mandatory — HubSpot uses it to identify module directories.

## meta.json

Controls where and how the module appears in the HubSpot editor:

```json
{
  "label": "Hero Banner",
  "css_assets": [],
  "external_js": [],
  "global": false,
  "host_template_types": ["PAGE"],
  "icon": "../images/icons/hero.svg",
  "is_available_for_new_content": true,
  "categories": ["BANNER"]
}
```

**Key properties:**

- `label` — Display name in the module picker
- `global` — If `true`, editing this module on one page changes it everywhere. Use sparingly (headers, footers, site-wide CTAs)
- `host_template_types` — Where the module can be used. Valid values: `"PAGE"`, `"BLOG_POST"`, `"BLOG_LISTING"`, `"EMAIL"`, `"KNOWLEDGE_ARTICLE"`
- `is_available_for_new_content` — Set to `false` to hide deprecated modules from the picker without breaking existing pages
- `categories` — Groups the module in the editor sidebar. Options include `"BANNER"`, `"BODY_CONTENT"`, `"COMMERCE"`, `"DESIGN"`, `"FORM"`, `"FUNCTIONALITY"`, `"INTERACTIVE"`, `"MEDIA"`, `"NAVIGATION"`, `"SOCIAL"`
- `css_assets` / `external_js` — Shared CSS/JS dependencies loaded when the module is used

## fields.json

This is where you define the editing interface — every field here becomes a control in the page editor sidebar. Content editors interact with your module entirely through these fields.

### Basic Structure

```json
[
  {
    "name": "headline",
    "label": "Headline",
    "type": "text",
    "required": true,
    "default": "Welcome to Our Site"
  },
  {
    "name": "description",
    "label": "Description",
    "type": "richtext",
    "default": "<p>Enter a description here</p>"
  },
  {
    "name": "background_image",
    "label": "Background Image",
    "type": "image",
    "responsive": true,
    "default": {
      "src": "",
      "alt": "",
      "width": 1920,
      "height": 600
    }
  }
]
```

### Field Types

For the complete field type reference, read `references/field-types.md`.

The most commonly used field types:

**Content fields:**
- `text` — Single line text input
- `textarea` — Multi-line plain text
- `richtext` — Full rich text editor with formatting

**Media fields:**
- `image` — Image picker with alt text, dimensions, loading strategy
- `video` — Video embed field
- `file` — Generic file picker (PDFs, etc.)

**Choice fields:**
- `boolean` — Toggle switch (true/false)
- `choice` — Dropdown with predefined options
- `number` — Numeric input

**Link fields:**
- `link` — URL field with options for internal/external links, open in new tab
- `cta` — HubSpot CTA picker

**Appearance fields:**
- `color` — Color picker with opacity
- `font` — Font family, weight, size, color
- `spacing` — Margin/padding controls
- `alignment` — Horizontal/vertical alignment
- `backgroundimage` — Background image with positioning

**Structural fields:**
- `group` — Group related fields together visually
- `repeater` — Repeating field groups (for lists of items)

### Field Groups

Group related fields so the editor sidebar stays organized:

```json
[
  {
    "name": "content_group",
    "label": "Content",
    "type": "group",
    "children": [
      {
        "name": "headline",
        "label": "Headline",
        "type": "text",
        "default": "Welcome"
      },
      {
        "name": "subheadline",
        "label": "Subheadline",
        "type": "text",
        "default": ""
      }
    ]
  },
  {
    "name": "style_group",
    "label": "Styles",
    "type": "group",
    "tab": "STYLE",
    "children": [
      {
        "name": "bg_color",
        "label": "Background Color",
        "type": "color",
        "default": {
          "color": "#ffffff",
          "opacity": 100
        }
      }
    ]
  }
]
```

The `tab` property moves fields between the editor tabs: `"CONTENT"` (default), `"STYLE"`, or `"ADVANCED"`.

### Repeater Fields

Create dynamic lists of items that content editors can add/remove:

```json
[
  {
    "name": "features",
    "label": "Features",
    "type": "group",
    "occurrence": {
      "min": 1,
      "max": 6,
      "default": 3
    },
    "children": [
      {
        "name": "icon",
        "label": "Icon",
        "type": "image"
      },
      {
        "name": "title",
        "label": "Title",
        "type": "text",
        "default": "Feature Title"
      },
      {
        "name": "description",
        "label": "Description",
        "type": "textarea",
        "default": "Feature description goes here."
      }
    ]
  }
]
```

The `occurrence` object makes any group a repeater. `min`/`max` control the number of items allowed.

### Conditional Field Visibility

Show or hide fields based on other field values:

```json
[
  {
    "name": "layout",
    "label": "Layout",
    "type": "choice",
    "choices": [
      ["grid", "Grid"],
      ["slider", "Slider"]
    ],
    "default": "grid"
  },
  {
    "name": "columns",
    "label": "Columns",
    "type": "number",
    "default": 3,
    "visibility": {
      "controlling_field_path": "layout",
      "controlling_value_regex": "grid",
      "operator": "EQUAL"
    }
  },
  {
    "name": "autoplay",
    "label": "Autoplay",
    "type": "boolean",
    "default": false,
    "visibility": {
      "controlling_field_path": "layout",
      "controlling_value_regex": "slider",
      "operator": "EQUAL"
    }
  }
]
```

This way, the "Columns" field only shows when "Grid" layout is selected, and "Autoplay" only shows for "Slider" layout.

## module.html

The HubL template that renders the module's HTML. Access field values through the `module` variable:

### Basic Template

```hubl
{# Access top-level fields #}
<section class="hero-banner"
  {% if module.background_image.src %}
    style="background-image: url('{{ module.background_image.src }}')"
  {% endif %}
>
  <div class="hero-banner__container">
    {% if module.headline %}
      <h1 class="hero-banner__title">{{ module.headline }}</h1>
    {% endif %}

    {% if module.description %}
      <div class="hero-banner__description">
        {{ module.description }}
      </div>
    {% endif %}

    {% if module.cta_link.url.href %}
      <a href="{{ module.cta_link.url.href }}"
         class="hero-banner__cta btn btn--primary"
         {% if module.cta_link.open_in_new_tab %}target="_blank" rel="noopener"{% endif %}>
        {{ module.cta_link.url.type == "EMAIL_ADDRESS" ? "Email Us" : module.cta_text|default("Learn More") }}
      </a>
    {% endif %}
  </div>
</section>
```

### Rendering Repeater Fields

```hubl
{% if module.features %}
  <div class="features-grid" style="--columns: {{ module.columns|default(3) }}">
    {% for feature in module.features %}
      <div class="feature-card">
        {% if feature.icon.src %}
          <img class="feature-card__icon"
               src="{{ feature.icon.src }}"
               alt="{{ feature.icon.alt }}"
               loading="lazy">
        {% endif %}
        <h3 class="feature-card__title">{{ feature.title }}</h3>
        <p class="feature-card__description">{{ feature.description }}</p>
      </div>
    {% endfor %}
  </div>
{% endif %}
```

### Accessing Grouped Fields

For fields inside a group, access them with dot notation:

```hubl
{# For a field "heading" inside group "content_group" #}
{{ module.content_group.heading }}

{# For a style field inside "style_group" #}
background-color: {{ module.style_group.bg_color.color }};
```

### Image Field Best Practices

Always handle images defensively and use responsive loading:

```hubl
{% if module.image.src %}
  <img
    src="{{ module.image.src }}"
    alt="{{ module.image.alt }}"
    {% if module.image.width %}width="{{ module.image.width }}"{% endif %}
    {% if module.image.height %}height="{{ module.image.height }}"{% endif %}
    loading="{{ module.image.loading|default('lazy') }}"
  >
{% endif %}
```

## module.css

Module styles are automatically scoped and loaded only when the module appears on a page. Use BEM naming to avoid conflicts:

```css
/* hero-banner.module/module.css */

.hero-banner {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: center;
}

.hero-banner__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.hero-banner__title {
  font-size: 2.5rem;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.hero-banner__description {
  font-size: 1.125rem;
  max-width: 600px;
  margin-bottom: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-banner {
    min-height: 300px;
  }

  .hero-banner__title {
    font-size: 1.75rem;
  }

  .hero-banner__container {
    padding: 40px 16px;
  }
}
```

### Dynamic Styles from Fields

When you need CSS that depends on field values, use an inline `<style>` block with a scoping wrapper in module.html:

```hubl
{% require_css %}
  <style>
    .hero-banner--{{ name }} {
      {% if module.style_group.bg_color.color %}
        background-color: {{ module.style_group.bg_color.color }};
      {% endif %}
      {% if module.style_group.text_color.color %}
        color: {{ module.style_group.text_color.color }};
      {% endif %}
    }
  </style>
{% end_require_css %}
```

The `{{ name }}` variable gives each module instance a unique identifier for scoping.

## module.js

JavaScript for interactive module behavior. Use an IIFE or event-based initialization to avoid globals:

```javascript
// hero-banner.module/module.js

(function() {
  'use strict';

  // Wait for DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    const banners = document.querySelectorAll('.hero-banner');

    banners.forEach(function(banner) {
      // Initialize each banner instance
      initBanner(banner);
    });
  });

  function initBanner(banner) {
    const cta = banner.querySelector('.hero-banner__cta');
    if (!cta) return;

    // Smooth scroll for anchor links
    cta.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }
})();
```

## Drag-and-Drop Areas

Drag-and-drop (DnD) areas let content editors add, remove, and rearrange modules on a page. They are defined in page templates, not in modules themselves.

### DnD Hierarchy

The nesting must follow this strict order:

```
dnd_area
  └── dnd_section
        └── dnd_column
              └── dnd_row
                    └── dnd_module (or raw content)
```

### Template with DnD Area

```hubl
{% extends "./layouts/base.html" %}

{% block content %}
  {% dnd_area "main_content"
    label="Main Content",
    class="page-content"
  %}
    {# Default content — editors can replace this #}
    {% dnd_section %}
      {% dnd_column %}
        {% dnd_row %}
          {% dnd_module
            path="../../modules/hero-banner.module",
            headline="Welcome",
            description="<p>This is the default hero content</p>"
          %}
          {% end_dnd_module %}
        {% end_dnd_row %}
      {% end_dnd_column %}
    {% end_dnd_section %}

    {% dnd_section %}
      {% dnd_column
        offset=0,
        width=6
      %}
        {% dnd_row %}
          {% dnd_module
            path="@hubspot/rich_text",
            html="<h2>Left column</h2><p>Content here</p>"
          %}
          {% end_dnd_module %}
        {% end_dnd_row %}
      {% end_dnd_column %}

      {% dnd_column
        offset=6,
        width=6
      %}
        {% dnd_row %}
          {% dnd_module
            path="../../modules/card-grid.module"
          %}
          {% end_dnd_module %}
        {% end_dnd_row %}
      {% end_dnd_column %}
    {% end_dnd_section %}
  {% end_dnd_area %}
{% endblock content %}
```

### Column Grid

Columns use a 12-column grid system. The `width` parameter defines how many columns each element spans, and `offset` defines where it starts:

```hubl
{# Full width #}
{% dnd_column offset=0, width=12 %} ... {% end_dnd_column %}

{# Two equal columns #}
{% dnd_column offset=0, width=6 %} ... {% end_dnd_column %}
{% dnd_column offset=6, width=6 %} ... {% end_dnd_column %}

{# Three columns #}
{% dnd_column offset=0, width=4 %} ... {% end_dnd_column %}
{% dnd_column offset=4, width=4 %} ... {% end_dnd_column %}
{% dnd_column offset=8, width=4 %} ... {% end_dnd_column %}

{# Sidebar layout (8 + 4) #}
{% dnd_column offset=0, width=8 %} ... {% end_dnd_column %}
{% dnd_column offset=8, width=4 %} ... {% end_dnd_column %}
```

### Section Styling

Sections accept styling parameters for backgrounds, padding, etc.:

```hubl
{% dnd_section
  background_color={
    "r": 245, "g": 245, "b": 245, "a": 1
  },
  padding={
    "top": 60, "bottom": 60, "left": 20, "right": 20
  },
  max_width=1200
%}
  ...
{% end_dnd_section %}
```

## Module Development Checklist

When building a new module, make sure you:

1. Create all required files: `module.html`, `meta.json`, `fields.json`
2. Set sensible `default` values for all fields — the module should look good out of the box
3. Use `required: true` only for fields that truly must have a value
4. Add field `visibility` rules so editors only see relevant options
5. Group related fields and use the `tab` property for style/advanced options
6. Handle empty/missing field values gracefully in `module.html` (always check with `{% if %}`)
7. Use semantic HTML and BEM CSS naming
8. Add `loading="lazy"` to images below the fold
9. Test the module on different screen sizes
10. Test with both minimal and maximum field content
