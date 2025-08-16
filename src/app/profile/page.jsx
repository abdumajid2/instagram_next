'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { QRCode } from "antd";
import { jwtDecode } from "jwt-decode";
import { CgMenu } from "react-icons/cg";
import { TiThSmallOutline } from "react-icons/ti";
import { FaRegBookmark } from "react-icons/fa6";
import { BsPersonSquare } from "react-icons/bs";
import { ImCancelCircle } from "react-icons/im";

import p from "../../assets/img/pages/profile/profile/p.png";
import Posts from "@/app/profile/posts/page";
import Saved from "@/app/profile/saved/page";

import {
  useGetMyProfileQuery,
  useGetMyStoriesQuery,
} from "@/store/pages/profile/ProfileApi";

// готовые модалки подписчики/подписки
import FollowersMenu from "@/components/pages/profile/followers";
import FollowingMenu from "@/components/pages/profile/following";

const API = "http://37.27.29.18:8003";
const BASE_IMG = `${API}/images`;

export default function Profile() {
  const router = useRouter();

  // === JWT decode ===
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

  // === данные профиля/историй ===
  const { data, isLoading, isError } = useGetMyProfileQuery();
  const profile = data?.data;

  const { data: storiesResp } = useGetMyStoriesQuery();
  const stories = storiesResp?.data?.stories || [];

  // ====== STORIES: автоудаление 24h + полноэкранный просмотр + кольцо ======

  // универсальная проверка «моложе 24 часов»
  const isFresh = (s) => {
    const rawDate =
      s?.createdAt ||
      s?.createdDate ||
      s?.createdTime ||
      s?.dateCreated ||
      s?.createdOn;

    if (!rawDate) return true; // нет даты — не удаляем
    const t = new Date(rawDate).getTime();
    if (Number.isNaN(t)) return true;
    return Date.now() - t < 24 * 60 * 60 * 1000;
  };

  // только актуальные истории (до 24h)
  const freshStories = useMemo(() => stories.filter(isFresh), [stories]);

  // автоудаление просроченных историй (делает DELETE на бэкенд)
  useEffect(() => {
    if (!stories || stories.length === 0) return;
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("authToken") || localStorage.getItem("access_token")
        : null;
    if (!token) return;

    const stale = stories.filter((s) => !isFresh(s));
    if (stale.length === 0) return;

    stale.forEach(async (s) => {
      try {
        await fetch(`${API}/Story/DeleteStory?id=${s.id}`, {
          method: "DELETE",
          headers: { accept: "*/*", Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error("DeleteStory error:", e);
      }
    });
  }, [storiesResp]);

  // helper для картинок
  const getImageSrc = (fileName) => {
    if (!fileName) return p.src;
    if (typeof fileName === "string" && fileName.startsWith("http")) return fileName;
    return `${BASE_IMG}/${fileName}`;
  };

  // полноэкранный просмотр (инстаграм-like)
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);

  const openStoryAt = (idx) => {
    if (freshStories.length === 0) return;
    setStoryIndex(idx);
    setStoryOpen(true);
  };

  const closeStory = () => setStoryOpen(false);

  // автопролистывание каждые 5 секунд
  useEffect(() => {
    if (!storyOpen) return;
    const timer = setTimeout(() => {
      if (storyIndex < freshStories.length - 1) {
        setStoryIndex((i) => i + 1);
      } else {
        setStoryOpen(false);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [storyOpen, storyIndex, freshStories.length]);

  // клавиши влево/вправо/esc
  useEffect(() => {
    if (!storyOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") return setStoryOpen(false);
      if (e.key === "ArrowRight") {
        setStoryIndex((i) => (i < freshStories.length - 1 ? i + 1 : i));
      }
      if (e.key === "ArrowLeft") {
        setStoryIndex((i) => (i > 0 ? i - 1 : i));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [storyOpen, freshStories.length]);

  // клик влево/вправо по экрану
  const onViewerClick = (e) => {
    const mid = window.innerWidth / 2;
    if (e.clientX > mid) {
      // вправо
      if (storyIndex < freshStories.length - 1) setStoryIndex((i) => i + 1);
      else setStoryOpen(false);
    } else {
      // влево
      if (storyIndex > 0) setStoryIndex((i) => i - 1);
    }
  };

  // кольцо вокруг аватарки, если есть свежие истории
  const hasStory = freshStories.length > 0;

  // ====== прочие UI-состояния профиля ======
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
    <div className="sm:max-w-[640px] ml-[100px] mt-5">
      {/* HEADER */}
      <section className="w-full flex items-center justify-between h-[160px]">
        {/* аватар с кольцом, если есть история; клик — открыть сторис, иначе увеличить фото */}
        <div
          className={hasStory
            ? "p-[3px] rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500"
            : ""}
          onClick={() => (hasStory ? openStoryAt(0) : setShowProfileImage(true))}
          style={{ cursor: "pointer" }}
        >
          <Image
            alt="Profile photo"
            width={160}
            height={160}
            src={getImageSrc(profile?.image)}
            className="h-[160px] w-[160px] object-cover rounded-full bg-white"
          />
        </div>

        {/* старое увеличение фото оставил — показываем, если нет сторис */}
        {showProfileImage && !hasStory && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="relative">
              <ImCancelCircle
                className="absolute top-2 right-2 text-white text-3xl cursor-pointer"
                onClick={() => setShowProfileImage(false)}
              />
              <Image
                src={getImageSrc(profile?.image)}
                alt="Profile large"
                width={400}
                height={400}
                className="object-contain rounded-xl"
              />
            </div>
          </div>
        )}

        {isMenuLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-[500px] flex flex-col gap-[30px] p-[50px] rounded-4xl bg-white">
              <ImCancelCircle className="ml-auto text-2xl" onClick={() => setIsMenuLoading(false)} />
              <p
                className="text-2xl font-bold cursor-pointer"
                onClick={() => {
                  setShowQRCode(true);
                  setIsMenuLoading(false);
                }}
              >
                Qr code
              </p>
              <Link href={"/notification"}>
                <p className="text-2xl font-bold">Notification</p>
              </Link>
              <Link href={"/setting"}>
                <p className="text-2xl font-bold">Settings and privacy</p>
              </Link>
              <p
                className="text-red-600 text-2xl font-bold cursor-pointer"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-[400px] h-[400px] flex flex-col gap-4 p-6 rounded-2xl bg-white items-center justify-center">
              <ImCancelCircle
                className="ml-auto text-2xl cursor-pointer"
                onClick={() => setShowQRCode(false)}
              />
              <QRCode value="https://ant.design/" size={300} />
            </div>
          </div>
        )}

        <article className="sm:w-[456px] flex flex-col items-start justify-between sm:h-[142px]">
          <div className="w-full flex items-center justify-between">
            <p className="text-[20px] font-[700]">{profile?.userName}</p>

            <Link href="/profile/editProfile">
              <button className="bg-[#F3F4F6] w-[105px] h-[40px] rounded-xl flex items-center justify-center">
                Edit profile
              </button>
            </Link>

            <button
              className="bg-[#F3F4F6] w-[105px] h-[40px] rounded-xl flex items-center justify-center"
              onClick={() => setIsMenuLoading(true)}
            >
              View archive
            </button>
            <CgMenu className="text-2xl cursor-pointer" onClick={() => setIsMenuLoading(true)} />
          </div>

          <div className="flex w-full items-start gap-7">
            <p className="text-[14px] font-[600]">
              {profile?.postCount} <span className="text-[#64748B] font-[400]">posts</span>
            </p>

            <p
              className="text-[14px] font-[600] cursor-pointer"
              onClick={() => setOpenFollowers(true)}
            >
              {profile?.subscribersCount} <span className="text-[#64748B] font-[400]">followers</span>
            </p>

            <p
              className="text-[14px] font-[600] cursor-pointer"
              onClick={() => setOpenFollowing(true)}
            >
              {profile?.subscriptionsCount} <span className="text-[#64748B] font-[400]">following</span>
            </p>
          </div>

          <p className="text-[20px] font-[700]">{profile?.firstName}</p>
        </article>
      </section>

      {/* STORIES — только свежие, клик открывает полноэкранный просмотр */}
      <div className="flex items-center space-x-5 p-5 bg-white">
        {freshStories.map((story, idx) => (
          <button
            key={story.id}
            className="flex flex-col items-center focus:outline-none"
            onClick={() => openStoryAt(idx)}
            title="View story"
          >
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500">
              <div className="w-full h-full rounded-full overflow-hidden bg-white">
                <Image
                  src={getImageSrc(story.fileName || story.fileUrl)}
                  alt="story"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </button>
        ))}

        <button className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700">
          <span className="text-3xl font-bold leading-none">+</span>
          <p className="text-xs mt-1">New</p>
        </button>
      </div>

      {/* STORY VIEWER (полноэкранный) */}
      {storyOpen && freshStories[storyIndex] && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center select-none"
          onClick={onViewerClick}
        >
          {/* progress bar сверху */}
          <div className="absolute top-4 left-4 right-4 flex gap-2">
            {freshStories.map((_, i) => (
              <div key={i} className="h-1 flex-1 bg-white/30 overflow-hidden rounded">
                <div
                  className="h-full bg-white"
                  style={{
                    width:
                      i < storyIndex ? "100%" : i === storyIndex ? "100%" : "0%",
                    opacity: i === storyIndex ? 0.9 : 0.6,
                    transition: i === storyIndex ? "width 5s linear" : "none",
                  }}
                />
              </div>
            ))}
          </div>

          {/* само изображение */}
          <Image
            src={getImageSrc(
              freshStories[storyIndex].fileName || freshStories[storyIndex].fileUrl
            )}
            alt="story-large"
            width={800}
            height={800}
            className="max-h-[80vh] w-auto object-contain rounded-xl"
            priority
          />

          {/* кнопка закрытия */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl"
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
      )}

      {/* TABS */}
      <section className="w-full my-[30px] p-[20px] border-t flex items-center justify-center space-x-10 border-gray-400">
        <article
          onClick={() => setActiveTab("posts")}
          className={`cursor-pointer font-[500] flex items-center gap-[10px] ${
            activeTab === "posts" ? "text-[#2563EB] border-t-2 border-[#2563EB]" : "text-[#64748B]"
          }`}
        >
          <TiThSmallOutline className="text-xl" />
          <p>Posts</p>
        </article>

        <article
          onClick={() => setActiveTab("saved")}
          className={`cursor-pointer font-[500] flex items-center gap-[10px] ${
            activeTab === "saved" ? "text-[#2563EB] border-t-2 border-[#2563EB]" : "text-[#64748B]"
          }`}
        >
          <FaRegBookmark className="text-xl" />
          <p>Saved</p>
        </article>

        <article
          onClick={() => setActiveTab("tagged")}
          className={`cursor-pointer font-[500] flex items-center gap-[10px] ${
            activeTab === "tagged" ? "text-[#2563EB] border-t-2 border-[#2563EB]" : "text-[#64748B]"
          }`}
        >
          <BsPersonSquare className="text-xl" />
          <p>Tagged</p>
        </article>
      </section>

      <div>
        {activeTab === "posts" && <Posts />}
        {activeTab === "saved" && <Saved />}
        {activeTab === "tagged" && <p>Tagged content</p>}
      </div>

      {/* модалки подписчики/подписки */}
      <FollowersMenu open={openFollowers} onClose={() => setOpenFollowers(false)} />
      <FollowingMenu open={openFollowing} onClose={() => setOpenFollowing(false)} />
    </div>
  );
}
