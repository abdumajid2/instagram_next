// src/store/pages/chat/pages/storeApi.jsx
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://37.27.29.18:8003/",
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
    getChats: builder.query({
      query: () => "Chat/get-chats",
    }),

    getChatById: builder.query({
      query: (id) => `Chat/get-chat-by-id?chatId=${id}`,
    }),

    getUsers: builder.query({
      query: () => "User/get-users",
    }),

    deleteMessage: builder.mutation({
      query: (messageId) => ({
        url: `Chat/delete-message?massageId=${messageId}`, // <-- исправлено на massageId
        method: "DELETE",
      }),
    }),
     createChat: builder.mutation({
      // проверь по swagger, но чаще всего так:
      // POST /Chat/add-chat?receiveUserId={id}
      query: (receiveUserId) => ({
        url: `Chat/add-chat?receiveUserId=${receiveUserId}`,
        method: "POST",
      }),
      invalidatesTags: ["Chats"],
    }),
    deleteChat: builder.mutation({
  query: (chatId) => ({
    url: `Chat/delete-chat?chatId=${chatId}`,
    method: "DELETE",
  }),
}),

    sendMessage: builder.mutation({
      query: ({ chatId, message, file }) => {
        const formData = new FormData();
        formData.append("ChatId", chatId);
        formData.append("MessageText", message);
        if (file) {
          formData.append("File", file);
        }

        return {
          url: "Chat/send-message",
          method: "PUT",
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useGetChatsQuery,
  useGetChatByIdQuery,
  useSendMessageMutation,
  useGetUsersQuery,
  useDeleteMessageMutation,
  useDeleteChatMutation,
  useCreateChatMutation,
} = chatApi;
