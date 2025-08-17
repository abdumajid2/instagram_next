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
import { FiPaperclip, FiTrash, FiSmile, FiMic, FiImage, FiPhoneOff, FiMicOff, FiVideoOff, FiVideo } from "react-icons/fi";
import { Spin } from "antd";
import Peer from "peerjs";

const FILE_BASE = "http://37.27.29.18:8003/StaticFiles";

/* ==== helpers ==== */
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

/* ==== UI для звонка ==== */
function VideoCallOverlay({
  avatar, userName,
  localStream, remoteStream,
  micMuted, camOff,
  onToggleMic, onToggleCam, onClose
}) {
  const localRef = useRef(null);
  const remoteRef = useRef(null);

  useEffect(() => {
    if (localRef.current && localStream) {
      localRef.current.srcObject = localStream;
      localRef.current.muted = true;
      localRef.current.play().catch(() => {});
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
      remoteRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      {/* основной фон — удалённое видео */}
      <video
        ref={remoteRef}
        className="absolute inset-0 w-full h-full object-cover opacity-90"
        playsInline
      />
      {!remoteStream && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/20">
            <img src={avatar} alt={userName} className="w-full h-full object-cover" />
          </div>
          <div className="mt-4 text-white text-lg">{userName}</div>
          <div className="text-gray-300 text-sm mt-1">Вызов…</div>
        </div>
      )}

      {/* мини-превью локального видео */}
      <div className="absolute bottom-8 right-8 w-72 h-40 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
        {camOff || !localStream ? (
          <div className="flex flex-col items-center gap-2 text-white/80">
            <FiVideoOff size={28} />
            <span className="text-sm">Камера выключена</span>
          </div>
        ) : (
          <video ref={localRef} className="w-full h-full object-cover" playsInline />
        )}
      </div>

      {/* панель управления */}
      <div className="absolute bottom-16 left-0 right-0 flex items-center justify-center gap-6">
        <button
          onClick={onToggleCam}
          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur transition"
          title={camOff ? "Включить камеру" : "Выключить камеру"}
        >
          {camOff ? <FiVideoOff size={22} /> : <FiVideo size={22} />}
        </button>

        <button
          onClick={onToggleMic}
          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur transition"
          title={micMuted ? "Включить микрофон" : "Выключить микрофон"}
        >
          {micMuted ? <FiMicOff size={22} /> : <FiMic size={22} />}
        </button>

        <button
          onClick={onClose}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition"
          title="Завершить"
        >
          <FiPhoneOff size={22} />
        </button>
      </div>
    </div>
  );
}

/* ==== СТРАНИЦА ЧАТА ==== */
export default function ChatByIdPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawParam = String(params["chat-by-id"] ?? "");
  const isNew = rawParam === "new";
  const chatId = isNew ? null : Number(rawParam);
  const myId = String(getMyUserId() || "");
  const myName = getMyName();

  const targetUserId = searchParams.get("userId") || "";
  const partnerId = String(searchParams.get("partnerId") || ""); // <— добавили
  const userName = searchParams.get("name") || "Пользователь";
  const avatar = searchParams.get("avatar")
    ? `http://37.27.29.18:8003/images/${searchParams.get("avatar")}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`;

  const { data: chatsData } = useGetChatsQuery(undefined, { skip: !isNew });
  const [createChat, { isLoading: isCreating }] = useCreateChatMutation();

  useEffect(() => {
    const go = async () => {
      if (!isNew || !targetUserId) return;
      const list = chatsData?.data || [];
      const existing = list.find((c) => {
        const iAmSender = String(c.sendUserId) === String(myId);
        const pid = iAmSender ? c.receiveUserId : c.sendUserId;
        return String(pid) === String(targetUserId);
      });
      if (existing?.chatId) {
        router.replace(
          `/chats/${existing.chatId}?name=${encodeURIComponent(userName)}&avatar=${encodeURIComponent(
            searchParams.get("avatar") || ""
          )}&partnerId=${encodeURIComponent(targetUserId)}`
        );
        return;
      }
      try {
        const res = await createChat(String(targetUserId)).unwrap();
        const newChatId = res?.data ?? res?.chatId ?? res?.id;
        if (newChatId) {
          router.replace(
            `/chats/${newChatId}?name=${encodeURIComponent(userName)}&avatar=${encodeURIComponent(
              searchParams.get("avatar") || ""
            )}&partnerId=${encodeURIComponent(targetUserId)}`
          );
        }
      } catch (e) {
        console.error("Не удалось создать чат:", e);
      }
    };
    go();
  }, [isNew, targetUserId, chatsData, createChat, router, userName, searchParams, myId]);

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

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [sorted.length]);

  const handleSend = async () => {
    if (!chatId || (!messageText.trim() && !file)) return;
    try {
      await sendMessage({ chatId, message: messageText.trim(), file }).unwrap();
      setMessageText(""); setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refetch(); endRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) { console.error("Ошибка отправки:", err); }
  };
  const handleDelete = async (messageId) => {
    try { await deleteMessage(messageId).unwrap(); await refetch(); endRef.current?.scrollIntoView({ behavior: "smooth" }); }
    catch (err) { console.error("Ошибка удаления:", err); }
  };

  /* ==== ВИДЕОЗВОНОК (PeerJS) ==== */
  const [showCall, setShowCall] = useState(false);
  const [peer, setPeer] = useState(null);
  const [callConnection, setCallConnection] = useState(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  const myPeerId = chatId && myId ? `chat-${chatId}-${myId}` : "";
  const partnerPeerId = chatId && partnerId ? `chat-${chatId}-${partnerId}` : "";

  // Создаём Peer, слушаем входящий звонок (callee)
  useEffect(() => {
    if (!myPeerId) return;
    const p = new Peer(myPeerId, { debug: 0 }); // можно настроить host/port/path при необходимости
    setPeer(p);

    p.on("call", async (incoming) => {
      // Отвечаем входящему
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        setShowCall(true);
        incoming.answer(stream);
        setCallConnection(incoming);

        incoming.on("stream", (rStream) => setRemoteStream(rStream));
        incoming.on("close", endCall);
        incoming.on("error", endCall);
      } catch (e) {
        console.error("Нет доступа к камере/микрофону:", e);
      }
    });

    p.on("error", (err) => console.error("Peer error:", err));

    return () => {
      p.destroy();
      setPeer(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myPeerId]);

  const startCall = async () => {
    if (!partnerPeerId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setShowCall(true);

      const call = peer.call(partnerPeerId, stream);
      setCallConnection(call);

      call.on("stream", (rStream) => setRemoteStream(rStream));
      call.on("close", endCall);
      call.on("error", endCall);
    } catch (e) {
      console.error("Нет доступа к камере/микрофону:", e);
    }
  };

  const endCall = () => {
    try { callConnection?.close(); } catch {}
    try { peer?.disconnect(); peer?.reconnect(); } catch {}
    setCallConnection(null);
    setShowCall(false);
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
    if (remoteStream) setRemoteStream(null);
    setMicMuted(false);
    setCamOff(false);
  };

  const toggleMic = () => {
    if (!localStream) return;
    const enabled = !micMuted;
    localStream.getAudioTracks().forEach((t) => (t.enabled = !enabled)); // если-muted => выключаем
    setMicMuted(!micMuted);
  };
  const toggleCam = () => {
    if (!localStream) return;
    const enabled = !camOff;
    localStream.getVideoTracks().forEach((t) => (t.enabled = !enabled));
    setCamOff(!camOff);
  };

  /* ==== Render ==== */
  if (isNew) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600"><Spin/></p>
      </div>
    );
  }
  if (!chatId || Number.isNaN(chatId)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-red-500"></p>
      </div>
    );
  }
  if (isLoading && !messagesData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-gray-600 animate-pulse"><Spin/></p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen w-[1000px] bg-white text-gray-900">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-white">
          <div className="flex items-center gap-3">
            <img src={avatar} alt={userName} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200" />
            <div className="font-medium">{userName}</div>
          </div>
          <div className="flex items-center gap-5 text-gray-600">
            <button className="hover:text-black" title="Call"><BsTelephone size={18} /></button>
            <button
              className="hover:text-black"
              title="Video"
              onClick={startCall} // ← запускаем
              disabled={!partnerPeerId || !myPeerId || !peer}
            >
              <BsCameraVideo size={18} />
            </button>
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
                            <img src={`${FILE_BASE}/${m.file}`} alt="attachment" className="rounded-lg max-h-64 object-contain" />
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

        {/* Input */}
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
              <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full text-gray-600 hover:bg-gray-100" title="Attach file">
                <FiPaperclip size={20} />
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full text-gray-600 hover:bg-gray-100" title="Add image">
                <FiImage size={20} />
              </button>
              <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100" title="Voice">
                <FiMic size={20} />
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
            <button
              onClick={handleSend}
              disabled={isSending || (!messageText.trim() && !file) || !chatId}
              className={`ml-2 px-4 py-2 rounded-full font-semibold text-white ${isSending || (!messageText.trim() && !file) || !chatId ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              title="Send"
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {showCall && (
        <VideoCallOverlay
          avatar={avatar}
          userName={userName}
          localStream={localStream}
          remoteStream={remoteStream}
          micMuted={micMuted}
          camOff={camOff}
          onToggleMic={toggleMic}
          onToggleCam={toggleCam}
          onClose={endCall}
        />
      )}
    </>
  );
}
