# Component Patterns

## Component Naming Convention

Custom components are prefixed with `T`:

| Prefix | Meaning | Example |
|--------|---------|---------|
| `T` | TJ-branded component | `TButton`, `TSelect`, `TAccordion` |
| None | Standard/MUI component | `Modal`, `ErrorBoundary` |

## Core Components

### TAccordion

Expandable panel with custom styling.

```jsx
import { TAccordion } from '../components/common/TAccordion';

<TAccordion
  title="Section Title"
  subTitle="Optional subtitle"
  defaultExpanded={true}
  icon={<FilterIcon />}
  chip={<Chip label="5 items" />}
>
  {/* Content */}
</TAccordion>
```

**Structure:**
```jsx
const Accordion = styled(MuiAccordion)(({ theme }) => ({
  border: '1px solid #D9D9D9',
  borderRadius: '16px',
  '&:before': { display: 'none' },
  boxShadow: 'none',
}));

const AccordionSummary = styled(MuiAccordionSummary)({
  padding: '0.5rem 1rem',
  '& .MuiAccordionSummary-content': {
    alignItems: 'center',
  },
});
```

### TSelect

Enhanced autocomplete with multi-select support.

```jsx
import TSelect from '../components/common/TSelect';

<TSelect
  id="stores-select"
  label="Select Stores"
  options={storeOptions}
  value={selectedStores}
  onChange={handleChange}
  multiple={true}
  checkbox={true}
  fullWidth
  disabled={false}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array<{value, label}>` | `[]` | Options list |
| `value` | `any | any[]` | - | Selected value(s) |
| `onChange` | `function` | - | Change handler |
| `multiple` | `boolean` | `false` | Enable multi-select |
| `checkbox` | `boolean` | `false` | Show checkboxes |
| `label` | `string` | - | Input label |
| `fullWidth` | `boolean` | `false` | Full width |

### TMetricBlock

KPI/metric card with tooltip.

```jsx
import TMetricBlock from '../components/common/TMetricBlock';

<TMetricBlock
  title="Total Transactions"
  value="1,234"
  tooltipText="Last 24 hours"
  icon={<TransactionIcon />}
  color="blue" // 'blue' | 'green' | 'red'
/>
```

**Structure:**
```jsx
<Box sx={{
  background: color === 'green' ? '#16A8160D' : '#3471B71A',
  borderRadius: '16px',
  padding: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: 2,
}}>
  <Box sx={{
    background: color === 'green' ? '#117E11' : '#3471B7',
    borderRadius: '50%',
    padding: '0.75rem',
  }}>
    {icon}
  </Box>
  <Box>
    <Typography variant="body2">{title}</Typography>
    <Typography variant="metricTotal">{value}</Typography>
  </Box>
</Box>
```

### TFilters

Dynamic filter menu with multiple field types.

```jsx
import TFilters from '../components/common/TFilters';

const filterConfig = [
  { type: 'text', name: 'search', label: 'Search' },
  { type: 'select', name: 'status', label: 'Status', options: statusOptions },
  { type: 'currency', name: 'amount', label: 'Amount' },
];

<TFilters
  config={filterConfig}
  values={filterValues}
  onChange={handleFilterChange}
  onReset={handleReset}
/>
```

### TDateRangeFilter

Date range picker with popover.

```jsx
import TDateRangeFilter from '../components/common/TDateRangeFilter';

<TDateRangeFilter
  startDate={filters.dateFrom}
  endDate={filters.dateTo}
  onChange={({ startDate, endDate }) => {
    dispatch(setFilters({ dateFrom: startDate, dateTo: endDate }));
  }}
  maxDate={new Date()}
/>
```

### TExportButton

Export button with multiple format options.

```jsx
import TExportButton from '../components/common/TExportButton';

<TExportButton
  data={tableData}
  filename="transactions"
  formats={['csv', 'xlsx']}
  disabled={isLoading}
/>
```

### TBreadcrumbs

Navigation breadcrumbs with dynamic params.

```jsx
import TBreadcrumbs from '../components/common/TBreadcrumbs';

const crumbs = [
  { label: 'Home', path: '/' },
  { label: 'Transactions', path: '/transactions' },
  { label: transactionId }, // Current page (no path)
];

<TBreadcrumbs items={crumbs} />
```

### Modal

Dialog wrapper component.

```jsx
import Modal from '../components/common/Modal';

<Modal
  open={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  actions={
    <>
      <Button onClick={handleClose}>Cancel</Button>
      <Button variant="contained" onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <Typography>Are you sure?</Typography>
</Modal>
```

## Layout Components

### BaseLayout

Main application layout wrapper. Uses `TPage` from `tj-components` which provides the sidebar, top app bar, and drawer toggle out of the box.

```jsx
import { TPage } from 'tj-components';
import { Link } from 'react-router';

<TPage
  logo={logo}                        // SVG/image for sidebar logo
  tjApps={[]}                        // Array of TJ app launcher items (empty if single app)
  selectedApp="Admin Portal"         // App name shown in sidebar header and top bar
  activePage={location.pathname.slice(1)} // e.g. "billing" for /billing
  links={NAV_LINKS}                  // Main nav items
  extraLinks={EXTRA_LINKS}           // Bottom nav items (stacked below main nav)
  reactRouterLink={Link}             // Pass react-router Link for client-side nav
  collapsableList={{}}               // Map of collapsable group keys → open state
  user={{ displayName: userName }}   // User object for top bar display
  lineIcons                          // Enable Lineicons Pro class rendering
  renderAuthActions={<UserMenu />}   // Top bar right-side content (user avatar + dropdown)
>
  <Outlet />
</TPage>
```

**Link format** (used for both `links` and `extraLinks`):
```javascript
const NAV_LINKS = [
  { name: 'Billing',      href: '/billing',      icon: 'lni lni-invoice-1',  iconHover: 'lni lni-invoice-1' },
  { name: 'Archiving',    href: '/archiving',     icon: 'lni lni-database-1', iconHover: 'lni lni-database-1' },
  { name: 'IPG Config',   href: '/ipg-config',    icon: 'lni lni-gear-1',     iconHover: 'lni lni-gear-1' },
];

const EXTRA_LINKS = [
  { name: 'Support Queries', href: '/support', icon: 'lni lni-headphone-1', iconHover: 'lni lni-headphone-1' },
  { name: 'Help & Support',  href: '/help',    icon: 'lni lni-question-1',  iconHover: 'lni lni-question-1' },
];
```

**Active page matching:** `TPage` matches `activePage` against `"/" + activePage`, so pass `location.pathname.slice(1)` (strips the leading slash).

**`tj-components` version:** `^2.1.38`

## Table Components

### Using Material React Table

```jsx
import { MaterialReactTable } from 'material-react-table';

const columns = useMemo(() => [
  {
    accessorKey: 'transactionId',
    header: 'Transaction ID',
    size: 150,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    Cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    Cell: ({ row }) => <StatusChip status={row.original.status} />,
  },
], []);

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
  onPaginationChange={setPagination}
  onSortingChange={setSorting}
  muiTablePaperProps={{
    sx: { boxShadow: 'none', border: '1px solid #D9D9D9' },
  }}
  muiTableHeadCellProps={{
    sx: { fontWeight: 600 },
  }}
/>
```

## Form Components

### Using React Hook Form

```jsx
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from '@mui/material';

const MyForm = ({ onSubmit }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        rules={{ required: 'Name is required' }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Name"
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
          />
        )}
      />
      <Button type="submit" variant="contained">
        Submit
      </Button>
    </form>
  );
};
```

## Notification Components

### Using Notistack

```jsx
import { useSnackbar } from 'notistack';

const MyComponent = () => {
  const { enqueueSnackbar } = useSnackbar();

  const showSuccess = () => {
    enqueueSnackbar('Operation successful', { variant: 'success' });
  };

  const showError = () => {
    enqueueSnackbar('Something went wrong', { variant: 'error' });
  };
};
```

**Custom Styled Snackbar:**
```jsx
// Notistack provider configuration
<SnackbarProvider
  maxSnack={3}
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  autoHideDuration={4000}
  Components={{
    success: StyledSuccessSnackbar,
    error: StyledErrorSnackbar,
  }}
>
  <App />
</SnackbarProvider>
```
