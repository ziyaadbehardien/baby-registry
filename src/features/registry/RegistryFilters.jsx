import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';

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

const ALL_CATEGORIES = '';

const RegistryFilters = ({ categories }) => {
  const dispatch = useDispatch();
  const { status, category } = useSelector(selectRegistryFilters);

  const handleStatusChange = (event, value) => {
    // ToggleButtonGroup passes null when the active button is clicked again; keep a selection.
    if (value) dispatch(setStatusFilter(value));
  };

  const handleCategoryChange = (event) => {
    dispatch(setCategoryFilter(event.target.value || null));
  };

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
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
        <TextField
          select
          label="Category"
          value={category ?? ALL_CATEGORIES}
          onChange={handleCategoryChange}
          slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
          sx={{ minWidth: { sm: 200 } }}
        >
          <MenuItem value={ALL_CATEGORIES}>All categories</MenuItem>
          {categories.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>
      )}
    </Stack>
  );
};

RegistryFilters.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default RegistryFilters;
