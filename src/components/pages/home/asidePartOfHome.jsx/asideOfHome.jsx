"use client";
import { useGetUsersQuery } from "@/store/pages/home/muslimApi";
import React, { useState } from "react";
import Image from "next/image";
import userImage from "../../../../components/pages/home/images/user.jpg";
import PendingAnimationOfAsideOfHome from "./pendingAnimationOfAsideOfHome";
import { Modal } from "antd";

const AsideOfHome = () => {
  const { data, isLoading } = useGetUsersQuery();
  const users = data?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="w-[40%] hidden md:block p-5 bg-white border border-gray-200 rounded-lg">
      <Modal
        title={null}
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <section className="flex flex-col gap-4 max-h-[500px] overflow-y-auto no-scrollbar py-5">
          {users.map((user, i) => (
            <article key={i} className="flex items-center justify-between">
              <div
                className="flex items-center gap-3"
                onClick={`/profile/${user.userId}`}
              >
                {user.avatar ? (
                  <img
                    src={`http://37.27.29.18:8003/images/${user.avatar}`}
                    alt={user.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <Image
                    src={userImage}
                    alt="user"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <h3 className="text-sm font-semibold">{user.userName}</h3>
              </div>
              <button className="text-blue-500 text-sm font-semibold hover:text-blue-700">
                Follow
              </button>
            </article>
          ))}
        </section>
      </Modal>

      <div className="flex items-center justify-between mb-4 text-sm">
        <h2 className="text-gray-500 font-semibold">Suggestions For You</h2>
        <h3 onClick={showModal} className="hover:text-gray-500 cursor-pointer">
          View all
        </h3>
      </div>

      {isLoading ? (
        <PendingAnimationOfAsideOfHome />
      ) : (
        <section className="flex flex-col gap-4">
          {users.slice(0, 5).map((user, i) => (
            <article
              key={i}
              className="flex items-center justify-between"
              onClick={`/profile/${user.userId}`}
            >
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img
                    src={`http://37.27.29.18:8003/images/${user.avatar}`}
                    alt={user.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <Image
                    src={userImage}
                    alt="user"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <h3 className="text-sm font-semibold">{user.userName}</h3>
              </div>
              <button className="text-blue-500 text-sm font-semibold hover:text-blue-700">
                Follow
              </button>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default AsideOfHome;
