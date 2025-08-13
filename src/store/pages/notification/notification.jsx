// src/redux/api/notificationApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://37.27.29.18:8003" }),
  endpoints: (builder) => ({
    getSubscribers: builder.query({
      query: (userId) => `/FollowingRelationShip/get-subscribers?UserId=${userId}`,
    }),
  }),
});

export const { useGetSubscribersQuery } = notificationApi;
