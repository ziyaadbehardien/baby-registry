# API Patterns Guidelines

## Base API Configuration

```javascript
// src/features/api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setErrorStatus } from '../error/errorSlice';

// Custom base query with interceptor
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  timeout: 300000, // 5 minutes
  prepareHeaders: (headers) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Wrapper with error handling
const baseQueryWithInterceptor = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const status = result.error.status === 404 ? 500 : result.error.status;
    api.dispatch(
      setErrorStatus({
        status,
        message: result.error.data?.message,
      }),
    );
  }

  return result;
};

// Create base API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithInterceptor,
  tagTypes: ['Partitions', 'Tasks', 'RunningTasks'],  // Add new tag types here as features grow
  endpoints: () => ({}), // Extended by feature slices
});
```

## Creating Feature API Slices

```javascript
// src/features/transactions/transactionsApiSlice.js
import { apiSlice } from '../api/apiSlice';
import { formatCurrency, formatDate } from '../../utils';
import currencyCodes from 'currency-codes';

export const transactionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Query endpoint
    fetchTransactions: builder.query({
      query: ({ page = 0, size = 20, sort, filters }) => ({
        url: '/transactions',
        params: {
          page,
          size,
          sort: sort || 'createdDate,desc',
          ...filters,
        },
      }),
      // Transform API response
      transformResponse: (response) => ({
        content: response.content.map((item) => ({
          ...item,
          formattedAmount: formatCurrency(item.amount, currencyCodes.code(item.currencyCode)?.currency),
          formattedDate: formatDate(item.createdDate),
        })),
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      }),
      // Cache management
      providesTags: (result) =>
        result
          ? [...result.content.map(({ id }) => ({ type: 'Transactions', id })), { type: 'Transactions', id: 'LIST' }]
          : [{ type: 'Transactions', id: 'LIST' }],
      // Don't cache (always refetch)
      keepUnusedDataFor: 0,
    }),

    // Query by ID
    fetchTransactionById: builder.query({
      query: (id) => `/transactions/${id}`,
      transformResponse: (response) => ({
        ...response,
        formattedAmount: formatCurrency(response.amount),
      }),
      providesTags: (result, error, id) => [{ type: 'Transactions', id }],
    }),

    // Mutation endpoint
    updateTransaction: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/transactions/${id}`,
        method: 'PUT',
        body: data,
      }),
      // Invalidate cache on success
      invalidatesTags: (result, error, { id }) => [
        { type: 'Transactions', id },
        { type: 'Transactions', id: 'LIST' },
      ],
    }),

    // POST mutation
    createNote: builder.mutation({
      query: (data) => ({
        url: '/notes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Notes'],
    }),

    // DELETE mutation
    deleteNote: builder.mutation({
      query: (id) => ({
        url: `/notes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notes'],
    }),
  }),
});

// Export hooks
export const {
  useFetchTransactionsQuery,
  useLazyFetchTransactionsQuery,
  useFetchTransactionByIdQuery,
  useUpdateTransactionMutation,
  useCreateNoteMutation,
  useDeleteNoteMutation,
} = transactionsApiSlice;
```

## Using API Hooks in Components

### Query Hooks

```jsx
import { useFetchTransactionsQuery } from '../features/transactions/transactionsApiSlice';

const TransactionsPage = () => {
  const [page, setPage] = useState(0);
  const filters = useSelector(selectFilters);

  const { data, isLoading, isFetching, isError, error, refetch } = useFetchTransactionsQuery({
    page,
    size: 20,
    filters,
  });

  if (isLoading) return <TLoader />;
  if (isError) return <ErrorDisplay error={error} />;

  return (
    <div>
      {isFetching && <RefetchIndicator />}
      <TransactionsTable data={data.content} totalPages={data.totalPages} onPageChange={setPage} />
      <Button onClick={refetch}>Refresh</Button>
    </div>
  );
};
```

### Lazy Query Hooks

```jsx
import { useLazyFetchTransactionsQuery } from '../features/transactions/transactionsApiSlice';

const SearchComponent = () => {
  const [trigger, { data, isLoading }] = useLazyFetchTransactionsQuery();

  const handleSearch = (searchTerm) => {
    trigger({ filters: { search: searchTerm } });
  };

  return (
    <div>
      <SearchInput onSearch={handleSearch} />
      {isLoading && <TLoader />}
      {data && <ResultsList data={data.content} />}
    </div>
  );
};
```

### Mutation Hooks

```jsx
import { useUpdateTransactionMutation } from '../features/transactions/transactionsApiSlice';
import { useSnackbar } from 'notistack';

const EditTransaction = ({ transaction }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [updateTransaction, { isLoading }] = useUpdateTransactionMutation();

  const handleSave = async (formData) => {
    try {
      await updateTransaction({
        id: transaction.id,
        ...formData,
      }).unwrap();

      enqueueSnackbar('Transaction updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update transaction', { variant: 'error' });
    }
  };

  return (
    <form onSubmit={handleSave}>
      {/* Form fields */}
      <TButton loading={isLoading} type="submit">
        Save
      </TButton>
    </form>
  );
};
```

## Query Parameter Building

```javascript
// src/utils/apiFilters.jsx
export const populateFilters = (filters) => {
  const params = {};

  if (filters.dateFrom) {
    params.fromDate = filters.dateFrom;
  }
  if (filters.dateTo) {
    params.toDate = filters.dateTo;
  }
  if (filters.storeIds?.length > 0) {
    params.storeIds = filters.storeIds.join(',');
  }
  if (filters.status) {
    params.status = filters.status;
  }
  // Add more filter mappings as needed

  return params;
};
```

## Response Transformation Patterns

```javascript
// Date formatting
import dayjs from 'dayjs';

const formatDate = (date) => dayjs(date).format('DD MMM YYYY HH:mm');

// Currency formatting
import currencyCodes from 'currency-codes';

const formatCurrency = (value, currencyCode) => {
  const currency = currencyCodes.code(currencyCode);
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currencyCode || 'ZAR',
  }).format(value);
};

// Text normalization
const normalizeStatus = (status) => {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
};
```

## Cache Management

```javascript
// Invalidate specific tags after mutation
invalidatesTags: ['Transactions'];

// Invalidate by ID
invalidatesTags: (result, error, id) => [{ type: 'Transactions', id }];

// Provide tags for caching
providesTags: ['Transactions'];

// Provide tags by ID for granular invalidation
providesTags: (result) => (result ? result.map(({ id }) => ({ type: 'Transactions', id })) : ['Transactions']);

// Force refetch (no caching)
keepUnusedDataFor: 0;

// Cache for 5 minutes
keepUnusedDataFor: 300;
```

## Error Handling

```javascript
// In component
const { data, isError, error } = useQuery();

if (isError) {
  if (error.status === 401) {
    // Redirect to login
  } else if (error.status === 403) {
    // Show access denied
  } else {
    // Show generic error
  }
}

// Using try-catch with mutations
try {
  await mutation(data).unwrap();
} catch (error) {
  console.error('Mutation failed:', error);
  // Handle specific error codes
}
```
