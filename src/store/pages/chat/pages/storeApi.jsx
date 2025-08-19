import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://37.27.29.18:8003/",
    prepareHeaders: (headers) => {
      const authToken =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      if (authToken) headers.set("authorization", `Bearer ${authToken}`);
      return headers;
    },
  }),
  tagTypes: ["Chats", "Messages"],
  endpoints: (builder) => ({
    // Список чатов
    getChats: builder.query({
      query: () => "Chat/get-chats",
      providesTags: (res) =>
        res?.data
          ? [
              ...res.data.map(({ chatId }) => ({
                type: "Messages",
                id: chatId,
              })),
              { type: "Chats", id: "LIST" },
            ]
          : [{ type: "Chats", id: "LIST" }],
    }),

    // Сообщения одного чата
    getChatById: builder.query({
      query: (id) => `Chat/get-chat-by-id?chatId=${id}`,
      providesTags: (_res, _err, id) => [{ type: "Messages", id }],
    }),

    // Поиск пользователей (можно расширить параметрами при необходимости)
    getUsers: builder.query({
      query: (q = "") =>
        q
          ? `User/get-users?UserName=${encodeURIComponent(q)}`
          : "User/get-users",
    }),

    createChat: builder.mutation({
      query: (receiverUserId) => ({
        url: `Chat/create-chat?receiverUserId=${receiverUserId}`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Chats", id: "LIST" }],
    }),

    
    sendMessage: builder.mutation({
      query: ({ chatId, message, file }) => {
        const fd = new FormData();
        fd.append("chatId", chatId);
        if (message) fd.append("messageText", message);
        if (file) fd.append("file", file); // имя поля — как на бэке
        return { url: "Chat/send-message", method: "PUT", body: fd };
      },
      invalidatesTags: (_res, _err, arg) => [
        { type: "Messages", id: arg.chatId },
      ],
    }),

    deleteMessage: builder.mutation({
      query: (messageId) => ({
        url: `Chat/delete-message?massageId=${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Chats", id: "LIST" }],
    }),

   getPostById: builder.query({
      query: (id) => `Post/get-post-by-id?id=${id}`,
    }),
  

    
    deleteChat: builder.mutation({
      query: (chatId) => ({
        url: `Chat/delete-chat?chatId=${chatId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Chats", id: "LIST" }],
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
  useGetPostByIdQuery,
} = chatApi;
