"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  useDeleteMessageMutation,
  useGetChatByIdQuery,
  useSendMessageMutation,
  useGetChatsQuery,
  useCreateChatMutation, // добавь этот endpoint в storeApi, как обсуждали
} from "@/store/pages/chat/pages/storeApi";
import { FiPaperclip, FiTrash, FiSmile, FiMic, FiImage } from "react-icons/fi";
import { BsTelephone, BsCameraVideo, BsInfoCircle } from "react-icons/bs";

const CURRENT_USER_ID = "3dd0bb8c-a007-494c-bf36-fb983ed245f0";
const FILE_BASE = "http://37.27.29.18:8003/StaticFiles";

export default function ChatByIdPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawParam = String(params["chat-by-id"] ?? "");
  const isNew = rawParam === "new";
  const chatId = isNew ? null : Number(rawParam);

  const targetUserId = searchParams.get("userId") || "";
  const userName = searchParams.get("name") || "Пользователь";
  const avatar = searchParams.get("avatar")
    ? `http://37.27.29.18:8003/images/${searchParams.get("avatar")}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`;

  // для режима /chats/new — список чатов, чтобы найти существующий
  const { data: chatsData } = useGetChatsQuery(undefined, { skip: !isNew });
  const [createChat, { isLoading: isCreating }] = useCreateChatMutation();

  // если /chats/new: ищем чат с этим userId, иначе создаем и заменяем URL на /chats/{id}
  useEffect(() => {
    const run = async () => {
      if (!isNew) return;
      if (!targetUserId) return;

      const list = chatsData?.data || [];
      const existing = list.find(
        (c) =>
          String(c.receiveUserId || c.userId || c.partnerId) ===
          String(targetUserId)
      );
      if (existing?.chatId) {
        router.replace(
          `/chats/${existing.chatId}?name=${encodeURIComponent(
            userName
          )}&avatar=${encodeURIComponent(searchParams.get("avatar") || "")}`
        );
        return;
      }
      try {
        const res = await createChat(targetUserId).unwrap();
        const newChatId = res?.data?.chatId || res?.chatId || res?.id;
        if (newChatId) {
          router.replace(
            `/chats/${newChatId}?name=${encodeURIComponent(
              userName
            )}&avatar=${encodeURIComponent(searchParams.get("avatar") || "")}`
          );
        }
      } catch (e) {
        console.error("Не удалось создать чат:", e);
      }
    };
    run();
  }, [isNew, targetUserId, chatsData, createChat, router, userName, searchParams]);

  // после редиректа будет числовой chatId
  const {
    data: messagesData,
    refetch,
    isLoading,
    isFetching,
  } = useGetChatByIdQuery(chatId, {
    skip: isNew || !chatId || Number.isNaN(Number(chatId)),
    pollingInterval: 2000,
  });

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const messages = messagesData?.data || [];

  // helpers & sorting
  const getTs = (m) => {
    const raw = m.sendMassageDate || m.sendMessageDate || m.createdAt;
    const t = new Date(raw).getTime();
    return Number.isNaN(t) ? 0 : t;
  };

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => (getTs(a) - getTs(b)) || ((a.messageId ?? 0) - (b.messageId ?? 0))
    );
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages.length]);

  const formatTime = (s) => {
    if (!s) return "";
    const d = new Date(s);
    return Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDay = (s) => {
    const d = new Date(s || "");
    return Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  };

  const handleSend = async () => {
    if (!messageText.trim() && !file) return;
    if (!chatId) return; // ждём, пока создастся чат и будет редирект
    try {
      await sendMessage({ chatId, message: messageText.trim(), file }).unwrap();
      setMessageText("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refetch();
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Ошибка отправки:", err);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await deleteMessage(messageId).unwrap();
      await refetch();
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Ошибка удаления:", err);
    }
  };

  // экраны состояния при /chats/new
  if (isNew) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600">
          {isCreating ? "Создаём чат…" : "Готовим чат…"}
        </p>
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
        </div>
        <div className="flex items-center gap-5 text-gray-600">
          <button className="hover:text-black" title="Call">
            <BsTelephone size={18} />
          </button>
          <button className="hover:text-black" title="Video">
            <BsCameraVideo size={18} />
          </button>
          <button className="hover:text-black" title="Info">
            <BsInfoCircle size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6">
        <div className="mx-auto max-w-6xl space-y-4">
          {sortedMessages.map((m, i) => {
            const isMine = m.userId === CURRENT_USER_ID;

            const prev = sortedMessages[i - 1];
            const rawPrev = prev && (prev.sendMassageDate || prev.sendMessageDate || prev.createdAt);
            const rawCur = m.sendMassageDate || m.sendMessageDate || m.createdAt;

            const curDay = formatDay(rawCur);
            const prevDay = rawPrev ? formatDay(rawPrev) : null;
            const showDaySeparator = i === 0 || curDay !== prevDay;

            const curTime = formatTime(rawCur);
            const prevTime = rawPrev ? formatTime(rawPrev) : null;
            const showTimeAbove = i === 0 || curTime !== prevTime;

            return (
              <div key={m.messageId} className="space-y-2">
                {showDaySeparator && (
                  <div className="flex justify-center">
                    <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {curDay}
                    </span>
                  </div>
                )}

                {showTimeAbove && (
                  <div className="flex justify-center">
                    <span className="text-[11px] text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-full">
                      {curTime}
                    </span>
                  </div>
                )}

                <div
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  onMouseEnter={() => setHoveredMessageId(m.messageId)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <div
                    className={
                      "relative max-w-[75%] sm:max-w-[60%] px-3.5 py-2 rounded-2xl shadow " +
                      (isMine
                        ? "bg-[#1b74e4] text-white pr-7 rounded-br-xs"
                        : "bg-white text-gray-900 rounded-tl-xs")
                    }
                  >
                    {m.messageText && (
                      <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">
                        {m.messageText}
                      </p>
                    )}

                    {m.file && (
                      <div className={`${m.messageText ? "mt-2" : ""}`}>
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
                            className={isMine ? "underline text-white/90" : "underline text-blue-600"}
                          >
                            📎 Файл
                          </a>
                        )}
                      </div>
                    )}

                    {isMine && hoveredMessageId === m.messageId && (
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
          <div ref={messagesEndRef} />
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
