// src/redux/api/notificationApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://37.27.29.18:8003",
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
    // Чаты
    getChats: builder.query({
      query: () => `/Chat/get-chats`,
    }),
    getChatById: builder.query({
      query: (chatId) => `/Chat/get-chat-by-id?ChatId=${chatId}`,
    }),

    // Подписчики
    getSubscribers: builder.query({
      query: (userId) =>
        `/FollowingRelationShip/get-subscribers?UserId=${userId}`,

    }),
    deleteSubscriber: builder.mutation({
      query: (id) => ({
        url: `/FollowingRelationShip/delete-following-relation-ship?followingUserId=${id}`,
        method: "DELETE", // ё POST, вобаста ба API
      }),
      invalidatesTags: ["Subscribers"], // агар истифода баред
    }),

    // Лайк поста
    likePost: builder.mutation({
      query: (postId) => ({
        url: `/Post/like-post?PostId=${postId}`,
        method: "POST",
      }),
    }),

    // Добавить комментарий
    addComment: builder.mutation({
      query: (body) => ({
        url: `/Post/add-comment`,
        method: "POST",
        body,
      }),
    }),

    // Посты от подписок
    getFollowingPosts: builder.query({
      query: () => `/Post/get-following-post`,
    }),

    // Просмотр сторис
    addStoryView: builder.mutation({
      query: (storyId) => ({
        url: `/Story/add-story-view?StoryId=${storyId}`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetChatByIdQuery,
  useGetSubscribersQuery,
  useLikePostMutation,
  useAddCommentMutation,
  useGetFollowingPostsQuery,
  useAddStoryViewMutation,
  useDeleteSubscriberMutation
} = notificationApi;
