"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import placeholder from "@/assets/img/pages/profile/profile/p.png";
import {
  useGetSubscribersQuery,
  useGetSubscriptionsQuery,
  useGetMyPostsQuery,
  useGetUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/store/pages/notification/notification";

const API = "http://37.27.29.18:8003";

function humanTime(ts) {
  try {
    const d = new Date(ts);
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "только что";
    if (m < 60) return `${m} мин.`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ч.`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days} дн.`;
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

export default function Notification() {
  const router = useRouter(); // ✅ хук внутри компонента

  const [userId, setUserId] = useState(null);
  useEffect(() => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const decoded = jwtDecode(token);
      const uid = decoded?.sid || decoded?.nameid || decoded?.userId || decoded?.id;
      if (uid) setUserId(uid);
    } catch (e) {
      console.error("Ошибка декодирования токена", e);
    }
  }, []);

  // 1) подписчики (они подписались на меня)
  const { data: subscribers = [], isLoading: subsLoading } =
    useGetSubscribersQuery(userId, { skip: !userId });

  // 2) мои подписки (я подписан на них)
  const { data: subscriptions = [], isLoading: subscrLoading } =
    useGetSubscriptionsQuery(userId, { skip: !userId });

  // 3) мои посты (для лайков/комментариев)
  const { data: myPosts = [], isLoading: myPostsLoading } =
    useGetMyPostsQuery(undefined, { skip: !userId });

  // 4) рекомендации
  const { data: users = [], isLoading: usersLoading } =
    useGetUsersQuery({ pageNumber: 1, pageSize: 40 }, { skip: !userId });

  const [followUser, { isLoading: followingInFlight }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowingInFlight }] = useUnfollowUserMutation();

  const myFollowingSet = useMemo(() => {
    const ids = subscriptions.map((row) => row?.userShortInfo?.userId).filter(Boolean);
    return new Set(ids);
  }, [subscriptions]);

  // ------ EVENTS ------
  const commentEvents = useMemo(() => {
    const ev = [];
    for (const p of myPosts) {
      const pid = p?.postId;
      const img = Array.isArray(p?.images) && p.images.length
        ? `${API}/images/${p.images[0]}`
        : null;

      for (const c of p?.comments ?? []) {
        ev.push({
          type: "comment",
          postId: pid,
          postPreview: img,
          byId: c.userId,
          byName: c.userName || "user",
          byPhoto: c.userImage ? `${API}/images/${c.userImage}` : placeholder.src,
          text: c.comment,
          at: c.dateCommented,
        });
      }
    }
    ev.sort((a, b) => new Date(b.at) - new Date(a.at));
    return ev;
  }, [myPosts]);

  const likeEvents = useMemo(() => {
    const ev = [];
    for (const p of myPosts) {
      const pid = p?.postId;
      const img = Array.isArray(p?.images) && p.images.length
        ? `${API}/images/${p.images[0]}`
        : null;
      for (const u of p?.userLikes ?? []) {
        ev.push({
          type: "like",
          postId: pid,
          postPreview: img,
          byId: u.userId,
          byName: u.userName || "user",
          byPhoto: u.userPhoto ? `${API}/images/${u.userPhoto}` : placeholder.src,
          at: null,
        });
      }
    }
    return ev;
  }, [myPosts]);

  const followerEvents = useMemo(() => {
    return subscribers.map((row) => {
      const u = row?.userShortInfo || {};
      return {
        type: "follow",
        byId: u.userId,
        byName: u.userName || "user",
        byPhoto: u.userPhoto ? `${API}/images/${u.userPhoto}` : placeholder.src,
        at: null,
      };
    });
  }, [subscribers]);

  const thisWeekComments = commentEvents.filter((e) => {
    if (!e.at) return false;
    const dt = new Date(e.at);
    const diffDays = (Date.now() - dt.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  });

  const recommendations = useMemo(() => {
    const notMeNotFollowed = users
      .filter((u) => u?.id && u.id !== userId && !myFollowingSet.has(u.id))
      .slice(0, 15);
    return notMeNotFollowed;
  }, [users, userId, myFollowingSet]);

  const onFollow = async (targetId) => {
    try {
      await followUser(targetId).unwrap();
    } catch (e) {
      console.error("Ошибка follow:", e);
    }
  };
  const onUnfollow = async (targetId) => {
    try {
      await unfollowUser(targetId).unwrap();
    } catch (e) {
      console.error("Ошибка unfollow:", e);
    }
  };

  if (!userId) return <p className="p-4">Идёт загрузка токена…</p>;
  if (subsLoading || subscrLoading || myPostsLoading || usersLoading) {
    return <p className="p-4">Загрузка…</p>;
  }

  return (
    <div className="lg:w-[90%] lg:m-auto lg:ml-[10px] bg-white rounded-2xl border border-gray-200 px-3 py-3">
      <div className="flex items-center justify-between px-2 py-2 border-b">
        <h1 className="font-bold text-[24px]">Уведомления</h1>
        <Link href="/"><p className="text-[18px]">❌</p></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* LEFT */}
        <div className="col-span-2">
          {/* На этой неделе (комментарии) */}
          <section className="mb-6">
            <h2 className="font-semibold mb-3">На этой неделе</h2>
            <div className="space-y-3">
              {thisWeekComments.length === 0 && (
                <div className="text-gray-500">Новых комментариев за неделю нет</div>
              )}
              {thisWeekComments.map((e, idx) => (
                <div
                  key={`cweek-${idx}`}
                  className="flex items-center justify-between gap-3 cursor-pointer"
                  onClick={() => router.push(`/profile-by-id/${e.byId}`)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={e.byPhoto}
                      alt={e.byName}
                      className="rounded-full w-[46px] h-[46px] object-cover"
                    />
                    <div className="leading-tight">
                      <div className="text-sm">
                        <b className="hover:underline">{e.byName}</b> прокомментировал(а) ваш пост:{" "}
                        <span className="text-gray-600">{e.text}</span>
                      </div>
                      <div className="text-xs text-gray-500">{humanTime(e.at)}</div>
                    </div>
                  </div>
                  {e.postPreview && (
                    <img
                      src={e.postPreview}
                      alt="post"
                      className="w-[48px] h-[48px] object-cover rounded"
                      onClick={(ev) => ev.stopPropagation()}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Подписчики */}
          <section className="mb-6">
            <h2 className="font-semibold mb-3">Подписчики</h2>
            <div className="space-y-3">
              {followerEvents.length === 0 && (
                <div className="text-gray-500"></div>
              )}
              {followerEvents.map((e) => {
                const iFollow = myFollowingSet.has(e.byId);
                return (

                  <div key={`f-${e.byId}`} className="flex items-center justify-between gap-3">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => router.push(`/profile-by-id/${e.byId}`)}
                    >
                      <img
                        src={e.byPhoto}
                        alt={e.byName}
                        className="rounded-full w-[46px] h-[46px] object-cover"
                      />
                      <div className="leading-tight">
                        <div className="text-sm">
                          <b className="hover:underline">{e.byName}</b> подписался(-лась) на вас
                        </div>
                      </div>
                    </div>
                    {!iFollow ? (
                      <button
                        className="px-3 py-1.5 rounded bg-[#EFF6FF] text-[#3B82F6]"
                        onClick={(ev) => { ev.stopPropagation(); onFollow(e.byId); }}
                        disabled={followingInFlight}
                      >
                        Подписаться
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1.5 rounded bg-gray-200"
                        onClick={(ev) => { ev.stopPropagation(); onUnfollow(e.byId); }}
                        disabled={unfollowingInFlight}
                      >
                        Отписаться
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Лайки */}
          <section className="mb-2">
            <h2 className="font-semibold mb-3">Лайки ваших постов</h2>
            <div className="space-y-3">
              {likeEvents.length === 0 && (
                <div className="text-gray-500">Пока лайков нет</div>
              )}
              {likeEvents.map((e, idx) => (
                <div
                  key={`l-${e.postId}-${e.byId}-${idx}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => router.push(`/profile-by-id/${e.byId}`)}
                  >
                    <img
                      src={e.byPhoto}
                      alt={e.byName}
                      className="rounded-full w-[46px] h-[46px] object-cover"
                    />
                    <div className="leading-tight">
                      <div className="text-sm">
                        <b className="hover:underline">{e.byName}</b> понравился ваш пост
                      </div>
                    </div>
                  </div>
                  {e.postPreview && (
                    <img
                      src={e.postPreview}
                      alt="post"
                      className="w-[48px] h-[48px] object-cover rounded"
                      onClick={(ev) => ev.stopPropagation()}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT: рекомендации */}
        <aside className="col-span-1">
          <div className="rounded-xl border p-3">
            <h3 className="font-semibold mb-3">Рекомендации для вас</h3>
            <div className="space-y-3">
              {recommendations.length === 0 && (
                <div className="text-gray-500">Пока нечего рекомендовать</div>
              )}
              {recommendations.map((u) => {
                const avatar = u.avatar ? `${API}/images/${u.avatar}` : placeholder.src;
                const iFollow = myFollowingSet.has(u.id);
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => router.push(`/notification/${u.userId}`)}
                    >
                      <img
                        src={avatar}
                        alt={u.userName}
                        className="rounded-full w-[40px] h-[40px] object-cover"
                      />
                      <div className="leading-tight">
                        <div onClick={() => router.push(`/profile/${e.byId}`)} className="font-medium text-sm hover:underline">
                          {u.userName}
                        </div>
                        <div className="text-xs text-gray-500">
                          Подписчики: {u.subscribersCount ?? 0}
                        </div>
                      </div>
                    </div>

                    {!iFollow ? (
                      <button
                        className="px-3 py-1 rounded bg-[#EFF6FF] text-[#3B82F6]"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onFollow(u.id);
                        }}
                        disabled={followingInFlight}
                      >
                        Подписаться
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 rounded bg-gray-200"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          onUnfollow(u.id);
                        }}
                        disabled={unfollowingInFlight}
                      >
                        Отписаться
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
