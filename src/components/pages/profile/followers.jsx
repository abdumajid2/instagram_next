"use client";
import { useEffect, useMemo, useState } from "react";
import { Modal, Typography, Avatar, Button, IconButton } from "@mui/material";
import { X } from "lucide-react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

import {
  useGetSubscribersQuery,
  useGetSubscriptionsQuery,
} from "@/store/pages/profile/ProfileApi";

export default function FollowersMenu({ open, onClose, userId: propsUserId }) {
  const [decode, setDecode] = useState(null);
  const [localFollowers, setLocalFollowers] = useState([]);
    const API = "http://37.27.29.18:8003"
  // читаем токен и декодим sid
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("authToken") || localStorage.getItem("access_token");
    if (!raw) return;
    try {
      setDecode(jwtDecode(raw));
    } catch (e) {
      console.error("JWT decode error:", e);
    }
  }, []);

const userId = propsUserId || decode?.sid;


  // тянем подписчиков и подписки текущего пользователя, когда открыт модал
  const {
    data: subsResp,
    isFetching: subsLoading,
    error: subsError,
    refetch: refetchSubs,
  } = useGetSubscribersQuery(userId, { skip: !open || !userId });

  const {
    data: follResp,
    isFetching: follLoading,
    error: follError,
    refetch: refetchFoll,
  } = useGetSubscriptionsQuery(userId, { skip: !open || !userId });

  const followers = subsResp?.data || [];
  const followings = follResp?.data || [];

  // локальный список с пометкой isFollowing
  useEffect(() => {
    if (!open) return;
    const followingIds = new Set(followings.map((f) => f?.userShortInfo?.userId));
    setLocalFollowers(
      followers.map((f) => ({
        ...f,
        isFollowing: followingIds.has(f?.userShortInfo?.userId),
      }))
    );
  }, [open, followers, followings]);

  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("authToken") || localStorage.getItem("access_token")
        : null,
    []
  );

  const toggleFollow = async (targetUserId, isCurrentlyFollowing) => {
    // оптимистично
    setLocalFollowers((prev) =>
      prev.map((u) =>
        u?.userShortInfo?.userId === targetUserId
          ? { ...u, isFollowing: !isCurrentlyFollowing }
          : u
      )
    );

    try {
      const url = `${API}/FollowingRelationShip/${
        isCurrentlyFollowing ? "delete-following-relation-ship" : "add-following-relation-ship"
      }?followingUserId=${targetUserId}`;

      const res = await fetch(url, {
        method: isCurrentlyFollowing ? "DELETE" : "POST",
        headers: { accept: "*/*", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Follow toggle failed: ${res.status}`);

      await Promise.all([refetchSubs(), refetchFoll()]);
    } catch (err) {
      console.error(err);
      // откат
      setLocalFollowers((prev) =>
        prev.map((u) =>
          u?.userShortInfo?.userId === targetUserId
            ? { ...u, isFollowing: isCurrentlyFollowing }
            : u
        )
      );
    }
  };

if (!userId) return null; 
  return (
    <Modal open={open} onClose={onClose}>
      <div
        className="fixed inset-0 flex justify-center items-center z-50"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(6px)" }}
      >
        <div className="bg-white rounded-xl w-[90%] max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
          <div className="relative px-4 py-3 border-b">
            <Typography className="text-center font-semibold text-base">Подписчики</Typography>
            <IconButton onClick={onClose} className="absolute right-2 top-2">
              <X />
            </IconButton>
          </div>

          {(subsLoading || follLoading) && (
            <div className="p-4 text-sm text-gray-500">Загрузка…</div>
          )}
          {subsError && <div className="p-4 text-sm text-red-600">Ошибка загрузки подписчиков</div>}
          {follError && <div className="p-4 text-sm text-red-600">Ошибка загрузки подписок</div>}

          <div className="overflow-y-auto px-4 py-2 space-y-3">
            {localFollowers.map((el) => {
              const user = el?.userShortInfo;
              if (!user) return null;
              return (
                <div key={user.userId} className="flex items-center justify-between">
                  <Link href={`/profile/${user.userId}`}>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={`${API}/images/${user.userPhoto || ""}`}
                        alt={user.userName}
                        sx={{ width: 44, height: 44 }}
                      />
                      <Typography className="text-sm font-medium">{user.userName}</Typography>
                    </div>
                  </Link>

                  <Button
                    onClick={() => toggleFollow(user.userId, el.isFollowing)}
                    variant={el.isFollowing ? "outlined" : "contained"}
                    size="small"
                    className="capitalize text-sm"
                  >
                    {el.isFollowing ? "Отписаться" : "Подписаться"}
                  </Button>
                </div>
              );
            })}
            {open && !subsLoading && followers.length === 0 && (
              <div className="p-4 text-sm text-gray-500">Пусто</div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
