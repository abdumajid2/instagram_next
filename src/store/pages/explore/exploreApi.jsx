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
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ postId }) => ({ type: "Post", id: postId })),
              { type: "Post", id: "LIST" },
            ]
          : [{ type: "Post", id: "LIST" }],
    }),

    likePost: builder.mutation({
      query: (postId) => ({
        url: `/Post/like-post?postId=${postId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, postId) => [{ type: "Post", id: postId }],
    }),

    addComment: builder.mutation({
      query: ({ postId, text }) => ({
        url: `/Post/add-comment`,
        method: "POST",
        body: { postId, text },
      }),
      invalidatesTags: (result, error, { postId }) => [{ type: "Post", id: postId }],
    }),

    deleteComment: builder.mutation({
      query: (commentId) => ({
        url: `/Post/delete-comment?commentId=${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),
  }),
})

export const { useGetPostsQuery, useLikePostMutation, useAddCommentMutation, useDeleteCommentMutation } = exploreApi
