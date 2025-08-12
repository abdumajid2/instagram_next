import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const storeApi = createApi({
  reducerPath: "storeApi ",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://37.27.29.18:8003/",
  }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (body) => ({
        url: "Account/register",
        method: "POST",
        body,
      }),
    }),
    getChat: builder.query({
      query: () => ({
        url: "Chat/getChat",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const { useRegisterUserMutation,useGetChatQuery } = storeApi;
