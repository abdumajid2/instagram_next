"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  useGetChatByIdQuery,
  useSendMessageMutation,
} from "@/store/pages/chat/pages/storeApi";
import { FiPaperclip } from "react-icons/fi";

const CURRENT_USER_ID = "3dd0bb8c-a007-494c-bf36-fb983ed245f0";

export default function ChatByIdPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chatId = parseInt(params["chat-by-id"], 10);

  const userName = searchParams.get("name") || "Пользователь";
  const avatar = searchParams.get("avatar")
    ? `http://37.27.29.18:8003/images/${searchParams.get("avatar")}`
    : `https://ui-avatars.com/api/?name=${userName}`;

  const { data: messagesData, isLoading } = useGetChatByIdQuery(chatId, {
    pollingInterval: 2000,
  });

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const messages = messagesData?.data || [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() && !file) return;

    try {
      await sendMessage({ chatId, message: messageText, file }).unwrap();
      setMessageText("");
      setFile(null);
    } catch (err) {
      console.error("Ошибка отправки:", err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? "Неверная дата"
      : date.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  let lastDate = "";

  if (!chatId || isNaN(chatId)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-red-500">Некорректный ID чата.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-gray-600 animate-pulse">
          Загрузка сообщений...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen md:w-280 bg-gray-100 antialiased text-gray-800">

      <div className="flex items-center p-4 bg-white shadow space-x-4">
        <img
          src={avatar}
          alt={userName}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-300"
        />
        <div>
          <h1 className="text-lg font-semibold text-gray-800">{userName}</h1>
          <p className="text-sm text-gray-500">Активен недавно</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((msg) => {
          const msgDate = formatDate(msg.sendMassageDate);
          const showDateSeparator = msgDate !== lastDate;
          lastDate = msgDate;

          return (
            <div key={msg.messageId}>
              {showDateSeparator && (
                <div className="flex justify-center my-4">
                  <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                    {msgDate}, {formatTime(msg.sendMassageDate)}
                  </span>
                </div>
              )}

              <div
                className={`flex ${
                  msg.userId === CURRENT_USER_ID
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl shadow ${
                    msg.userId === CURRENT_USER_ID
                      ? "bg-blue-600 rounded-br-xs text-white"
                      : "bg-white rounded-tl-xs text-gray-800"
                  }`}
                >
                  <p className="text-base">{msg.messageText}</p>

                  {msg.file && (
                    <div className="mt-2">
                      {/\.(jpg|jpeg|png|gif)$/i.test(msg.file) ? (
                        <img
                          src={`http://37.27.29.18:8003/StaticFiles/${msg.file}`}
                          alt="Отправленное изображение"
                          className="max-w-xs rounded-lg shadow"
                        />
                      ) : (
                        <a
                          href={`http://37.27.29.18:8003/StaticFiles/${msg.file}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm underline block"
                        >
                          📎 Файл
                        </a>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-300 mt-1 text-right">
                    {formatTime(msg.sendMassageDate)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center p-4 bg-white border-t border-gray-200">
        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Введите сообщение..."
          className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="ml-2 text-blue-600 hover:text-blue-800 p-2 rounded-full focus:outline-none"
          title="Прикрепить файл"
        >
          <FiPaperclip size={22} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />

        <button
          onClick={handleSend}
          disabled={isSending}
          className={`ml-2 px-5 py-2 rounded-full font-semibold text-white ${
            isSending ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSending ? "Send..." : "➤"}
        </button>
      </div>
    </div>
  );
}
