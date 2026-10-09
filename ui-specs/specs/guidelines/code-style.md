# Code Style Guidelines

## File Naming Conventions

| Type              | Convention                  | Example                           |
| ----------------- | --------------------------- | --------------------------------- |
| React Components  | PascalCase.jsx              | `TransactionsTable.jsx`           |
| Pages             | PascalCase + Page.jsx       | `TransactionsPage.jsx`            |
| Redux Slices      | camelCase + Slice.js        | `transactionsFilterSlice.js`      |
| API Slices        | camelCase + ApiSlice.js     | `transactionsApiSlice.js`         |
| Utilities         | camelCase.jsx               | `tableUtils.jsx`                  |
| Custom Components | T + PascalCase.jsx          | `TSelect.jsx`, `TMetricBlock.jsx` |
| SCSS Files        | \_partial.scss or name.scss | `_datepicker.scss`                |

## Component Structure

```jsx
// 1. Imports (in order)
import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';

// External libraries
import { Box, Typography, Button } from '@mui/material';
import { TButton, TLoader } from 'tj-components';
import dayjs from 'dayjs';

// Internal imports
import { useFetchDataQuery } from '../features/data/dataApiSlice';
import { setFilters } from '../features/data/dataFilterSlice';
import { formatCurrency } from '../utils';

// Local components
import DataTable from './DataTable';

// Assets
import logo from 'assets/images/logo.svg';

// 2. Component Definition
const ComponentName = ({ prop1, prop2 = 'default' }) => {
  // Hooks first
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const filters = useSelector((state) => state.filters);

  // RTK Query hooks
  const { data, isLoading, error } = useFetchDataQuery(params);

  // Local state
  const [localState, setLocalState] = useState(null);

  // Derived/computed values
  const processedData = useMemo(() => {
    return data?.map((item) => transform(item));
  }, [data]);

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependency]);

  // Event handlers
  const handleClick = () => {
    dispatch(setFilters(newFilters));
  };

  // Early returns for loading/error states
  if (isLoading) {
    return <TLoader />;
  }

  if (error) return <ErrorDisplay error={error} />;

  // Main render
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h2">{prop1}</Typography>
      <DataTable data={processedData} />
    </Box>
  );
};

// 3. PropTypes (if not using TypeScript)
ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.string,
};

// 4. Export
export default ComponentName;
```

## Naming Conventions

### Variables and Functions

```javascript
// camelCase for variables and functions
const userName = 'John';
const isLoading = true;
const handleSubmit = () => {};
const formatCurrency = (value) => {};

// UPPER_SNAKE_CASE for constants
const API_TIMEOUT = 300000;
const MAX_RETRIES = 3;

// Prefix boolean variables with is/has/should
const isVisible = true;
const hasPermission = false;
const shouldRefresh = true;
```

### React Hooks

```javascript
// Custom hooks prefixed with 'use'
const useAuth = () => {};
const useFilters = () => {};

// Event handlers prefixed with 'handle'
const handleClick = () => {};
const handleSubmit = () => {};
const handleFilterChange = () => {};
```

### Redux

```javascript
// Actions: verb + noun
setTransactionFilters;
resetFilters;
updateUserProfile;
clearError;

// Selectors: select + noun
selectUser;
selectFilters;
selectTransactions;

// Slice names: feature name (singular)
user;
transactionFilters;
lookupData;
```

## Import Organization

```javascript
// 1. React core
import { useState, useEffect } from 'react';

// 2. React ecosystem (Redux, Router)
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';

// 3. External libraries (alphabetical)
import { Box, Button, Typography } from '@mui/material';
import dayjs from 'dayjs';
import lodash from 'lodash';

// 4. Internal features/slices
import { useFetchDataQuery } from '../features/data/dataApiSlice';
import { setFilters } from '../features/data/filterSlice';

// 5. Components
import { TButton, TLoader } from 'tj-components';
import CustomComponent from '../components/CustomComponent';

// 6. Utilities
import { formatCurrency, formatDate } from '../utils';

// 7. Assets
import logo from 'assets/images/logo.svg';
import 'assets/scss/styles.scss';
```

## ESLint Rules

Key rules enforced:

```javascript
{
  "no-unused-vars": "error",
  "no-console": "error",  // No console.log in production
  "react/prop-types": "warn",
  "react/jsx-uses-react": "off",  // React 17+ JSX transform
  "react/react-in-jsx-scope": "off",
  "import/order": ["error", {
    "groups": ["builtin", "external", "internal", "parent", "sibling"]
  }]
}
```

## Formatting (Prettier)

```yaml
# .prettierrc.yml
printWidth: 100
tabWidth: 2
useTabs: false
semi: true
singleQuote: true
trailingComma: es5
bracketSpacing: true
jsxBracketSameLine: false
arrowParens: always
```

## Comments

```javascript
// Single-line comment for brief explanations

/**
 * Multi-line comment for complex logic
 * Explain the "why", not the "what"
 */

// TODO: Description of what needs to be done
// FIXME: Description of known issue

// JSDoc for utility functions
/**
 * Formats a number as currency
 * @param {number} value - The value to format
 * @param {string} currencyCode - ISO 4217 currency code
 * @returns {string} Formatted currency string
 */
const formatCurrency = (value, currencyCode) => {};
```
