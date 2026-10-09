import { createSlice } from '@reduxjs/toolkit';

export const STATUS_FILTERS = {
  NEEDED: 'needed',
  PURCHASED: 'purchased',
  ALL: 'all',
};

const initialState = {
  status: STATUS_FILTERS.NEEDED,
  category: null,
};

const registryFiltersSlice = createSlice({
  name: 'registryFilters',
  initialState,
  reducers: {
    setStatusFilter: (state, action) => {
      state.status = action.payload;
    },
    setCategoryFilter: (state, action) => {
      state.category = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const { setStatusFilter, setCategoryFilter, resetFilters } = registryFiltersSlice.actions;

export const selectRegistryFilters = (state) => state.registryFilters;

export default registryFiltersSlice.reducer;
