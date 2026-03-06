# Module Field Types Reference

Complete reference for all field types available in HubSpot CMS module `fields.json`. Each entry shows the field definition and how to access its value in `module.html`.

## Text & Content Fields

### text
Single-line text input.

```json
{
  "name": "headline",
  "label": "Headline",
  "type": "text",
  "required": true,
  "default": "Welcome",
  "placeholder": "Enter headline...",
  "validation_regex": "",
  "allow_new_line": false
}
```

Template: `{{ module.headline }}`

### textarea
Multi-line plain text (no formatting).

```json
{
  "name": "description",
  "label": "Description",
  "type": "textarea",
  "default": "Enter description here",
  "placeholder": "Describe your content..."
}
```

Template: `{{ module.description }}`

### richtext
Full rich text editor with formatting toolbar.

```json
{
  "name": "body_content",
  "label": "Body Content",
  "type": "richtext",
  "default": "<p>Rich text content with <strong>formatting</strong></p>",
  "enabled_features": ["bold", "italic", "link", "image", "heading", "list"]
}
```

Template: `{{ module.body_content }}`

The output includes HTML tags, so no need to wrap in `|render`.

### url
URL/link input.

```json
{
  "name": "link_url",
  "label": "Link URL",
  "type": "url",
  "default": {
    "content_id": null,
    "type": "EXTERNAL",
    "href": ""
  },
  "supported_types": ["EXTERNAL", "CONTENT", "FILE", "EMAIL_ADDRESS", "BLOG"]
}
```

Template:
```hubl
{% if module.link_url.href %}
  <a href="{{ module.link_url.href }}"
     {% if module.link_url.type == "EMAIL_ADDRESS" %}
       href="mailto:{{ module.link_url.href }}"
     {% endif %}>
    Link Text
  </a>
{% endif %}
```

### link
URL field with open-in-new-tab option built in.

```json
{
  "name": "cta_link",
  "label": "CTA Link",
  "type": "link",
  "default": {
    "url": {
      "content_id": null,
      "type": "EXTERNAL",
      "href": ""
    },
    "open_in_new_tab": false,
    "no_follow": false
  },
  "supported_types": ["EXTERNAL", "CONTENT", "FILE", "EMAIL_ADDRESS", "BLOG"]
}
```

Template:
```hubl
{% if module.cta_link.url.href %}
  <a href="{{ module.cta_link.url.href }}"
     {% if module.cta_link.open_in_new_tab %}target="_blank" rel="noopener"{% endif %}
     {% if module.cta_link.no_follow %}rel="nofollow"{% endif %}>
    {{ module.cta_text }}
  </a>
{% endif %}
```

## Media Fields

### image
Image picker with alt text, dimensions, and loading strategy.

```json
{
  "name": "hero_image",
  "label": "Hero Image",
  "type": "image",
  "responsive": true,
  "default": {
    "src": "",
    "alt": "",
    "width": null,
    "height": null,
    "max_width": null,
    "max_height": null,
    "loading": "lazy"
  }
}
```

Template:
```hubl
{% if module.hero_image.src %}
  <img
    src="{{ module.hero_image.src }}"
    alt="{{ module.hero_image.alt }}"
    {% if module.hero_image.width %}width="{{ module.hero_image.width }}"{% endif %}
    {% if module.hero_image.height %}height="{{ module.hero_image.height }}"{% endif %}
    loading="{{ module.hero_image.loading|default('lazy') }}"
  >
{% endif %}
```

### video
Video embed (supports HubSpot video, YouTube, Vimeo).

```json
{
  "name": "video",
  "label": "Video",
  "type": "videoplayer",
  "default": {
    "player_id": null,
    "height": null,
    "width": null,
    "size_type": "auto"
  }
}
```

Template: `{% video_player "embed_player" embed_field=module.video %}`

### file
Generic file picker.

```json
{
  "name": "download_file",
  "label": "Download File",
  "type": "file",
  "default": null,
  "picker": "file"
}
```

Template: `<a href="{{ module.download_file }}">Download</a>`

## Choice Fields

### boolean
Toggle switch.

```json
{
  "name": "show_cta",
  "label": "Show CTA Button",
  "type": "boolean",
  "default": true,
  "display": "toggle"
}
```

Template: `{% if module.show_cta %} ... {% endif %}`

### choice
Dropdown selector.

```json
{
  "name": "layout",
  "label": "Layout",
  "type": "choice",
  "display": "select",
  "choices": [
    ["grid", "Grid Layout"],
    ["list", "List Layout"],
    ["slider", "Slider Layout"]
  ],
  "default": "grid"
}
```

Template: `{% if module.layout == "grid" %} ... {% endif %}`

Alternative display: `"display": "radio"` for radio buttons.

### number
Numeric input.

```json
{
  "name": "columns",
  "label": "Number of Columns",
  "type": "number",
  "default": 3,
  "min": 1,
  "max": 6,
  "step": 1
}
```

Template: `style="--columns: {{ module.columns }}"`

### date
Date picker.

```json
{
  "name": "event_date",
  "label": "Event Date",
  "type": "date",
  "default": null
}
```

Template: `{{ module.event_date|datetimeformat("%B %d, %Y") }}`

### datetime
Date and time picker.

```json
{
  "name": "event_datetime",
  "label": "Event Date & Time",
  "type": "datetime",
  "default": null
}
```

## Appearance Fields

### color
Color picker with opacity.

```json
{
  "name": "text_color",
  "label": "Text Color",
  "type": "color",
  "default": {
    "color": "#333333",
    "opacity": 100
  }
}
```

Template:
```hubl
color: {{ module.text_color.color }};
opacity: {{ module.text_color.opacity / 100 }};

{# Or with rgba #}
color: rgba({{ module.text_color.red }}, {{ module.text_color.green }}, {{ module.text_color.blue }}, {{ module.text_color.opacity / 100 }});
```

### font
Font picker with family, weight, size, and color.

```json
{
  "name": "heading_font",
  "label": "Heading Font",
  "type": "font",
  "default": {
    "font": "Arial, sans-serif",
    "font_set": "GOOGLE",
    "size": 32,
    "size_unit": "px",
    "color": "#000000",
    "styles": {
      "font-weight": "bold"
    }
  }
}
```

Template:
```hubl
font-family: {{ module.heading_font.font }};
font-size: {{ module.heading_font.size }}{{ module.heading_font.size_unit }};
color: {{ module.heading_font.color }};
```

### spacing
Margin and/or padding controls.

```json
{
  "name": "section_padding",
  "label": "Section Padding",
  "type": "spacing",
  "default": {
    "padding": {
      "top": { "value": 40, "units": "px" },
      "bottom": { "value": 40, "units": "px" },
      "left": { "value": 20, "units": "px" },
      "right": { "value": 20, "units": "px" }
    }
  }
}
```

Template:
```hubl
padding: {{ module.section_padding.padding.top.value }}{{ module.section_padding.padding.top.units }}
         {{ module.section_padding.padding.right.value }}{{ module.section_padding.padding.right.units }}
         {{ module.section_padding.padding.bottom.value }}{{ module.section_padding.padding.bottom.units }}
         {{ module.section_padding.padding.left.value }}{{ module.section_padding.padding.left.units }};
```

### alignment
Horizontal/vertical alignment control.

```json
{
  "name": "text_alignment",
  "label": "Text Alignment",
  "type": "alignment",
  "default": {
    "horizontal_align": "LEFT",
    "vertical_align": "MIDDLE"
  },
  "alignment_direction": "BOTH"
}
```

Template: `text-align: {{ module.text_alignment.horizontal_align|lower }};`

### backgroundimage
Background image with position and size.

```json
{
  "name": "section_bg",
  "label": "Section Background",
  "type": "backgroundimage",
  "default": {
    "src": "",
    "background_position": "MIDDLE_CENTER",
    "background_size": "cover"
  }
}
```

## Structural Fields

### group
Container for organizing related fields. Not a visual element — just groups fields in the editor.

```json
{
  "name": "cta_settings",
  "label": "CTA Settings",
  "type": "group",
  "tab": "CONTENT",
  "children": [
    { "name": "cta_text", "label": "Button Text", "type": "text", "default": "Learn More" },
    { "name": "cta_url", "label": "Button URL", "type": "url", "default": { "href": "" } },
    { "name": "cta_style", "label": "Button Style", "type": "choice", "choices": [["primary", "Primary"], ["secondary", "Secondary"]], "default": "primary" }
  ]
}
```

Template: Access children with dot notation: `{{ module.cta_settings.cta_text }}`

### Repeater (group with occurrence)
Makes a group repeatable — editors can add/remove instances.

```json
{
  "name": "testimonials",
  "label": "Testimonials",
  "type": "group",
  "occurrence": {
    "min": 1,
    "max": 10,
    "default": 3,
    "sorting_label_field": "author_name"
  },
  "children": [
    { "name": "quote", "label": "Quote", "type": "textarea", "required": true },
    { "name": "author_name", "label": "Author", "type": "text", "required": true },
    { "name": "author_title", "label": "Title", "type": "text" },
    { "name": "author_photo", "label": "Photo", "type": "image" }
  ]
}
```

Template:
```hubl
{% for testimonial in module.testimonials %}
  <blockquote class="testimonial">
    <p>{{ testimonial.quote }}</p>
    <cite>
      {{ testimonial.author_name }}
      {% if testimonial.author_title %}, {{ testimonial.author_title }}{% endif %}
    </cite>
  </blockquote>
{% endfor %}
```

## HubSpot-Specific Fields

### cta
HubSpot CTA picker.

```json
{
  "name": "cta_button",
  "label": "CTA",
  "type": "cta",
  "default": null
}
```

Template: `{% cta module.cta_button %}`

### form
HubSpot form picker.

```json
{
  "name": "contact_form",
  "label": "Contact Form",
  "type": "form",
  "default": {
    "form_id": "",
    "response_type": "inline",
    "message": "Thank you for submitting!"
  }
}
```

Template:
```hubl
{% if module.contact_form.form_id %}
  {% form
    form_to_use="{{ module.contact_form.form_id }}",
    response_type="{{ module.contact_form.response_type }}",
    inline_message="{{ module.contact_form.message }}"
  %}
{% endif %}
```

### hubdbrow / hubdbtable
HubDB row or table picker.

```json
{
  "name": "selected_table",
  "label": "HubDB Table",
  "type": "hubdbtable",
  "default": null
}
```

### menu
Menu/navigation picker.

```json
{
  "name": "nav_menu",
  "label": "Navigation Menu",
  "type": "menu",
  "default": null
}
```

### blog
Blog picker.

```json
{
  "name": "blog_source",
  "label": "Blog",
  "type": "blog",
  "default": null
}
```

### tag
Blog tag picker.

```json
{
  "name": "filter_tag",
  "label": "Filter by Tag",
  "type": "tag",
  "tag_value": "slug",
  "default": null
}
```

## Field Visibility Rules

Control when fields appear based on other field values:

```json
{
  "name": "custom_width",
  "label": "Custom Width (px)",
  "type": "number",
  "default": 800,
  "visibility": {
    "controlling_field_path": "size_type",
    "controlling_value_regex": "custom",
    "operator": "EQUAL"
  }
}
```

**Operators:** `"EQUAL"`, `"NOT_EQUAL"`, `"EMPTY"`, `"NOT_EMPTY"`, `"MATCHES_REGEX"`

**Nested field paths:** Use dots for fields inside groups: `"controlling_field_path": "style_group.layout"`

**Multiple conditions:**
```json
{
  "visibility": {
    "controlling_field_path": "show_overlay",
    "controlling_value_regex": "true",
    "operator": "EQUAL",
    "property": "AND",
    "children": [
      {
        "controlling_field_path": "overlay_type",
        "controlling_value_regex": "color",
        "operator": "EQUAL"
      }
    ]
  }
}
```
