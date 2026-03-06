# HubL Functions Reference

Functions are called directly (not piped) and return values or rendered output. Organized by category.

## Blog Functions

```hubl
{# Get recent posts from a blog #}
{% set posts = blog_recent_posts("default", 5) %}
{% for post in posts %}
  <a href="{{ post.absolute_url }}">{{ post.name }}</a>
{% endfor %}

{# Get posts by tag #}
{% set tagged = blog_recent_tag_posts("default", "news", 3) %}

{# Get blog topics/tags #}
{% set topics = blog_topics("default", 10) %}
{% for topic in topics %}
  <span>{{ topic.name }} ({{ topic.live_posts }})</span>
{% endfor %}

{# Get posts by author #}
{% set author_posts = blog_recent_author_posts("default", "john-doe", 5) %}

{# Blog page link (for pagination) #}
<a href="{{ blog_page_link(next_page_num) }}">Next Page</a>

{# Total blog post count #}
{{ blog_total_post_count("default") }}
```

## Content Functions

```hubl
{# Get content by IDs #}
{% set pages = content_by_ids([12345, 67890]) %}
{% for page in pages %}
  <a href="{{ page.absolute_url }}">{{ page.title }}</a>
{% endfor %}

{# Get content by ID (single) #}
{% set page = content_by_id(12345) %}
```

## HubDB Functions

```hubl
{# Get all rows from a table (by name or ID) #}
{% set products = hubdb_table_rows("products") %}
{% set products = hubdb_table_rows(12345) %}

{# With query parameters #}
{% set active = hubdb_table_rows("products", "where=status='active'&orderBy=name&limit=50") %}

{# Random ordering #}
{% set featured = hubdb_table_rows("products", "orderBy=random()&limit=3") %}

{# Get table metadata #}
{% set table = hubdb_table("products") %}
{{ table.name }} — {{ table.row_count }} rows

{# Get a single row by ID #}
{% set row = hubdb_table_row(12345, 1) %}
```

**Query parameter reference:**
- `orderBy=column_name` — Sort by column (use `-column_name` for descending)
- `orderBy=random()` — Random order
- `limit=N` — Max rows to return (default: 1000, max: 10000)
- `offset=N` — Skip first N rows
- `where=condition` — Filter rows (supports `=`, `!=`, `>`, `<`, `>=`, `<=`, `LIKE`, `IN`, `IS NULL`, `IS NOT NULL`)

## Menu Functions

```hubl
{# Get a navigation menu by name or ID #}
{% set nav = menu("main-navigation") %}

{# Render menu items with active state #}
<nav>
  {% for item in nav %}
    <a href="{{ item.url }}"
       {% if item.activeBranch %}class="active"{% endif %}
       {% if item.linkTarget %}target="{{ item.linkTarget }}"{% endif %}>
      {{ item.label }}
    </a>

    {# Nested children (dropdown) #}
    {% if item.children %}
      <ul class="submenu">
        {% for child in item.children %}
          <li><a href="{{ child.url }}">{{ child.label }}</a></li>
        {% endfor %}
      </ul>
    {% endif %}
  {% endfor %}
</nav>
```

## URL and Asset Functions

```hubl
{# Get public URL for a theme asset #}
{{ get_asset_url("../../images/logo.png") }}

{# Get public URL for a template file #}
{{ get_public_template_url("custom/page/my-template") }}

{# Resize image on-the-fly #}
{{ resize_image_url("image.jpg", 0, 0, 800) }}

{# CRM file URL #}
{{ hubspot_file_url("path/to/file.pdf") }}
```

## Color Functions

```hubl
{# Lighten a theme color by percentage #}
{{ theme.primary_color.color|color_variant(20) }}

{# Darken a theme color #}
{{ theme.primary_color.color|color_variant(-30) }}

{# Get individual color components #}
{% set c = theme.primary_color %}
rgba({{ c.red }}, {{ c.green }}, {{ c.blue }}, {{ c.alpha }})
```

## Form Functions

```hubl
{# Render a HubSpot form by ID #}
{{ hubspot_form("portal_id", "form_guid") }}

{# With options #}
{{ hubspot_form("12345", "abc-def-ghi",
  redirect_url="/thank-you",
  form_css_class="custom-form"
) }}
```

## CTA Functions

```hubl
{# Render a Call-to-Action #}
{{ cta("cta_guid") }}
{{ cta("cta_guid", "justifycenter") }}
```

## Utility Functions

```hubl
{# Generate a range of numbers #}
{% for i in range(1, 6) %}
  Item {{ i }}
{% endfor %}

{# Create a date object #}
{% set date = today() %}

{# Current timestamp #}
{{ local_dt }}
{{ unixtimestamp() }}

{# Check if value is truthy #}
{% if truthy(value) %}...{% endif %}

{# Type checking #}
{% if value is string %}...{% endif %}
{% if value is number %}...{% endif %}
{% if value is iterable %}...{% endif %}
{% if value is mapping %}...{% endif %}

{# Personalization token with default #}
{{ personalization_token("contact.firstname", "there") }}
```

## Module Functions

```hubl
{# Render a module dynamically #}
{% module "my_module"
  path="../../modules/hero-banner.module",
  headline="Welcome",
  show_button=true
%}

{# Widget block (for global modules in coded templates) #}
{% widget_block rich_text "sidebar_text" %}
  {% widget_attribute "html" %}
    <p>Default sidebar content</p>
  {% end_widget_attribute %}
{% end_widget_block %}
```

## CRM Object Functions

```hubl
{# Access CRM objects from templates #}
{% set contact = crm_object("contact", query, "email,firstname,lastname") %}
{% set company = crm_object("company", query, "name,domain") %}
{% set deal = crm_object("deal", query, "dealname,amount") %}

{# Multiple CRM objects #}
{% set contacts = crm_objects("contact", "limit=10&firstname__contains=John") %}
```

## Membership/Gated Content

```hubl
{# Check if user is logged in #}
{% if request.contact %}
  Welcome, {{ request.contact.firstname }}!
{% else %}
  <a href="{{ login_url }}">Log in</a>
{% endif %}

{# Check list membership #}
{% if request.contact and request.contact.list_memberships|selectattr("id", 123) %}
  Premium content here
{% endif %}
```
