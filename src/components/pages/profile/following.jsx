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
import { useTranslation } from "react-i18next";

export default function FollowingMenu({ open, onClose, userId: propsUserId }) {
  const [decode, setDecode] = useState(null);
  const [localFollowing, setLocalFollowing] = useState([]);
    const API = "http://37.27.29.18:8003"
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("authToken") || localStorage.getItem("access_token");
    if (!raw) return;
    try {
      setDecode(jwtDecode(raw));
    } catch (err) {
      console.error("JWT decode error:", err);
    }
  }, []);

 const userId = propsUserId || decode?.sid;




  const {
    data: follResp,
    isFetching: follLoading,
    error: follError,
    refetch: refetchFoll,
  } = useGetSubscriptionsQuery(userId, { skip: !open || !userId });

  const {
    data: subsResp,
    isFetching: subsLoading,
    error: subsError,
    refetch: refetchSubs,
  } = useGetSubscribersQuery(userId, { skip: !open || !userId });

  const followings = follResp?.data || [];

  useEffect(() => {
    if (!open) return;
    setLocalFollowing(followings.map((u) => ({ ...u, isFollowing: true })));
  }, [open, followings]);

  const token = useMemo(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("authToken") || localStorage.getItem("access_token")
        : null,
    []
  );

  const toggleFollow = async (targetUserId, isCurrentlyFollowing) => {
    setLocalFollowing((prev) =>
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

      await Promise.all([refetchFoll(), refetchSubs()]);
    } catch (error) {
      console.error(error);
    
      setLocalFollowing((prev) =>
        prev.map((u) =>
          u?.userShortInfo?.userId === targetUserId
            ? { ...u, isFollowing: isCurrentlyFollowing }
            : u
        )
      );
    }
  };

      const {t, i18n} = useTranslation();
      function TranslateClick(lang) {
          i18n.changeLanguage(lang);
      }
  


if (!userId) return null; 

  return (
    <Modal open={open} onClose={onClose}>
      <div
        className="fixed inset-0 flex justify-center items-center z-50"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(6px)" }}
      >
        <div className="bg-white rounded-xl w-[90%] max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
          <div className="relative px-4 py-3 border-b">
            <Typography className="text-center font-semibold text-base">Подписки</Typography>
            <IconButton onClick={onClose} className="absolute right-2 top-2">
              <X />
            </IconButton>
          </div>

          {(follLoading || subsLoading) && (
            <div className="p-4 text-sm text-gray-500">Загрузка…</div>
          )}
          {follError && <div className="p-4 text-sm text-red-600">Ошибка загрузки подписок</div>}
          {subsError && <div className="p-4 text-sm text-red-600">Ошибка загрузки подписчиков</div>}

          <div className="overflow-y-auto px-4 py-2 space-y-3">
            {localFollowing.map((el) => {
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
            {open && !follLoading && followings.length === 0 && (
              <div className="p-4 text-sm text-gray-500">Пусто</div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
