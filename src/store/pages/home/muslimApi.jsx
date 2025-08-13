import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const muslimApi = createApi({
  reducerPath: "muslimApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://37.27.29.18:8003/",
    prepareHeaders: (headers) => {
      const authToken = localStorage.getItem("authToken");
      console.log("Token из localStorage:", authToken);

      if (authToken) {
        headers.set("authorization", `Bearer ${authToken}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => "Post/get-posts",
    }),
    getPostById: builder.query({
      query: (id) => `Post/get-post-by-id?id=${id}`,
    }),
  }),
});

export const { useGetPostsQuery, useGetPostByIdQuery } = muslimApi;
