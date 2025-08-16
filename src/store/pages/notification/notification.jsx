
// "use client";
// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// export const notificationApi = createApi({
//   reducerPath: "notificationApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: "http://37.27.29.18:8003/",
//     prepareHeaders: (headers) => {
//       const authToken = localStorage.getItem("authToken");
//       console.log("Token из localStorage:", authToken);

//       if (authToken) {
//         headers.set("authorization", `Bearer ${authToken}`);
//       }
//       return headers;
//     },
//   }),
//   endpoints: (builder) => ({
//     getSubscribers: builder.query({
//       query: (userId) =>
//         `FollowingRelationShip/get-subscribers?UserId=${userId}`,
//     }),
//     getSubscriptions: builder.query({
//       query: (userId) =>
//         `FollowingRelationShip/get-subscriptions?UserId=${userId}`,
//     }),


//     followUser: builder.mutation({
//       query: ({ myId, targetId }) => ({
//         url: "FollowingRelationShip/add-following-relation-ship",
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: {
//           userId: myId,           // твой id из токена
//           followingUserId: targetId,  // айди того, на кого подписываешься
//         },
//       }),
//     }),

//     unfollowUser: builder.mutation({
//       query: ({ myId, targetId }) => ({
//         url: "FollowingRelationShip/unfollow",
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: {
//           userId: myId,
//           unfollowUserId: targetId,
//         },
//       }),
//     }),


//   }),

// });

// export const {
//   useGetSubscribersQuery,

//   useFollowUserMutation,
//   useUnfollowUserMutation
// } = notificationApi;


"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://37.27.29.18:8003/",
    prepareHeaders: (headers) => {
      const authToken = localStorage.getItem("authToken");
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
      query: ({ myId, targetId }) => ({
        url: "FollowingRelationShip/add-following-relation-ship",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          UserId: myId,           // ⚡ PascalCase
          FollowingUserId: targetId,
        },
      }),
    }),

    unfollowUser: builder.mutation({
      query: ({ myId, targetId }) => ({
        url: "FollowingRelationShip/unfollow",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          UserId: myId,           // ⚡ PascalCase
          UnfollowUserId: targetId,
        },
      }),
    }),


  }),
});

export const {
  useGetSubscribersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = notificationApi;
