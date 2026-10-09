# Claude Code Guidelines for Recon UI

This is a React 18 TJ application built with Redux Toolkit, Material-UI, and Vite.

## Quick Start

When working on this codebase, reference the specifications in `specs/` for detailed patterns and guidelines.

## Tech Stack Summary

| Category  | Technology                |
| --------- | ------------------------- |
| Framework | React 18.3.1              |
| Build     | Vite 5.4.1                |
| State     | Redux Toolkit + RTK Query |
| UI        | Material-UI v6            |
| Styling   | Emotion + SCSS            |
| Auth      | Keycloak                  |
| Icons     | Lineicons Pro             |
| Tables    | Material React Table      |
| Forms     | React Hook Form           |

## Project Structure

```
src/
├── app/           # Redux store
├── assets/        # Fonts, images, SCSS, theme
├── components/    # Reusable components (T-prefixed)
├── features/      # Feature modules (slices, API, components)
├── layout/        # BaseLayout
├── pages/         # Page components
├── routes/        # React Router config
└── utils/         # Utility functions
```

## Key Patterns

### Feature Module Structure

```
features/{name}/
├── {name}ApiSlice.js    # RTK Query
├── {name}Slice.js       # Redux slice
└── {Name}Table.jsx      # Components
```

### Component Naming

- `T{Name}.jsx` for TJ-branded components
- `{Name}Page.jsx` for pages
- `{name}Slice.js` for Redux slices
- `{name}ApiSlice.js` for API slices

### Styling

- Use MUI `sx` prop with theme values
- Theme defined in `src/assets/theme.js`
- Colors: `#011731` (navy), `#00C1FF` (light blue), `#034EA2` (dark blue)

### Icons

```jsx
<i className="lni lni-icon-name" />
<i className="lni lni-spinner-1 lni-is-spinning" /> // Loading
```

## Specifications

For complete guidelines, see:

- [specs/CLAUDE.md](specs/CLAUDE.md) - Main specification index
- [specs/guidelines/](specs/guidelines/) - Code patterns
- [specs/ui/](specs/ui/) - Design system
- [specs/agents/](specs/agents/) - Generator templates

## Commands

```bash
npm start      # Dev server on :3000
npm run build  # Production build
npm run lint   # ESLint check
```
