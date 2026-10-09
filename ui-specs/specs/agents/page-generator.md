# Page Generator Agent

You are a page component generator for a React application. Follow these specifications to create consistent, production-ready page components.

## Context

You are creating pages for a React 18 application using:
- **UI Framework**: Material-UI v6
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v7
- **Component Library**: TJ Components + Custom components

## Page Structure

### Location and Naming

- Location: `src/pages/{PageName}Page.jsx`
- Naming: PascalCase with `Page` suffix
- Examples: `TransactionsPage.jsx`, `SystemAdminPage.jsx`, `UserProfilePage.jsx`

## Page Templates

### List Page Template

```jsx
// src/pages/{FeatureName}Page.jsx
import { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Button, Chip } from '@mui/material';
import { TPageTitle, TLoader, TButton } from 'tj-components';

import {
  useFetch{FeatureName}sQuery,
} from '../features/{featureName}/{featureName}ApiSlice';
import {
  select{FeatureName}Filters,
  selectShowClearChip,
  set{FeatureName}Filters,
  reset{FeatureName}Filters,
} from '../features/{featureName}/{featureName}Slice';
import {FeatureName}Table from '../features/{featureName}/{FeatureName}Table';
import {FeatureName}Filters from '../features/{featureName}/{FeatureName}Filters';
import TMetricBlock from '../components/common/TMetricBlock';
import TExportButton from '../components/common/TExportButton';
import TDateRangeFilter from '../components/common/TDateRangeFilter';

const {FeatureName}Page = () => {
  const dispatch = useDispatch();

  // Redux state
  const filters = useSelector(select{FeatureName}Filters);
  const showClearChip = useSelector(selectShowClearChip);

  // Local state
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // API query
  const { data, isLoading, isFetching, refetch } = useFetch{FeatureName}sQuery({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: sorting[0]
      ? `${sorting[0].id},${sorting[0].desc ? 'desc' : 'asc'}`
      : 'createdDate,desc',
    ...filters,
  });

  // Handlers
  const handleFilterChange = useCallback((newFilters) => {
    dispatch(set{FeatureName}Filters(newFilters));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [dispatch]);

  const handleDateChange = useCallback(({ startDate, endDate }) => {
    handleFilterChange({ dateFrom: startDate, dateTo: endDate });
  }, [handleFilterChange]);

  const handleResetFilters = useCallback(() => {
    dispatch(reset{FeatureName}Filters());
    setPagination({ pageIndex: 0, pageSize: 20 });
    setSorting([]);
  }, [dispatch]);

  // Computed values
  const metrics = useMemo(() => {
    if (!data) return null;
    return {
      total: data.totalElements,
      // Add more computed metrics
    };
  }, [data]);

  // Loading state
  if (isLoading) return <TLoader />;

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TPageTitle title="{Feature Name}" />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TExportButton
            data={data?.content || []}
            filename="{feature-name}"
            disabled={!data?.content?.length}
          />
          <TButton
            variant="contained"
            onClick={() => {/* Create action */}}
            startIcon={<i className="lni lni-plus" />}
          >
            Add New
          </TButton>
        </Box>
      </Box>

      {/* Metrics Row */}
      {metrics && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TMetricBlock
            title="Total Records"
            value={metrics.total.toLocaleString()}
            icon={<i className="lni lni-files-1" />}
            color="blue"
          />
          {/* Add more metrics */}
        </Box>
      )}

      {/* Filters Row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <TDateRangeFilter
          startDate={filters.dateFrom}
          endDate={filters.dateTo}
          onChange={handleDateChange}
        />

        <Button
          variant="outlined"
          onClick={() => setIsFilterOpen(true)}
          startIcon={<i className="lni lni-sliders-triple-horizontal-1" />}
        >
          Filters
        </Button>

        {showClearChip && (
          <Chip
            label="Clear filters"
            onDelete={handleResetFilters}
            color="primary"
            variant="outlined"
          />
        )}

        {isFetching && (
          <Box sx={{ ml: 'auto' }}>
            <i className="lni lni-spinner-1 lni-is-spinning" />
          </Box>
        )}
      </Box>

      {/* Filter Drawer/Modal */}
      <{FeatureName}Filters
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Data Table */}
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

### Detail Page Template

```jsx
// src/pages/{FeatureName}DetailPage.jsx
import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Box, Button, Grid2, Typography, Divider } from '@mui/material';
import { TPageTitle, TLoader } from 'tj-components';

import { useFetch{FeatureName}ByIdQuery } from '../features/{featureName}/{featureName}ApiSlice';
import TBreadcrumbs from '../components/common/TBreadcrumbs';
import TCard from '../components/common/TCard';

const {FeatureName}DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useFetch{FeatureName}ByIdQuery(id);

  const breadcrumbs = useMemo(() => [
    { label: '{Feature Name}', path: '/{feature-name}' },
    { label: id },
  ], [id]);

  if (isLoading) return <TLoader />;

  if (isError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          {error?.data?.message || 'Failed to load data'}
        </Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <TBreadcrumbs items={breadcrumbs} />

      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TPageTitle title="{Feature Name} Details" />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            startIcon={<i className="lni lni-chevron-left" />}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() => {/* Edit action */}}
            startIcon={<i className="lni lni-pencil-1" />}
          >
            Edit
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 8 }}>
          <TCard title="Details">
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Field Label
                </Typography>
                <Typography variant="body1">
                  {data?.fieldValue || '-'}
                </Typography>
              </Grid2>
              {/* More fields */}
            </Grid2>
          </TCard>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 4 }}>
          <TCard title="Status">
            {/* Status info */}
          </TCard>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default {FeatureName}DetailPage;
```

### Form Page Template

```jsx
// src/pages/{FeatureName}FormPage.jsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { Box, TextField, Button, Grid2 } from '@mui/material';
import { TPageTitle, TLoader } from 'tj-components';
import { useSnackbar } from 'notistack';

import {
  useFetch{FeatureName}ByIdQuery,
  useCreate{FeatureName}Mutation,
  useUpdate{FeatureName}Mutation,
} from '../features/{featureName}/{featureName}ApiSlice';
import TBreadcrumbs from '../components/common/TBreadcrumbs';

const {FeatureName}FormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const isEdit = Boolean(id);

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      // Add more fields
    },
  });

  // API hooks
  const { data: existingData, isLoading: isLoadingData } = useFetch{FeatureName}ByIdQuery(id, {
    skip: !isEdit,
  });
  const [create, { isLoading: isCreating }] = useCreate{FeatureName}Mutation();
  const [update, { isLoading: isUpdating }] = useUpdate{FeatureName}Mutation();

  const isSubmitting = isCreating || isUpdating;

  // Populate form when editing
  useEffect(() => {
    if (existingData) {
      reset({
        name: existingData.name || '',
        description: existingData.description || '',
        // Map more fields
      });
    }
  }, [existingData, reset]);

  // Form submit
  const onSubmit = async (formData) => {
    try {
      if (isEdit) {
        await update({ id, ...formData }).unwrap();
        enqueueSnackbar('Updated successfully', { variant: 'success' });
      } else {
        await create(formData).unwrap();
        enqueueSnackbar('Created successfully', { variant: 'success' });
      }
      navigate('/{feature-name}');
    } catch (error) {
      enqueueSnackbar(error.data?.message || 'Operation failed', { variant: 'error' });
    }
  };

  const breadcrumbs = [
    { label: '{Feature Name}', path: '/{feature-name}' },
    { label: isEdit ? 'Edit' : 'Create' },
  ];

  if (isLoadingData) return <TLoader />;

  return (
    <Box sx={{ p: 3 }}>
      <TBreadcrumbs items={breadcrumbs} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TPageTitle title={isEdit ? 'Edit {Feature Name}' : 'Create {Feature Name}'} />
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid2>

          <Grid2 size={{ xs: 12 }}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                />
              )}
            />
          </Grid2>

          {/* Add more form fields */}

          <Grid2 size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || !isDirty}
              >
                {isSubmitting ? (
                  <i className="lni lni-spinner-1 lni-is-spinning" />
                ) : isEdit ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </Button>
            </Box>
          </Grid2>
        </Grid2>
      </form>
    </Box>
  );
};

export default {FeatureName}FormPage;
```

## Route Registration

Add to `src/routes/index.jsx`:

```javascript
import {FeatureName}Page from '../pages/{FeatureName}Page';
import {FeatureName}DetailPage from '../pages/{FeatureName}DetailPage';
import {FeatureName}FormPage from '../pages/{FeatureName}FormPage';

// In router children
{ path: '{feature-name}', element: <{FeatureName}Page /> },
{ path: '{feature-name}/:id', element: <{FeatureName}DetailPage /> },
{ path: '{feature-name}/new', element: <{FeatureName}FormPage /> },
{ path: '{feature-name}/:id/edit', element: <{FeatureName}FormPage /> },
```

## Page Checklist

When generating a page, ensure:

- [ ] Proper file naming ({PageName}Page.jsx)
- [ ] TLoader for loading states
- [ ] Error handling and display
- [ ] Breadcrumbs for navigation
- [ ] Page title with TPageTitle
- [ ] Responsive layout with Grid2
- [ ] Pagination state management
- [ ] Filter state from Redux
- [ ] Proper data fetching with RTK Query
- [ ] Loading indicators during operations
- [ ] Success/error notifications with notistack
- [ ] Route registered in routes/index.jsx
- [ ] Back/cancel navigation handling
