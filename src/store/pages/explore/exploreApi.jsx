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
  tagTypes: ["Post", "Following", "Profile"], 
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

    addPostFavorite: builder.mutation({
      query: (id) => ({
        url: `/Post/add-post-favorite`,
        method: "POST",
        body: id
      })  
    }),

    addComment: builder.mutation({
      query: ({ postId, comment }) => ({   
        url: `/Post/add-comment`,
        method: "POST",
        body: { postId, comment },
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

    getSubscribers: builder.query({
      query: (userId) => `/FollowingRelationShip/get-subscribers?UserId=${userId}`,
      providesTags: (_res, _err, userId) => [{ type: 'Following', id: `subs-${userId}` }],
    }),

    getSubscriptions: builder.query({
      query: (userId) => `/FollowingRelationShip/get-subscriptions?UserId=${userId}`,
      providesTags: (_res, _err, userId) => [{ type: 'Following', id: `foll-${userId}` }],
    }),

    addFollowing: builder.mutation({
      query: (followingUserId) => ({
        url: '/FollowingRelationShip/add-following-relation-ship',
        method: 'POST',
        params: { followingUserId },
      }),
      invalidatesTags: ['Following', 'Profile'],
    }),

    deleteFollowing: builder.mutation({
      query: (followingUserId) => ({
        url: '/FollowingRelationShip/delete-following-relation-ship',
        method: 'DELETE',
        params: { followingUserId },
      }),
      invalidatesTags: ['Following', 'Profile'],
    }),
  }),
})


export const { 
  useGetPostsQuery, 
  useLikePostMutation, 
  useAddCommentMutation, 
  useDeleteCommentMutation,
  useGetSubscribersQuery,
  useGetSubscriptionsQuery,
  useAddFollowingMutation,
  useDeleteFollowingMutation,
  useAddPostFavoriteMutation
} = exploreApi

export const { useGetPostsQuery, useLikePostMutation, useAddCommentMutation, useDeleteCommentMutation } = exploreApi

