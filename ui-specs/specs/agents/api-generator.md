# API Generator Agent

You are an API slice generator for a React application using Redux Toolkit Query. Follow these specifications to create consistent, production-ready API integrations.

## Context

You are creating API slices for a React 18 application using:
- **Data Fetching**: RTK Query (Redux Toolkit Query)
- **Base Configuration**: Centralized in `src/features/api/apiSlice.js`
- **Authentication**: Bearer token from sessionStorage
- **Error Handling**: Global error interceptor

## Base API Configuration

The base API is already configured at `src/features/api/apiSlice.js`:

```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setErrorStatus } from '../error/errorSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  timeout: 300000,
  prepareHeaders: (headers) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithInterceptor = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error) {
    api.dispatch(setErrorStatus({
      status: result.error.status,
      message: result.error.data?.message,
    }));
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithInterceptor,
  tagTypes: ['User', 'Transactions', 'Notes', 'Stores'],
  endpoints: () => ({}),
});
```

## API Slice Template

```javascript
// src/features/{featureName}/{featureName}ApiSlice.js
import { apiSlice } from '../api/apiSlice';
import dayjs from 'dayjs';
import currencyCodes from 'currency-codes';

// Transformation helpers
const transformItem = (item) => ({
  ...item,
  formattedDate: item.createdDate
    ? dayjs(item.createdDate).format('DD MMM YYYY HH:mm')
    : null,
  formattedAmount: item.amount
    ? new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: item.currencyCode || 'ZAR',
      }).format(item.amount)
    : null,
});

export const {featureName}ApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ============================================
    // QUERIES
    // ============================================

    // List endpoint with pagination
    fetch{FeatureName}s: builder.query({
      query: ({ page = 0, size = 20, sort, ...filters }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (sort) params.append('sort', sort);

        // Add filter params
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value);
            }
          }
        });

        return `/{feature-endpoint}?${params.toString()}`;
      },
      transformResponse: (response) => ({
        content: response.content.map(transformItem),
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        number: response.number,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: '{FeatureName}', id })),
              { type: '{FeatureName}', id: 'LIST' },
            ]
          : [{ type: '{FeatureName}', id: 'LIST' }],
      keepUnusedDataFor: 0, // Don't cache, always refetch
    }),

    // Single item by ID
    fetch{FeatureName}ById: builder.query({
      query: (id) => `/{feature-endpoint}/${id}`,
      transformResponse: transformItem,
      providesTags: (result, error, id) => [{ type: '{FeatureName}', id }],
    }),

    // Search/lookup endpoint
    search{FeatureName}s: builder.query({
      query: (searchTerm) => ({
        url: '/{feature-endpoint}/search',
        params: { q: searchTerm },
      }),
      transformResponse: (response) => response.map(transformItem),
      // Short cache for autocomplete
      keepUnusedDataFor: 60,
    }),

    // ============================================
    // MUTATIONS
    // ============================================

    // Create
    create{FeatureName}: builder.mutation({
      query: (data) => ({
        url: '/{feature-endpoint}',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: '{FeatureName}', id: 'LIST' }],
    }),

    // Update
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

    // Patch (partial update)
    patch{FeatureName}: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/{feature-endpoint}/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: '{FeatureName}', id }],
    }),

    // Delete
    delete{FeatureName}: builder.mutation({
      query: (id) => ({
        url: `/{feature-endpoint}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: '{FeatureName}', id },
        { type: '{FeatureName}', id: 'LIST' },
      ],
    }),

    // Bulk operations
    bulkUpdate{FeatureName}s: builder.mutation({
      query: (items) => ({
        url: '/{feature-endpoint}/bulk',
        method: 'PUT',
        body: items,
      }),
      invalidatesTags: [{ type: '{FeatureName}', id: 'LIST' }],
    }),
  }),
});

// Export hooks
export const {
  // Queries
  useFetch{FeatureName}sQuery,
  useLazyFetch{FeatureName}sQuery,
  useFetch{FeatureName}ByIdQuery,
  useLazyFetch{FeatureName}ByIdQuery,
  useSearch{FeatureName}sQuery,
  useLazySearch{FeatureName}sQuery,
  // Mutations
  useCreate{FeatureName}Mutation,
  useUpdate{FeatureName}Mutation,
  usePatch{FeatureName}Mutation,
  useDelete{FeatureName}Mutation,
  useBulkUpdate{FeatureName}sMutation,
} = {featureName}ApiSlice;
```

## Usage Patterns

### Query in Component

```jsx
import { useFetch{FeatureName}sQuery } from '../features/{featureName}/{featureName}ApiSlice';

const MyComponent = () => {
  const [page, setPage] = useState(0);
  const filters = useSelector(selectFilters);

  const {
    data,
    isLoading,      // First load
    isFetching,     // Any load (including refetch)
    isError,
    error,
    refetch,
  } = useFetch{FeatureName}sQuery({
    page,
    size: 20,
    ...filters,
  });

  if (isLoading) return <TLoader />;
  if (isError) return <ErrorDisplay error={error} />;

  return (
    <>
      {isFetching && <RefreshIndicator />}
      <DataTable data={data.content} total={data.totalElements} />
    </>
  );
};
```

### Lazy Query

```jsx
import { useLazyFetch{FeatureName}ByIdQuery } from '../features/{featureName}/{featureName}ApiSlice';

const DetailComponent = () => {
  const [trigger, { data, isLoading }] = useLazyFetch{FeatureName}ByIdQuery();

  const handleSelect = (id) => {
    trigger(id);
  };

  return (
    <Select onChange={(e) => handleSelect(e.target.value)}>
      {/* options */}
    </Select>
  );
};
```

### Mutation

```jsx
import { useCreate{FeatureName}Mutation } from '../features/{featureName}/{featureName}ApiSlice';
import { useSnackbar } from 'notistack';

const CreateComponent = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [create, { isLoading }] = useCreate{FeatureName}Mutation();

  const handleSubmit = async (formData) => {
    try {
      await create(formData).unwrap();
      enqueueSnackbar('Created successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.data?.message || 'Failed to create', { variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <TButton loading={isLoading} type="submit">Create</TButton>
    </form>
  );
};
```

## Data Transformation Patterns

### Date Formatting

```javascript
import dayjs from 'dayjs';

const formatDate = (date, format = 'DD MMM YYYY HH:mm') => {
  if (!date) return null;
  return dayjs(date).format(format);
};

// In transformResponse
transformResponse: (response) => ({
  ...response,
  formattedCreatedDate: formatDate(response.createdDate),
  formattedUpdatedDate: formatDate(response.updatedDate, 'DD/MM/YYYY'),
}),
```

### Currency Formatting

```javascript
const formatCurrency = (amount, currencyCode = 'ZAR') => {
  if (amount === null || amount === undefined) return null;
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

// In transformResponse
transformResponse: (response) => ({
  ...response,
  formattedAmount: formatCurrency(response.amount, response.currencyCode),
}),
```

### Status Normalization

```javascript
const normalizeStatus = (status) => {
  if (!status) return null;
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
};

// PENDING_APPROVAL -> "Pending approval"
```

## Cache Management

### Tag Types

Register in base apiSlice:

```javascript
tagTypes: ['User', 'Transactions', 'Notes', 'Stores', '{NewFeature}'],
```

### Providing Tags

```javascript
// List endpoint
providesTags: (result) =>
  result
    ? [
        ...result.content.map(({ id }) => ({ type: 'Feature', id })),
        { type: 'Feature', id: 'LIST' },
      ]
    : [{ type: 'Feature', id: 'LIST' }],

// Single item
providesTags: (result, error, id) => [{ type: 'Feature', id }],
```

### Invalidating Tags

```javascript
// After create - invalidate list
invalidatesTags: [{ type: 'Feature', id: 'LIST' }],

// After update - invalidate specific item and list
invalidatesTags: (result, error, { id }) => [
  { type: 'Feature', id },
  { type: 'Feature', id: 'LIST' },
],

// After delete
invalidatesTags: (result, error, id) => [
  { type: 'Feature', id },
  { type: 'Feature', id: 'LIST' },
],
```

### Cache Duration

```javascript
// No caching (always fresh)
keepUnusedDataFor: 0,

// Short cache (60 seconds)
keepUnusedDataFor: 60,

// Default (60 seconds)
// Don't specify keepUnusedDataFor

// Long cache (5 minutes)
keepUnusedDataFor: 300,
```

## Error Handling

```javascript
// Conditional invalidation on success only
invalidatesTags: (result, error) =>
  error ? [] : [{ type: 'Feature', id: 'LIST' }],

// Custom error transformation
transformErrorResponse: (response) => ({
  status: response.status,
  message: response.data?.message || 'An error occurred',
  errors: response.data?.errors || [],
}),
```

## API Slice Checklist

When generating an API slice, ensure:

- [ ] Injected into base apiSlice
- [ ] Tag type registered in base apiSlice
- [ ] Pagination parameters handled
- [ ] Filter parameters mapped correctly
- [ ] Response transformation applied
- [ ] Proper cache tags (providesTags)
- [ ] Cache invalidation (invalidatesTags)
- [ ] All hooks exported
- [ ] Lazy query hooks included
- [ ] Date/currency formatting in transformResponse
- [ ] Error responses handled
