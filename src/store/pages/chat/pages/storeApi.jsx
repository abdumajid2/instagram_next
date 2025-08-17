import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://37.27.29.18:8003/",
    prepareHeaders: (headers) => {
      const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
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
              ...res.data.map(({ chatId }) => ({ type: "Messages", id: chatId })),
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
      query: (q = "") => (q ? `User/get-users?UserName=${encodeURIComponent(q)}` : "User/get-users"),
    }),

    // Создать чат — по Swagger: POST /Chat/create-chat?receiverUserId=...
    createChat: builder.mutation({
      query: (receiverUserId) => ({
        url: `Chat/create-chat?receiverUserId=${receiverUserId}`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Chats", id: "LIST" }],
    }),

    // Отправить сообщение — PUT multipart
    sendMessage: builder.mutation({
      query: ({ chatId, message, file }) => {
        const form = new FormData();
        form.append("ChatId", chatId);
        form.append("MessageText", message ?? "");
        if (file) form.append("File", file);
        return { url: "Chat/send-message", method: "PUT", body: form };
      },
      invalidatesTags: (_res, _err, arg) => [{ type: "Messages", id: arg.chatId }],
    }),

    // Удалить сообщение — по API: Chat/delete-message?massageId=...
    deleteMessage: builder.mutation({
      query: (messageId) => ({
        url: `Chat/delete-message?massageId=${messageId}`,
        method: "DELETE",
      }),
      // сервер сам знает chatId? если нет — просто перечитаем список чатов
      invalidatesTags: [{ type: "Chats", id: "LIST" }],
    }),

    // Удалить чат
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
} = chatApi;
