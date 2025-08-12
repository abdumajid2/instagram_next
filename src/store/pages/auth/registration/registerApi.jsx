import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://37.27.29.18:8003" }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "/Account/register",
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json"
        },
        body: userData
      })
    })
  })
});

export const { useRegisterUserMutation } = authApi;
