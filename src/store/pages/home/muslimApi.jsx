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
    addComment: builder.mutation({
      query: ({ postId, comment }) => ({
        url: "Post/add-comment",
        method: "POST",
        body: { postId, comment },
      }),
    }),
    addLikePost: builder.mutation({
      query: (postId) => ({
        url: `Post/like-post?postId=${postId}`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useAddCommentMutation,
  useAddLikePostMutation,
} = muslimApi;
