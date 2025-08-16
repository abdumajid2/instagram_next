"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useGetSubscribersQuery, useFollowUserMutation, useUnfollowUserMutation, } from "@/store/pages/notification/notification";
import { jwtDecode } from "jwt-decode";
import placeholder from "@/assets/img/pages/profile/profile/p.png";
import Link from "next/link";
const API = "http://37.27.29.18:8003";
export default function Notification() {
  const [userId, setUserId] = useState(null);
  // Берём userId из токена
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

  const { data: subscrData } = useGetSubscribersQuery(userId, { skip: !userId });
  const [followUser, { isLoading: followingInFlight }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowingInFlight }] = useUnfollowUserMutation();
  const followers = subscrData?.data || [];
  const subscribedIds = useMemo(
    () => new Set(followers.map((u) => u?.userShortInfo?.isSubscribedToMe ? u.userShortInfo.userId : null).filter(Boolean)),
    [followers]
  );

  


  const onFollow = async (targetId) => {
    try {
      console.log("FOLLOW BODY:", { myId: userId, targetId });
      await followUser({ myId: userId, targetId }).unwrap();
    } catch (e) {
      console.error("Ошибка follow:", e);
    }
  };

  const onUnfollow = async (targetId) => {
    try {
      console.log("UNFOLLOW BODY:", { myId: userId, targetId });
      await unfollowUser({ myId: userId, targetId }).unwrap();
    } catch (e) {
      console.error("Ошибка unfollow:", e);
    }
  };


  return (
    <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-200 ml-[10px] top-[10px] px-[10px]">
      {!userId ? (
        <p className="p-4">Идёт загрузка токена…</p>) : (
        <>
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h1 className="font-bold text-[30px]">Notifications</h1>
            <Link href={'/'}>
              <p className="text-[20px]">❌</p>
            </Link>
          </div>
          <div className="max-h-[420px] overflow-y-auto p-3 space-y-3">
            <h1 className="font-semibold">На этой неделе</h1>{(
              followers.map((row) => {
                const u = row?.userShortInfo || {};
                const photo = u.userPhoto ? `${API}/images/${u.userPhoto}` : placeholder.src;
                const isFollowing = subscribedIds.has(u.userId);

                return (
                  <div key={u.userId} className="flex items-center justify-between gap-3 px-1" >
                    <div className="flex items-center gap-3">
                      <img src={photo} alt={u.userName} className="rounded-full w-[50px] h-[50px]  object-cover " />
                      <div className="leading-tight">
                        <div className="font-medium">{u.userName}</div>
                        <h1 className="text-[gray]">Followed you</h1>
                      </div>
                    </div>

                    {!isFollowing ? (
                      <button className="px-3 py-1.5 rounded bg-[#EFF6FF] text-[#3B82F6] " onClick={() => onFollow(u.userId)} disabled={followingInFlight} > Подписаться</button>
                    ) : (
                      <button className="px-3 py-1.5 rounded bg-gray-200 " onClick={() => onUnfollow(u.userId)} disabled={unfollowingInFlight}> Отписаться</button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>)}
    </div>
  );
}