"use client";

import {
  useGetStoriesQuery,
  useGetStoryByIdQuery,
} from "@/store/pages/home/muslimApi";
import React, { useState } from "react";
import userImage from "../../../../components/pages/home/images/user.jpg";
import Image from "next/image";
import { Modal } from "antd";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Story = () => {
  const { data } = useGetStoriesQuery();
  let [storyId, setStoryId] = useState(null);
  const { data: storyById } = useGetStoryByIdQuery(storyId);
  const imgUrl = "http://37.27.29.18:8003/images/";

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  function openStory(story) {
    setStoryId(story.userId);
    setIsModalOpen(true);
  }

  return (
    <div className="w-full overflow-x-auto">
      <Modal
        title="Stories"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleCancel}
        onCancel={handleCancel}
        footer={null}
        className="!w-[80%] !h-[100vh] !m-0 !p-0 !absolute !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2 overflow-hidden"
      > 
        {storyById?.data?.stories && storyById.data.stories.length > 0 && (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="w-full h-[90vh] bg-black"
          >
            {storyById.data.stories.map((file) => {
              const fileName = file.fileName || "";
              const isVideo =
                fileName.toLowerCase().endsWith(".mp4") ||
                fileName.toLowerCase().endsWith(".mov");

              return (
                <SwiperSlide
                  key={file.id}
                  className="flex items-center justify-center bg-black"
                >
                  {isVideo ? (
                    <video
                      src={`${imgUrl}${fileName}`}
                      controls
                      autoPlay
                      className="max-h-full max-w-full rounded-xl w-full object-cover"
                    />
                  ) : (
                    <img
                      src={`${imgUrl}${fileName}`}
                      alt="story"
                      className="max-h-full max-w-full rounded-xl w-full object-cover"
                    />
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </Modal>

      <section className="flex flex-nowrap items-start gap-5">
        {data?.map((story) => (
          <article
            key={story.userId}
            onClick={() => openStory(story)}
            className="flex-shrink-0"
          >
            <div className="flex flex-col items-center">
              {story.userImage ? (
                <img
                  src={`${imgUrl}${story.userImage}`}
                  alt="image"
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <Image
                  src={userImage}
                  width={64}
                  height={64}
                  alt="image"
                  className="rounded-full"
                />
              )}
              <h3>{story.userName}</h3>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Story;
