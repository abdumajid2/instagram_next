
'use client';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


const BASE_URL = 'http://37.27.29.18:8003';

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/`,
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token =
          localStorage.getItem('authToken') || localStorage.getItem('access_token');
        if (token) headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Profile', 'Stories', 'StoriesList', 'Posts', 'Following'],
  endpoints: (builder) => ({
 
    getMyProfile: builder.query({
      query: () => 'UserProfile/get-my-profile',
      providesTags: ['Profile'],
    }),

    updateUserProfile: builder.mutation({
      query: (body) => ({
        url: 'UserProfile/update-user-profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    updateUserProfileImage: builder.mutation({
      query: (formData) => ({
        url: 'UserProfile/update-user-image-profile',
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Profile'],
    }),

   
    getMyPosts: builder.query({
      query: () => 'Post/get-my-posts',
      providesTags: ['Posts'],
    }),

  
    getUsers: builder.query({
      query: () => 'User/get-users',
    }),


    getSubscribers: builder.query({
      query: (userId) => `FollowingRelationShip/get-subscribers?UserId=${userId}`,
      providesTags: (_res, _err, userId) => [{ type: 'Following', id: `subs-${userId}` }],
    }),

    getSubscriptions: builder.query({
      query: (userId) => `FollowingRelationShip/get-subscriptions?UserId=${userId}`,
      providesTags: (_res, _err, userId) => [{ type: 'Following', id: `foll-${userId}` }],
    }),

    addFollowing: builder.mutation({
      query: (followingUserId) => ({
        url: 'FollowingRelationShip/add-following-relation-ship',
        method: 'POST',
        params: { followingUserId },
      }),
      invalidatesTags: ['Following', 'Profile'],
    }),

    deleteFollowing: builder.mutation({
      query: (followingUserId) => ({
        url: 'FollowingRelationShip/delete-following-relation-ship',
        method: 'DELETE',
        params: { followingUserId },
      }),
      invalidatesTags: ['Following', 'Profile'],
    }),


    getMyStories: builder.query({
      query: () => 'Story/get-my-stories',
      providesTags: (result) => {
        const arr = result?.data?.stories ?? [];
        return [{ type: 'StoriesList', id: 'MY' }, ...arr.map((s) => ({ type: 'Stories', id: s.id }))];
      },
    }),

    likeStory: builder.mutation({
      query: (storyId) => ({
        url: 'Story/LikeStory',
        method: 'POST',
        params: { storyId },
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Stories', id },
        { type: 'StoriesList', id: 'MY' },
      ],
    }),

    addStoryView: builder.mutation({
      query: (storyId) => ({
        url: 'Story/add-story-view',
        method: 'POST',
        params: { StoryId: storyId },
      }),
   
      invalidatesTags: [],
    }),

    deleteStory: builder.mutation({
      query: (id) => ({
        url: 'Story/DeleteStory',
        method: 'DELETE',
        params: { id },
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Stories', id },
        { type: 'StoriesList', id: 'MY' },
      ],
    }),

    addStory: builder.mutation({
   
      query: ({ file, postId = null }) => {
        const fd = new FormData();
        fd.append('Image', file);
        const url = postId ? `Story/AddStories?PostId=${postId}` : 'Story/AddStories';
        return { url, method: 'POST', body: fd };
      },
      invalidatesTags: [{ type: 'StoriesList', id: 'MY' }],
    }),
    getPosts:builder.query({
      query:()=>`/Post/get-posts`
    }),
    addComment:builder.mutation({
      query:({postId,comment})=>({
        url:`/Post/add-comment`,
        method:"POST",
        body:{postId,comment}
      })
    }),
    deleteComment:builder.mutation({
      query:(id)=>({
        url:`/Post/delete-comment?commentId=${id}`,
        method:"DELETE",
      }),
    }),
    getUserProfileById:builder.query({
      query:(id)=>  `/UserProfile/get-user-profile-by-id?id=${id}`
    }),
    getUserStoryById:builder.query({
      query:(id)=>  `/Story/get-user-stories/${id}`
    }),
    getUsersPostById:builder.query({
      query:(id)=>  `/Post/get-posts?UserId=${id}`
    }),
    chatById:builder.query({
      query:(chatId)=>`/Chat/get-chat-by-id?chatId=${chatId}`
    }),
    getChats:builder.query({
      query:()=>`/Chat/get-chats`
    }),
    createChat:builder.mutation({
      query:(userId)=>({
        url:`/Chat/create-chat?receiverUserId=${userId}`,
        method:"POST"
      })
    }),
    deletePost:builder.mutation({
      query:(postId)=>({
        url:`Post/delete-post?id=${postId}`,
        method:"DELETE"
      })
    })
  }),
});




export const {
  useGetMyProfileQuery,
  useGetMyStoriesQuery,
  useGetMyPostsQuery,
  useGetSubscribersQuery,
  useGetSubscriptionsQuery,
  useGetUsersQuery,
  useUpdateUserProfileImageMutation,
  useUpdateUserProfileMutation,
useGetPostsQuery,
 
  useLikeStoryMutation,
  useAddStoryViewMutation,
  useDeleteStoryMutation,
  useAddStoryMutation,

  
  useAddFollowingMutation,
  useDeleteFollowingMutation,

  useLazyGetSubscribersQuery,
  useLazyGetSubscriptionsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useGetUserProfileByIdQuery,
  useGetUserStoryByIdQuery,
  useGetUsersPostByIdQuery,
  useChatByIdQuery,
  useGetChatsQuery,
  useCreateChatMutation,
  useDeletePostMutation


  
} = profileApi;