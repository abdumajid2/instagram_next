import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// let token = localStorage.getItem("authToken");
export const ReelsApi = createApi({
  reducerPath: "ReelsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://37.27.29.18:8003/",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getReels: builder.query({
      query: () => "Post/get-reels",
    }),
  }),
});
export const {
  useGetReelsQuery,
} = ReelsApi;
