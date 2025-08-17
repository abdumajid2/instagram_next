"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  useGetChatsQuery,
  useGetUsersQuery,
  useDeleteChatMutation,
} from "@/store/pages/chat/pages/storeApi";
import Image from "next/image";
import mess from "@/assets/img/pages/chat/pages/default-chat/mess.svg";
import { BsPencilSquare, BsThreeDotsVertical, BsTrash, BsCameraVideo } from "react-icons/bs";
import { FaChevronDown } from "react-icons/fa";


function getAuthPayload() {
  if (typeof window === "undefined") return null; // защита от SSR
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function getMyUserId() {
  const p = getAuthPayload();
 
  return p?.sid || p?.sub || p?.userId || p?.nameid || null;
}
function getMyName() {
  const p = getAuthPayload();
  return p?.name || p?.fullName || "User";
}

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

function ChatActionModal({ chatId, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [deleteChat, { isLoading }] = useDeleteChatMutation();

  const handleDelete = async () => {
    try {
      await deleteChat(chatId).unwrap();
      setOpen(false);
      onDeleted?.(chatId);
    } catch (e) {
      console.error("Ошибка удаления:", e);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="p-2 rounded-full hover:bg-gray-200">
        <BsThreeDotsVertical size={20} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100 rounded-t-lg disabled:opacity-60"
          >
            <BsTrash className="mr-2" /> Delete Chat
          </button>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg"
          >
            <BsCameraVideo className="mr-2" /> Video Call
          </button>
        </div>
      )}
    </div>
  );
}

export default function MessengerApp() {
  const router = useRouter();
  const { data: chatsData, isLoading } = useGetChatsQuery();
  const { data: usersData } = useGetUsersQuery();
  const users = usersData?.data || [];
  const userName = getMyName();
  const myId = getMyUserId();


  const chatList = (chatsData?.data || []).map((c) => {
    const iAmSender = String(c.sendUserId) === String(myId);
    const partnerId = iAmSender ? c.receiveUserId : c.sendUserId;
    const partnerName = iAmSender ? c.receiveUserName : c.sendUserName;
    const partnerImage = iAmSender ? c.receiveUserImage : c.sendUserImage;
    return {
      chatId: c.chatId,
      partnerId,
      partnerName: partnerName || "User",
      partnerImage: partnerImage || "",
    };
  });

  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const openChat = (item) => {
    const q = `?name=${encodeURIComponent(item.partnerName)}&avatar=${encodeURIComponent(item.partnerImage || "")}&partnerId=${encodeURIComponent(item.partnerId)}`;
  router.push(`/chats/${item.chatId}${q}`);
  setShowSidebar(false);
  };

  const handleUserSelect = (u) => {
  
    router.push(`/chats/new?userId=${u.id}&name=${encodeURIComponent(u.fullName)}&avatar=${encodeURIComponent(u.avatar || "")}`);
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
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowSidebar(false)}>
          <aside
            className="absolute left-0 top-0 w-64 h-full bg-white p-4 shadow-lg z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">Chats</h2>
            <ul className="space-y-2">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <ChatSkeleton key={i} />)
                : chatList.map((item) => (
                    <li key={item.chatId} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100">
                      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => openChat(item)}>
                        <img
                          src={
                            item.partnerImage
                              ? `http://37.27.29.18:8003/images/${item.partnerImage}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.partnerName)}`
                          }
                          alt={item.partnerName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-300"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{item.partnerName}</p>
                          <p className="text-sm text-gray-500">Active Group</p>
                        </div>
                      </div>
                      <ChatActionModal chatId={item.chatId} onDeleted={() => {}} />
                    </li>
                  ))}
            </ul>
          </aside>
        </div>
      )}

      <aside className="hidden md:flex flex-col w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-gray-700 text-lg">{userName}</span>
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
          <button className="text-blue-700 hover:text-blue-500 transition font-semibold">Requests</button>
        </div>

        <ul className="space-y-2">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <ChatSkeleton key={i} />)
            : chatList.map((item) => (
                <li key={item.chatId} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center space-x-3 cursor-pointer" onClick={() => openChat(item)}>
                    <img
                      src={
                        item.partnerImage
                          ? `http://37.27.29.18:8003/images/${item.partnerImage}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.partnerName)}`
                      }
                      alt={item.partnerName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-300"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{item.partnerName}</p>
                      <p className="text-sm text-gray-500">Active Group</p>
                    </div>
                  </div>
                  <ChatActionModal chatId={item.chatId} onDeleted={() => {}} />
                </li>
              ))}
        </ul>
      </aside>

      <div className="flex-1 flex flex-col gap-6 items-center md:w-180 h-screen justify-center text-gray-500">
        <Image src={mess} width={150} height={150} alt="mess" />
        <p className="text-xl font-bold">Your messages</p>
        <p>Send private photos and messages to a friend or group</p>
        <button className="rounded-lg bg-[#3B82F6] px-7 py-3 text-white font-bold">Send message</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg p-6 w-80 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">New chat</h3>
            <ul className="space-y-2">
              {users.map((u) => (
                <li
                  key={u.id}
                  onClick={() => handleUserSelect(u)}
                  className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100"
                >
                  <img
                    src={
                      u.avatar
                        ? `http://37.27.29.18:8003/images/${u.avatar}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}`
                    }
                    alt={u.fullName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-300"
                  />
                  <span className="font-medium text-gray-800">{u.fullName}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
