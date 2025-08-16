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
}),
getMyPosts:builder.query({
      query: () => `/Post/get-my-posts`
}),
getSubscribers: builder.query({
  query: (userId) => `/FollowingRelationShip/get-subscribers?UserId=${userId}`,
}),

getSubscriptions: builder.query({
  query: (userId) => `/FollowingRelationShip/get-subscriptions?UserId=${userId}`,
}),
getUsers:builder.query({
      query:()=>`/User/get-users`
}),
updateUserProfile:builder.mutation({
      query:(updatedUserProfile)=>({
            url:`http://37.27.29.18:8003/UserProfile/update-user-profile`,
            method:"PUT",
            body:updatedUserProfile
      })
}),
updateUserProfileImage:builder.mutation({
      query:(formData)=>({
            url:`http://37.27.29.18:8003/UserProfile/update-user-image-profile`,
            method:"PUT",
            body:formData
      })
})

    })

})
export const {useGetMyProfileQuery,useGetMyStoriesQuery,useGetMyPostsQuery,useGetSubscribersQuery,useGetSubscriptionsQuery,useGetUsersQuery,useUpdateUserProfileImageMutation,useUpdateUserProfileMutation}=profileApi

