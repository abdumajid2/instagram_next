"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGetChatsQuery } from "@/store/pages/chat/pages/storeApi";
import mess from "@/assets/img/pages/chat/pages/default-chat/mess.svg";
import Image from "next/image";
const CURRENT_USER_ID = "3dd0bb8c-a007-494c-bf36-fb983ed245f0";

function ChatSkeleton() {
  return (
    <li className="flex items-center space-x-3 p-3 rounded-lg animate-pulse">
      <div className="w-10 h-10 bg-gray-300 rounded-full" />
      <div className="flex flex-col space-y-2">
        <div className="w-32 h-4 bg-gray-300 rounded" />
        <div className="w-20 h-3 bg-gray-200 rounded" />
      </div>
    </li>
  );
}

export default function MessengerApp() {
  const { data: chatsData, isLoading } = useGetChatsQuery();
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(false);

  const chatList = (chatsData?.data || []).map((chat) => ({
    ...chat,
    isOnline: Math.random() > 0.5,
  }));

  const handleChatClick = (chat) => {
    const query = `?name=${encodeURIComponent(
      chat.receiveUserName
    )}&avatar=${encodeURIComponent(chat.receiveUserImage || "")}`;
    router.push(`/chats/${chat.chatId}${query}`);
    setShowSidebar(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 antialiased text-gray-800">
      <button
        onClick={() => setShowSidebar(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg"
      >
        ☰
      </button>

      
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSidebar(false)}
        >
          <aside
            className="absolute left-0 top-0 w-64 h-full bg-white p-4 shadow-lg z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
              Чаты
            </h2>
            <ul className="space-y-2">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <ChatSkeleton key={i} />
                  ))
                : chatList.map((chat) => (
                    <li
                      key={chat.chatId}
                      onClick={() => handleChatClick(chat)}
                      className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100"
                    >
                      <div className="relative">
                        <img
                          src={
                            chat.receiveUserImage
                              ? `http://37.27.29.18:8003/images/${chat.receiveUserImage}`
                              : `https://ui-avatars.com/api/?name=${chat.receiveUserName}`
                          }
                          alt={chat.receiveUserName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-300"
                        />
                        {chat.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {chat.receiveUserName}
                        </p>
                        <p className="text-sm text-gray-500">Active Group</p>
                      </div>
                    </li>
                  ))}
            </ul>
          </aside>
        </div>
      )}

      
      <aside className="hidden md:flex flex-col w-100 bg-white border-r border-gray-200 p-4 overflow-y-auto shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
          Chats
        </h2>
        <ul className="space-y-2">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <ChatSkeleton key={i} />)
            : chatList.map((chat) => (
                <li
                  key={chat.chatId}
                  onClick={() => handleChatClick(chat)}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-100"
                >
                  <div className="relative">
                    <img
                      src={
                        chat.receiveUserImage
                          ? `http://37.27.29.18:8003/images/${chat.receiveUserImage}`
                          : `https://ui-avatars.com/api/?name=${chat.receiveUserName}`
                      }
                      alt={chat.receiveUserName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-300"
                    />
                    {chat.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {chat.receiveUserName}
                    </p>
                    <p className="text-sm text-gray-500">Active Group</p>
                  </div>
                </li>
              ))}
        </ul>
      </aside>


      <div className="flex-1 flex flex-col gap-6 items-center md:w-180 h-screen  justify-center text-gray-500">
        <Image src={mess} />
        <p className="text-xl font-bold">Your messages</p>
        <p>Send private photos and messages to a friend or group</p>
        <button className="rounded-lg bg-[#3B82F6] px-7 py-3 text-white font-bold">Send message</button>
      </div>
    </div>
  );
}
