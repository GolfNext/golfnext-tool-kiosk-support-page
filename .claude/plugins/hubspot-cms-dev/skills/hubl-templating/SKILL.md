---
name: hubl-templating
description: "HubL templating language patterns for HubSpot CMS. Covers syntax, variables, control flow, filters, functions, template inheritance, blocks, macros, and HubSpot-specific tags. Use this skill whenever writing or editing HubL templates, using HubL filters or functions, working with template inheritance, creating macros, or debugging HubL syntax issues. Triggers on: HubL, hubl, Jinja, template, filter, macro, block, extends, include, HubSpot template."
---

# HubL Templating

HubL is HubSpot's server-side templating language, built on Jinjava (a Java implementation of Jinja). It renders on the server before the HTML reaches the browser. This means HubL code never appears in the page source — it's processed into final HTML.

Understanding this server-side nature is important: you can't mix HubL with client-side JavaScript directly. HubL runs first, then the browser executes JS.

## Core Syntax

HubL uses three delimiter types, each with a distinct purpose:

**Expressions** output values into the template:
```hubl
{{ variable }}
{{ content.title }}
{{ module.field_name }}
```

**Statements** handle logic (loops, conditions, assignments):
```hubl
{% if condition %}
  ...
{% endif %}

{% for item in items %}
  ...
{% endfor %}

{% set my_var = "value" %}
```

**Comments** are invisible in output:
```hubl
{# This won't appear in the HTML #}
```

### Whitespace Control

Add a minus sign to strip whitespace before/after a tag. This is useful when you need clean HTML output without extra blank lines:

```hubl
{%- if show_title -%}
  <h1>{{ title }}</h1>
{%- endif -%}
```

Without the `-`, the if/endif lines would leave blank lines in the output.

## Variables

### Built-in Content Variables

HubSpot provides variables for every page. The most commonly used:

```hubl
{{ content.title }}              {# Page title #}
{{ content.meta_description }}   {# Meta description #}
{{ content.slug }}               {# URL slug #}
{{ content.created }}            {# Creation timestamp #}
{{ content.updated }}            {# Last modified timestamp #}
{{ content.featured_image }}     {# Featured image URL #}
{{ content.author }}             {# Author object #}
{{ content.topic_list }}         {# Associated topics #}
{{ content.absolute_url }}       {# Full canonical URL #}

{{ request.path }}               {# Current URL path #}
{{ request.query }}              {# Query string #}
{{ request.domain }}             {# Current domain #}

{{ local_dt }}                   {# Current date/time #}
{{ year }}                       {# Current year #}
```

### Setting Variables

```hubl
{% set greeting = "Hello" %}
{% set full_name = first_name ~ " " ~ last_name %}
{% set items = [1, 2, 3] %}
{% set config = {"key": "value", "count": 42} %}
```

The `~` operator concatenates strings. You can also use the `+` operator for numbers or `|join` filter for lists.

## Control Flow

### Conditionals

```hubl
{% if content.featured_image %}
  <img src="{{ content.featured_image }}" alt="{{ content.title }}">
{% elif content.post_list_summary_featured_image %}
  <img src="{{ content.post_list_summary_featured_image }}" alt="">
{% else %}
  <div class="placeholder-image"></div>
{% endif %}
```

**Truthy/Falsy rules**: Empty strings, `0`, `null`, `false`, empty lists/dicts are falsy. Everything else is truthy.

**Useful operators**:
```hubl
{% if value is defined %}        {# Check if variable exists #}
{% if value is none %}           {# Check for null #}
{% if value is string_containing "search" %}
{% if value in ["a", "b", "c"] %}
{% if loop.first %}              {# First iteration of a for loop #}
{% if loop.last %}               {# Last iteration #}
```

### For Loops

```hubl
{% for post in contents %}
  <article class="post {% if loop.first %}post--featured{% endif %}">
    <h2>{{ post.title }}</h2>
    <p>{{ post.post_list_content|truncatehtml(120) }}</p>
    <span>{{ loop.index }} of {{ loop.length }}</span>
  </article>
{% endfor %}
```

**Loop variables** available inside `{% for %}`:
- `loop.index` — current iteration (1-based)
- `loop.index0` — current iteration (0-based)
- `loop.first` — true on first iteration
- `loop.last` — true on last iteration
- `loop.length` — total number of items
- `loop.depth` — nesting depth (starts at 1)

### Unless (Inverted Condition)

```hubl
{% unless module.hide_title %}
  <h2>{{ module.title }}</h2>
{% endunless %}
```

Equivalent to `{% if not module.hide_title %}` but reads more naturally for simple negation.

## Template Inheritance

Template inheritance is the backbone of HubSpot theme architecture. You define a base layout with `{% block %}` tags, then child templates override specific blocks.

### Base Layout (parent)

```hubl
{# templates/layouts/base.html #}
<!DOCTYPE html>
<html lang="{{ html_lang }}" {{ html_lang_dir }}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ page_meta.html_title }}</title>
  {{ standard_header_includes }}
  {% block head_extras %}{% endblock head_extras %}
</head>
<body>
  {% include "./partials/header.html" %}

  <main>
    {% block content %}
      {# Child templates fill this in #}
    {% endblock content %}
  </main>

  {% include "./partials/footer.html" %}

  {{ standard_footer_includes }}
  {% block footer_extras %}{% endblock footer_extras %}
</body>
</html>
```

`{{ standard_header_includes }}` and `{{ standard_footer_includes }}` are required — they inject HubSpot's tracking scripts, stylesheets, and system JS.

### Child Template

```hubl
{# templates/pages/home.html #}
<!--
  templateType: page
  label: Home Page
  isAvailableForNewContent: true
-->
{% extends "./layouts/base.html" %}

{% block head_extras %}
  {% require_css "../../css/pages/home.css" %}
{% endblock head_extras %}

{% block content %}
  {% dnd_area "main_content"
    label="Main Content",
    class="main-content"
  %}
    {% dnd_section %}
      {% dnd_column %}
        {% dnd_row %}
          {% dnd_module
            path="../../modules/hero-banner.module",
            headline="Welcome"
          %}
          {% end_dnd_module %}
        {% end_dnd_row %}
      {% end_dnd_column %}
    {% end_dnd_section %}
  {% end_dnd_area %}
{% endblock content %}
```

### Include (Partials)

Pull in reusable template fragments:

```hubl
{% include "./partials/header.html" %}
{% include "./partials/social-icons.html" %}
```

Include is for static fragments. For reusable logic with parameters, use macros instead.

## Macros

Macros are reusable template functions — like components you can call with different arguments:

### Defining Macros

```hubl
{# macros/components.html #}

{% macro render_button(text, url, style="primary", size="md") %}
  <a href="{{ url }}"
     class="btn btn--{{ style }} btn--{{ size }}">
    {{ text }}
  </a>
{% endmacro %}

{% macro render_card(title, description, image_url, link_url) %}
  <div class="card">
    {% if image_url %}
      <img class="card__image" src="{{ image_url }}" alt="{{ title }}">
    {% endif %}
    <div class="card__body">
      <h3 class="card__title">{{ title }}</h3>
      <p class="card__description">{{ description }}</p>
      {% if link_url %}
        {{ render_button("Read more", link_url, "secondary", "sm") }}
      {% endif %}
    </div>
  </div>
{% endmacro %}
```

### Using Macros

```hubl
{% import "./macros/components.html" as components %}

{{ components.render_button("Get Started", "/signup") }}
{{ components.render_button("Learn More", "/about", "outline", "lg") }}

{{ components.render_card(
  "Our Story",
  "Founded in 2020...",
  "/images/team.jpg",
  "/about"
) }}
```

### Call Blocks

Pass dynamic HTML content into a macro using `caller()`:

```hubl
{% macro section_wrapper(title, bg_class="") %}
  <section class="section {{ bg_class }}">
    <div class="container">
      <h2 class="section__title">{{ title }}</h2>
      {{ caller() }}
    </div>
  </section>
{% endmacro %}

{% call section_wrapper("Our Services", "bg-light") %}
  <div class="grid grid--3col">
    {# This entire block gets inserted where caller() is #}
    <div class="service-card">...</div>
    <div class="service-card">...</div>
    <div class="service-card">...</div>
  </div>
{% endcall %}
```

## Filters

Filters transform values using the pipe `|` syntax. They are applied left to right and can be chained.

For the most commonly used filters in HubSpot development, read `references/filters.md`.

### Quick Reference of Essential Filters

```hubl
{{ "hello"|capitalize }}                  → Hello
{{ "Hello World"|lower }}                 → hello world
{{ content.title|truncatehtml(120) }}     → Truncated with HTML-safe cutoff
{{ timestamp|datetimeformat("%B %d, %Y") }} → January 15, 2026
{{ price|int }}                           → Integer conversion
{{ items|length }}                        → List length
{{ list|join(", ") }}                     → Comma-separated string
{{ html_content|striptags }}              → Strip all HTML tags
{{ url|urlencode }}                       → URL-encode a string
{{ content|pprint }}                      → Debug: pretty-print any value
```

## Functions

HubL functions are called directly (not piped) and return values or render output.

For the full function reference, read `references/functions.md`.

### Key Functions

```hubl
{# Blog functions #}
{% set posts = blog_recent_posts("default", 5) %}
{% set tags = blog_topics("default", 10) %}

{# Content functions #}
{{ content_by_ids([123, 456]) }}

{# HubDB functions #}
{% set rows = hubdb_table_rows("my_table") %}
{% set table = hubdb_table("my_table") %}

{# URL and asset functions #}
{{ get_asset_url("../../images/logo.png") }}
{{ get_public_template_url("path/to/template") }}

{# Color functions #}
{{ theme.primary_color|color_variant(20) }}   {# Lighten by 20% #}
{{ theme.primary_color|color_variant(-20) }}  {# Darken by 20% #}

{# Menu functions #}
{% set menu = menu("main-navigation") %}
{% for item in menu %}
  <a href="{{ item.url }}" {% if item.activeBranch %}class="active"{% endif %}>
    {{ item.label }}
  </a>
{% endfor %}
```

## Debugging

When developing, these techniques help you understand what's happening:

```hubl
{# Pretty-print any variable to see its structure #}
<pre>{{ content|pprint }}</pre>

{# Check if a variable is defined #}
{% if my_var is defined %}
  {{ my_var }}
{% else %}
  Variable not defined
{% endif %}

{# Output type information #}
{{ my_var|type }}
```

In HubSpot's design manager, you can also use the template preview to see rendered output with real page data.

## Common Patterns

### Responsive Image with Srcset

```hubl
{% if module.image.src %}
  <img
    src="{{ module.image.src }}"
    alt="{{ module.image.alt }}"
    width="{{ module.image.width }}"
    height="{{ module.image.height }}"
    loading="{{ module.image.loading or 'lazy' }}"
    {% if module.image.width > 600 %}
      srcset="{{ module.image.src }}?width=400 400w,
              {{ module.image.src }}?width=800 800w,
              {{ module.image.src }} {{ module.image.width }}w"
      sizes="(max-width: 600px) 100vw, 50vw"
    {% endif %}
  >
{% endif %}
```

### Dynamic CSS from Theme Fields

```hubl
{# Inside a <style> block or theme-overrides.css #}
{% require_css %}
  <style>
    :root {
      --color-primary: {{ theme.primary_color.color }};
      --color-secondary: {{ theme.secondary_color.color }};
      --font-primary: {{ theme.body_font.font }};
      --font-heading: {{ theme.heading_font.font }};
    }
  </style>
{% end_require_css %}
```

### Pagination

```hubl
{% if contents %}
  {% for post in contents %}
    {# Render post #}
  {% endfor %}

  {% if next_page_num or last_page_num %}
    <nav class="pagination">
      {% if last_page_num %}
        <a href="{{ blog_page_link(last_page_num) }}">Previous</a>
      {% endif %}
      {% if next_page_num %}
        <a href="{{ blog_page_link(next_page_num) }}">Next</a>
      {% endif %}
    </nav>
  {% endif %}
{% endif %}
```
