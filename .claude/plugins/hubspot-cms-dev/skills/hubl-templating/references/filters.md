# HubL Filters Reference

Comprehensive reference of HubL filters organized by category. Filters are applied with the pipe `|` syntax and can be chained: `{{ value|filter1|filter2 }}`.

## String Filters

| Filter | Usage | Description |
|--------|-------|-------------|
| `capitalize` | `{{ "hello"|capitalize }}` | Capitalize first letter |
| `center(width)` | `{{ "hi"|center(20) }}` | Center string in given width |
| `cut(chars)` | `{{ value|cut(" ") }}` | Remove all occurrences of chars |
| `escape` | `{{ html|escape }}` | HTML-escape special characters |
| `lower` | `{{ value|lower }}` | Convert to lowercase |
| `upper` | `{{ value|upper }}` | Convert to uppercase |
| `title` | `{{ value|title }}` | Title Case Each Word |
| `trim` | `{{ value|trim }}` | Strip leading/trailing whitespace |
| `truncate(length)` | `{{ text|truncate(100) }}` | Truncate to length (adds ...) |
| `truncatehtml(length)` | `{{ html|truncatehtml(120) }}` | Truncate while preserving HTML tags |
| `striptags` | `{{ html|striptags }}` | Remove all HTML tags |
| `replace(old, new)` | `{{ value|replace("old", "new") }}` | Replace substring |
| `regex_replace(pattern, new)` | `{{ value|regex_replace("[^a-z]", "") }}` | Regex replace |
| `slugify` | `{{ "Hello World"|slugify }}` | URL-safe slug (hello-world) |
| `wordcount` | `{{ text|wordcount }}` | Count words |
| `wordwrap(width)` | `{{ text|wordwrap(80) }}` | Wrap at width characters |
| `urlize` | `{{ text|urlize }}` | Convert URLs in text to links |
| `urlencode` | `{{ value|urlencode }}` | URL-encode a string |

## Number Filters

| Filter | Usage | Description |
|--------|-------|-------------|
| `abs` | `{{ value|abs }}` | Absolute value |
| `float` | `{{ value|float }}` | Convert to float |
| `int` | `{{ value|int }}` | Convert to integer |
| `round(precision)` | `{{ value|round(2) }}` | Round to precision |
| `filesizeformat` | `{{ bytes|filesizeformat }}` | Human-readable file size |

## Date/Time Filters

| Filter | Usage | Description |
|--------|-------|-------------|
| `datetimeformat(fmt)` | `{{ ts\|datetimeformat("%B %d, %Y") }}` | Format datetime |
| `unixtimestamp` | `{{ content.created\|unixtimestamp }}` | Convert to Unix timestamp |
| `between_times(start, end)` | `{{ ts\|between_times(start, end) }}` | Check if between two times |

**Common datetime format codes:**
- `%Y` — 4-digit year (2026)
- `%m` — Month with zero-pad (01–12)
- `%d` — Day with zero-pad (01–31)
- `%B` — Full month name (January)
- `%b` — Abbreviated month (Jan)
- `%H` — Hour 24h (00–23)
- `%I` — Hour 12h (01–12)
- `%M` — Minute (00–59)
- `%p` — AM/PM

## List Filters

| Filter | Usage | Description |
|--------|-------|-------------|
| `batch(size)` | `{{ items\|batch(3) }}` | Split list into chunks |
| `first` | `{{ items\|first }}` | First element |
| `last` | `{{ items\|last }}` | Last element |
| `join(separator)` | `{{ items\|join(", ") }}` | Join list into string |
| `length` | `{{ items\|length }}` | List length |
| `list` | `{{ value\|list }}` | Convert to list |
| `map(attr)` | `{{ items\|map("name") }}` | Extract attribute from each item |
| `reject(attr, val)` | `{{ items\|reject("active", false) }}` | Reject items matching |
| `rejectattr(attr, val)` | `{{ items\|rejectattr("draft", true) }}` | Reject by attribute value |
| `reverse` | `{{ items\|reverse }}` | Reverse list |
| `select(attr, val)` | `{{ items\|select("active", true) }}` | Select items matching |
| `selectattr(attr, val)` | `{{ items\|selectattr("published", true) }}` | Select by attribute value |
| `shuffle` | `{{ items\|shuffle }}` | Randomize list order |
| `slice(count)` | `{{ items\|slice(3) }}` | Slice into N groups |
| `sort(attr)` | `{{ items\|sort(false, false, "name") }}` | Sort list |
| `sum` | `{{ prices\|sum }}` | Sum numeric list |
| `unique` | `{{ items\|unique }}` | Remove duplicates |

## Dict Filters

| Filter | Usage | Description |
|--------|-------|-------------|
| `dictsort` | `{{ dict\|dictsort }}` | Sort dict by key |
| `items` | `{{ dict\|items }}` | Get key-value pairs |
| `keys` | `{{ dict\|keys }}` | Get dict keys |
| `values` | `{{ dict\|values }}` | Get dict values |
| `attr(name)` | `{{ obj\|attr("name") }}` | Get attribute dynamically |
| `tojson` | `{{ obj\|tojson }}` | Serialize to JSON string |
| `fromjson` | `{{ json_str\|fromjson }}` | Parse JSON string to object |

## HubSpot-Specific Filters

| Filter | Usage | Description |
|--------|-------|-------------|
| `color_variant(amount)` | `{{ color\|color_variant(20) }}` | Lighten (+) or darken (-) |
| `render` | `{{ richtext_field\|render }}` | Render rich text content |
| `ipaddr` | `{{ value\|ipaddr }}` | Validate/format IP address |
| `md5` | `{{ value\|md5 }}` | MD5 hash |
| `sha256` | `{{ value\|sha256 }}` | SHA-256 hash |

## Debug Filters

| Filter | Usage | Description |
|--------|-------|-------------|
| `pprint` | `{{ object\|pprint }}` | Pretty-print for debugging |
| `type` | `{{ value\|type }}` | Show variable type |
| `default(val)` | `{{ value\|default("fallback") }}` | Fallback if undefined/falsy |

## Chaining Examples

```hubl
{# Truncate rich text, strip tags, capitalize #}
{{ post.body|striptags|truncate(150)|capitalize }}

{# Format a list of names into a sentence #}
{{ team|map("name")|sort|join(", ") }}

{# Get the first 3 items, reversed #}
{% for item in items|sort(false, false, "date")|reverse|slice(1)|first %}
  {{ item.title }}
{% endfor %}

{# Safe currency formatting #}
{{ price|float|round(2) }} DKK

{# Conditional default with filter #}
{{ module.subtitle|default(content.meta_description)|truncate(200) }}
```
