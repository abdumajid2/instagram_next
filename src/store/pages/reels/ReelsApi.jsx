import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// let token = localStorage.getItem("authToken");
export const ReelsApi = createApi({
  reducerPath: "ReelsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://37.27.29.18:8003/",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getReels: builder.query({
      query: () => "Post/get-reels",
    }),
    addLike: builder.mutation({
      query: (id) => ({
        url: `Post/like-post?postId=${id}`,
        method: "POST"
      }),
    }),
    follow: builder.mutation({
      query: (id) => ({
        url: `FollowingRelationShip/add-following-relation-ship?followingUserId=${id}`,
        method: "POST"
      }),
    }),
    addToFavorite: builder.mutation({
      query: (reels) => ({
        url: `Post/add-post-favorite`,
        method: "POST",
        body: reels
      }),
    }),
    addComment: builder.mutation({
      query: (comment) => ({
        url: `Post/add-comment`,
        method: "POST",
        body: comment
      }),
    }),
    deleteComment: builder.mutation({
      query: (id) => ({
        url: `Post/delete-comment?commentId=${id}`,
        method: "DELETE"
      }),
    }),
  }),
});
export const {
  useGetReelsQuery,
  useAddLikeMutation,
  useFollowMutation,
  useAddToFavoriteMutation,
  useAddCommentMutation,
  useDeleteCommentMutation,
} = ReelsApi;
