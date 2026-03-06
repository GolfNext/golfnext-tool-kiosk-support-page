---
name: theme-development
description: "HubSpot CMS theme creation and configuration — theme.json, fields.json, layouts, sections, global content, and theme settings. Use this skill whenever building or editing a HubSpot theme, configuring theme settings, creating layouts, working with sections, or setting up global content areas. Triggers on: theme, theme.json, theme fields, layout, section, global content, HubSpot theme, theme settings, site-wide styles."
---

# HubSpot Theme Development

A HubSpot theme is a complete package of templates, modules, styles, and configuration that defines how a website looks and behaves. Themes provide a consistent design system that content editors work within — they can change colors, fonts, and content, but the structural decisions you make as a developer set the boundaries.

## Theme Architecture

A theme is a directory uploaded to HubSpot CMS. At minimum it needs `theme.json` and at least one template. In practice, a production theme includes much more.

```
src/
├── theme.json                    # Theme identity & configuration
├── fields.json                   # Theme-level editable settings
├── templates/
│   ├── layouts/
│   │   └── base.html             # Master layout all pages inherit from
│   ├── pages/
│   │   ├── home.html
│   │   ├── about.html
│   │   ├── landing.html
│   │   └── contact.html
│   ├── blog/
│   │   ├── blog-listing.html
│   │   └── blog-post.html
│   ├── system/
│   │   ├── 404.html
│   │   ├── 500.html
│   │   ├── password-prompt.html
│   │   └── search-results.html
│   └── partials/
│       ├── header.html
│       ├── footer.html
│       └── nav.html
├── modules/
│   └── (see custom-modules skill)
├── sections/
│   ├── hero-section.html
│   ├── features-section.html
│   └── cta-section.html
├── css/
│   ├── layout.css
│   ├── theme-overrides.css
│   └── components/
├── js/
│   └── main.js
├── macros/
│   └── components.html
└── images/
    └── theme-screenshot.png
```

## theme.json

The theme manifest — tells HubSpot about your theme:

```json
{
  "label": "GolfNext Theme",
  "preview_path": "./templates/pages/home.html",
  "screenshot_path": "./images/theme-screenshot.png",
  "enable_domain_stylesheets": false,
  "responsive": true,
  "version": "1.0.0"
}
```

**Properties:**

- `label` — Theme name shown in HubSpot's design tools
- `preview_path` — Default template shown when previewing the theme
- `screenshot_path` — Thumbnail image (recommended 1000×750px)
- `enable_domain_stylesheets` — If `true`, includes legacy domain-level CSS. Set to `false` for new themes to keep styling self-contained
- `responsive` — Should always be `true` for modern themes
- `version` — Semantic version for tracking changes

## Theme Fields (fields.json)

Theme-level fields.json defines settings that apply across the entire site — colors, fonts, spacing, logo, etc. These appear in HubSpot's "Theme settings" panel and are accessible in every template via the `theme` variable.

### Organizing Theme Fields

Structure fields into logical groups so the theme settings panel is easy to navigate:

```json
[
  {
    "name": "colors",
    "label": "Colors",
    "type": "group",
    "children": [
      {
        "name": "primary_color",
        "label": "Primary Color",
        "type": "color",
        "default": { "color": "#c0e66e", "opacity": 100 },
        "help_text": "Main brand color used for buttons, links, and accents"
      },
      {
        "name": "secondary_color",
        "label": "Secondary Color",
        "type": "color",
        "default": { "color": "#053e3f", "opacity": 100 }
      },
      {
        "name": "background_color",
        "label": "Background Color",
        "type": "color",
        "default": { "color": "#ffffff", "opacity": 100 }
      },
      {
        "name": "text_color",
        "label": "Text Color",
        "type": "color",
        "default": { "color": "#333333", "opacity": 100 }
      }
    ]
  },
  {
    "name": "typography",
    "label": "Typography",
    "type": "group",
    "children": [
      {
        "name": "body_font",
        "label": "Body Font",
        "type": "font",
        "default": {
          "font": "Inter, sans-serif",
          "font_set": "GOOGLE",
          "size": 16,
          "size_unit": "px",
          "color": "#333333"
        }
      },
      {
        "name": "heading_font",
        "label": "Heading Font",
        "type": "font",
        "default": {
          "font": "Inter, sans-serif",
          "font_set": "GOOGLE",
          "size": 32,
          "size_unit": "px",
          "color": "#053e3f",
          "styles": { "font-weight": "bold" }
        }
      }
    ]
  },
  {
    "name": "layout",
    "label": "Layout",
    "type": "group",
    "children": [
      {
        "name": "max_width",
        "label": "Max Content Width",
        "type": "number",
        "default": 1200,
        "min": 800,
        "max": 1600,
        "suffix": "px",
        "help_text": "Maximum width for the content container"
      },
      {
        "name": "section_spacing",
        "label": "Section Spacing",
        "type": "number",
        "default": 80,
        "min": 20,
        "max": 200,
        "suffix": "px"
      }
    ]
  },
  {
    "name": "header",
    "label": "Header",
    "type": "group",
    "children": [
      {
        "name": "logo",
        "label": "Logo",
        "type": "image",
        "default": { "src": "", "alt": "Site Logo" }
      },
      {
        "name": "sticky_header",
        "label": "Sticky Header",
        "type": "boolean",
        "default": true
      }
    ]
  },
  {
    "name": "footer",
    "label": "Footer",
    "type": "group",
    "children": [
      {
        "name": "footer_text",
        "label": "Footer Copyright Text",
        "type": "text",
        "default": "© {{ year }} Company Name. All rights reserved."
      },
      {
        "name": "show_social_links",
        "label": "Show Social Links",
        "type": "boolean",
        "default": true
      }
    ]
  }
]
```

### Using Theme Fields in Templates

Theme fields are available everywhere via the `theme` variable:

```hubl
{# In any template or module #}
<body style="
  font-family: {{ theme.typography.body_font.font }};
  color: {{ theme.colors.text_color.color }};
  background-color: {{ theme.colors.background_color.color }};
">
```

### CSS Custom Properties Pattern

The recommended approach is to convert theme fields into CSS custom properties once, then use them throughout your CSS:

```hubl
{# In layouts/base.html or a dedicated theme-overrides.css #}
{% require_css %}
<style>
  :root {
    /* Colors */
    --color-primary: {{ theme.colors.primary_color.color }};
    --color-secondary: {{ theme.colors.secondary_color.color }};
    --color-bg: {{ theme.colors.background_color.color }};
    --color-text: {{ theme.colors.text_color.color }};

    /* Typography */
    --font-body: {{ theme.typography.body_font.font }};
    --font-heading: {{ theme.typography.heading_font.font }};
    --font-size-body: {{ theme.typography.body_font.size }}{{ theme.typography.body_font.size_unit }};

    /* Layout */
    --max-width: {{ theme.layout.max_width }}px;
    --section-spacing: {{ theme.layout.section_spacing }}px;
  }
</style>
{% end_require_css %}
```

Then in regular CSS files:

```css
/* layout.css — no HubL needed, uses CSS variables */
body {
  font-family: var(--font-body);
  font-size: var(--font-size-body);
  color: var(--color-text);
  background: var(--color-bg);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  color: var(--color-secondary);
}

.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 20px;
}

.section {
  padding: var(--section-spacing) 0;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-secondary);
}
```

This pattern has a key advantage: your main CSS files stay pure CSS (cacheable, no HubL processing needed). Only the `:root` declaration block needs HubL rendering.

## Base Layout Template

The base layout is the most important template — every page inherits from it:

```hubl
{# templates/layouts/base.html #}
<!DOCTYPE html>
<html lang="{{ html_lang }}" {{ html_lang_dir }}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ page_meta.html_title }}</title>

  {# HubSpot system includes (required) #}
  {{ standard_header_includes }}

  {# Theme CSS #}
  {{ require_css(get_asset_url("../../css/layout.css")) }}

  {# Theme field overrides as CSS variables #}
  {% require_css %}
  <style>
    :root {
      --color-primary: {{ theme.colors.primary_color.color }};
      --color-secondary: {{ theme.colors.secondary_color.color }};
      --color-bg: {{ theme.colors.background_color.color }};
      --color-text: {{ theme.colors.text_color.color }};
      --font-body: {{ theme.typography.body_font.font }};
      --font-heading: {{ theme.typography.heading_font.font }};
      --max-width: {{ theme.layout.max_width }}px;
      --section-spacing: {{ theme.layout.section_spacing }}px;
    }
  </style>
  {% end_require_css %}

  {% block head_extras %}{% endblock head_extras %}
</head>
<body class="{% block body_class %}{% endblock body_class %}">
  {# Header #}
  {% block header %}
    {% include "../partials/header.html" %}
  {% endblock header %}

  {# Main content area — child templates fill this #}
  <main id="main-content">
    {% block content %}{% endblock content %}
  </main>

  {# Footer #}
  {% block footer %}
    {% include "../partials/footer.html" %}
  {% endblock footer %}

  {# HubSpot system includes (required) #}
  {{ standard_footer_includes }}

  {# Theme JS #}
  {{ require_js(get_asset_url("../../js/main.js")) }}

  {% block footer_scripts %}{% endblock footer_scripts %}
</body>
</html>
```

## Sections

Sections are pre-built page sections that content editors can add to drag-and-drop areas. They're like templates within templates — a hero section, a features grid, a CTA bar, etc.

### Creating a Section

Sections live in the `sections/` directory. Each section is a single HTML file that defines a `dnd_section`:

```hubl
{# sections/hero-section.html #}
<!--
  sectionLabel: Hero Section
  sectionDescription: Full-width hero with headline, text, and CTA
  sectionScreenshot: ../images/sections/hero.png
-->

{% dnd_section
  padding={
    "top": 80,
    "bottom": 80,
    "left": 20,
    "right": 20
  },
  max_width=1200,
  background_image={
    "backgroundPosition": "MIDDLE_CENTER",
    "backgroundSize": "cover"
  }
%}
  {% dnd_column %}
    {% dnd_row %}
      {% dnd_module
        path="@hubspot/rich_text",
        html="<h1>Your Headline Here</h1><p>Supporting text goes here. Tell visitors what you're about.</p>"
      %}
      {% end_dnd_module %}
    {% end_dnd_row %}
    {% dnd_row %}
      {% dnd_module
        path="../../modules/cta-button.module",
        button_text="Get Started",
        button_style="primary"
      %}
      {% end_dnd_module %}
    {% end_dnd_row %}
  {% end_dnd_column %}
{% end_dnd_section %}
```

The annotation comment at the top tells HubSpot how to display the section in the editor's "Add section" panel.

### Multi-Column Sections

```hubl
{# sections/features-section.html #}
<!--
  sectionLabel: Three Column Features
  sectionDescription: Three feature cards in a row
-->

{% dnd_section padding={ "top": 60, "bottom": 60 } %}
  {% dnd_column offset=0, width=4 %}
    {% dnd_row %}
      {% dnd_module
        path="../../modules/feature-card.module",
        icon="star",
        title="Feature One",
        description="Description of the first feature"
      %}
      {% end_dnd_module %}
    {% end_dnd_row %}
  {% end_dnd_column %}

  {% dnd_column offset=4, width=4 %}
    {% dnd_row %}
      {% dnd_module
        path="../../modules/feature-card.module",
        icon="shield",
        title="Feature Two",
        description="Description of the second feature"
      %}
      {% end_dnd_module %}
    {% end_dnd_row %}
  {% end_dnd_column %}

  {% dnd_column offset=8, width=4 %}
    {% dnd_row %}
      {% dnd_module
        path="../../modules/feature-card.module",
        icon="zap",
        title="Feature Three",
        description="Description of the third feature"
      %}
      {% end_dnd_module %}
    {% end_dnd_row %}
  {% end_dnd_column %}
{% end_dnd_section %}
```

## Global Content

Global content modules appear on every page and can be edited once to update everywhere. Headers and footers are the classic examples.

### Global Partials

```hubl
{# templates/partials/header.html #}
{% global_module "header"
  path="../../modules/site-header.module",
  label="Site Header"
%}
```

When you use `global_module` instead of `module`, HubSpot:
1. Shows this module in the "Global content" editor
2. Syncs changes across all pages that include it
3. Lets editors update it from any page

### Linking Theme Fields to Global Content

In the header partial, combine global module fields with theme-level settings:

```hubl
{# templates/partials/header.html #}
<header class="site-header {% if theme.header.sticky_header %}site-header--sticky{% endif %}">
  <div class="container">
    {% if theme.header.logo.src %}
      <a href="/" class="site-header__logo">
        <img src="{{ theme.header.logo.src }}"
             alt="{{ theme.header.logo.alt|default('Logo') }}"
             loading="eager">
      </a>
    {% endif %}

    <nav class="site-header__nav">
      {% module "main_nav"
        path="@hubspot/menu",
        menu="main-navigation"
      %}
    </nav>
  </div>
</header>
```

## System Templates

HubSpot requires specific templates for system pages. At minimum, create these:

### 404 Error Page

```hubl
{# templates/system/404.html #}
<!--
  templateType: error_page
  label: 404 Error Page
  isAvailableForNewContent: false
-->
{% extends "../layouts/base.html" %}

{% block content %}
  <section class="error-page">
    <div class="container" style="text-align: center; padding: 100px 20px;">
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" class="btn btn--primary">Go Home</a>
    </div>
  </section>
{% endblock content %}
```

### Search Results

```hubl
{# templates/system/search-results.html #}
<!--
  templateType: search_results
  label: Search Results
  isAvailableForNewContent: false
-->
{% extends "../layouts/base.html" %}

{% block content %}
  <section class="search-results">
    <div class="container">
      <h1>Search Results</h1>
      {% if search_results %}
        {% for result in search_results %}
          <article class="search-result">
            <h2><a href="{{ result.url }}">{{ result.title }}</a></h2>
            <p>{{ result.description|truncatehtml(200) }}</p>
          </article>
        {% endfor %}
      {% else %}
        <p>No results found. Try a different search term.</p>
      {% endif %}
    </div>
  </section>
{% endblock content %}
```

## Performance Best Practices

1. **Convert theme fields to CSS custom properties** — render HubL once in `<style>`, then use pure CSS everywhere else
2. **Use `require_css` and `require_js`** — prevents duplicate loading when a module appears multiple times
3. **Set `enable_domain_stylesheets: false`** in theme.json to avoid loading legacy CSS
4. **Lazy-load images** below the fold with `loading="lazy"`
5. **Load JavaScript in footer** — use `require_js` which defaults to footer placement
6. **Keep hero images under 250KB** and use responsive sizing
7. **Minimize CSS specificity** — use flat BEM selectors instead of nested rules
