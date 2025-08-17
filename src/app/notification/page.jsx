"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import placeholder from "@/assets/img/pages/profile/profile/p.png";
import {
  useGetSubscribersQuery,
  useGetSubscriptionsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/store/pages/notification/notification";

const API = "http://37.27.29.18:8003";

export default function Notification() {
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

  // подписчики (они подписались на меня)
  const { data: subscribers = [], isLoading: subsLoading } =
    useGetSubscribersQuery(userId, { skip: !userId });

  // мои подписки (я подписан на них)
  const { data: subscriptions = [], isLoading: subscrLoading } =
    useGetSubscriptionsQuery(userId, { skip: !userId });

  const [followUser, { isLoading: followingInFlight }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowingInFlight }] = useUnfollowUserMutation();

  // множество id, на кого Я уже подписан
  const myFollowingSet = useMemo(() => {
    const ids = subscriptions
      .map((row) => row?.userShortInfo?.userId)
      .filter(Boolean);
    return new Set(ids);
  }, [subscriptions]);

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
  if (subsLoading || subscrLoading) return <p className="p-4">Загрузка…</p>;

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-200 ml-[10px] top-[10px] px-[10px]">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h1 className="font-bold text-[30px]">Notifications</h1>
        <Link href="/"><p className="text-[20px]">❌</p></Link>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-3 space-y-3">
        <h2 className="font-semibold">На этой неделе</h2>

        {subscribers.map((row) => {
          const u = row?.userShortInfo || {};
          const photo = u.userPhoto ? `${API}/images/${u.userPhoto}` : placeholder.src;

          // правильно: проверяем, ПОДПИСАН ЛИ Я на этого пользователя
          const iFollow = myFollowingSet.has(u.userId);

          return (
            <div key={u.userId} className="flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-3">
                <img
                  src={photo}
                  alt={u.userName || "user"}
                  className="rounded-full w-[50px] h-[50px] object-cover"
                />
                <div className="leading-tight">
                  <div className="font-medium">{u.userName}</div>
                  <p className="text-gray-500 text-sm">Followed you</p>
                </div>
              </div>
                            {!iFollow ? (
                <button
                  className="px-3 py-1.5 rounded bg-[#EFF6FF] text-[#3B82F6]"
                  onClick={() => onFollow(u.userId)}
                  disabled={followingInFlight}
                >
                  Подписаться
                </button>
              ) : (
                <button
                  className="px-3 py-1.5 rounded bg-gray-200"
                  onClick={() => onUnfollow(u.userId)}
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
  );
}