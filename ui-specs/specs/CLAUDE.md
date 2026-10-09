# Claude Agent Specification for Recon UI

This specification defines the architecture, patterns, and guidelines for building applications based on the Recon UI project. Use these specifications to generate consistent, high-quality code that follows established conventions.

## Quick Reference

| Aspect | Technology/Pattern |
|--------|-------------------|
| Framework | React 18.3.1 |
| Build Tool | Vite 5.4.1 |
| State Management | Redux Toolkit + RTK Query |
| UI Library | Material-UI v6 |
| Styling | Emotion + SCSS |
| Authentication | Keycloak |
| Icons | Lineicons Pro |
| Forms | React Hook Form |
| Tables | Material React Table |

## Specification Files

### Application Requirements
- [Requirements](requirements.md) - Archiving module functional spec, UI layout, modals, state shape
- [API Reference](api.md) - All endpoints, request/response schemas, RTK Query implementation notes

### Guidelines
- [Architecture](guidelines/architecture.md) - Project structure and organization
- [Code Style](guidelines/code-style.md) - Naming conventions and patterns
- [State Management](guidelines/state-management.md) - Redux patterns
- [API Patterns](guidelines/api-patterns.md) - RTK Query and data fetching

### UI Specifications
- [Design System](ui/design-system.md) - Colors, typography, spacing
- [Components](ui/components.md) - Component patterns and usage
- [Theming](ui/theming.md) - MUI theme configuration
- [Icons](ui/icons.md) - Icon system and usage

### Agents
- [Feature Generator](agents/feature-generator.md) - Generate complete features
- [Component Generator](agents/component-generator.md) - Create UI components
- [API Generator](agents/api-generator.md) - Create API slices and endpoints
- [Page Generator](agents/page-generator.md) - Generate page components
- [Form Generator](agents/form-generator.md) - Generate forms with validation

## Core Principles

1. **Feature-First Organization**: Group related code by feature, not by type
2. **Redux for Global State**: Use Redux Toolkit for shared state, local state for UI
3. **RTK Query for Data**: All API calls go through RTK Query
4. **Material-UI Theming**: Use theme tokens, never hardcode colors
5. **Consistent Naming**: Follow established conventions strictly
6. **No Over-Engineering**: Build what's needed, not what might be needed
