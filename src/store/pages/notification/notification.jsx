
"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
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
  getSubscribers: builder.query({
    query: (userId) =>
      `FollowingRelationShip/get-subscribers?UserId=${userId}`,
  }),
  getSubscriptions: builder.query({
    query: (userId) =>
      `FollowingRelationShip/get-subscriptions?UserId=${userId}`,
  }),

  followUser: builder.mutation({

    // POST /FollowingRelationShip/follow
    
    query: (userId) => ({
      url: "FollowingRelationShip/follow",
      method: "POST",
      body: { UserId: userId },
    }),
  }),
  unfollowUser: builder.mutation({
    // POST /FollowingRelationShip/unfollow
    query: (userId) => ({
      url: "FollowingRelationShip/unfollow",
      method: "POST",
      body: { UserId: userId },
    }),
  }),
}),

});

export const {
  useGetSubscribersQuery,
  useGetSubscriptionsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation
} = notificationApi;