"use client";

import {
  useGetStoriesQuery,
  useGetStoryByIdQuery,
} from "@/store/pages/home/muslimApi";
import React, { useState } from "react";
import userImage from "../../../../components/pages/home/images/user.jpg";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import AddStory from "./addStory";

const Story = () => {
  const { data } = useGetStoriesQuery();
  let [storyId, setStoryId] = useState(null);
  const { data: storyById } = useGetStoryByIdQuery(storyId);
  const imgUrl = "http://37.27.29.18:8003/images/";

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const openStory = (story) => {
    setStoryId(story.userId);
    setIsModalOpen(true);
  };

  function formatData(data) {
    const now = new Date();
    const date = new Date(data);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "только что";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч назад`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} дн назад`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} мес назад`;

    return `${Math.floor(seconds / 31536000)} г назад`;
  }

  return (
    <div className="w-full overflow-x-auto border-b-1 border-gray-300 pb-3">
      {/* // storyModal  */}
      {isModalOpen && storyById?.data && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative w-full max-w-full sm:max-w-xl md:max-w-3xl h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={handleCancel}
              className="absolute top-3 right-3 sm:top-5 sm:right-5 cursor-pointer z-50 bg-black/50 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-700 transition text-2xl"
            >
              ✕
            </button>

            <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex flex-col gap-1 z-50">
              <div className="flex items-center gap-2 sm:gap-3">
                {storyById?.data.userImage ? (
                  <img
                    src={`${imgUrl}${storyById?.data.userImage}`}
                    alt="image"
                    className="w-10 h-10 sm:w-16 sm:h-16 rounded-full border border-gray-300"
                  />
                ) : (
                  <Image
                    src={userImage}
                    width={40}
                    height={40}
                    sm={{ width: 64, height: 64 }}
                    alt="image"
                    className="w-10 h-10 sm:w-16 sm:h-16 rounded-full border border-gray-300"
                  />
                )}
                <span className="text-gray-500 font-semibold text-sm sm:text-base">
                  {storyById.data.userName}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {storyById.data.stories[0]?.createAt
                  ? formatData(storyById.data.stories[0].createAt)
                  : ""}
              </span>
            </div>

            {storyById.data.stories.length > 0 && (
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className="w-full h-full flex items-center justify-center"
              >
                {storyById.data.stories.map((file) => {
                  const fileName = file.fileName || "";
                  const isVideo =
                    fileName.toLowerCase().endsWith(".mp4") ||
                    fileName.toLowerCase().endsWith(".mov");
                  return (
                    <SwiperSlide
                      key={file.id}
                      className="flex items-center justify-center"
                    >
                      {isVideo ? (
                        <video
                          src={`${imgUrl}${fileName}`}
                          controls
                          autoPlay
                          className="max-h-[85vh] min-h-[40vh] max-w-[90%] rounded-xl object-contain shadow-lg"
                        />
                      ) : (
                        <img
                          src={`${imgUrl}${fileName}`}
                          alt="story"
                          className="max-h-[85vh] min-h-[40vh] max-w-[90%] rounded-xl object-contain shadow-lg"
                        />
                      )}
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            )}
          </div>
        </div>
      )}

      <section className="flex flex-nowrap items-start gap-4 sm:gap-5 px-2">
        <AddStory />

        {data?.map((story) => {
          const hasStory = story.stories && story.stories.length > 0;

          return (
            <article
              key={story.userId}
              onClick={() => openStory(story)}
              className="flex-shrink-0 cursor-pointer"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-full p-0.5 sm:p-1 ${
                    hasStory
                      ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                      : ""
                  }`}
                >
                  {story.userImage ? (
                    <img
                      src={`${imgUrl}${story.userImage}`}
                      alt="image"
                      className="w-full h-full rounded-full border border-black"
                    />
                  ) : (
                    <Image
                      src={userImage}
                      width={64}
                      height={64}
                      alt="image"
                      className="w-full h-full rounded-full border border-black"
                    />
                  )}
                </div>
                <h3 className="text-xs sm:text-sm mt-1">{story.userName}</h3>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default Story;