import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const muslimApi = createApi({
  reducerPath: "muslimApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://37.27.29.18:8003/" }),
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => "Post/get-posts",
    }),
  }),
});

export const { useGetPostsQuery } = muslimApi;
