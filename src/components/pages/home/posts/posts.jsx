"use client";
import {
  useAddCommentMutation,
  useAddFollowMutation,
  useAddLikePostMutation,
  useAddPostFavoriteMutation,
  useDeleteCommentMutation,
  useDeleteFollowMutation,
  useGetPostByIdQuery,
  useGetPostsQuery,
  useIsFollowerQuery,
} from "@/store/pages/home/muslimApi";
import Image from "next/image";
import userImage from "../../../../components/pages/home/images/user.jpg";
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Flex, Input, Modal, Spin } from "antd";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import ErrorAnimation from "./ErrorAnimation ";
import {
  FaBookmark,
  FaHeart,
  FaRegBookmark,
  FaRegComment,
  FaRegHeart,
} from "react-icons/fa";
import { IoSendOutline } from "react-icons/io5";
import { FaRegFaceSmileWink } from "react-icons/fa6";
import { video } from "@/assets/icon/layout/svg";
import Story from "../stories/story";
import { Navigation, Pagination } from "swiper/modules";
import PendingAnimation from "./PendingAnimation";

import { GoTrash } from "react-icons/go";

const Posts = () => {
  const { data, isLoading, isError, refetch } = useGetPostsQuery();
  const [infoId, setInfoId] = useState(null);
  const { data: postInfo, refetch: infoRefetch } = useGetPostByIdQuery(infoId);
  const [addComment] = useAddCommentMutation();
  const [addLikedPost] = useAddLikePostMutation();
  const posts = data?.data || [];
  const [addFollow] = useAddFollowMutation();
  const [deleteFollow] = useDeleteFollowMutation();
  const [followerId, setFollowerId] = useState(null);
  const { data: isFollower, refetch: followeRefetch } =
    useIsFollowerQuery(followerId);
  const [addPostFavorite] = useAddPostFavoriteMutation();
  const [deleteComment] = useDeleteCommentMutation();
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

  function openComment(e) {
    setInfoId(e.postId);
    setIsModalOpen(true);
  }

  function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "только что";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} дн`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} мес`;

    return `${Math.floor(seconds / 31536000)} г`;
  }

  // addComment
  let [inpAddComment, setInpAddComment] = useState("");

  async function addNewComment(e) {
    e.preventDefault();
    try {
      await addComment({ postId: infoId, comment: inpAddComment });
      setInpAddComment("");
      infoRefetch();
    } catch (error) {
      console.error(error);
    }
  }

  // addLikeComment
  let [localPosts, setLocalPosts] = useState([]);

  useEffect(() => {
    if (data?.data) {
      setLocalPosts(data.data);
    }
  }, [data]);

  async function addNewLikedPost(id) {
    try {
      setLocalPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.postId === id
            ? {
                ...p,
                postLike: !p.postLike,
                postLikeCount: p.postLike
                  ? p.postLikeCount - 1
                  : p.postLikeCount + 1,
              }
            : p
        )
      );

      await addLikedPost(id);
    } catch (error) {
      console.error(error);
    }
  }

  // deleteComment
  async function deleteOldComment(id) {
    try {
      await deleteComment(id);
      infoRefetch()
    } catch (error) {
      console.error(error);
    }
  }

  // addFollow && deleteFollow
  const [isModalOpenFollower, setIsModalOpenFollower] = useState(false);

  const handleCancelFollower = () => {
    setIsModalOpenFollower(false);
  };

  function followerModal(e) {
    setFollowerId(e.userId);
    setIsModalOpenFollower(true);
  }

  async function addNewFollower(id) {
    try {
      await addFollow(id);
      followeRefetch();
    } catch (error) {
      console.error(error);
    }
  }


  async function deleteOldFollower(id) {
    try {
      await deleteFollow(id);
      followeRefetch();
    } catch (error) {
      console.error(error);
    }
  }

  // addPostFavourite
  async function addNewPostFavourite(id) {
    try {
      setLocalPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.postId == id
            ? {
                ...p,
                postFavorite: !p.postFavorite,
              }
            : p
        )
      );
      await addPostFavorite(id);
    } catch (error) {
      console.error(error);
    }
  }


  if (isLoading) return <PendingAnimation />;

  if (isError) return <ErrorAnimation />;
  return (

    <div className="md:w-[50%] mx-auto flex flex-col gap-7">

    <div className="md:w-[60%] mx-auto flex flex-col gap-7">

      <Story />

      {/* // modalComments  */}
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
                      controls
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

          <aside className="md:w-[40%] p-4 flex flex-col justify-between">
            <section>
              <article className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {postInfo?.data?.userImage ? (
                    <div>
                      <img
                        className="w-10 h-10 rounded-full"
                        src={`${imgUrl}${postInfo?.data?.userImage}`}
                        alt={postInfo?.data?.userName}
                      />
                    </div>
                  ) : (
                    <div>
                      <Image
                        src={userImage}
                        alt="user"
                        width={80}
                        height={80}
                        className="w-10 h-10 rounded-full"
                      />
                    </div>
                  )}
                  <h3 className="font-semibold">{postInfo?.data?.userName}</h3>
                </div>
                <HiOutlineDotsHorizontal className="text-lg" />
              </article>
              <hr className="border-1 border-gray-200 my-3" />
              <section className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                {postInfo?.data?.comments.map((comment) => (
                  <article
                    key={comment.postCommentId}
                    className="flex items-start gap-3"
                  >
                    <Image
                      src={userImage}
                      width={36}
                      height={36}
                      alt="user"
                      className="rounded-full flex-shrink-0"
                    />

                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">
                          {comment.userName || "user"}
                        </h3>
                        <p className="text-sm">{comment.comment}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(comment.dateCommented)}
                        </p>
                        <GoTrash onClick={()=>deleteOldComment(comment.postCommentId)} className="text-sm text-gray-400 hover:text-red-500 cursor-pointer" />
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            </section>
            <form
              onSubmit={addNewComment}
              className="flex justify-between border-1 border-gray-300 w-full p-3 rounded"
            >
              <div className="flex items-center gap-3 ">
                <FaRegFaceSmileWink className="text-2xl" />
                <input
                  type="text"
                  value={inpAddComment}
                  onChange={(e) => setInpAddComment(e.target.value)}
                  placeholder="Add comment..."
                  className="w-full outline-none"
                />
              </div>
              <button
                className={`text-blue-900 text-[16px] font-semibold ${
                  inpAddComment ? "" : "opacity-65"
                }`}
              >
                Publish
              </button>
            </form>
          </aside>
        </section>
      </Modal>

      {/* // modalFollower  */}
      <Modal
        title={null}
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpenFollower}
        onOk={handleCancelFollower}
        onCancel={handleCancelFollower}
        footer={null}
        className="md:!max-w-[400px] "
        centered
      >
        <section className="flex flex-col text-center">
          {isFollower?.data?.isSubscriber ? (
            <button
              onClick={() => deleteOldFollower(followerId)}
              className="text-red-500 text-[16px] font-semibold pb-3 hover:bg-gray-100"
            >
              Unfollow
            </button>
          ) : (
            <button
              onClick={() => addNewFollower(followerId)}
              className="text-blue-500 text-[16px] font-semibold py-3 hover:bg-gray-100"
            >
              Subscribe
            </button>
          )}

          <div className="border-t-1 border-gray-300" />

          <button className="py-[10px] text-[16px] hover:bg-gray-100">
            Report
          </button>
          <div className="border-t-1 border-gray-300" />

          <button className="py-[10px] text-[16px] hover:bg-gray-100">
            Block
          </button>
          <div className="border-t-1 border-gray-300" />

          <button className="py-[10px] text-[16px] hover:bg-gray-100">
            Restrict
          </button>
          <div className="border-t-1 border-gray-300" />

          <button className="py-[10px] text-[16px] hover:bg-gray-100">
            Copy profile link
          </button>
          <div className="border-t-1 border-gray-300" />

          <button className="py-[10px] text-[16px] hover:bg-gray-100">
            Share this profile
          </button>

          <div className="mt-2 border-t-1 border-gray-300">
            <button
              onClick={handleCancelFollower}
              className="w-full pt-3 text-[16px] font-semibold hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </section>
      </Modal>

      {localPosts.map((e) => (
        <article key={e.postId} className="w-[80%] mx-auto">
          <div className="flex items-center justify-between">
            <section className="flex items-center gap-3">
              {e.userImage ? (
                <div>
                  <img
                    className="w-10 h-10 rounded-full"
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
                    className="w-10 h-10 rounded-full"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{e.userName}</h3>
                {/* <p className="text-[#475569]">Profile</p> */}
                <span className="p-[2px] rounded-full bg-gray-500"></span>
                <p className="text-sm text-gray-500">
                  {formatTimeAgo(e.datePublished)}
                </p>
              </div>
            </section>
            <div className="flex items-center gap-3 ">

              <div>
                <HiOutlineDotsHorizontal
                  onClick={() => followerModal(e)}
                  className="cursor-pointer hover:text-gray-600 text-xl"
                />
              </div>

              <button
                onClick={() => addNewFollower(e.userId)}
                className={`text-blue-900 text-[16px] font-semibold hover:opacity-65 transition-colors delay-75  rounded bg-white py-2 px-10 border-1 border-blue-600`}
              >
                Subscribe
              </button>
              {/* <HiOutlineDotsHorizontal /> */}

            </div>
          </div>
          <div className="mt-4">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="w-full h-full flex items-center justify-center"
            >
              {e.images.map((file, i) => {
                const isVideo =
                  file.toLowerCase().endsWith(".mp4") ||
                  file.toLowerCase().endsWith(".mov");
                return (
                  <SwiperSlide>
                    <div
                      key={i}

                      className="w-full md:max-h-[600px] min-h-[400px] h-full flex items-center justify-center bg-black "

                      className="w-full h-full flex items-center justify-center bg-black rounded-xl"

                    >
                      {isVideo ? (
                        <video
                          src={`${imgUrl}${file}`}
                          controls

                          className="min-h-[200px] rounded"
                        />
                      ) : (
                        <img
                          className="min-h-[200px]  rounded"

                          className="w-full md:max-h-[500px] object-contain rounded-xl"
                        />
                      ) : (
                        <img
                          className="w-full md:max-h-[500px] bg-gray-200 rounded-xl"

                          src={`${imgUrl}${file}`}
                          alt="image"
                        />
                      )}
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
          <div className="flex items-center justify-between mt-4 text-2xl ">
            <div className="flex items-center gap-3">
              {e.postLike ? (
                <FaHeart
                  onClick={() => addNewLikedPost(e.postId)}
                  className="text-red-600 cursor-pointer hover:text-red-500"
                />
              ) : (
                <FaRegHeart
                  onClick={() => addNewLikedPost(e.postId)}
                  className="text-gray-600 cursor-pointer hover:text-gray-500"
                />
              )}
              <h1>{e.postLikeCount}</h1>
              <h1>{e.comments.length}</h1>
              <FaRegComment
                onClick={() => openComment(e)}
                className="hover:text-gray-500 cursor-pointer"
              />
              <IoSendOutline className="hover:text-gray-500 cursor-pointer" />
            </div>
            {e.postFavorite ? (
              <FaBookmark
                onClick={() => addNewPostFavourite(e.postId)}
                className=" cursor-pointer"
              />
            ) : (
              <FaRegBookmark
                onClick={() => addNewPostFavourite(e.postId)}
                className="hover:text-gray-500 cursor-pointer"
              />
            )}
          </div>
        </article>
      ))}
    </div>
  );
};

export default Posts;
