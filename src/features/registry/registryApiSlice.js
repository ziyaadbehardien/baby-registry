import { apiSlice } from '../api/apiSlice';

export const registryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query({
      query: () => '/items',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Items', id })), { type: 'Items', id: 'LIST' }]
          : [{ type: 'Items', id: 'LIST' }],
    }),

    createItem: builder.mutation({
      query: (item) => ({ url: '/items', method: 'POST', body: item }),
      invalidatesTags: [{ type: 'Items', id: 'LIST' }],
    }),

    updateItem: builder.mutation({
      query: ({ id, ...item }) => ({ url: `/items/${id}`, method: 'PUT', body: item }),
      // Item names appear on purchases, so refresh those too.
      invalidatesTags: (result, error, { id }) => [{ type: 'Items', id }, 'Purchases'],
    }),

    deleteItem: builder.mutation({
      query: (id) => ({ url: `/items/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Items', id: 'LIST' }, 'Purchases'],
    }),

    // A mutation rather than a query: it's an on-demand owner action, not cached data.
    getLinkPreview: builder.mutation({
      query: (url) => ({ url: '/link-previews', method: 'POST', body: { url } }),
    }),

    createPurchase: builder.mutation({
      query: ({ itemId, ...purchase }) => ({
        url: `/items/${itemId}/purchases`,
        method: 'POST',
        body: purchase,
      }),
      // Always refresh: a 409 means someone else bought it and the list is stale.
      invalidatesTags: (result, error, { itemId }) => [{ type: 'Items', id: itemId }, 'Purchases'],
    }),
  }),
});

export const {
  useGetItemsQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
  useGetLinkPreviewMutation,
  useCreatePurchaseMutation,
} = registryApiSlice;
