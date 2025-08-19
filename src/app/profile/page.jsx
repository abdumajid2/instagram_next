
'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { FreeMode } from "swiper/modules";

import { QRCode } from "antd";
import { jwtDecode } from "jwt-decode";
import { CgMenu } from "react-icons/cg";
import { TiThSmallOutline } from "react-icons/ti";
import { FaRegBookmark } from "react-icons/fa6";
import { BsPersonSquare } from "react-icons/bs";
import { ImCancelCircle } from "react-icons/im";
import { FiTrash2 } from "react-icons/fi";

import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

import p from "../../assets/img/pages/profile/profile/p.png";
import Posts from "@/app/profile/posts/page";
import Saved from "@/app/profile/saved/page";

import {
  useGetMyProfileQuery,
  useGetMyStoriesQuery,
  useAddStoryMutation,
  useDeleteStoryMutation,
  useAddStoryViewMutation,
  useLikeStoryMutation,
} from "@/store/pages/profile/ProfileApi";

import FollowersMenu from "@/components/pages/profile/followers";
import FollowingMenu from "@/components/pages/profile/following";

const API = "http://37.27.29.18:8003";
const BASE_IMG = `${API}/images`;

export default function Profile() {

  const router = useRouter();

  // ===== JWT decode =====
  const [decode, setDecode] = useState(null);
  const [hasToken, setHasToken] = useState(true);

  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken") || localStorage.getItem("access_token")
          : null;

      if (!raw) {
        setHasToken(false);
        return;
      }
      const d = jwtDecode(raw);
      setDecode(d);
    } catch (e) {
      console.error("JWT decode error:", e);
      setHasToken(false);
    }
  }, []);

  useEffect(() => {
    if (hasToken === false) router.replace("/login");
  }, [hasToken, router]);

  // ===== данные =====
  const { data, isLoading, isError } = useGetMyProfileQuery();
  const profile = data?.data;

  const { data: storiesResp, refetch: refetchStories } = useGetMyStoriesQuery();
  const stories = storiesResp?.data?.stories || [];

  // ===== RTK mutations для сторис =====
  const [addStory] = useAddStoryMutation();
  const [deleteStory] = useDeleteStoryMutation();
  const [addStoryView] = useAddStoryViewMutation();
  const [likeStoryMut] = useLikeStoryMutation();

  // ===== STORIES =====
  const isFresh = (s) => {
    const rawDate = s?.createAt; // поле в API
    if (!rawDate) return true;
    const t = Date.parse(rawDate);
    if (Number.isNaN(t)) return true;
    return Date.now() - t < 24 * 60 * 60 * 1000;
  };

  const freshStories = useMemo(() => stories.filter(isFresh), [stories]);

  // автоудаление истёкших
  const cleanupDoneRef = useRef(false);
  useEffect(() => {
    if (cleanupDoneRef.current) return;
    if (!stories || stories.length === 0) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("authToken") || localStorage.getItem("access_token")
        : null;
    if (!token) return;

    const stale = stories.filter((s) => !isFresh(s));
    if (stale.length === 0) {
      cleanupDoneRef.current = true;
      return;
    }

    (async () => {
      try {
        await Promise.all(
          stale.map((s) =>
            fetch(`${API}/Story/DeleteStory?id=${s.id}`, {
              method: "DELETE",
              headers: { accept: "*/*", Authorization: `Bearer ${token}` },
            }).catch((e) => console.error("DeleteStory error:", e))
          )
        );
      } finally {
        cleanupDoneRef.current = true;
        refetchStories();
      }
    })();
  }, [stories, refetchStories]);

  const getImageSrc = (fileName) => {
    if (!fileName) return p.src;
    if (typeof fileName === "string" && fileName.startsWith("http")) return fileName;
    return `${BASE_IMG}/${fileName}`;
  };




  // ===== Загрузка новой сторис =====
  const fileInputRef = useRef(null);
  const onNewStoryClick = () => fileInputRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await addStory({ file }).unwrap(); // POST /Story/AddStories
      await refetchStories();
    } catch (err) {
      console.error("AddStories error:", err);
    } finally {
      e.target.value = "";
    }
  };

  // ===== Вьюер историй =====
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  // локальное состояние лайков
const localLikes = useMemo(() => {
  const init = {};
  freshStories.forEach((s) => {
    init[s.id] = { liked: !!s.liked, likedCount: Number(s.likedCount || 0) };
  });
  return init;
}, [JSON.stringify(freshStories)]);


  // локальная отметка "просмотрено"
  const [viewedMap, setViewedMap] = useState({});
  useEffect(() => {
    if (!storyOpen) return;
    const cur = freshStories[storyIndex];
    if (!cur) return;

    // если уже пометили раньше — не дёргаем
    if (viewedMap[cur.id]) return;

    addStoryView(cur.id) // POST /Story/add-story-view
      .unwrap()
      .then(() => setViewedMap((m) => ({ ...m, [cur.id]: true })))
      .catch((e) => console.error("add-story-view error:", e));
  }, [storyOpen, storyIndex, freshStories, addStoryView, viewedMap]);

  const openStoryAt = (idx) => {
    if (freshStories.length === 0) return;
    setStoryIndex(idx);
    setStoryOpen(true);
  };
  const closeStory = () => setStoryOpen(false);

  // автопролистывание 5s
  useEffect(() => {
    if (!storyOpen) return;
    const timer = setTimeout(() => {
      if (storyIndex < freshStories.length - 1) setStoryIndex((i) => i + 1);
      else setStoryOpen(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [storyOpen, storyIndex, freshStories.length]);

  // клавиши
  useEffect(() => {
    if (!storyOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") return setStoryOpen(false);
      if (e.key === "ArrowRight")
        setStoryIndex((i) => (i < freshStories.length - 1 ? i + 1 : i));
      if (e.key === "ArrowLeft") setStoryIndex((i) => (i > 0 ? i - 1 : i));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [storyOpen, freshStories.length]);

  // клики по краям экрана
  const onViewerClick = (e) => {
    const mid = window.innerWidth / 2;
    if (e.clientX > mid) {
      if (storyIndex < freshStories.length - 1) setStoryIndex((i) => i + 1);
      else setStoryOpen(false);
    } else {
      if (storyIndex > 0) setStoryIndex((i) => i - 1);
    }
  };

  // лайк сторис (RTK)
  const likeCurrentStory = async () => {
    const s = freshStories[storyIndex];
    if (!s) return;
    const prev = localLikes[s.id] || { liked: !!s.liked, likedCount: Number(s.likedCount || 0) };

    // оптимизм
    const next = {
      liked: !prev.liked,
      likedCount: prev.liked ? Math.max(0, prev.likedCount - 1) : prev.likedCount + 1,
    };
    setLocalLikes((st) => ({ ...st, [s.id]: next }));

    try {
      await likeStoryMut(s.id).unwrap(); // POST /Story/LikeStory
    } catch (err) {
      console.error(err);
      setLocalLikes((st) => ({ ...st, [s.id]: prev })); // откат
    }
  };

  // удалить текущую сторис
  const onDeleteCurrent = async (e) => {
    e.stopPropagation();
    const cur = freshStories[storyIndex];
    if (!cur) return;
    try {
      await deleteStory(cur.id).unwrap(); // DELETE /Story/DeleteStory
      setStoryOpen(false);
      await refetchStories();
    } catch (err) {
      console.error("DeleteStory error:", err);
    }
  };

  // кольцо вокруг аватарки
  const hasStory = freshStories.length > 0;




  // ===== прочее UI =====
  const [activeTab, setActiveTab] = useState("posts");
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showProfileImage, setShowProfileImage] = useState(false);
  const [openFollowers, setOpenFollowers] = useState(false);
  const [openFollowing, setOpenFollowing] = useState(false);

  if (!hasToken) return <div className="p-6">Переход на страницу входа…</div>;
  if (isLoading) return <p>Загрузка...</p>;
  if (isError) return <p>Ошибка при загрузке данных</p>;

return (
  <div className="w-full sm:max-w-[640px] mx-auto sm:ml-[100px] mt-2 sm:mt-5 px-3 sm:px-0">
    {/* HEADER */}
    <section className="w-full flex  sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-[30px] h-auto sm:h-[160px]">
      <div
        className={
          (hasStory
            ? "p-[3px] rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 "
            : "") + "shrink-0"
        }
        onClick={() => (hasStory ? openStoryAt(0) : setShowProfileImage(true))}
        style={{ cursor: "pointer" }}
        aria-label={hasStory ? "Open stories" : "View avatar"}
      >
        <Image
          alt="Profile photo"
          width={160}
          height={160}
          src={getImageSrc(profile?.image)}
          className="h-[96px] w-[96px] sm:h-[160px] sm:w-[160px] object-cover rounded-full bg-white"
        />
      </div>

      {showProfileImage && !hasStory && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4">
          <div className="relative w-[90vw] max-w-[420px] sm:w-auto sm:max-w-none">
            <ImCancelCircle
              className="absolute -top-3 -right-3 sm:top-2 sm:right-2 text-white text-3xl cursor-pointer"
              onClick={() => setShowProfileImage(false)}
            />
            <Image
              src={getImageSrc(profile?.image)}
              alt="Profile large"
              width={400}
              height={400}
              className="object-contain rounded-xl w-full h-auto"
            />
          </div>
        </div>
      )}

      {isMenuLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">\
        
          <div className="w-[92vw] max-w-[500px] flex flex-col gap-5 p-5 sm:p-[50px] rounded-2xl sm:rounded-4xl bg-white">
            
            <ImCancelCircle className="ml-auto text-2xl" onClick={() => setIsMenuLoading(false)} />
            <p
              className="text-xl sm:text-2xl font-bold cursor-pointer"
              onClick={() => {
                setShowQRCode(true);
                setIsMenuLoading(false);
              }}
            >
              Qr code
            </p>
               <Link href="/profile/editProfile" className="flex-1 sm:flex-none">
              <button  className="text-xl sm:text-2xl font-bold cursor-pointer">
                Edit profile
              </button>
            </Link>
            <Link href={"/notification"}>
              <p className="text-xl sm:text-2xl font-bold">Notification</p>
            </Link>
            <Link href={"/setting"}>
              <p className="text-xl sm:text-2xl font-bold">Settings and privacy</p>
            </Link>
            <p
              className="text-red-600 text-xl sm:text-2xl font-bold cursor-pointer"
              onClick={() => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("access_token");
                setIsMenuLoading(false);
                window.location.href = "/login";
              }}
            >
              Log out
            </p>
          </div>
        </div>
      )}

      {showQRCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-[92vw] max-w-[400px] h-auto flex flex-col gap-4 p-4 sm:p-6 rounded-2xl bg-white items-center justify-center">
            <ImCancelCircle
              className="ml-auto text-2xl cursor-pointer self-end"
              onClick={() => setShowQRCode(false)}
            />
            <QRCode value="https://ant.design/" size={260} />
          </div>
        </div>
      )}

      <article className="w-full sm:w-[456px] flex flex-col items-start justify-between h-auto sm:h-[142px]">
        {/* top row: name + actions */}
        <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between">
          <p className="text-[18px] sm:text-[20px] font-[700]">{profile?.userName}</p>




          {/* actions — на мобилке в одну строку, компактнее */}
          <div className="flex items-center gap-2 sm:gap-[50px]">
         
            <button
              className="bg-[#F3F4F6] w-[110px] sm:w-[105px] h-[36px] sm:h-[40px] rounded-xl flex items-center justify-center text-sm sm:text-base"
              onClick={() => setIsMenuLoading(true)}
            >
              View archive
            </button>
            <CgMenu
              className="text-2xl  cursor-pointer"
              onClick={() => setIsMenuLoading(true)}
            />
          </div>
        </div>

        {/* stats */}
        <div className="flex w-full items-start sm:items-center justify-between sm:justify-start gap-6 sm:gap-7 mt-2 sm:mt-0">
          <p className="text-[13px] sm:text-[14px] font-[600]">
            {profile?.postCount} <span className="text-[#64748B] font-[400]">posts</span>
          </p>

          <p
            className="text-[13px] sm:text-[14px] font-[600] cursor-pointer"
            onClick={() => setOpenFollowers(true)}
          >
            {profile?.subscribersCount} <span className="text-[#64748B] font-[400]">followers</span>
          </p>

          <p
            className="text-[13px] sm:text-[14px] font-[600] cursor-pointer"
            onClick={() => setOpenFollowing(true)}
          >
            {profile?.subscriptionsCount} <span className="text-[#64748B] font-[400]">following</span>
          </p>
        </div>

        <p className="text-[16px] sm:text-[20px] font-[700] mt-1 sm:mt-0">{profile?.firstName}</p>
      </article>
    </section>

    {/* STORIES — Swiper и загрузка */}
    <div className="p-3 sm:p-5 bg-white -mx-3 sm:mx-0">
      <Swiper
        slidesPerView={4}
        spaceBetween={10}
        freeMode
        breakpoints={{
          320: { slidesPerView: 4, spaceBetween: 10 },
          375: { slidesPerView: 5, spaceBetween: 10 },
          640: { slidesPerView: 6, spaceBetween: 10 },
        }}
        modules={[FreeMode]}
        className="mySwiper"
      >
        {freshStories.map((story, idx) => (
          <SwiperSlide key={story.id} className="flex flex-col items-center">
            <button
              className="flex flex-col items-center focus:outline-none"
              onClick={() => openStoryAt(idx)}
              title="View story"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  <Image
                    src={getImageSrc(story.fileName)}
                    alt="story"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </button>
          </SwiperSlide>
        ))}

        {/* New story */}
        <SwiperSlide className="flex flex-col items-center justify-center">
          <button
            className="flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700"
            onClick={onNewStoryClick}
            title="Add story"
          >
            <span className="text-2xl sm:text-3xl font-bold leading-none">+</span>
            <p className="hidden sm:block text-xs mt-1">New</p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </SwiperSlide>
      </Swiper>
    </div>




    {/* STORY VIEWER */}
    {storyOpen && freshStories[storyIndex] && (
      <div
        className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center select-none p-3"
        onClick={onViewerClick}
      >
        {/* верх: прогресс и пользователь */}
        <div className="absolute top-3 sm:top-4 left-3 right-3 sm:left-4 sm:right-4">
          <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            {freshStories.map((_, i) => (
              <div key={i} className="h-0.5 sm:h-1 flex-1 bg-white/30 overflow-hidden rounded">
                <div
                  className="h-full bg-white"
                  style={{
                    width: i < storyIndex ? "100%" : i === storyIndex ? "100%" : "0%",
                    opacity: i === storyIndex ? 0.9 : 0.6,
                    transition: i === storyIndex ? "width 5s linear" : "none",
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-white/90">
            <Image
              src={getImageSrc(profile?.image)}
              alt="user"
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="text-xs sm:text-sm font-semibold">{profile?.userName}</span>
            {viewedMap[freshStories[storyIndex].id] && (
              <span className="ml-2 sm:ml-3 text-[10px] sm:text-xs px-2 py-0.5 rounded bg-white/15">
                Viewed
              </span>
            )}
          </div>
        </div>

        {/* картинка */}
        <Image
          src={getImageSrc(freshStories[storyIndex].fileName)}
          alt="story-large"
          width={800}
          height={800}
          className="max-h-[76vh] sm:max-h-[80vh] w-auto object-contain rounded-xl"
          priority
          unoptimized
        />

        {/* лайк + счётчик */}
        <div
          className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-3 sm:gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="rounded-full p-2.5 sm:p-3 bg-white/10 hover:bg-white/20"
            onClick={likeCurrentStory}
            aria-label="Like story"
            title="Like"
          >
            {(localLikes[freshStories[storyIndex].id]?.liked ?? false) ? (
              <AiFillHeart className="text-red-500 text-2xl sm:text-3xl" />
            ) : (
              <AiOutlineHeart className="text-white text-2xl sm:text-3xl" />
            )}
          </button>
          <span className="text-white/90 text-xs sm:text-sm">
            {localLikes[freshStories[storyIndex].id]?.likedCount ??
              freshStories[storyIndex].likedCount ??
              0}{" "}
            likes
          </span>
        </div>

        {/* удалить/закрыть */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-2 sm:gap-3">
          <button
            className="text-white/80 hover:text-white text-xl sm:text-2xl"
            onClick={onDeleteCurrent}
            title="Delete story"
            aria-label="Delete story"
          >
            <FiTrash2 />
          </button>
          <button
            className="text-white/80 hover:text-white text-2xl sm:text-3xl"
            onClick={(e) => {
              e.stopPropagation();
              closeStory();
            }}
            aria-label="Close story"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>
    )}




    {/* TABS */}
    <section className="w-full my-5 sm:my-[30px] px-2 py-[5px] border-t flex items-center justify-center gap-6 sm:space-x-10 border-gray-400">
      <article
        onClick={() => setActiveTab("posts")}
        className={`cursor-pointer font-[500] flex items-center gap-2 sm:gap-[10px] ${
          activeTab === "posts" ? "text-[#2563EB] border-t-2 border-[#2563EB]" : "text-[#64748B]"
        }`}
      >
        <TiThSmallOutline className="text-lg sm:text-xl" />
        <p className="hidden sm:block">Posts</p>
      </article>

      <article
        onClick={() => setActiveTab("saved")}
        className={`cursor-pointer font-[500] flex items-center gap-2 sm:gap-[10px] ${
          activeTab === "saved" ? "text-[#2563EB] border-t-2 border-[#2563EB]" : "text-[#64748B]"
        }`}
      >
        <FaRegBookmark className="text-lg sm:text-xl" />
        <p className="hidden sm:block">Saved</p>
      </article>

      <article
        onClick={() => setActiveTab("tagged")}
        className={`cursor-pointer font-[500] flex items-center gap-2 sm:gap-[10px] ${
          activeTab === "tagged" ? "text-[#2563EB] border-t-2 border-[#2563EB]" : "text-[#64748B]"
        }`}
      >
        <BsPersonSquare className="text-lg sm:text-xl" />
        <p className="hidden sm:block">Tagged</p>
      </article>
    </section>

    <div className="px-0 sm:px-0">
      {activeTab === "posts" && <Posts />}
      {activeTab === "saved" && <Saved />}
      {activeTab === "tagged" && <p>Tagged content</p>}
    </div>

    {/* модалки подписчики/подписки */}
    <FollowersMenu
      open={openFollowers}
      onClose={() => setOpenFollowers(false)}
      userId={decode?.sid}
    />
    <FollowingMenu
      open={openFollowing}
      onClose={() => setOpenFollowing(false)}
      userId={decode?.sid}
    />
  </div>
);
}