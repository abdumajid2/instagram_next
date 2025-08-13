import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const exploreApi = createApi({
  reducerPath: 'exploreApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://37.27.29.18:8003',
    prepareHeaders: headers => {
      const authToken = localStorage.getItem('authToken')
      console.log('Token из localStorage:', authToken)

      if (authToken) {
        headers.set('authorization', `Bearer ${authToken}`)
      }
      return headers
    },
  }),
  endpoints: builder => ({
    getPosts: builder.query({
      query: ({ pageNumber = 1, pageSize = 10 } = {}) =>
        `/Post/get-posts?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    }),
  }),
})

export const { useGetPostsQuery } = exploreApi
