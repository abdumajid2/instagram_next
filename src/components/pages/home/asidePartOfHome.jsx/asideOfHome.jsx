"use client";
import { useGetUsersQuery } from "@/store/pages/home/muslimApi";
import React from "react";
import Image from "next/image";
import userImage from "../../../../components/pages/home/images/user.jpg";
import PendingAnimationOfAsideOfHome from "./pendingAnimationOfAsideOfHome";

const AsideOfHome = () => {
  const { data, isLoading } = useGetUsersQuery();
  const users = data?.data || [];

  return (
    <div className="w-[40%] hidden md:block p-5 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-4 text-sm">
        <h2 className="text-gray-500 font-semibold">
          Suggestions For You
        </h2>
        <h3 className="hover:text-gray-500 cursor-pointer">View all</h3>
      </div>

      {isLoading ? (
        <PendingAnimationOfAsideOfHome />
      ) : (
        <section className="flex flex-col gap-4">
          {users.slice(0, 5).map((user, i) => (
            <article key={i} className="flex items-center justify-between">
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
