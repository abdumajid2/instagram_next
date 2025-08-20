import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Modal } from "antd";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LuSend } from "react-icons/lu";
import userImage from "../../../../components/pages/home/images/user.jpg";
import { useGetSubscriptionsQuery } from "@/store/pages/home/muslimApi";

function getAvatarUrl(fileName) {
  return fileName ? `http://37.27.29.18:8003/images/${fileName}` : null;
}

const SharePost = ({ el }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      if (!token) return;
      const decoded = jwtDecode(token);
      const uid =
        decoded?.sid ||
        decoded?.userId ||
        decoded?.id ||
        decoded?.sub ||
        decoded?.nameid;
      if (uid) setUserId(uid);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const { data, isLoading, isFetching } = useGetSubscriptionsQuery(userId, {
    skip: !userId,
  });
  const subscription = data?.data ?? [];

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handleUserSelect = useCallback(
    (e) => {
      const id =
        e?.userShortInfo?.userId ?? e?.userId ?? e?.followingUserId ?? e?.id;

      const name =
        e?.userShortInfo?.userName ?? e?.userName ?? e?.fullName ?? "User";

      const photoFile =
        e?.userShortInfo?.userPhoto ?? e?.avatar ?? e?.photo ?? "";

      const avatarParam = encodeURIComponent(photoFile || "");
      const nameParam = encodeURIComponent(name);

      if (!id) return;

      router.push(
        `/chats/new?userId=${id}&name=${nameParam}&avatar=${avatarParam}&postId=${el.postId}`
      );

      setIsModalOpen(false);
    },
    [router, el.postId]
  );

  const subscriptionList = useMemo(() => {
    return subscription.map((e) => {
      const name =
        e?.userShortInfo?.userName ?? e?.userName ?? e?.fullName ?? "User";

      const avatarUrl = getAvatarUrl(e?.userShortInfo?.userPhoto);
      const id =
        e?.id ?? e?.userShortInfo?.userId ?? e?.userId ?? e?.followingUserId;

      return (
        <article
          key={id}
          className="flex items-center justify-between gap-3 py-2"
        >
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <Image
                src={userImage}
                width={48}
                height={48}
                alt={name}
                className="rounded-full"
              />
            )}
            <h3 className="font-medium">{name}</h3>
          </div>

          <button
            onClick={() => handleUserSelect(e)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            Send
          </button>
        </article>
      );
    });
  }, [subscription, handleUserSelect]);

  return (
    <div>
      <Modal
        title=""
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        closable
      >
        <section className="space-y-2 overflow-y-auto max-h-[524px] no-scrollbar">
          {(!userId || isLoading || isFetching) && (
            <div className="text-sm text-gray-500">Загрузка списка…</div>
          )}

          {userId && !isLoading && !isFetching && subscription.length === 0 && (
            <div className="text-sm text-gray-500">Список пуст</div>
          )}

          {subscriptionList}
        </section>
      </Modal>

      <LuSend
        onClick={showModal}
        className="cursor-pointer hover:opacity-60 transition rotate-12 relative right-1 text-2xl"
      />
    </div>
  );
};

export default React.memo(SharePost);
