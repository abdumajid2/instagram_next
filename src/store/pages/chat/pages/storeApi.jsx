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

    // Исправленный запрос (по Swagger)
    getChatById: builder.query({
      query: (id) => `Chat/get-chat-by-id?chatId=${id}`,
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
} = chatApi;
