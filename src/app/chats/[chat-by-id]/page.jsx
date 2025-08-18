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
import {
  FiPaperclip,
  FiTrash,
  FiSmile,
  FiMic,
  FiImage,
  FiPhoneOff,
  FiMicOff,
  FiVideoOff,
  FiVideo,
} from "react-icons/fi";
import { Spin } from "antd";
import Peer from "peerjs";

const FILE_BASE = "http://37.27.29.18:8003/StaticFiles";
const API_BASE = "http://37.27.29.18:8003";

function getAuthPayload() {
  if (typeof window === "undefined") return null;
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

const getSenderId = (m) => m?.userId ?? m?.senderUserId ?? m?.fromUserId ?? null;
const getStamp = (m) => {
  const t = new Date(m?.sendMassageDate || m?.sendMessageDate || m?.createdAt || 0).getTime();
  return Number.isNaN(t) ? 0 : t;
};
const toTime = (s) => {
  const d = new Date(s || "");
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
};
const toDay = (s) => {
  const d = new Date(s || "");
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const isImage = (f) => /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(f || "");
const isVideo = (f) => /\.(mp4|webm|mov|m4v|ogg|ogv)$/i.test(f || "");
const isAudio = (f) => /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(f || "");
const isDoc = (f) => /\.(pdf|docx?|xlsx?|pptx?|txt|csv|zip|rar|7z|tar|gz)$/i.test(f || "");

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const k = 1024,
    sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function ReelOverlay({ src, onClose }) {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, []);
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };
  return (
    <div className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center">
      <div className="relative w-full h-full max-w-[480px] mx-auto">
        <video
          ref={videoRef}
          src={`${FILE_BASE}/${src}`}
          className="absolute inset-0 w-full h-full object-contain"
          playsInline
          autoPlay
          loop
          muted
          onClick={togglePlay}
        />
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
          title="Закрыть"
        >
          ✕
        </button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-white/10 px-3 py-1.5 rounded-full">
          {paused ? "Пауза — нажмите для воспроизведения" : "Идёт воспроизведение — нажмите для паузы"}
        </div>
      </div>
    </div>
  );
}

function VideoCallOverlay({
  avatar,
  userName,
  localStream,
  remoteStream,
  micMuted,
  camOff,
  onToggleMic,
  onToggleCam,
  onClose,
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
      <video ref={remoteRef} className="absolute inset-0 w-full h-full object-cover opacity-90" playsInline />
      {!remoteStream && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/20">
            <img src={avatar} alt={userName} className="w-full h-full object-cover" />
          </div>
          <div className="mt-4 text-white text-lg">{userName}</div>
          <div className="text-gray-300 text-sm mt-1">Вызов…</div>
        </div>
      )}
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

function useAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

function PostPreview({ postId }) {
  const token = useAuthToken();
  const [post, setPost] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    let abort = false;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/Post/get-post-by-id?id=${postId}`, {
          headers: {
            accept: "*/*",
            authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (!abort) setPost(json?.data || null);
      } catch {
        if (!abort) setErr("Не удалось загрузить пост");
      }
    }
    if (postId) load();
    return () => {
      abort = true;
    };
  }, [postId, token]);
  if (err) return <div className="text-xs text-red-500">{err}</div>;
  if (!post) return <div className="text-xs text-gray-500">Загрузка поста…</div>;
  const firstImg = post.images?.[0] || "";
  const vid = isVideo(firstImg);
  return (
    <a href="#" onClick={(e) => e.preventDefault()} className="block w-56 sm:w-64 bg-white border rounded-xl overflow-hidden shadow hover:shadow-md transition">
      <div className="relative w-full aspect-[9/16] bg-gray-100 flex items-center justify-center">
        {firstImg ? (
          vid ? (
            <video src={`${FILE_BASE}/${firstImg}`} className="w-full h-full object-cover" muted playsInline preload="metadata" />
          ) : (
            <img src={`${FILE_BASE}/${firstImg}`} alt={post.title || "post"} className="w-full h-full object-cover" />
          )
        ) : (
          <div className="text-gray-400 text-sm">Без медиа</div>
        )}
      </div>
      <div className="p-3">
        <div className="text-sm font-semibold line-clamp-1">{post.title || "Без названия"}</div>
        {post.content && <div className="text-xs text-gray-600 line-clamp-2 mt-1">{post.content}</div>}
        <div className="text-[11px] text-gray-500 mt-2">❤️ {post.postLikeCount ?? 0} · 💬 {post.commentCount ?? 0}</div>
      </div>
    </a>
  );
}

function extractPostId(text) {
  if (!text) return null;
  const m = String(text).match(/(?:^|\s)post:(\d+)(?:\s|$)/i);
  return m ? Number(m[1]) : null;
}

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
  const partnerId = String(searchParams.get("partnerId") || "");
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
      } catch {}
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
  const [reelSrc, setReelSrc] = useState("");
  const [pending, setPending] = useState([]);

  const endRef = useRef(null);
  const fileInputRef = useRef(null);

  const items = messagesData?.data || [];
  const sorted = useMemo(
    () => [...items].sort((a, b) => getStamp(a) - getStamp(b) || (a.messageId ?? 0) - (b.messageId ?? 0)),
    [items]
  );
  const combined = useMemo(() => [...sorted, ...pending], [sorted, pending]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [combined.length]);

  const handleSend = async () => {
    if (!chatId || (!messageText.trim() && !file)) return;
    const tempId = "tmp-" + Date.now();
    const createdAt = new Date().toISOString();
    let blobURL = "";
    try {
      if (file) blobURL = URL.createObjectURL(file);
    } catch {}
    const kind = file
      ? file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
        ? "audio"
        : "other"
      : "other";
    setPending((prev) => [
      ...prev,
      {
        __pending: true,
        messageId: tempId,
        messageText: messageText.trim(),
        createdAt,
        kind,
        src: blobURL,
        fallbackSrc: "",
        fileName: file?.name || "",
        size: file?.size || 0,
        revoke: blobURL ? () => URL.revokeObjectURL(blobURL) : null,
        userId: myId,
      },
    ]);
    if (file) {
      try {
        const b64 = await readAsDataURL(file);
        setPending((prev) => prev.map((m) => (m.messageId === tempId ? { ...m, fallbackSrc: String(b64 || "") } : m)));
      } catch {}
    }
    try {
      await sendMessage({ chatId, message: messageText.trim(), file }).unwrap();
      setMessageText("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refetch();
      setPending((prev) => {
        prev.forEach((p) => {
          try {
            p.revoke && p.revoke();
          } catch {}
        });
        return [];
      });
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {
      setPending((prev) => {
        prev.forEach((p) => {
          try {
            p.revoke && p.revoke();
          } catch {}
        });
        return prev.filter((m) => m.messageId !== tempId);
      });
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await deleteMessage(messageId).unwrap();
      await refetch();
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {}
  };

  const [showCall, setShowCall] = useState(false);
  const [peer, setPeer] = useState(null);
  const [callConnection, setCallConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  const myPeerId = chatId && myId ? `chat-${chatId}-${myId}` : "";
  const partnerPeerId = chatId && partnerId ? `chat-${chatId}-${partnerId}` : "";

  useEffect(() => {
    if (!myPeerId) return;
    const p = new Peer(myPeerId, { debug: 0 });
    setPeer(p);
    p.on("call", async (incoming) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        setShowCall(true);
        incoming.answer(stream);
        setCallConnection(incoming);
        incoming.on("stream", (rStream) => setRemoteStream(rStream));
        incoming.on("close", endCall);
        incoming.on("error", endCall);
      } catch {}
    });
    return () => {
      p.destroy();
      setPeer(null);
    };
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
    } catch {}
  };

  const endCall = () => {
    try {
      callConnection?.close();
    } catch {}
    try {
      peer?.disconnect();
      peer?.reconnect();
    } catch {}
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
    localStream.getAudioTracks().forEach((t) => (t.enabled = !enabled));
    setMicMuted(!micMuted);
  };
  const toggleCam = () => {
    if (!localStream) return;
    const enabled = !camOff;
    localStream.getVideoTracks().forEach((t) => (t.enabled = !enabled));
    setCamOff(!camOff);
  };

  if (isNew) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-600">
          <Spin />
        </p>
      </div>
    );
  }
  if (!chatId || Number.isNaN(chatId)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-red-500">Неверный chatId</p>
      </div>
    );
  }
  if (isLoading && !messagesData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-gray-600 animate-pulse">
          <Spin />
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen w-[1000px] bg-white text-gray-900">
        <div className="flex items-center justify-between px-5 py-3 border-b bg-white">
          <div className="flex items-center gap-3">
            <img src={avatar} alt={userName} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200" />
            <div className="font-medium">{userName}</div>
          </div>
          <div className="flex items-center gap-5 text-gray-600">
            <button className="hover:text-black" title="Call">
              <BsTelephone size={18} />
            </button>
            <button className="hover:text-black" title="Video" onClick={startCall} disabled={!partnerPeerId || !myPeerId || !peer}>
              <BsCameraVideo size={18} />
            </button>
            <button className="hover:text-black" title="Info">
              <BsInfoCircle size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6">
          <div className="mx-auto max-w-6xl space-y-4">
            {combined.map((m, i) => {
              const isPending = !!m.__pending;
              const mine = String(isPending ? m.userId : getSenderId(m)) === String(myId);
              const prev = combined[i - 1];
              const rawPrev = prev ? (prev.__pending ? prev.createdAt : prev.sendMassageDate || prev.sendMessageDate || prev.createdAt) : null;
              const rawCur = isPending ? m.createdAt : m?.sendMassageDate || m?.sendMessageDate || m?.createdAt;
              const curDay = toDay(rawCur);
              const prevDay = rawPrev ? toDay(rawPrev) : null;
              const showDay = i === 0 || curDay !== prevDay;
              const curTime = toTime(rawCur);
              const prevTime = rawPrev ? toTime(rawPrev) : null;
              const showTime = i === 0 || curTime !== prevTime;

              const filePath = isPending ? "" : m?.file || "";
              const hasFile = isPending ? m.kind !== "other" || !!m.fileName : !!filePath;
              const postId = isPending ? null : extractPostId(m?.messageText);

              return (
                <div key={m.messageId ?? `${getStamp(m)}-${i}`} className="space-y-2 hidscroll
				 ">
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
                    onMouseEnter={() => !isPending && setHoveredId(m.messageId)}
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

                      {hasFile && (
                        <div className={`${m?.messageText ? "mt-2" : ""} space-y-2`}>
                          {isPending && m.kind === "image" && m.src && (
                            <img
                              src={m.src}
                              onError={(e) => {
                                if (m.fallbackSrc) e.currentTarget.src = m.fallbackSrc;
                              }}
                              alt={m.fileName || "attachment"}
                              className="rounded-lg max-h-64 object-contain"
                            />
                          )}
                          {isPending && m.kind === "video" && m.src && (
                            <video
                              src={m.src}
                              onError={(e) => {
                                try {
                                  if (m.fallbackSrc) e.currentTarget.src = m.fallbackSrc;
                                } catch {}
                              }}
                              className="w-full max-w-sm rounded-lg"
                              controls
                              playsInline
                              preload="metadata"
                            />
                          )}
                          {isPending && m.kind === "audio" && m.src && (
                            <audio
                              src={m.src}
                              onError={(e) => {
                                try {
                                  if (m.fallbackSrc) e.currentTarget.src = m.fallbackSrc;
                                } catch {}
                              }}
                              className="w-full max-w-sm"
                              controls
                            />
                          )}
                          {isPending && m.kind === "other" && (
                            <div className="text-sm">
                              <div className="font-semibold">📎 {m.fileName || "Файл"}</div>
                              {m.size ? <div className="text-gray-500">{formatBytes(m.size)}</div> : null}
                            </div>
                          )}

                          {!isPending && isImage(filePath) && (
                            <img
                              src={`${FILE_BASE}/${filePath}`}
                              alt="attachment"
                              className="rounded-lg max-h-64 object-contain"
                              loading="lazy"
                            />
                          )}
                          {!isPending && isVideo(filePath) && (
                            <div className="w-full">
                              <div
                                className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-[9/16] bg-black/5 rounded-xl overflow-hidden cursor-pointer"
                                onClick={() => setReelSrc(filePath)}
                                title="Открыть"
                              >
                                <video
                                  src={`${FILE_BASE}/${filePath}#t=0.1`}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                  loop
                                  autoPlay
                                  preload="metadata"
                                />
                                <div className="absolute bottom-2 right-2 text-white text-xs bg-black/40 px-2 py-1 rounded">▶ Открыть</div>
                              </div>
                              <details className="mt-2">
                                <summary className="text-xs opacity-80 cursor-pointer">Показать плеер</summary>
                                <video
                                  src={`${FILE_BASE}/${filePath}`}
                                  className="mt-2 w-full max-w-sm rounded-lg"
                                  controls
                                  playsInline
                                  preload="metadata"
                                />
                              </details>
                            </div>
                          )}
                          {!isPending && isAudio(filePath) && (
                            <audio className="w-full max-w-sm" src={`${FILE_BASE}/${filePath}`} controls />
                          )}
                          {!isPending && isDoc(filePath) && (
                            <a
                              href={`${FILE_BASE}/${filePath}`}
                              target="_blank"
                              rel="noreferrer"
                              className={mine ? "underline text-white/90" : "underline text-blue-600"}
                            >
                              📎 Скачать файл
                            </a>
                          )}
                          {!isPending &&
                            !isImage(filePath) &&
                            !isVideo(filePath) &&
                            !isAudio(filePath) &&
                            !isDoc(filePath) &&
                            filePath && (
                              <a
                                href={`${FILE_BASE}/${filePath}`}
                                target="_blank"
                                rel="noreferrer"
                                className={mine ? "underline text-white/90" : "underline text-blue-600"}
                              >
                                📎 Вложение
                              </a>
                            )}
                        </div>
                      )}

                      {postId && (
                        <div className={`${m?.messageText || hasFile ? "mt-3" : ""}`}>
                          <PostPreview postId={postId} />
                        </div>
                      )}

                      {mine && !isPending && hoveredId === m.messageId && (
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
                title="Add image/video"
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
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (f && f.size === 0) {
                  setFile(null);
                  e.target.value = "";
                  return;
                }
                setFile(f);
              }}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
            />
            <button
              onClick={handleSend}
              disabled={isSending || (!messageText.trim() && !file) || !chatId}
              className={`ml-2 px-4 py-2 rounded-full font-semibold text-white ${
                isSending || (!messageText.trim() && !file) || !chatId ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
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

      {!!reelSrc && <ReelOverlay src={reelSrc} onClose={() => setReelSrc("")} />}
    </>
  );
}
