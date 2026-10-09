# Design System Specification

## Color Palette

### Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `tjDarkBlue` | `#034EA2` | Primary buttons, links |
| `tjNavyBlue` | `#011731` | Navigation, headers |
| `tjLightBlue` | `#00C1FF` | Secondary accent, hover states |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `textStrongBlue` | `#000626E5` | Primary text |
| `textWeakGrey` | `#1C2938A6` | Secondary text |
| `greyText` | `#555B78` | Input placeholders, labels |
| `white` | `#FFFFFF` | Text on dark backgrounds |

### Status Colors

| Token | Value | Usage |
|-------|-------|-------|
| `success` | `#117E11` | Success messages, positive metrics |
| `error` | `#D22A1E` | Error messages, negative metrics |
| `warning` | `#F5A623` | Warning states |
| `info` | `#3471B7` | Info messages, neutral metrics |

### Metric Card Colors

| Background | Icon BG | Usage |
|------------|---------|-------|
| `#3471B71A` | `#3471B7` | Blue metrics |
| `#16A8160D` | `#117E11` | Green/positive metrics |
| `#D22A1E24` | `#D22A1E` | Red/negative metrics |

### Background Colors

| Token | Value | Usage |
|-------|-------|-------|
| `pageBackground` | `#F2F5F9` | Main page background |
| `cardBackground` | `#FFFFFF` | Cards, panels |
| `inputBackground` | `#FFFFFF` | Form inputs |

### Border Colors

| Token | Value | Usage |
|-------|-------|-------|
| `defaultBorder` | `#D9D9D9` | Standard borders |
| `tableBorder` | `#354E6B1A` | Table cell borders |
| `focusBorder` | `#034EA2` | Focus states |

## Typography

### Font Family

```css
font-family: 'Montserrat', sans-serif;
```

Montserrat variable font loaded from `/src/assets/fonts/`.

### Type Scale

| Variant | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| `h1` | 6rem | 400 | 1.167 | Hero sections |
| `h2` | 2rem | 600 | 1.2 | Page titles |
| `h3` | 1.5rem | 600 | 1.167 | Section headers |
| `h4` | 1.25rem | 600 | 1.235 | Subsection headers |
| `h5` | 1.1rem | 600 | 1.334 | Card titles |
| `h6` | 1rem | 600 | 1.6 | Small headers |
| `body1` | 1rem | 400 | 1.5 | Body text |
| `body2` | 0.875rem | 400 | 1.43 | Secondary body |
| `caption` | 0.75rem | 400 | 1.66 | Captions |

### Custom Variants

| Variant | Size | Weight | Usage |
|---------|------|--------|-------|
| `pageTitle` | 1.25rem | 700 | Page titles |
| `accordionTitle` | 1rem | 700 | Accordion headers |
| `accordionSubTitle` | 0.875rem | 400 | Accordion subtitles |
| `metricTotal` | 1.2rem | 700 | KPI values |
| `breadcrumb` | 0.875rem | 400 | Breadcrumb text |
| `td` | 0.875rem | 400 | Table cells |
| `tdPrimary` | 0.875rem | 600 | Primary table cells |

## Spacing

Use MUI's spacing multiplier (1 unit = 8px):

| Value | Size | Usage |
|-------|------|-------|
| `0.5` | 4px | Tight spacing |
| `1` | 8px | Element spacing |
| `2` | 16px | Component padding |
| `3` | 24px | Section spacing |
| `4` | 32px | Large gaps |
| `5` | 40px | Page margins |

```jsx
// Usage
<Box sx={{ p: 2, mb: 3, gap: 1 }} />
```

## Border Radius

| Value | Size | Usage |
|-------|------|-------|
| `0.5rem` | 8px | Inputs, small elements |
| `0.6rem` | ~10px | Buttons |
| `0.8rem` | ~13px | Cards |
| `1rem` | 16px | Large cards, modals |
| `2rem` | 32px | Pills, tags |

## Shadows

### Card Shadow
```css
box-shadow: 0px 2px 4px -2px rgba(0, 0, 0, 0.08),
            0px 4px 8px -2px rgba(0, 0, 0, 0.04);
```

### Tooltip Shadow
```css
box-shadow: 0px 20px 24px -4px rgba(0, 0, 0, 0.08);
```

### Dropdown Shadow
```css
box-shadow: 0px 4px 6px -2px rgba(0, 0, 0, 0.05),
            0px 10px 15px -3px rgba(0, 0, 0, 0.1);
```

## Z-Index Scale

| Layer | Value | Usage |
|-------|-------|-------|
| Base | 0 | Default |
| Dropdown | 100 | Dropdowns, autocomplete |
| Sticky | 200 | Sticky headers |
| Fixed | 300 | Fixed elements |
| Modal Backdrop | 400 | Modal overlays |
| Modal | 500 | Modal content |
| Popover | 600 | Popovers, tooltips |
| Toast | 700 | Notifications |

## Breakpoints

MUI default breakpoints:

| Breakpoint | Value | Usage |
|------------|-------|-------|
| `xs` | 0px | Mobile |
| `sm` | 600px | Small tablets |
| `md` | 900px | Tablets |
| `lg` | 1200px | Desktops |
| `xl` | 1536px | Large screens |

```jsx
// Usage
<Box sx={{
  display: { xs: 'none', md: 'block' },
  padding: { xs: 1, sm: 2, md: 3 }
}} />
```

## Animation

### Transitions
```javascript
// Default transition
transition: 'all 0.2s ease-in-out'

// Hover transitions
transition: 'background-color 0.2s ease'
transition: 'transform 0.15s ease'
```

### Loading States
```css
/* Spinner animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
animation: spin 1s linear infinite;
```
