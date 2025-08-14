"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useGetChatsQuery, useGetUsersQuery } from "@/store/pages/chat/pages/storeApi";
import mess from "@/assets/img/pages/chat/pages/default-chat/mess.svg";
import Image from "next/image";
import { BsPencilSquare } from "react-icons/bs";

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


function getUserNameFromToken() {
  const token = localStorage.getItem("authToken");
  if (!token) return "User";

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.name || "User";
  } catch (e) {
    console.error("Ошибка при декодировании токена", e);
    return "User";
  }
}

export default function MessengerApp() {
  const { data: chatsData, isLoading } = useGetChatsQuery();
  const { data: usersData } = useGetUsersQuery();
  const users = usersData?.data || [];
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const userName = getUserNameFromToken();


  const chatList = (chatsData?.data || []).map((chat) => ({
    ...chat,
    chatId: chat.chatId || chat.id,
    receiveUserName: chat.receiveUserName || chat.fullName || "User",
    isOnline: Math.random() > 0.5,
  }));

  const handleChatClick = (chat) => {
    if (!chat.chatId || !chat.receiveUserName) {
      console.error("Некорректный ID или имя пользователя", chat);
      return;
    }
    const query = `?name=${encodeURIComponent(
      chat.receiveUserName
    )}&avatar=${encodeURIComponent(chat.receiveUserImage || "")}`;
    router.push(`/chats/${chat.chatId}${query}`);
    setShowSidebar(false);
  };

  const handleUserSelect = (user) => {
    router.push(
      `/chats/new?userId=${user.id}&name=${encodeURIComponent(user.fullName)}`
    );
    setShowModal(false);
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


      <aside className="hidden md:flex flex-col w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <span className="font-semibold text-gray-700 text-lg">{userName}</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            title="Создать чат"
          >
            <BsPencilSquare />
          </button>
        </div>

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
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              chat.receiveUserName
                            )}`
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

  
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-80 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Выберите пользователя</h3>
            <ul className="space-y-2">
              {users.map((user) => (
                <li
                  key={user.id}
                  onClick={() =>
                    handleUserSelect({
                      id: user.id,
                      name: user.fullName,
                      avatar: user.avatar,
                    })
                  }
                  className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100"
                >
                  <img
                    src={
                      user.avatar
                        ? `http://37.27.29.18:8003/images/${user.avatar}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.fullName
                          )}`
                    }
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-300"
                  />
                  <span className="font-medium text-gray-800">{user.fullName}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}


      <div className="flex-1 flex flex-col gap-6 items-center md:w-180 h-screen justify-center text-gray-500">
        <Image src={mess} width={150} height={150} alt="mess" />
        <p className="text-xl font-bold">Your messages</p>
        <p>Send private photos and messages to a friend or group</p>
        <button className="rounded-lg bg-[#3B82F6] px-7 py-3 text-white font-bold">
          Send message
        </button>
      </div>
    </div>
  );
}
