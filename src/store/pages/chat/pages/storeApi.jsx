import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";



export const storeApi  = createApi({
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
  }),
});

export const { useRegisterUserMutation } = storeApi ;
