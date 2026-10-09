# Icon System

## Icon Library: Lineicons Pro

This project uses **Lineicons Pro** icon font for consistent iconography.

### Setup

Lineicons Pro v5 font files live in `assets/lineicons-pro-icon-fonts-main/` at the **project root** (not inside `src/`):

```
assets/
├── lineicons-pro-icon-fonts-main/
│   ├── v5-regular-icon-font/   # Regular (outlined) icons
│   │   ├── lineicons.css       # @font-face + icon classes
│   │   ├── lineicons.woff2
│   │   ├── lineicons.woff
│   │   └── lineicons.ttf
│   └── v5-solid-icon-font/     # Solid (filled) icons
│       ├── lineicons-solid.css
│       ├── lineicons-solid.woff2
│       ├── lineicons-solid.woff
│       └── lineicons-solid.ttf
├── scss/
│   ├── lineicons.scss          # Imports both CSS files + defines .lni base class
│   └── styles.scss             # Entry SCSS — @use './lineicons.scss'
└── fonts/                      # Montserrat font files
```

Icons are loaded through the SCSS chain (no direct import needed in `main.jsx`):

```
main.jsx
  └── @import '../assets/scss/styles.scss'
        └── @use './lineicons.scss'
              ├── @import '../lineicons-pro-icon-fonts-main/v5-regular-icon-font/lineicons.css'
              └── @import '../lineicons-pro-icon-fonts-main/v5-solid-icon-font/lineicons-solid.css'
```

> **Important:** The `@font-face` URLs inside the CSS files must use **relative paths** (e.g. `./lineicons.woff2`), not absolute paths. The files ship with `/src/assets/...` absolute paths which are incorrect for this project.

The spinning animation is defined in `assets/scss/lineicons.scss`.

> **Rebuild note:** When rebuilding from scratch, paste the Lineicons Pro font directories into `assets/lineicons-pro-icon-fonts-main/` and fix the `@font-face` URLs in both CSS files to use relative paths (`./lineicons.woff2`, etc.).

### Basic Usage

```jsx
// Using className
<i className="lni lni-home" />

// With custom styling
<i className="lni lni-home" style={{ fontSize: '1.5rem', color: '#034EA2' }} />

// In a button
<Button startIcon={<i className="lni lni-download-1" />}>
  Download
</Button>
```

### Icon Variants

| Prefix | Style | Example |
|--------|-------|---------|
| `lni lni-*` | Regular (outlined) | `lni lni-home` |
| `lni lnis-*` | Solid (filled) | `lni lnis-home` |

### Common Icons Reference

#### Navigation & Actions

| Icon | Class | Usage |
|------|-------|-------|
| Home | `lni lni-home` | Home navigation |
| Menu | `lni lni-menu-hamburger-1` | Mobile menu |
| Close | `lni lni-xmark` | Close/dismiss |
| Back | `lni lni-chevron-left` | Back navigation |
| Settings | `lni lni-gear-1` | Settings menu |
| User | `lni lni-user-1` | User profile |
| Logout | `lni lni-exit` | Sign out |

#### Data & Tables

| Icon | Class | Usage |
|------|-------|-------|
| Filter | `lni lni-sliders-triple-horizontal-1` | Filter controls |
| Sort | `lni lni-arrow-up-down` | Sort toggle |
| Download | `lni lni-download-1` | Export/download |
| Search | `lni lni-search-1` | Search input |
| Refresh | `lni lni-spinner-1` | Refresh data |
| More | `lni lni-more-1` | More options |

#### Status & Feedback

| Icon | Class | Usage |
|------|-------|-------|
| Success | `lni lni-checkmark-circle` | Success state |
| Error | `lni lni-xmark-circle` | Error state |
| Warning | `lni lni-info-triangle` | Warning/exceptions |
| Info | `lni lni-information` | Info tooltip |

#### Finance & Business

| Icon | Class | Usage |
|------|-------|-------|
| Transaction | `lni lni-credit-card` | Transactions |
| Money | `lni lni-dollar-1` | Currency/amount |
| Cart | `lni lni-cart-1` | Merchant/store |
| Receipt | `lni lni-clipboard-1` | Reports |
| Calendar | `lni lni-calendar-1` | Date picker |

#### UI Elements

| Icon | Class | Usage |
|------|-------|-------|
| Expand | `lni lni-chevron-down` | Expand accordion |
| Collapse | `lni lni-chevron-up` | Collapse accordion |
| Right | `lni lni-chevron-right` | Next/forward |
| Add | `lni lni-plus` | Add item |
| Edit | `lni lni-pencil-1` | Edit action |
| Delete | `lni lni-trash-1` | Delete action |
| Copy | `lni lni-files-1` | Copy to clipboard |

### Animated Icons

```jsx
// Spinning loader
<i className="lni lni-spinner-1 lni-is-spinning" />
```

The spinning animation is defined in CSS:
```scss
.lni-is-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Icon Sizing

```jsx
// Using inline style
<i className="lni lni-home" style={{ fontSize: '1rem' }} />    // 16px
<i className="lni lni-home" style={{ fontSize: '1.25rem' }} /> // 20px
<i className="lni lni-home" style={{ fontSize: '1.5rem' }} />  // 24px
<i className="lni lni-home" style={{ fontSize: '2rem' }} />    // 32px

// Using MUI sx prop
<Box sx={{ '& .lni': { fontSize: '1.5rem' } }}>
  <i className="lni lni-home" />
</Box>
```

### Icon Colors

```jsx
// Using inline style
<i className="lni lni-home" style={{ color: '#034EA2' }} />

// Using MUI sx prop in parent
<Box sx={{ '& .lni': { color: 'primary.main' } }}>
  <i className="lni lni-home" />
</Box>

// Status colors
<i className="lni lni-checkmark-circle" style={{ color: '#117E11' }} /> // Success
<i className="lni lni-xmark-circle" style={{ color: '#D22A1E' }} />     // Error
<i className="lni lni-info-triangle" style={{ color: '#F5A623' }} />    // Warning
```

### Icon in Components

```jsx
// In Button
<Button startIcon={<i className="lni lni-plus" />}>
  Add New
</Button>

// In IconButton
<IconButton>
  <i className="lni lni-gear-1" />
</IconButton>

// In Navigation
const navItems = [
  { label: 'Transactions', path: '/transactions', icon: 'lni lni-credit-card' },
  { label: 'Exceptions', path: '/exceptions', icon: 'lni lni-info-triangle' },
  { label: 'Settings', path: '/settings', icon: 'lni lni-gear-1' },
];

navItems.map(item => (
  <ListItem key={item.path}>
    <ListItemIcon>
      <i className={item.icon} />
    </ListItemIcon>
    <ListItemText primary={item.label} />
  </ListItem>
))
```

### Creating Icon Wrapper Component

```jsx
// components/common/Icon.jsx
const Icon = ({ name, solid = false, spinning = false, size = '1rem', color, sx, ...props }) => {
  const iconClass = `lni ${solid ? 'lnis' : 'lni'}-${name}${spinning ? ' lni-is-spinning' : ''}`;

  return (
    <Box
      component="i"
      className={iconClass}
      sx={{
        fontSize: size,
        color: color,
        ...sx,
      }}
      {...props}
    />
  );
};

// Usage
<Icon name="home" size="1.5rem" color="primary.main" />
<Icon name="spinner-1" spinning />
<Icon name="checkmark-circle" solid color="success.main" />
```

### MUI Icons (Alternative)

For additional icons, use `@mui/icons-material`:

```jsx
import {
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

<IconButton>
  <DownloadIcon />
</IconButton>
```
