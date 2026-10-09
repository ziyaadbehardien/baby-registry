# State Management Guidelines

## Overview

This project uses **Redux Toolkit** for state management with **RTK Query** for server state. Follow these patterns for consistency.

## Store Configuration

```javascript
// src/app/store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// API slices
import { apiSlice } from '../features/api/apiSlice';

// Feature slices
import userReducer from '../features/user/userSlice';
import filtersReducer from '../features/filters/filtersSlice';

// Persistence config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['lookupData'], // Only persist specific slices
};

const rootReducer = combineReducers({
  // API reducers
  [apiSlice.reducerPath]: apiSlice.reducer,

  // Feature reducers
  user: userReducer,
  filters: filtersReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }).concat(apiSlice.middleware),
  devTools: import.meta.env.DEV,
});

setupListeners(store.dispatch);
export const persistor = persistStore(store);
```

## Creating a Redux Slice

```javascript
// src/features/{featureName}/{featureName}Slice.js
import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

const initialState = {
  // Define initial state with sensible defaults
  filters: {
    dateFrom: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    dateTo: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    storeIds: [],
    status: null,
  },
  showClearFiltersChip: false,
};

const filtersSlice = createSlice({
  name: 'transactionFilters',
  initialState,
  reducers: {
    // Action to update filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.showClearFiltersChip = true;
    },

    // Action to reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.showClearFiltersChip = false;
    },

    // Action for specific field
    setDateRange: (state, action) => {
      const { dateFrom, dateTo } = action.payload;
      state.filters.dateFrom = dateFrom;
      state.filters.dateTo = dateTo;
    },
  },
});

// Export actions
export const { setFilters, resetFilters, setDateRange } = filtersSlice.actions;

// Export selectors
export const selectFilters = (state) => state.transactionFilters.filters;
export const selectShowClearChip = (state) => state.transactionFilters.showClearFiltersChip;

// Export reducer
export default filtersSlice.reducer;
```

## Using Redux in Components

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { setFilters, resetFilters, selectFilters } from '../features/filters/filtersSlice';

const FilterComponent = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);

  const handleFilterChange = (newFilter) => {
    dispatch(setFilters(newFilter));
  };

  const handleReset = () => {
    dispatch(resetFilters());
  };

  return (
    <div>
      <FilterInput
        value={filters.storeId}
        onChange={(value) => handleFilterChange({ storeId: value })}
      />
      <Button onClick={handleReset}>Clear Filters</Button>
    </div>
  );
};
```

## State Categories

### When to Use Redux

| Use Redux For | Examples |
|---------------|----------|
| User authentication | User profile, roles, permissions |
| Filters shared across components | Transaction filters, date ranges |
| Cached lookup data | Store lists, status codes |
| Application-wide state | Error status, maintenance mode |
| State that survives navigation | Selected items, preferences |

### When to Use Local State

| Use Local State For | Examples |
|---------------------|----------|
| Form input values | Text inputs, checkboxes |
| UI state | Modals open/closed, tooltips |
| Component-specific state | Loading spinners, animations |
| Temporary data | Hover states, focus states |

```jsx
// Local state example
const [isModalOpen, setIsModalOpen] = useState(false);
const [inputValue, setInputValue] = useState('');
```

## Selector Patterns

```javascript
// Simple selector
export const selectUser = (state) => state.user;

// Computed selector
export const selectFullName = (state) => {
  const { firstName, lastName } = state.user;
  return `${firstName} ${lastName}`;
};

// Memoized selector (for complex computations)
import { createSelector } from '@reduxjs/toolkit';

export const selectFilteredTransactions = createSelector(
  [selectTransactions, selectFilters],
  (transactions, filters) => {
    return transactions.filter(t => matchesFilters(t, filters));
  }
);
```

## Error State Pattern

```javascript
// src/features/error/errorSlice.js
import { createSlice } from '@reduxjs/toolkit';

const errorSlice = createSlice({
  name: 'errorStatus',
  initialState: { status: null, message: null },
  reducers: {
    setErrorStatus: (state, action) => {
      state.status = action.payload.status;
      state.message = action.payload.message;
    },
    clearError: (state) => {
      state.status = null;
      state.message = null;
    },
  },
});

export const { setErrorStatus, clearError } = errorSlice.actions;
export default errorSlice.reducer;
```

## Provider Setup

```jsx
// src/main.jsx
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={<TLoader />} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);
```
