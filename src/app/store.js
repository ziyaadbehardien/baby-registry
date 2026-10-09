import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { apiSlice } from '../features/api/apiSlice';
import errorReducer from '../features/error/errorSlice';
import registryFiltersReducer from '../features/registry/registryFiltersSlice';

// No redux-persist: registry data contains guests' names, which shouldn't sit in localStorage.
const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  errorStatus: errorReducer,
  registryFilters: registryFiltersReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: import.meta.env.DEV,
});

setupListeners(store.dispatch);
