import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const settingApi = createApi({
  reducerPath: "storeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://37.27.29.18:8003",
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") { // проверка, что мы в браузере
        const token = localStorage.getItem("authToken");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
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
    }),

    getFavoritePost: builder.query({
      query: () => ({
        url: `/UserProfile/get-post-favorites?PageNumber=1&PageSize=999`,
        method: "GET"
      })
    }),

    unfollowToUser: builder.mutation({
      query: (id) => ({
        url: `/FollowingRelationShip/delete-following-relation-ship?followingUserId=${id}`,
        method: "DELETE"
      })
    })
  }),
});

export const { useGetUsersForSearchQuery, useGetSubscribersQuery, useFollowToUserMutation, useGetFavoritePostQuery, useUnfollowToUserMutation } = settingApi;
