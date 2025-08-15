"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDeleteChatMutation,useGetChatsQuery,useGetUsersQuery,} from "@/store/pages/chat/pages/storeApi";
import mess from "@/assets/img/pages/chat/pages/default-chat/mess.svg";
import Image from "next/image";
import {
  BsPencilSquare,
  BsThreeDotsVertical,
  BsTrash,
  BsCameraVideo,
} from "react-icons/bs";
import { FaChevronDown } from "react-icons/fa";

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

function ChatActionModal({ chatId, onDeleteChat }) {
	const [showModal, setShowModal] = useState(false);
	
	
	const [deleteChat] = useDeleteChatMutation();
	const handleDelete = async () => {
    try {
      await deleteChat(chatId).unwrap(); 
      setShowModal(false);
      
      if (onDeleteChat) onDeleteChat(chatId); 
    } catch (err) {
      console.error("Ошибка удаления:", err);
      
    }
  };
  const handleVideoCall = () => {
   
    setShowModal(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowModal(!showModal)}
        className="p-2 rounded-full hover:bg-gray-200"
      >
        <BsThreeDotsVertical size={20} />
      </button>

      {showModal && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            onClick={handleDelete}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100 rounded-t-lg"
          >
            <BsTrash className="mr-2" /> Удалить чат
          </button>
          <button
            onClick={handleVideoCall}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg"
          >
            <BsCameraVideo className="mr-2" /> Видеозвонок
          </button>
        </div>
      )}
    </div>
  );
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
    if (!chat.chatId || !chat.receiveUserName) return;
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

  const handleDeleteChat = (chatId) => {
    alert(`Чат ${chatId} удалён (сюда добавьте вызов deleteChat из RTK Query)`);
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
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100"
                    >
                      <div
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => handleChatClick(chat)}
                      >
                        <img
                          src={
                            chat.receiveUserImage
                              ? `http://37.27.29.18:8003/images/${chat.receiveUserImage}`
                              : `https://ui-avatars.com/api/?name=${chat.receiveUserName}`
                          }
                          alt={chat.receiveUserName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-300"
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {chat.receiveUserName}
                          </p>
                          <p className="text-sm text-gray-500">Active Group</p>
                        </div>
                      </div>
                      <ChatActionModal
                        chatId={chat.chatId}
                        onDeleteChat={handleDeleteChat}
                      />
                    </li>
                  ))}
            </ul>
          </aside>
        </div>
      )}

    
      <aside className="hidden md:flex flex-col w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-gray-700 text-lg">
              {userName}
            </span>
            <FaChevronDown />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="p-2 rounded-full text-xl font-bold text-blue-700 transition"
            title="Создать чат"
          >
            <BsPencilSquare />
          </button>
        </div>

        <div className="flex justify-between mb-6">
          <p className="text-gray-500">Messages</p>
          <button className="text-blue-700 hover:text-blue-500 transition font-semibold">
            Requests
          </button>
        </div>

        <ul className="space-y-2">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <ChatSkeleton key={i} />)
            : chatList.map((chat) => (
                <li
                  key={chat.chatId}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100"
                >
                  <div
                    className="flex items-center space-x-3 cursor-pointer"
                    onClick={() => handleChatClick(chat)}
                  >
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
                    <div>
                      <p className="font-medium text-gray-800">
                        {chat.receiveUserName}
                      </p>
                      <p className="text-sm text-gray-500">Active Group</p>
                    </div>
                  </div>
                  <ChatActionModal
                    chatId={chat.chatId}
                    onDeleteChat={handleDeleteChat}
                  />
                </li>
              ))}
        </ul>
      </aside>

      <div className="flex-1 flex flex-col gap-6 items-center md:w-180 h-screen justify-center text-gray-500">
        <Image src={mess} width={150} height={150} alt="mess" />
        <p className="text-xl font-bold">Your messages</p>
        <p>Send private photos and messages to a friend or group</p>
        <button className="rounded-lg bg-[#3B82F6] px-7 py-3 text-white font-bold">
          Send message
        </button>
      </div>

      
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-80 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              Выберите пользователя
            </h3>
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
                  <span className="font-medium text-gray-800">
                    {user.fullName}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
