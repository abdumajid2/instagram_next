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
import Image from "next/image";


const FILE_BASE = "http://37.27.29.18:8003/StaticFiles";
const API_BASE = "http://37.27.29.18:8003";


//грифтани токен ай ауз
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


// грифтани айди аз токен
function getMyUserId() {
  const p = getAuthPayload();
  return p?.sid || p?.sub || p?.userId || p?.nameid || null;
}


// грифтани носи юзер
function getMyName() {
  const p = getAuthPayload();
  return p?.name || p?.fullName || "User";
}

// грифтани токен аз localStorage
function useAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

// типа барои утил 
const getSenderId = (m) =>
  m?.userId ?? m?.senderUserId ?? m?.fromUserId ?? null;
const getStamp = (m) => {
  const t = new Date(
    m?.sendMassageDate || m?.sendMessageDate || m?.createdAt || 0
  ).getTime();
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
    : d.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
};


//типа проверкаи ёки тест кардани файло
const isImage = (f) => /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(f || "");
const isVideo = (f) => /\.(mp4|webm|mov|m4v|ogg|ogv)$/i.test(f || "");
const isAudio = (f) => /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(f || "");
const isDoc = (f) =>
  /\.(pdf|docx?|xlsx?|pptx?|txt|csv|zip|rar|7z|tar|gz)$/i.test(f || "");

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
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}




function extractSharedEntity(text) {
  if (!text) return null;
  const s = String(text);

  let m = s.match(/(?:^|\s)(post|reel):(\d+)(?:\s|$)/i);
  if (m) return { kind: m[1].toLowerCase(), id: Number(m[2]) };

  m = s.match(/\/(posts|reels)\/(\d+)(?:\b|\/|$)/i);
  if (m)
    return {
      kind: m[1].toLowerCase() === "posts" ? "post" : "reel",
      id: Number(m[2]),
    };

  m = s.match(/[?&]id=(\d+)\b/i);
  if (m) {
    const kind = /reel/i.test(s) ? "reel" : "post";
    return { kind, id: Number(m[1]) };
  }

  return null;
}

// оверлей барои хаму рильс ва видеохо
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
          {paused
            ? "Пауза — нажмите для воспроизведения"
            : "Идёт воспроизведение — нажмите для паузы"}
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
      <video
        ref={remoteRef}
        className="absolute inset-0 w-full h-full object-cover opacity-90"
        playsInline
      />
      {!remoteStream && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/20">
            <Image
              src={avatar}
              alt={userName}
              className="w-full h-full object-cover"
            />
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
          <video
            ref={localRef}
            className="w-full h-full object-cover"
            playsInline
          />
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


//
function IgCard({ id, kind = "post", onOpenReel }) {
  const token = useAuthToken();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/Post/get-post-by-id?id=${id}`, {
          headers: {
            accept: "*/*",
            authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (!abort) setData(json?.data || null);
      } catch {
        if (!abort)
          setErr("Не удалось загрузить " + (kind === "reel" ? "рилс" : "пост"));
      }
    })();
    return () => {
      abort = true;
    };
  }, [id, kind, token]);

  if (err) return <div className="text-xs text-red-500">{err}</div>;
  if (!data) return <div className="text-xs text-gray-500">Загрузка…</div>;

  const firstMedia = data.images?.[0] || "";
  const isVid = isVideo(firstMedia);

  return (
    <div className="w-[270px] sm:w-[300px]">
      <div
        className="relative w-full aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-md cursor-pointer"
        onClick={() => (kind === "reel" || isVid) && onOpenReel?.(firstMedia)}
        title={kind === "reel" || isVid ? "Открыть рилс" : "Открыть пост"}
      >
        {firstMedia ? (
          isVid ? (
            <video
              src={`${FILE_BASE}/${firstMedia}#t=0.1`}
              className="w-full h-full object-cover"
              muted
              playsInline
              loop
              autoPlay
              preload="metadata"
            />
          ) : (
            <Image
              src={`${FILE_BASE}/${firstMedia}`}
              alt={data.title || ""}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
            Без медиа
          </div>
        )}

        <div className="absolute bottom-2 right-2 text-white text-xs bg-black/40 px-2 py-1 rounded-full select-none">
          ▶ Открыть
        </div>
        <div className="absolute bottom-2 left-2 text-white/90 text-xs bg-black/30 px-2 py-1 rounded-full select-none">
          {kind === "reel" || isVid ? "Reels" : "Post"}
        </div>
      </div>

      <div className="px-1.5 pt-2">
        <div className="text-[11px] text-gray-500">
          ❤️ {data.postLikeCount ?? 0} · 💬 {data.commentCount ?? 0}
        </div>
        <div className="text-sm font-semibold line-clamp-1 mt-0.5">
          {data.title || "Без названия"}
        </div>
        {data.content && (
          <div className="text-xs text-gray-600 line-clamp-2">
            {data.content}
          </div>
        )}
      </div>
    </div>
  );
}

//барои чат гузаштан
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

  // postId ай поделиться омадагиш
  const sharedPostId = searchParams.get("postId") || "";
  const autoSharedRef = useRef(false);

  const { data: chatsData } = useGetChatsQuery(undefined, { skip: !isNew });
  const [createChat] = useCreateChatMutation();

  // чати нав сохтан
  useEffect(() => {
    const go = async () => {
      if (!isNew || !targetUserId) return;
      const list = chatsData?.data || [];
      const existing = list.find((c) => {
        const iAmSender = String(c.sendUserId) === String(myId);
        const pid = iAmSender ? c.receiveUserId : c.sendUserId;
        return String(pid) === String(targetUserId);
      });

      const qs =
        `?name=${encodeURIComponent(userName)}` +
        `&avatar=${encodeURIComponent(searchParams.get("avatar") || "")}` +
        `&partnerId=${encodeURIComponent(targetUserId)}` +
        (sharedPostId ? `&postId=${encodeURIComponent(sharedPostId)}` : "");

      if (existing?.chatId) {
        router.replace(`/chats/${existing.chatId}${qs}`);
        return;
      }
      try {
        const res = await createChat(String(targetUserId)).unwrap();
        const newChatId = res?.data ?? res?.chatId ?? res?.id;
        if (newChatId) router.replace(`/chats/${newChatId}${qs}`);
      } catch {}
    };
    go();
  }, [
    isNew,
    targetUserId,
    chatsData,
    createChat,
    router,
    userName,
    searchParams,
    myId,
    sharedPostId,
  ]);


  // грифтани чатхо
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

  // якбор рои кадани пост
  useEffect(() => {
    if (!chatId || !sharedPostId) return;
    const key = `autoShare:${chatId}:${sharedPostId}`;
    if (autoSharedRef.current) return;
    if (typeof window !== "undefined" && sessionStorage.getItem(key)) return;

    autoSharedRef.current = true;
    (async () => {
      try {
        await sendMessage({ chatId, message: `post:${sharedPostId}` }).unwrap();
        if (typeof window !== "undefined") sessionStorage.setItem(key, "1");
        const url = new URL(window.location.href);
        url.searchParams.delete("postId");
        router.replace(
          url.pathname +
            (url.searchParams.toString()
              ? `?${url.searchParams.toString()}`
              : "")
        );
      } catch {}
    })();
  }, [chatId, sharedPostId, sendMessage, router]);

  
  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [reelSrc, setReelSrc] = useState("");
  const [pending, setPending] = useState([]);

  const endRef = useRef(null);
  const fileInputRef = useRef(null);


  //барои сорт кардани смсхои чат
  const items = messagesData?.data || [];
  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          getStamp(a) - getStamp(b) || (a.messageId ?? 0) - (b.messageId ?? 0)
      ),
    [items]
  );


  //ишам хам барои сорт ва скрол кадани аму ареаи чат
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
        setPending((prev) =>
          prev.map((m) =>
            m.messageId === tempId ? { ...m, fallbackSrc: b64 } : m
          )
        );
      } catch {}
    }

    try {
      await sendMessage({
        chatId,
        message: messageText.trim(),
        file: file ?? undefined,
      }).unwrap();
      setMessageText("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refetch();
      setPending((prev) => {
        prev.forEach((p) => p?.revoke?.());
        return [];
      });
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {
      setPending((prev) => {
        prev.forEach((p) => p?.revoke?.());
        return prev.filter((m) => m.messageId !== tempId);
      });
    }
  };


  //делет смс иш
  const handleDelete = async (messageId) => {
    try {
      await deleteMessage(messageId).unwrap();
      await refetch();
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {}
  };


  //peer js chatgpt
  const [showCall, setShowCall] = useState(false);
  const [peer, setPeer] = useState(null);
  const [callConnection, setCallConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  const myPeerId = chatId && myId ? `chat-${chatId}-${myId}` : "";
  const partnerPeerId =
    chatId && partnerId ? `chat-${chatId}-${partnerId}` : "";

  useEffect(() => {
    if (!myPeerId) return;
    const p = new Peer(myPeerId, { debug: 0 });
    setPeer(p);
    p.on("call", async (incoming) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
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
    if (!partnerPeerId || !peer) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
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

  /* ====== UI states ====== */
  if (isNew) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Spin />
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
      <div className="flex items-center justify-center h-screen bg-white">
        <Spin />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-[94vh] md:h-screen  md:w-[85vw]  md:overflow-y-auto">

        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b">
          <div className="flex items-center gap-3">
            <Image
              src={avatar}
              alt={userName}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="font-semibold">{userName}</div>
          </div>
          <div className="flex items-center gap-5 text-gray-600">
            <button className="hover:text-black" title="Call">
              <BsTelephone size={18} />
            </button>
            <button
              className="hover:text-black"
              title="Video"
              onClick={startCall}
              disabled={!partnerPeerId || !myPeerId || !peer}
            >
              <BsCameraVideo size={18} />
            </button>
            <button className="hover:text-black" title="Info">
              <BsInfoCircle size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-6 bg-white">
          <div className="mx-auto max-w-10xl space-y-4">
            {combined.map((m, i) => {
              const isPending = !!m.__pending;
              const mine =
                String(isPending ? m.userId : getSenderId(m)) === String(myId);
              const prev = combined[i - 1];
              const rawPrev = prev
                ? prev.__pending
                  ? prev.createdAt
                  : prev.sendMassageDate ||
                    prev.sendMessageDate ||
                    prev.createdAt
                : null;
              const rawCur = isPending
                ? m.createdAt
                : m?.sendMassageDate || m?.sendMessageDate || m?.createdAt;
              const curDay = toDay(rawCur);
              const prevDay = rawPrev ? toDay(rawPrev) : null;
              const showDay = i === 0 || curDay !== prevDay;
              const curTime = toTime(rawCur);
              const prevTime = rawPrev ? toTime(rawPrev) : null;
              const showTime = i === 0 || curTime !== prevTime;

              const filePath = isPending ? "" : m?.file || "";
              const hasFile = isPending
                ? m.kind !== "other" || !!m.fileName
                : !!filePath;

              const shared = isPending
                ? null
                : extractSharedEntity(m?.messageText);
              const displayText = shared
                ? String(m?.messageText || "")
                    .replace(/(?:^|\s)(post|reel):\d+(?=\s|$)/gi, "")
                    .trim()
                : m?.messageText;

              return (
                <div
                  key={m.messageId ?? `${getStamp(m)}-${i}`}
                  className="space-y-2"
                >
                  {showDay && (
                    <div className="flex justify-center">
                      <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {curDay}
                      </span>
                    </div>
                  )}
                  {showTime && (
                    <div className="flex justify-center">
                      <span className="text-[11px] text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-full">
                        {curTime}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    onMouseEnter={() => !isPending && setHoveredId(m.messageId)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div
                      className={[
                        "relative max-w-[78%] sm:max-w-[65%] px-3.5 py-2 rounded-2xl shadow-sm border",
                        mine
                          ? "bg-[#efefef] text-black rounded-br-xs border-transparent"
                          : "bg-white rounded-tl-xs text-gray-900 border-gray-200",
                      ].join(" ")}
                    >
                      {!!displayText && (
                        <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">
                          {displayText}
                        </p>
                      )}

                      {hasFile && (
                        <div
                          className={`${displayText ? "mt-2" : ""} space-y-2`}
                        >
                          {isPending && m.kind === "image" && m.src && (
                            <Image
                              src={m.src}
                              onError={(e) => {
                                if (m.fallbackSrc)
                                  e.currentTarget.src = m.fallbackSrc;
                              }}
                              alt={m.fileName || "attachment"}
                              className="rounded-xl max-h-64 object-contain"
                            />
                          )}
                          {isPending && m.kind === "video" && m.src && (
                            <video
                              src={m.src}
                              className="w-full max-w-sm rounded-xl"
                              onError={(e) => {
                                try {
                                  if (m.fallbackSrc)
                                    e.currentTarget.src = m.fallbackSrc;
                                } catch {}
                              }}
                              controls
                              playsInline
                              preload="metadata"
                            />
                          )}
                          {isPending && m.kind === "audio" && m.src && (
                            <audio
                              className="w-full max-w-sm"
                              src={m.src}
                              controls
                            />
                          )}
                          {isPending && m.kind === "other" && (
                            <div className="text-sm">
                              <div className="font-semibold">
                                📎 {m.fileName || "Файл"}
                              </div>
                              {m.size ? (
                                <div className="text-gray-500">
                                  {formatBytes(m.size)}
                                </div>
                              ) : null}
                            </div>
                          )}

                          {!isPending && isImage(filePath) && (
                            <Image
                              src={`${FILE_BASE}/${filePath}`}
                              alt="attachment"
                              className="rounded-xl max-h-64 object-contain"
                              loading="lazy"
                            />
                          )}
                          {!isPending && isVideo(filePath) && (
                            <div className="w-full">
                              <div
                                className="relative w-full max-w-[300px] aspect-[9/16] bg-black rounded-2xl overflow-hidden cursor-pointer"
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
                                <div className="absolute bottom-2 right-2 text-white text-xs bg-black/40 px-2 py-1 rounded-full">
                                  ▶ Открыть
                                </div>
                              </div>
                              <details className="mt-2">
                                <summary className="text-xs opacity-80 cursor-pointer">
                                  Показать плеер
                                </summary>
                                <video
                                  src={`${FILE_BASE}/${filePath}`}
                                  className="mt-2 w-full max-w-sm rounded-xl"
                                  controls
                                  playsInline
                                  preload="metadata"
                                />
                              </details>
                            </div>
                          )}
                          {!isPending && isAudio(filePath) && (
                            <audio
                              className="w-full max-w-sm"
                              src={`${FILE_BASE}/${filePath}`}
                              controls
                            />
                          )}
                          {!isPending && isDoc(filePath) && (
                            <a
                              href={`${FILE_BASE}/${filePath}`}
                              target="_blank"
                              rel="noreferrer"
                              className="underline text-blue-600"
                            >
                              📎 Скачать файл
                            </a>
                          )}
                        </div>
                      )}


                      {shared && (
                        <div
                          className={`${displayText || hasFile ? "mt-3" : ""}`}
                        >
                          <IgCard
                            id={shared.id}
                            kind={shared.kind}
                            onOpenReel={(src) => setReelSrc(src)}
                          />
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

        <div className="border-t bg-white px-2 sm:px-6 py-3">
          <div
            className="
      mx-auto w-full
      max-w-full
      sm:max-w-2xl
      lg:max-w-4xl
      xl:max-w-6xl
      2xl:max-w-7xl
      flex items-center gap-2
    "
          >
            <button
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
              title="Emoji"
            >
              <FiSmile size={20} />
            </button>

            <div className="flex-1 flex items-center w-full bg-[#fafafa] rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-gray-300">
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Messages"
                className="w-full bg-transparent px-3 py-2 md:px-4 md:py-2.5 outline-none text-[15px]"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                title="Прикрепить файл"
              >
                <FiPaperclip size={20} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                title="Фото/видео"
              >
                <FiImage size={20} />
              </button>
              <button
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100"
                title="Голосовое"
              >
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
                  e.currentTarget.value = "";
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
              className={`ml-1 px-4 py-2 rounded-full font-semibold text-white ${
                isSending || (!messageText.trim() && !file) || !chatId
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-black/90"
              }`}
              title="Отправить"
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

      {!!reelSrc && (
        <ReelOverlay src={reelSrc} onClose={() => setReelSrc("")} />
      )}
    </>
  );
}
