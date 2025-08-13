"use client";
import {
  useGetPostByIdQuery,
  useGetPostsQuery,
} from "@/store/pages/home/muslimApi";
import Image from "next/image";
import userImage from "../../../../components/pages/home/images/user.jpg";
import React, { useRef, useState } from "react";
import { Flex, Modal, Spin } from "antd";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import ErrorAnimation from "./ErrorAnimation ";
import { FaRegComment, FaRegHeart } from "react-icons/fa";
import { IoSendOutline } from "react-icons/io5";
import { video } from "@/assets/icon/layout/svg";

const Posts = () => {
  const { data, isLoading, isError } = useGetPostsQuery();
  const [infoId, setInfoId] = useState(null);
  const { data: postInfo } = useGetPostByIdQuery(infoId);
  const posts = data?.data || [];
  const imgUrl = "http://37.27.29.18:8003/images/";

  const videoRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCancel = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsModalOpen(false);
  };
  console.log(infoId);

  function openComment(e) {
    setInfoId(e.postId);
    setIsModalOpen(true);
  }

  if (isLoading)
    return (
      <Flex
        align="center"
        className="w-full h-screen flex justify-center items-center "
        gap="middle"
      >
        <Spin size="large" />
      </Flex>
    );

  if (isError) return <ErrorAnimation />;
  return (
    <div className="md:w-[50%] border flex flex-col gap-7">
      <Modal
        className="!w-[80%] !h-[90vh] !m-0 !p-0 !absolute !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2 overflow-hidden"
        title=""
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleCancel}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <section className="flex w-full h-[85vh]">
          <aside className="w-[60%] bg-black flex items-center justify-center">
            {postInfo?.data?.images.map((file, i) => {
              const isVideo =
                file.toLowerCase().endsWith(".mp4") ||
                file.toLowerCase().endsWith(".mov");
              return (
                <div
                  key={i}
                  className="w-full h-full flex items-center justify-center"
                >
                  {isVideo ? (
                    <video
                      ref={videoRef}
                      src={`${imgUrl}${file}`}
                      autoPlay
                      loop
                      className="w-full md:h-[80vh] object-contain"
                    />
                  ) : (
                    <img
                      src={`${imgUrl}${file}`}
                      alt="image"
                      className="w-full md:h-[80vh] object-contain"
                    />
                  )}
                </div>
              );
            })}
          </aside>

          <aside className="md:w-[40%] p-5">
            <article className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  className="w-12 h-12 rounded-full"
                  src={`${imgUrl}${postInfo?.data?.userImage}`}
                  alt="userImage"
                />
                <h3 className="font-semibold">{postInfo?.data?.userName}</h3>
              </div>
            <HiOutlineDotsHorizontal className="text-lg" />
            </article>
            <hr className="border-1 border-gray-200 my-3" />
          </aside>
        </section>
      </Modal>

      {posts.map((e) => (
        <article key={e.postId}>
          <div className="flex items-center justify-between">
            <section className="flex items-center gap-3">
              {e.userImage ? (
                <div>
                  <img
                    className="w-12 h-12 rounded-full"
                    src={`${imgUrl}/${e.userImage}`}
                    alt={e.userName}
                  />
                </div>
              ) : (
                <div>
                  <Image
                    src={userImage}
                    alt="user"
                    width={80}
                    height={80}
                    className="w-12 h-12 rounded-full"
                  />
                </div>
              )}
              <div>
                <h3 className="font-semibold">{e.userName}</h3>
                <p className="text-[#475569]">Profile</p>
              </div>
            </section>
            <HiOutlineDotsHorizontal />
          </div>
          <div className="mt-5">
            {e.images.slice(0, 1).map((file, i) => {
              const isVideo =
                file.toLowerCase().endsWith(".mp4") ||
                file.toLowerCase().endsWith(".mov");
              return (
                <div
                  key={i}
                  className="w-full h-full flex items-center justify-center bg-black rounded"
                >
                  {isVideo ? (
                    <video
                      src={`${imgUrl}${file}`}
                      controls
                      className="w-full md:h-[500px] object-contain"
                    />
                  ) : (
                    <img
                      className="w-full md:h-[500px] bg-gray-200"
                      src={`${imgUrl}${file}`}
                      alt="image"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xl flex items-center gap-3">
            <FaRegHeart />
            <FaRegComment
              onClick={() => openComment(e)}
              className="cursor-pointer hover:text-gray-300 transition-colors delay-75"
            />
            <IoSendOutline />
          </div>
        </article>
      ))}
    </div>
  );
};

export default Posts;
