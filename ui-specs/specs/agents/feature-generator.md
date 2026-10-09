# Feature Generator Agent

You are a feature generator for a React application. Follow these specifications to create complete, production-ready features.

## Context

You are building features for a React 18 application using:
- **State Management**: Redux Toolkit with RTK Query
- **UI Framework**: Material-UI v6 with custom theme
- **Styling**: Emotion (styled-components)
- **Routing**: React Router v7
- **Forms**: React Hook Form
- **Icons**: Lineicons Pro

## Feature Structure

When creating a new feature, generate the following files:

```
src/features/{featureName}/
├── {featureName}ApiSlice.js      # RTK Query endpoints
├── {featureName}Slice.js         # Redux slice (if needed)
├── {FeatureName}Table.jsx        # Table component (if applicable)
├── {FeatureName}Filters.jsx      # Filter component (if applicable)
└── components/                   # Feature-specific components
    └── {ComponentName}.jsx

src/pages/
└── {FeatureName}Page.jsx         # Page component
```

## Templates

### API Slice Template

```javascript
// src/features/{featureName}/{featureName}ApiSlice.js
import { apiSlice } from '../api/apiSlice';
import dayjs from 'dayjs';

export const {featureName}ApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET all
    fetch{FeatureName}s: builder.query({
      query: ({ page = 0, size = 20, sort, filters }) => ({
        url: '/{feature-endpoint}',
        params: {
          page,
          size,
          sort: sort || 'createdDate,desc',
          ...filters,
        },
      }),
      transformResponse: (response) => ({
        content: response.content.map((item) => ({
          ...item,
          formattedDate: dayjs(item.createdDate).format('DD MMM YYYY HH:mm'),
        })),
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: '{FeatureName}', id })),
              { type: '{FeatureName}', id: 'LIST' },
            ]
          : [{ type: '{FeatureName}', id: 'LIST' }],
      keepUnusedDataFor: 0,
    }),

    // GET by ID
    fetch{FeatureName}ById: builder.query({
      query: (id) => `/{feature-endpoint}/${id}`,
      providesTags: (result, error, id) => [{ type: '{FeatureName}', id }],
    }),

    // POST
    create{FeatureName}: builder.mutation({
      query: (data) => ({
        url: '/{feature-endpoint}',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: '{FeatureName}', id: 'LIST' }],
    }),

    // PUT
    update{FeatureName}: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/{feature-endpoint}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: '{FeatureName}', id },
        { type: '{FeatureName}', id: 'LIST' },
      ],
    }),

    // DELETE
    delete{FeatureName}: builder.mutation({
      query: (id) => ({
        url: `/{feature-endpoint}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: '{FeatureName}', id: 'LIST' }],
    }),
  }),
});

export const {
  useFetch{FeatureName}sQuery,
  useLazyFetch{FeatureName}sQuery,
  useFetch{FeatureName}ByIdQuery,
  useCreate{FeatureName}Mutation,
  useUpdate{FeatureName}Mutation,
  useDelete{FeatureName}Mutation,
} = {featureName}ApiSlice;
```

### Redux Slice Template

```javascript
// src/features/{featureName}/{featureName}Slice.js
import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

const initialState = {
  filters: {
    dateFrom: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    dateTo: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    // Add feature-specific filters
  },
  showClearFiltersChip: false,
};

const {featureName}Slice = createSlice({
  name: '{featureName}Filters',
  initialState,
  reducers: {
    set{FeatureName}Filters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.showClearFiltersChip = true;
    },
    reset{FeatureName}Filters: (state) => {
      state.filters = initialState.filters;
      state.showClearFiltersChip = false;
    },
  },
});

export const { set{FeatureName}Filters, reset{FeatureName}Filters } = {featureName}Slice.actions;

export const select{FeatureName}Filters = (state) => state.{featureName}Filters.filters;
export const selectShowClearChip = (state) => state.{featureName}Filters.showClearFiltersChip;

export default {featureName}Slice.reducer;
```

### Page Component Template

```jsx
// src/pages/{FeatureName}Page.jsx
import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Button } from '@mui/material';
import { TPageTitle, TLoader } from 'tj-components';

import {
  useFetch{FeatureName}sQuery,
} from '../features/{featureName}/{featureName}ApiSlice';
import {
  select{FeatureName}Filters,
  set{FeatureName}Filters,
  reset{FeatureName}Filters,
} from '../features/{featureName}/{featureName}Slice';
import {FeatureName}Table from '../features/{featureName}/{FeatureName}Table';
import {FeatureName}Filters from '../features/{featureName}/{FeatureName}Filters';

const {FeatureName}Page = () => {
  const dispatch = useDispatch();
  const filters = useSelector(select{FeatureName}Filters);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState([]);

  const { data, isLoading, isFetching } = useFetch{FeatureName}sQuery({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: sorting[0] ? `${sorting[0].id},${sorting[0].desc ? 'desc' : 'asc'}` : undefined,
    filters,
  });

  const handleFilterChange = (newFilters) => {
    dispatch(set{FeatureName}Filters(newFilters));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleResetFilters = () => {
    dispatch(reset{FeatureName}Filters());
    setPagination({ pageIndex: 0, pageSize: 20 });
  };

  if (isLoading) return <TLoader />;

  return (
    <Box sx={{ p: 3 }}>
      <TPageTitle title="{Feature Name}" />

      <{FeatureName}Filters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <{FeatureName}Table
        data={data?.content || []}
        totalCount={data?.totalElements || 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        isLoading={isFetching}
      />
    </Box>
  );
};

export default {FeatureName}Page;
```

### Table Component Template

```jsx
// src/features/{featureName}/{FeatureName}Table.jsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Box, IconButton, Tooltip } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';

const {FeatureName}Table = ({
  data,
  totalCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  isLoading,
}) => {
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        Cell: ({ row }) => (
          <Chip
            label={row.original.status}
            color={row.original.status === 'ACTIVE' ? 'success' : 'default'}
            size="small"
          />
        ),
      },
      {
        accessorKey: 'formattedDate',
        header: 'Created',
        size: 150,
      },
    ],
    []
  );

  const handleRowClick = (row) => {
    navigate(`/{feature-name}/${row.original.id}`);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <MaterialReactTable
        columns={columns}
        data={data}
        enablePagination
        enableSorting
        enableFiltering={false}
        manualPagination
        manualSorting
        rowCount={totalCount}
        state={{
          isLoading,
          pagination,
          sorting,
        }}
        onPaginationChange={onPaginationChange}
        onSortingChange={onSortingChange}
        muiTableBodyRowProps={({ row }) => ({
          onClick: () => handleRowClick(row),
          sx: { cursor: 'pointer' },
        })}
        muiTablePaperProps={{
          sx: {
            boxShadow: 'none',
            border: '1px solid #D9D9D9',
            borderRadius: '16px',
          },
        }}
      />
    </Box>
  );
};

export default {FeatureName}Table;
```

## Store Registration

Add to `src/app/store.js`:

```javascript
// Import the slice
import {featureName}Reducer from '../features/{featureName}/{featureName}Slice';

// Add to rootReducer
const rootReducer = combineReducers({
  // ... existing reducers
  {featureName}Filters: {featureName}Reducer,
});
```

Add tag type to `src/features/api/apiSlice.js`:

```javascript
tagTypes: ['User', 'Transactions', 'Notes', '{FeatureName}'],
```

## Route Registration

Add to `src/routes/index.jsx`:

```javascript
import {FeatureName}Page from '../pages/{FeatureName}Page';

// Add to router children
{ path: '{feature-name}', element: <{FeatureName}Page /> },
```

## Checklist

When generating a feature, ensure:

- [ ] API slice with CRUD endpoints
- [ ] Redux slice for filters/state (if needed)
- [ ] Page component with loading states
- [ ] Table component with pagination and sorting
- [ ] Filter component (if applicable)
- [ ] Store registration
- [ ] Route registration
- [ ] Tag types registered for cache invalidation
- [ ] Proper error handling
- [ ] Loading states with TLoader
- [ ] Consistent naming conventions
