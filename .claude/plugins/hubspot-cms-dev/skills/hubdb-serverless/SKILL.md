---
name: hubdb-serverless
description: "HubDB data tables and serverless function patterns for HubSpot CMS. Use this skill whenever working with HubDB, creating dynamic data-driven pages, querying table rows, using foreign keys, or building serverless functions for HubSpot. Triggers on: HubDB, hubdb_table_rows, hubdb_table, dynamic pages, data tables, serverless functions, HubSpot API, data-driven content, foreign key, table query."
---

# HubDB & Serverless Functions

HubDB is HubSpot's built-in database for structured content — product catalogs, team directories, event listings, pricing tables, office locations, and any other data that's too structured for freeform pages but too dynamic for hardcoded modules. Serverless functions add server-side logic for form processing, API integrations, and dynamic data operations.

## HubDB Fundamentals

### What HubDB Is Good For

HubDB shines when you have repeating structured data that content editors need to manage without touching code. Think of it as a lightweight database with a spreadsheet-like interface.

**Great use cases:**
- Product/service catalogs
- Team member directories
- Event calendars
- Pricing plans
- FAQ lists
- Store/office locations
- Portfolio items

**Not ideal for:**
- Data with complex relationships (use CRM objects instead)
- High-write-frequency data (HubDB is read-optimized)
- More than 10,000 rows per table

### Limits to Keep in Mind

- Maximum **10,000 rows** per table
- Maximum **10 HubDB calls** per template render
- Default return limit is **1,000 rows** (increase with `limit` parameter up to 10,000)
- Tables must be **published** before they're available in HubL (draft changes aren't visible)

## Querying HubDB in HubL

### Basic Row Retrieval

```hubl
{# Get all rows from a table — by name (preferred) or by ID #}
{% set products = hubdb_table_rows("products") %}
{% set products = hubdb_table_rows(12345) %}

{# Loop through results #}
{% for product in products %}
  <div class="product-card">
    <h3>{{ product.name }}</h3>
    <p>{{ product.description }}</p>
    <span class="price">{{ product.price }} DKK</span>
  </div>
{% endfor %}
```

Use table **names** rather than IDs when possible — names are portable across HubSpot accounts (sandbox → production), while IDs are not.

### Query Parameters

Filter, sort, and limit results using query strings:

```hubl
{# Sort by name ascending #}
{% set sorted = hubdb_table_rows("products", "orderBy=name") %}

{# Sort descending #}
{% set newest = hubdb_table_rows("products", "orderBy=-created") %}

{# Random order (great for "featured" sections) #}
{% set featured = hubdb_table_rows("products", "orderBy=random()&limit=3") %}

{# Limit results #}
{% set top_10 = hubdb_table_rows("products", "limit=10") %}

{# Offset for pagination #}
{% set page_2 = hubdb_table_rows("products", "limit=10&offset=10") %}
```

### Filtering Rows

```hubl
{# Exact match #}
{% set active = hubdb_table_rows("products", "status=active") %}

{# Using where clause for complex filters #}
{% set expensive = hubdb_table_rows("products", "where=price>1000") %}

{# String contains (LIKE) #}
{% set golf_items = hubdb_table_rows("products", "where=name LIKE '%golf%'") %}

{# Multiple conditions (AND) #}
{% set filtered = hubdb_table_rows("products", "where=status='active' AND price>100") %}

{# IN clause #}
{% set categories = hubdb_table_rows("products", "where=category IN ('clubs', 'balls', 'accessories')") %}

{# NULL checks #}
{% set with_image = hubdb_table_rows("products", "where=image IS NOT NULL") %}

{# Combine filter + sort + limit #}
{% set best = hubdb_table_rows("products",
  "where=status='active'&orderBy=-rating&limit=6"
) %}
```

### Table Metadata

```hubl
{# Get table info #}
{% set table = hubdb_table("products") %}

<p>{{ table.name }} — {{ table.row_count }} products</p>
<p>Last updated: {{ table.updated_at|datetimeformat("%B %d, %Y") }}</p>

{# Access column definitions #}
{% for col in table.columns %}
  {{ col.name }} ({{ col.type }})
{% endfor %}
```

### Single Row by ID

```hubl
{# Get a specific row (table ID, row ID) #}
{% set product = hubdb_table_row(12345, 1) %}
{{ product.name }} — {{ product.price }} DKK
```

## Column Types

HubDB supports these column types:

| Type | HubL Access | Notes |
|------|------------|-------|
| Text | `{{ row.column_name }}` | Plain text string |
| Rich Text | `{{ row.column_name }}` | HTML content |
| Number | `{{ row.column_name }}` | Integer or decimal |
| Currency | `{{ row.column_name }}` | Number with currency formatting |
| Date | `{{ row.column_name\|datetimeformat(...) }}` | Timestamp |
| Date & Time | Same as Date | Timestamp with time |
| URL | `{{ row.column_name.url }}` | Object with `.url` and `.type` |
| Boolean | `{% if row.column_name %}` | True/false |
| Select | `{{ row.column_name.name }}` | Object with `.name` and `.id` |
| Multi-select | `{% for opt in row.column_name %}` | List of select objects |
| Image | `{{ row.column_name.url }}` | Object with `.url`, `.width`, `.height` |
| Video | `{{ row.column_name }}` | Video player embed |
| Foreign ID | `{{ row.column_name.name }}` | Reference to another table's row |
| Location | `{{ row.column_name.lat }}` | Object with `.lat` and `.lng` |

## Foreign Keys (Table Relationships)

Foreign ID columns create relationships between tables. This is how you normalize your data instead of duplicating it.

### Example: Products with Categories

**Categories table:**
| ID | name | description |
|----|------|-------------|
| 1 | Clubs | Golf clubs and drivers |
| 2 | Balls | Golf balls |
| 3 | Accessories | Bags, gloves, tees |

**Products table:**
| name | price | category (Foreign ID → Categories) |
|------|-------|-------------------------------------|
| Driver X1 | 2999 | → Clubs (row 1) |
| Pro Ball | 299 | → Balls (row 2) |

```hubl
{% set products = hubdb_table_rows("products") %}
{% for product in products %}
  <div class="product">
    <h3>{{ product.name }}</h3>
    <span class="category">{{ product.category.name }}</span>
    <span class="price">{{ product.price }} DKK</span>
  </div>
{% endfor %}
```

The foreign key is automatically resolved — `product.category` gives you the full row from the Categories table, so you can access all its columns.

## Dynamic Pages with HubDB

HubDB can power dynamic pages where each table row generates its own URL. This is configured in HubSpot's page editor, not in code.

### Setting Up Dynamic Pages

1. Create a template with the annotation `templateType: page`
2. In HubSpot, create a page using this template
3. In page settings, enable "Use HubDB table" and select your table
4. Each row gets a URL based on a designated "path" column

### Dynamic Page Template

```hubl
{# templates/pages/product-detail.html #}
<!--
  templateType: page
  label: Product Detail
  isAvailableForNewContent: true
-->
{% extends "../layouts/base.html" %}

{% block content %}
  {# 'dynamic_page_hubdb_row' is the current row for this page #}
  {% if dynamic_page_hubdb_row %}
    {% set product = dynamic_page_hubdb_row %}
    <article class="product-detail">
      <div class="container">
        {% if product.image %}
          <img src="{{ product.image.url }}"
               alt="{{ product.name }}"
               width="{{ product.image.width }}"
               height="{{ product.image.height }}">
        {% endif %}

        <h1>{{ product.name }}</h1>
        <p class="price">{{ product.price }} DKK</p>
        <div class="description">{{ product.description }}</div>

        {% if product.category %}
          <span class="category">{{ product.category.name }}</span>
        {% endif %}
      </div>
    </article>

  {% else %}
    {# Listing page — shown at the base URL #}
    {% set products = hubdb_table_rows("products", "orderBy=name") %}
    <section class="product-listing">
      <div class="container">
        <h1>Products</h1>
        <div class="product-grid">
          {% for product in products %}
            <a href="{{ request.path }}/{{ product.hs_path }}" class="product-card">
              <h3>{{ product.name }}</h3>
              <span class="price">{{ product.price }} DKK</span>
            </a>
          {% endfor %}
        </div>
      </div>
    </section>
  {% endif %}
{% endblock content %}
```

The `hs_path` column is automatically added when you enable dynamic pages — it contains the URL slug for each row.

## Caching Best Practices

Since HubDB calls count toward the 10-per-template limit, cache results in variables:

```hubl
{# Bad: Multiple calls to same table #}
{% for product in hubdb_table_rows("products") %}
  ...
{% endfor %}
{# This counts as 2 calls! #}
{% set count = hubdb_table_rows("products")|length %}

{# Good: Single call, reuse the variable #}
{% set products = hubdb_table_rows("products") %}
{% for product in products %}
  ...
{% endfor %}
{{ products|length }} products total
```

## Serverless Functions

HubSpot supports serverless functions for server-side logic. As of 2025, HubSpot is migrating away from built-in serverless in newer API versions — for new projects, consider hosting functions externally.

### When to Use Serverless

- Form submission processing with custom logic
- API integrations (fetch data from third-party services)
- Data validation and transformation
- Custom email triggers
- Webhook handlers

### HubSpot-Hosted Serverless (Legacy/v2025.1)

If using HubSpot-hosted serverless:

**Directory structure:**
```
project/
├── src/
│   └── (theme files)
└── functions/
    ├── serverless.json
    └── my-function.js
```

**serverless.json:**
```json
{
  "runtime": "nodejs18.x",
  "version": "1.0",
  "endpoints": {
    "process-form": {
      "method": "POST",
      "file": "my-function.js"
    }
  },
  "secrets": ["API_KEY"]
}
```

**my-function.js:**
```javascript
const axios = require('axios');

exports.main = async (context, sendResponse) => {
  const { body } = context;

  try {
    // Process the request
    const result = await processData(body);

    sendResponse({
      statusCode: 200,
      body: { success: true, data: result }
    });
  } catch (error) {
    sendResponse({
      statusCode: 500,
      body: { success: false, error: error.message }
    });
  }
};
```

### External Serverless (Recommended for New Projects)

For v2025.2+ or when you need more flexibility, host functions externally:

**AWS Lambda / Cloudflare Workers / Vercel Functions:**

```javascript
// External API endpoint
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body;

  // Process data, call HubSpot API, etc.
  const hubspotResponse = await fetch(
    'https://api.hubapi.com/crm/v3/objects/contacts',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: { email, firstname: name }
      })
    }
  );

  return res.json({ success: true });
}
```

**Calling from HubSpot templates:**

```hubl
{# In module.js #}
<script>
  async function submitCustomForm(formData) {
    const response = await fetch('https://your-api.example.com/process-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    return response.json();
  }
</script>
```

### HubSpot API Integration

Common API endpoints you might call from serverless functions:

```javascript
// Create/update contacts
POST https://api.hubapi.com/crm/v3/objects/contacts

// Create deals
POST https://api.hubapi.com/crm/v3/objects/deals

// Send transactional emails
POST https://api.hubapi.com/marketing/v3/transactional/single-email/send

// Update HubDB rows
PUT https://api.hubapi.com/cms/v3/hubdb/tables/{tableId}/rows/{rowId}

// Publish HubDB table (required after updates)
POST https://api.hubapi.com/cms/v3/hubdb/tables/{tableId}/draft/publish
```

## Common HubDB Patterns

### Filtered Listing with Category Tabs

```hubl
{% set all_products = hubdb_table_rows("products", "orderBy=name") %}
{% set categories = hubdb_table_rows("categories", "orderBy=name") %}

<div class="product-listing">
  {# Category filter tabs #}
  <div class="filter-tabs">
    <button class="filter-tab active" data-category="all">All</button>
    {% for cat in categories %}
      <button class="filter-tab" data-category="{{ cat.hs_id }}">
        {{ cat.name }}
      </button>
    {% endfor %}
  </div>

  {# Product grid #}
  <div class="product-grid">
    {% for product in all_products %}
      <div class="product-card"
           data-category="{{ product.category.hs_id }}">
        <h3>{{ product.name }}</h3>
        <p>{{ product.price }} DKK</p>
      </div>
    {% endfor %}
  </div>
</div>
```

### Team Directory

```hubl
{% set team = hubdb_table_rows("team_members", "orderBy=sort_order") %}

<section class="team-directory">
  {% for member in team %}
    <div class="team-member">
      {% if member.photo %}
        <img src="{{ member.photo.url }}"
             alt="{{ member.name }}"
             loading="lazy"
             width="200" height="200">
      {% endif %}
      <h3>{{ member.name }}</h3>
      <p class="title">{{ member.job_title }}</p>
      {% if member.bio %}
        <p class="bio">{{ member.bio|truncatehtml(150) }}</p>
      {% endif %}
      {% if member.email %}
        <a href="mailto:{{ member.email }}">{{ member.email }}</a>
      {% endif %}
    </div>
  {% endfor %}
</section>
```
