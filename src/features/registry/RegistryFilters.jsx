import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { Chip, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';

import {
  STATUS_FILTERS,
  selectRegistryFilters,
  setCategoryFilter,
  setStatusFilter,
} from './registryFiltersSlice';

const STATUS_OPTIONS = [
  { value: STATUS_FILTERS.NEEDED, label: 'Still needed' },
  { value: STATUS_FILTERS.PURCHASED, label: 'Bought' },
  { value: STATUS_FILTERS.ALL, label: 'All' },
];

const RegistryFilters = ({ categories }) => {
  const dispatch = useDispatch();
  const { status, category } = useSelector(selectRegistryFilters);

  const handleStatusChange = (event, value) => {
    // ToggleButtonGroup passes null when the active button is clicked again; keep a selection.
    if (value) dispatch(setStatusFilter(value));
  };

  // "All" plus one pill per category; null means no category filter.
  const categoryOptions = [
    { value: null, label: 'All categories' },
    ...categories.map((name) => ({ value: name, label: name })),
  ];

  return (
    <Stack spacing={1.5} alignItems={{ xs: 'stretch', sm: 'flex-start' }}>
      <ToggleButtonGroup
        value={status}
        exclusive
        onChange={handleStatusChange}
        size="small"
        color="primary"
        aria-label="Filter by status"
        sx={{
          bgcolor: 'background.paper',
          '& .MuiToggleButton-root': { textTransform: 'none', flex: 1 },
        }}
      >
        {STATUS_OPTIONS.map((option) => (
          <ToggleButton key={option.value} value={option.value}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {categories.length > 0 && (
        <Stack
          role="group"
          aria-label="Filter by category"
          direction="row"
          useFlexGap
          flexWrap="wrap"
          spacing={1}
        >
          {categoryOptions.map(({ value, label }) => {
            const isSelected = category === value;
            return (
              <Chip
                key={value ?? 'all-categories'}
                label={label}
                clickable
                onClick={() => dispatch(setCategoryFilter(value))}
                aria-pressed={isSelected}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{
                  borderRadius: '2rem',
                  fontWeight: isSelected ? 700 : 500,
                  ...(!isSelected && { bgcolor: 'background.paper' }),
                }}
              />
            );
          })}
        </Stack>
      )}
    </Stack>
  );
};

RegistryFilters.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default RegistryFilters;
