import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const exploreApi = createApi({
  reducerPath: 'exploreApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://37.27.29.18:8003',
    prepareHeaders: headers => {
      const authToken = localStorage.getItem('authToken')

      if (authToken) {
        headers.set('authorization', `Bearer ${authToken}`)
      }
      return headers
    },
  }),
  endpoints: builder => ({
    getPosts: builder.query({
      query: ({ pageNumber = 1, pageSize = 999 } = {}) =>
        `/Post/get-posts?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      method: "GET"
    }),
  }),
})

export const { useGetPostsQuery } = exploreApi
