import { createSlice } from '@reduxjs/toolkit';

const initialState = { status: null, message: null };

const errorSlice = createSlice({
  name: 'errorStatus',
  initialState,
  reducers: {
    setErrorStatus: (state, action) => {
      state.status = action.payload.status;
      state.message = action.payload.message;
    },
    clearError: () => initialState,
  },
});

export const { setErrorStatus, clearError } = errorSlice.actions;

export const selectErrorStatus = (state) => state.errorStatus;

export default errorSlice.reducer;
