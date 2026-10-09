import { apiSlice } from '../api/apiSlice';

export const landingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRegistryDetails: builder.query({
      query: () => '/registry-details',
      keepUnusedDataFor: 3600,
    }),
    getHeroPhoto: builder.query({
      query: () => '/hero-photo',
      keepUnusedDataFor: 3600,
    }),
  }),
});

export const { useGetRegistryDetailsQuery, useGetHeroPhotoQuery } = landingApiSlice;
