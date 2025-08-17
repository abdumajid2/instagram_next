// src/store/pages/notification/notification.js
"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://37.27.29.18:8003/",
    prepareHeaders: (headers) => {
      const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (authToken) headers.set("authorization", `Bearer ${authToken}`);
      return headers;
    },
  }),
  tagTypes: ["Subscribers", "Subscriptions"],
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
        // ВАЖНО: без ведущего пробела!
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
  useFollowUserMutation,
  useUnfollowUserMutation,
} = notificationApi;