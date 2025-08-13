import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://37.27.29.18:8003/";

export const storeApi = createApi({
  reducerPath: "storeApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
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
    registerUser: builder.mutation({
      query: (body) => ({
        url: "Account/register",
        method: "POST",
        body,
      }),
    }),
    getChat: builder.query({
      query: () => ({
        url: "Chat/get-chats",
        method: "GET",
      }),
    }),
  }),
});

export const { useRegisterUserMutation, useGetChatQuery } = storeApi;
