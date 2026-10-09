import { apiSlice } from '../api/apiSlice';

export const purchasesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPurchases: builder.query({
      query: () => '/purchases',
      providesTags: ['Purchases'],
    }),

    deletePurchase: builder.mutation({
      query: ({ id }) => ({ url: `/purchases/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { itemId }) => [{ type: 'Items', id: itemId }, 'Purchases'],
    }),
  }),
});

export const { useGetPurchasesQuery, useDeletePurchaseMutation } = purchasesApiSlice;
