# Architecture Guidelines

## Project Structure

```
archive-ui/
├── assets/                              # Static assets (project root, NOT inside src/)
│   ├── fonts/                           # Custom fonts (Montserrat variants)
│   ├── images/                          # Image assets (logo, bank logos, card schemes)
│   ├── lineicons-pro-icon-fonts-main/   # Lineicons Pro v5 font files
│   │   ├── v5-regular-icon-font/        # lineicons.css + woff2/woff/ttf
│   │   └── v5-solid-icon-font/          # lineicons-solid.css + woff2/woff/ttf
│   ├── scss/                            # Global SCSS
│   │   ├── styles.scss                  # Entry point (imported by main.jsx)
│   │   ├── lineicons.scss               # Lineicons setup + CSS imports
│   │   └── _datepicker.scss             # Datepicker overrides
│   └── theme.js                         # MUI theme configuration
├── src/
│   ├── app/                             # Redux store configuration
│   │   └── store.js
│   ├── components/                      # Shared/reusable components
│   ├── features/                        # Feature modules (core organization)
│   │   ├── api/                         # Base API configuration
│   │   ├── {featureName}/
│   │   │   ├── *ApiSlice.js             # RTK Query endpoints
│   │   │   ├── *Slice.js                # Redux state slice
│   │   │   └── *.jsx                    # Feature components
│   ├── layout/
│   │   └── BaseLayout.jsx               # Main app layout (uses TPage from tj-components)
│   ├── pages/                           # Page components (route targets)
│   ├── routes/                          # React Router configuration
│   └── utils/                           # Utility functions
```

## Feature Module Pattern

Each feature should be self-contained:

```
src/features/{featureName}/
├── {featureName}ApiSlice.js    # API endpoints
├── {featureName}Slice.js       # Redux slice (if needed)
├── {FeatureName}Table.jsx      # Table component (if applicable)
├── {FeatureName}Filters.jsx    # Filter component (if applicable)
└── index.js                    # Barrel export (optional)
```

## Routing Structure

Routes are defined in `/src/routes/index.jsx`:

```javascript
const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <DefaultPage /> },
      { path: 'feature-name', element: <FeaturePage /> },
      { path: 'feature-name/:id', element: <DetailPage /> },
      // Nested routes for complex features
      {
        path: 'parent-feature',
        element: <ParentPage />,
        children: [
          { path: 'child-feature', element: <ChildPage /> }
        ]
      }
    ]
  },
  // Error routes
  { path: '/error-401', element: <Error401 /> },
  { path: '/error-404', element: <Error404 /> },
  { path: '/error-500', element: <Error500 /> }
]);
```

## Environment Configuration

Environment variables use Vite's `import.meta.env`. Create a `.env` file at the project root (see `.env.example`):

```bash
VITE_API_URL=https://tier03-archive-v2.uat-tj.com   # Backend API — same URL for local and UAT
VITE_QUERY_IFRAME_URL=https://your-postgres-query-tool-url
```

> **Note:** `VITE_API_URL` points directly to the UAT backend for all environments including local development. No proxy or local backend is needed.

## Build Configuration

Vite configuration (`vite.config.js`):

```javascript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      assets: path.resolve(__dirname, 'assets'),      // Project-root assets/
      components: path.resolve(__dirname, 'src/components'),
      layout: path.resolve(__dirname, 'src/layout'),
      routes: path.resolve(__dirname, 'src/routes'),
      features: path.resolve(__dirname, 'src/features'),
    }
  },
  server: { port: 3000 },
  build: { outDir: './build' }
});
```

> **Note:** The `assets` alias resolves to the **project root** `assets/` directory, not `src/assets/`.

## Dependencies to Use

### Core
- `react`: ^18.3.1
- `react-dom`: ^18.3.1
- `react-router`: ^7.1.3

### State Management
- `@reduxjs/toolkit`: ^2.2.7
- `react-redux`: ^9.1.2
- `redux-persist`: ^6.0.0

### UI
- `@mui/material`: ^6.0.2
- `@mui/icons-material`: ^6.0.2
- `@mui/lab`: ^6.0.0-beta.14
- `@mui/x-date-pickers`: ^7.29.4
- `@emotion/react`: ^11.13.3
- `@emotion/styled`: ^11.13.0
- `material-react-table`: ^3.0.1
- `notistack`: ^3.0.2
- `tj-components`: ^2.1.38   # TJ internal component library (TPage, TCard, TForm, etc.)

### Forms
- `react-hook-form`: ^7.56.4

### Utilities
- `dayjs`: ^1.11.13
- `lodash`: ^4.17.21
