'use client'
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

export const profileApi=createApi({
    reducerPath:"profileApi",
    baseQuery:fetchBaseQuery({
        baseUrl:`http://37.27.29.18:8003/`,
           prepareHeaders: (headers) => {
      const authToken = localStorage.getItem("authToken");
      console.log("Token из localStorage:", authToken);

      if (authToken) {
        headers.set("authorization", `Bearer ${authToken}`);
      }
      return headers;
    },

    }),
    endpoints:(builder)=>({
getMyProfile:builder.query({
      query: () => `UserProfile/get-my-profile`
}),
getMyStories:builder.query({
      query: () => `/Story/get-my-stories`
})
    })

})
export const {useGetMyProfileQuery,useGetMyStoriesQuery}=profileApi

