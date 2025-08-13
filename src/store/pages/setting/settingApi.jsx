import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const settingApi = createApi({
  reducerPath: "storeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://37.27.29.18:8003",
    prepareHeaders: (headers) => {
      headers.set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaWQiOiJjOGZmNDU3OC0wYzM5LTQxOTgtYmVjYy1jZjU3YTIzYzA4MzMiLCJuYW1lIjoidmp4aW5nIiwiZW1haWwiOiJBbGlha2JhckBnbWFpbC5jb20iLCJzdWIiOiIiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJVc2VyIiwiZXhwIjoxNzU1MTUwMDcwLCJpc3MiOiJpbnN0YWdyYW0tZ3JvdXAiLCJhdWQiOiJpbnN0YWdyYW0tYXBpIn0.G0DVjYa0X-KVvWFHC4rxt0F49wBr-4_UwLfk6MaLt7A"
      );
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUsersForSearch: builder.query({
      query: ({ pageNumber = 1, pageSize = 9999 } = {}) => ({
        url: `/User/get-users`,
        method: "GET",
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      }),
    }),

    getSubscribers: builder.query({
      query: (id) => ({
        url: `/FollowingRelationShip/get-subscribers?UserId=${id}`,
        method: "GET",
      })
    }),

    followToUser: builder.mutation({
      query: (id) => ({
        url: `/FollowingRelationShip/add-following-relation-ship?followingUserId=${id}`,
        method: "POST"
      })
    })

  }),
});

export const { useGetUsersForSearchQuery, useGetSubscribersQuery, useFollowToUserMutation } = settingApi;
