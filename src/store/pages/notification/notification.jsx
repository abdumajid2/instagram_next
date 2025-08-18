"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE = "http://37.27.29.18:8003/";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE,
    prepareHeaders: (headers) => {
      const authToken =
        typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (authToken) headers.set("authorization", `Bearer ${authToken}`);
      return headers;
    },
  }),
  tagTypes: ["Subscribers", "Subscriptions", "MyPosts"],
  endpoints: (builder) => ({
    // кто подписан НА МЕНЯ
    getSubscribers: builder.query({
      query: (userId) => `FollowingRelationShip/get-subscribers?UserId=${userId}`,
      providesTags: [{ type: "Subscribers", id: "LIST" }],
      transformResponse: (res) => res?.data ?? [],
    }),

    // на кого ПОДПИСАН Я
    getSubscriptions: builder.query({
      query: (userId) => `FollowingRelationShip/get-subscriptions?UserId=${userId}`,
      providesTags: [{ type: "Subscriptions", id: "LIST" }],
      transformResponse: (res) => res?.data ?? [],
    }),

    // мои посты (для лайков/комментариев)
    getMyPosts: builder.query({
      query: () => `Post/get-my-posts`,
      providesTags: [{ type: "MyPosts", id: "LIST" }],
      transformResponse: (res) => res ?? [],
    }),

    // список пользователей (для рекомендаций). Параметры опциональны
    getUsers: builder.query({
      query: ({ userName = "", pageNumber = 1, pageSize = 20 } = {}) => {
        const qs = new URLSearchParams();
        if (userName) qs.set("UserName", userName);
        qs.set("PageNumber", pageNumber);
        qs.set("PageSize", pageSize);
        return `User/get-users?${qs.toString()}`;
      },
      transformResponse: (res) => res?.data ?? [],
    }),

    // follow / unfollow
    followUser: builder.mutation({
      query: (followingUserId) => ({
        url: `FollowingRelationShip/add-following-relation-ship?followingUserId=${followingUserId}`,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Subscribers", id: "LIST" },
        { type: "Subscriptions", id: "LIST" },
      ],
    }),

    unfollowUser: builder.mutation({
      query: (followingUserId) => ({
        url: `FollowingRelationShip/delete-following-relation-ship?followingUserId=${followingUserId}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Subscribers", id: "LIST" },
        { type: "Subscriptions", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSubscribersQuery,
  useGetSubscriptionsQuery,
  useGetMyPostsQuery,
  useGetUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = notificationApi;
