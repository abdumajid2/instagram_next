"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useGetSubscribersQuery,
  useGetSubscriptionsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/store/pages/notification/notification";
import {jwtDecode} from "jwt-decode";
import placeholder from "@/assets/img/pages/profile/profile/p.png";

const API = "http://37.27.29.18:8003";

export default function Notification() {
  const [userId, setUserId] = useState(null);
  const [tab, setTab] = useState("followers"); // "followers" | "following"
  const [q, setQ] = useState("");

  // Берём userId из токена
  useEffect(() => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const decoded = jwtDecode(token);
      const uid =
        decoded?.sid || decoded?.nameid || decoded?.userId || decoded?.id;
      if (uid) setUserId(uid);
    } catch (e) {
      console.error("Ошибка декодирования токена", e);
    }
  }, []);

  // RTK Query хуки
  const {
  data: subscrData,
  isLoading: loadingFollowers,
  isError: errorFollowers,
  refetch: refetchFollowers,
} = useGetSubscribersQuery(userId, { skip: !userId });

  const {
    data: subscrsData,
    isLoading: loadingFollowing,
    isError: errorFollowing,
    refetch: refetchFollowing,
  } = useGetSubscriptionsQuery(userId, { skip: !userId });

  // Мутации
  const [followUser, { isLoading: followingInFlight }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowingInFlight }] =
    useUnfollowUserMutation();

  const followers = subscrData?.data || [];
  const following = subscrsData?.data || [];

  // set из id, на кого уже подписан
  const subscribedIds = useMemo(
    () => new Set(following.map((u) => u?.userShortInfo?.userId)),
    [following]
  );

  const list = tab === "followers" ? followers : following;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((item) =>
      (item?.userShortInfo?.userName || "").toLowerCase().includes(s)
    );
  }, [list, q]);

  const onFollow = async (targetId) => {
    try {
      await followUser(targetId).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  const onUnfollow = async (targetId) => {
    try {
      await unfollowUser(targetId).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-200">
      {!userId ? (
        <p className="p-4">Идёт загрузка токена…</p>
      ) : (
        <>
          {/* Заголовок и табы */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="font-semibold">Followers / Following</div>
            <div className="flex gap-2">
              <button className={`px-3 py-1 rounded ${ tab === "followers" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700" }`}
                onClick={() => setTab("followers")}
              >
                Followers ({followers.length})
              </button>
              <button className={`px-3 py-1 rounded ${
                  tab === "following" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700" }`}
                onClick={() => setTab("following")}
              >
                Following ({following.length})
              </button>
            </div>
          </div>

          {/* Поиск */}
          <div className="px-4 py-3 border-b">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Список */}
          <div className="max-h-[420px] overflow-y-auto p-3 space-y-3">
            {(loadingFollowers && tab === "followers") ||
            (loadingFollowing && tab === "following") ? (
              <p className="text-gray-500 px-1">Загрузка…</p>
            ) : (errorFollowers && tab === "followers") ||
              (errorFollowing && tab === "following") ? (
              <p className="text-red-600 px-1">Ошибка загрузки</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500 px-1">Пусто</p>
            ) : (
              filtered.map((row) => {
                const u = row?.userShortInfo || {};
                const photo = u.userPhoto
                  ? `${API}/images/${u.userPhoto}`
                  : placeholder.src;
                const isFollowing = subscribedIds.has(u.userId);

                return (
                  <div
                    key={u.userId}
                    className="flex items-center justify-between gap-3 px-1"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={photo}
                        alt={u.userName}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div className="leading-tight">
                        <div className="font-medium">{u.userName}</div>
                      </div>
                    </div>

                    {!isFollowing ? (
                      <button  className="px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-60"  onClick={() => onFollow(u.userId)}  disabled={followingInFlight}
                      >
                        Подписаться
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1.5 rounded bg-gray-200 disabled:opacity-60"
                        onClick={() => onUnfollow(u.userId)}
                        disabled={unfollowingInFlight}
                      >
                        Отписаться
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t flex justify-end gap-2">
            <button
              className="px-3 py-1.5 rounded bg-gray-100"
              onClick={() => {
                if (tab === "followers") refetchFollowers();
                else refetchFollowing();
              }}
            >
              Обновить
            </button>
          </div>
        </>
      )}
    </div>
  );
}
