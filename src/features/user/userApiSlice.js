import { apiSlice } from '../api/apiSlice';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => '/me',
      providesTags: ['Me'],
    }),
  }),
});

export const { useGetMeQuery } = userApiSlice;

/**
 * The visitor's role and name as decided by the API. UI checks are a convenience only —
 * the API enforces the same rule on every request.
 */
export const useRole = () => {
  const { data, isLoading } = useGetMeQuery();
  return {
    isLoading,
    userId: data?.userId ?? null,
    name: data?.name ?? null,
    isOwner: data?.role === 'owner',
  };
};
