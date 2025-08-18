"use client";

import { useState, useEffect, useRef } from "react";
import { useGetChatQuery, useSendMessageMutation } from "@/store/pages/chat/pages/storeApi";

export default function MessengerApp() {
  const { data, isLoading, error } = useGetChatQuery();
  const chatList = data?.data || [];

  const [activeChatId, setActiveChatId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState(null);

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatId, data]);


  useEffect(() => {
    if (!activeChatId && chatList.length > 0) {
      setActiveChatId(chatList[0].chatId);
    }
  }, [chatList, activeChatId]);


  const activeChat = chatList.find((c) => c.chatId === activeChatId);

  const handleSend = async () => {
    if (!messageText.trim() || !activeChatId) return;

    try {
      await sendMessage({ chatId: activeChatId, messageText, file }).unwrap();
      setMessageText("");
      setFile(null);
    } catch (err) {
      console.error("Ошибка отправки сообщения", err);
    }
  };

  if (isLoading) return <div className="p-4">Loading chats...</div>;
  if (error) return <div className="p-4 text-red-600">Ошибка загрузки чатов</div>;

  return (
    <div className="flex h-screen bg-gray-100">

      <aside className="w-80 bg-white border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Chats</h2>
        <ul className="space-y-4">
          {chatList.map((chat) => (
            <li
              key={chat.chatId}
              onClick={() => setActiveChatId(chat.chatId)}
              className={`flex items-center space-x-3 cursor-pointer p-2 rounded ${
                activeChatId === chat.chatId ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <img
                src={
                  chat.receiveUserImage
                    ? `http://37.27.29.18:8003/images/${chat.receiveUserImage}`
                    : "https://ui-avatars.com/api/?name=" + chat.receiveUserName
                }
                alt={chat.receiveUserName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{chat.receiveUserName}</p>
                <p className="text-sm text-gray-500">Active Group</p>
              </div>
            </li>
          ))}
        </ul>
      </aside>

  
      <main className="flex-1 flex flex-col p-6 bg-white">
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Chat with {activeChat.receiveUserName}
            </h2>

            <div className="flex-1 flex flex-col space-y-4 overflow-y-auto border p-4 rounded">
              {activeChat.messages?.length ? (
                activeChat.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-md p-3 rounded ${
                      msg.isMine ? "bg-blue-500 text-white self-end" : "bg-gray-200 self-start"
                    }`}
                  >
                    <p>{msg.text || msg.MessageText || "No text"}</p>
                    <span className="text-xs text-gray-600">{msg.time || msg.createdAt}</span>
                  </div>
                ))
              ) : (
                <p>No messages yet</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 flex space-x-2">
              <input
                type="text"
                className="flex-1 border rounded px-3 py-2"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isSending}
              />
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0] || null)}
                disabled={isSending}
              />
              <button
                onClick={handleSend}
                disabled={isSending || !messageText.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
