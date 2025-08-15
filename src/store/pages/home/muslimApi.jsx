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
    getStories: builder.query({
      query: () => "Story/get-stories",
    }),
    addFollow: builder.mutation({
      query: (followingUserId) => ({
        url: `FollowingRelationShip/add-following-relation-ship?followingUserId=${followingUserId}`,
        method: "POST",
      }),
    }),
    getStoryById: builder.query({
      query: (userId) => `Story/get-user-stories/${userId}`,
    }),
    addStory: builder.mutation({
      query: (  form ) => ({
        url: `Story/AddStories`,
        method: "POST",
        body: form,
      }),
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useAddCommentMutation,
  useAddLikePostMutation,
  useGetStoriesQuery,
  useAddFollowMutation,
  useGetStoryByIdQuery,
  useAddStoryMutation,
} = muslimApi;
