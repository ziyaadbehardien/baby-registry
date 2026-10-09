import { apiSlice } from '../api/apiSlice';

export const accessApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Exchanges { name, passphrase } for an HttpOnly session cookie set by the server.
    enterRegistry: builder.mutation({
      query: (entry) => ({ url: '/sessions', method: 'POST', body: entry }),
      invalidatesTags: ['Me'],
    }),

    // Clears the session cookie, then drops every cached response so nothing lingers.
    leaveRegistry: builder.mutation({
      query: () => ({ url: '/sessions', method: 'DELETE' }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        await queryFulfilled.catch(() => {});
        dispatch(apiSlice.util.resetApiState());
      },
    }),
  }),
});

export const { useEnterRegistryMutation, useLeaveRegistryMutation } = accessApiSlice;
