"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useGetChatByIdQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
  useGetChatsQuery,
  useCreateChatMutation,
} from "@/store/pages/chat/pages/storeApi";
import { BsTelephone, BsCameraVideo, BsInfoCircle } from "react-icons/bs";
import { FiPaperclip, FiTrash, FiSmile, FiMic, FiImage } from "react-icons/fi";

const FILE_BASE = "http://37.27.29.18:8003/StaticFiles";

/** JWT helpers */
function getAuthPayload() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; }
}
function getMyUserId() {
  const p = getAuthPayload();
  return p?.sid || p?.sub || p?.userId || p?.nameid || null;
}
function getMyName() {
  const p = getAuthPayload();
  return p?.name || p?.fullName || "User";
}

/** message helpers */
const getSenderId = (m) => m?.userId ?? m?.senderUserId ?? m?.fromUserId ?? null;
const getStamp = (m) => {
  const t = new Date(m?.sendMassageDate || m?.sendMessageDate || m?.createdAt || 0).getTime();
  return Number.isNaN(t) ? 0 : t;
};
const toTime = (s) => {
  const d = new Date(s || "");
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};
const toDay = (s) => {
  const d = new Date(s || "");
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function ChatByIdPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawParam = String(params["chat-by-id"] ?? "");
  const isNew = rawParam === "new";
  const chatId = isNew ? null : Number(rawParam);
  const myId = getMyUserId();
  const myName = getMyName();

  const targetUserId = searchParams.get("userId") || "";
  const userName = searchParams.get("name") || "Пользователь";
  const avatar = searchParams.get("avatar")
    ? `http://37.27.29.18:8003/images/${searchParams.get("avatar")}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`;

  // /chats/new: ищем существующий чат с userId, иначе создаём и редиректим
  const { data: chatsData } = useGetChatsQuery(undefined, { skip: !isNew });
  const [createChat, { isLoading: isCreating }] = useCreateChatMutation();

  useEffect(() => {
    const go = async () => {
      if (!isNew || !targetUserId) return;

      const list = chatsData?.data || [];
      const existing = list.find((c) => {
        const iAmSender = String(c.sendUserId) === String(myId);
        const partnerId = iAmSender ? c.receiveUserId : c.sendUserId;
        return String(partnerId) === String(targetUserId);
      });

      if (existing?.chatId) {
        router.replace(`/chats/${existing.chatId}?name=${encodeURIComponent(userName)}&avatar=${encodeURIComponent(searchParams.get("avatar") || "")}`);
        return;
      }

      try {
        const res = await createChat(String(targetUserId)).unwrap(); // POST /Chat/create-chat?receiverUserId={id}
        const newChatId = res?.data ?? res?.chatId ?? res?.id;
        if (newChatId) {
          router.replace(`/chats/${newChatId}?name=${encodeURIComponent(userName)}&avatar=${encodeURIComponent(searchParams.get("avatar") || "")}`);
        }
      } catch (e) {
        console.error("Не удалось создать чат:", e);
      }
    };
    go();
  }, [isNew, targetUserId, chatsData, createChat, router, userName, searchParams, myId]);

  // сообщения
  const {
    data: messagesData,
    refetch,
    isLoading,
  } = useGetChatByIdQuery(chatId, {
    skip: isNew || !chatId || Number.isNaN(Number(chatId)),
    pollingInterval: 2000,
  });

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const endRef = useRef(null);
  const fileInputRef = useRef(null);

  const items = messagesData?.data || [];
  const sorted = useMemo(() => [...items].sort((a, b) => getStamp(a) - getStamp(b) || (a.messageId ?? 0) - (b.messageId ?? 0)), [items]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sorted.length]);

  const handleSend = async () => {
    if (!chatId || (!messageText.trim() && !file)) return;
    try {
      await sendMessage({ chatId, message: messageText.trim(), file }).unwrap();
      setMessageText("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refetch();
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Ошибка отправки:", err);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await deleteMessage(messageId).unwrap();
      await refetch();
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Ошибка удаления:", err);
    }
  };

  if (isNew) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600">{isCreating ? "Создаём чат…" : "Готовим чат…"}</p>
      </div>
    );
  }

  if (!chatId || Number.isNaN(chatId)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-red-500">Некорректный ID чата.</p>
      </div>
    );
  }

  if (isLoading && !messagesData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-gray-600 animate-pulse">Загрузка сообщений…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-[1000px] bg-white text-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b bg-white">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
          />
          <div className="font-medium">{userName}</div>
        </div>
        <div className="flex items-center gap-5 text-gray-600">
          <button className="hover:text-black" title="Call"><BsTelephone size={18} /></button>
          <button className="hover:text-black" title="Video"><BsCameraVideo size={18} /></button>
          <button className="hover:text-black" title="Info"><BsInfoCircle size={18} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6">
        <div className="mx-auto max-w-6xl space-y-4">
          {sorted.map((m, i) => {
            const mine = String(getSenderId(m)) === String(myId);

            const prev = sorted[i - 1];
            const rawPrev = prev && (prev.sendMassageDate || prev.sendMessageDate || prev.createdAt);
            const rawCur = m?.sendMassageDate || m?.sendMessageDate || m?.createdAt;

            const curDay = toDay(rawCur);
            const prevDay = rawPrev ? toDay(rawPrev) : null;
            const showDay = i === 0 || curDay !== prevDay;

            const curTime = toTime(rawCur);
            const prevTime = rawPrev ? toTime(rawPrev) : null;
            const showTime = i === 0 || curTime !== prevTime;

            return (
              <div key={m.messageId ?? `${getStamp(m)}-${i}`} className="space-y-2">
                {showDay && (
                  <div className="flex justify-center">
                    <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{curDay}</span>
                  </div>
                )}
                {showTime && (
                  <div className="flex justify-center">
                    <span className="text-[11px] text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-full">{curTime}</span>
                  </div>
                )}

                <div
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  onMouseEnter={() => setHoveredId(m.messageId)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div
                    className={
                      "relative max-w-[75%] sm:max-w-[60%] px-3.5 py-2 rounded-2xl shadow " +
                      (mine ? "bg-[#1b74e4] text-white pr-7" : "bg-white text-gray-900")
                    }
                  >
                    {!!m?.messageText && (
                      <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">{m.messageText}</p>
                    )}

                    {!!m?.file && (
                      <div className={`${m?.messageText ? "mt-2" : ""}`}>
                        {/\.(jpg|jpeg|png|gif|webp)$/i.test(m.file) ? (
                          <img
                            src={`${FILE_BASE}/${m.file}`}
                            alt="attachment"
                            className="rounded-lg max-h-64 object-contain"
                          />
                        ) : (
                          <a
                            href={`${FILE_BASE}/${m.file}`}
                            target="_blank"
                            rel="noreferrer"
                            className={mine ? "underline text-white/90" : "underline text-blue-600"}
                          >
                            📎 Файл
                          </a>
                        )}
                      </div>
                    )}

                    {mine && hoveredId === m.messageId && (
                      <button
                        onClick={() => handleDelete(m.messageId)}
                        className="absolute -left-8 top-1/2 -translate-y-1/2 p-2 text-black/60 hover:text-black"
                        title="Удалить"
                      >
                        <FiTrash size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="border-t bg-white px-3 sm:px-6 py-3">
        <div className="mx-auto max-w-6xl flex items-center gap-2">
          <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100" title="Emoji">
            <FiSmile size={20} />
          </button>

          <div className="flex-1 flex items-center bg-white rounded-full border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Message…"
              className="flex-1 bg-transparent px-4 py-2.5 outline-none text-[15px]"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
              title="Attach file"
            >
              <FiPaperclip size={20} />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
              title="Add image"
            >
              <FiImage size={20} />
            </button>
            <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100" title="Voice">
              <FiMic size={20} />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />

          <button
            onClick={handleSend}
            disabled={isSending || (!messageText.trim() && !file) || !chatId}
            className={`ml-2 px-4 py-2 rounded-full font-semibold text-white ${
              isSending || (!messageText.trim() && !file) || !chatId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            title="Send"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
