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
  useGetUsersQuery,
  useIsFollowerQuery,
} from "@/store/pages/home/muslimApi";
import Image from "next/image";
import userImage from "../../../../components/pages/home/images/user.jpg";
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Modal } from "antd";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import ErrorAnimation from "@/components/pages/home/posts/ErrorAnimation ";
import {
  FaBookmark,
  FaHeart,
  FaRegBookmark,
  FaRegComment,
  FaRegHeart,
} from "react-icons/fa";
import { FaRegFaceSmileWink } from "react-icons/fa6";
import Story from "../stories/story";
import { Navigation, Pagination } from "swiper/modules";
import PendingAnimation from "./PendingAnimation";
import { GoTrash } from "react-icons/go";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Link from "next/link";
import EmojiPicker from "emoji-picker-react";
import { LuSend } from "react-icons/lu";
import { jwtDecode } from "jwt-decode";
import SharePost from "./sharePost";
import { LiaTelegramPlane } from "react-icons/lia";

const Posts = () => {
  const { data, isLoading, isError } = useGetPostsQuery();
  const [infoId, setInfoId] = useState(null);
  const { data: postInfo, refetch: infoRefetch } = useGetPostByIdQuery(infoId);
  const [addComment] = useAddCommentMutation();
  const [addLikedPost] = useAddLikePostMutation();
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
  const [isModalOpenFollower, setIsModalOpenFollower] = useState(false);
  const [localPosts, setLocalPosts] = useState([]);
  const [inpAddComment, setInpAddComment] = useState("");
  const { data: users } = useGetUsersQuery();

  useEffect(() => {
    if (data?.data) {
      setLocalPosts(data.data);
    }
  }, [data]);

  const handleCancel = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsModalOpen(false);
  };

  const handleCancelFollower = () => {
    setIsModalOpenFollower(false);
  };

  const openComment = (e) => {
    setInfoId(e.postId);
    setIsModalOpen(true);
  };

  const followerModal = (e) => {
    setFollowerId(e.userId);
    setIsModalOpenFollower(true);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "только что";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} дн`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} мес`;

    return `${Math.floor(seconds / 31536000)} г`;
  };

  const addNewComment = async (e) => {
    e.preventDefault();
    try {
      await addComment({ postId: infoId, comment: inpAddComment });
      setInpAddComment("");
      infoRefetch();
    } catch (error) {
      console.error(error);
    }
  };

  const addNewLikedPost = async (id) => {
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
  };

  const deleteOldComment = async (id) => {
    try {
      await deleteComment(id);
      infoRefetch();
    } catch (error) {
      console.error(error);
    }
  };

  const addNewFollower = async (id) => {
    try {
      await addFollow(id);
      followeRefetch();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteOldFollower = async (id) => {
    try {
      await deleteFollow(id);
      followeRefetch();
    } catch (error) {
      console.error(error);
    }
  };

  const addNewPostFavourite = async (id) => {
    try {
      setLocalPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.postId === id
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
  };

  // contentModal
  let [contentModal, setContentModal] = useState(false);

  // Emoji
  let [showEmojiPicker, setShowEmojiPicker] = useState(false);

  if (isLoading) return <PendingAnimation />;
  if (isError) return <ErrorAnimation />;

  return (
    <div className="md:w-[45%] w-full mx-auto">
      <Story />
      <div className="md:w-[80%] mx-auto flex flex-col gap-7 max-w-full mt-7">
        {/* Modal Comments */}
        <Modal
          className="!w-full !h-full !m-0 !p-0 !absolute !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2 overflow-hidden sm:!w-[80%] md:!h-[90vh]"
          title={null}
          closable={{ "aria-label": "Custom Close Button" }}
          open={isModalOpen}
          onOk={handleCancel}
          onCancel={handleCancel}
          footer={null}
          centered
        >
          <section className="flex flex-col md:flex-row w-full h-full md:h-[85vh]">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              className="w-full md:w-[60%] h-1/2 md:h-full md:flex  hidden bg-black items-center justify-center"
            >
              {postInfo?.data?.images.map((file, i) => {
                const isVideo =
                  file.toLowerCase().endsWith(".mp4") ||
                  file.toLowerCase().endsWith(".mov");
                return (
                  <SwiperSlide
                    key={i}
                    className="w-full flex items-center justify-center"
                  >
                    {isVideo ? (
                      <video
                        ref={videoRef}
                        src={`${imgUrl}${file}`}
                        autoPlay
                        controls
                        loop
                        className="w-full hidden md:block h-full object-contain"
                      />
                    ) : (
                      <img
                        src={`${imgUrl}${file}`}
                        alt="image"
                        className="w-full hidden md:block h-full object-contain"
                      />
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
            <aside className="w-full md:w-[50%] p-2 md:p-4 flex flex-col justify-between md:h-full  h-[94vh] relative">
              <section>
                <article className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {postInfo?.data?.userImage ? (
                      <img
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                        src={`${imgUrl}${postInfo?.data?.userImage}`}
                        alt={postInfo?.data?.userName}
                      />
                    ) : (
                      <Image
                        src={userImage}
                        alt="user"
                        width={32}
                        height={32}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                      />
                    )}
                    <h3 className="font-semibold text-sm sm:text-base">
                      {postInfo?.data?.userName}
                    </h3>
                  </div>
                  <HiOutlineDotsHorizontal className="text-base sm:text-lg" />
                </article>

                <hr className="border-1 border-gray-200 my-2 sm:my-3" />

                <section className="flex flex-col gap-5 mt-5 md:mt-0 h-[60vh] overflow-y-auto no-scrollbar">
                  {postInfo?.data?.comments.map((comment) => (
                    <article
                      key={comment.postCommentId}
                      className="flex items-start gap-2 sm:gap-3"
                    >
                      <Image
                        src={userImage}
                        width={32}
                        height={32}
                        alt="user"
                        className="w-9 h-9 rounded-full flex-shrink-0"
                      />

                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <h3 className="font-semibold text-xs sm:text-sm">
                            {comment.userName || "user"}
                          </h3>
                          <p className="text-xs sm:text-sm">
                            {comment.comment}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] sm:text-xs text-gray-400">
                            {formatTimeAgo(comment.dateCommented)}
                          </p>
                          <GoTrash
                            onClick={() =>
                              deleteOldComment(comment.postCommentId)
                            }
                            className="text-xs sm:text-sm text-gray-400 hover:text-red-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </section>
              </section>

              <section className="md:relative bottom-4">
                <div className="p-4 h-[40px] sm:h-fit hidden  md:flex sm:flex-col justify-center  items-center sm:items-start gap-3">
                  <div className="flex items-center gap-4">
                    <FaRegHeart size={24} className="cursor-pointer" />
                    <FaRegComment size={24} className="cursor-pointer" />
                    <LiaTelegramPlane size={24} className="cursor-pointer" />
                  </div>
                  <span className="font-semibold">
                    {postInfo?.data?.postLikeCount} отметок "Нравится"
                  </span>
                  <span className="text-xs text-gray-500 sm:block hidden">
                    Posted on:{" "}
                    {new Date(postInfo?.data?.datePublished).toLocaleString()}
                  </span>
                </div>
                <form
                  onSubmit={addNewComment}
                  className="flex justify-between border-1 border-gray-300 w-full p-2 sm:p-3 rounded"
                >
                  <div className="flex items-center gap-2 sm:gap-3 ">
                    <FaRegFaceSmileWink
                      onClick={() => setShowEmojiPicker((val) => !val)}
                      className="text-xl sm:text-2xl cursor-pointer"
                    />

                    {showEmojiPicker && (
                      <div className="absolute bottom-10 left-0 z-50">
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            setInpAddComment((prev) => prev + emojiData.emoji);
                            setShowEmojiPicker(false);
                          }}
                        />
                      </div>
                    )}

                    <input
                      type="text"
                      value={inpAddComment}
                      onChange={(e) => setInpAddComment(e.target.value)}
                      placeholder="Add comment..."
                      className="w-full outline-none text-sm sm:text-base"
                    />
                  </div>
                  <button
                    className={`text-blue-900 text-sm sm:text-base font-semibold ${
                      inpAddComment ? "" : "opacity-65"
                    }`}
                  >
                    Publish
                  </button>
                </form>
              </section>
            </aside>
          </section>
        </Modal>

        {/* Modal Follower */}
        <Modal
          title={null}
          closable={{ "aria-label": "Custom Close Button" }}
          open={isModalOpenFollower}
          onOk={handleCancelFollower}
          onCancel={handleCancelFollower}
          footer={null}
          className="!w-[90%] sm:!w-[60%] md:!w-[40%] !max-w-md"
          centered
        >
          <section className="flex flex-col text-center">
            {isFollower?.data?.isSubscriber ? (
              <button
                onClick={() => deleteOldFollower(followerId)}
                className="text-red-500 text-sm sm:text-base font-semibold py-3 hover:bg-gray-100"
              >
                Unfollow
              </button>
            ) : (
              <button
                onClick={() => addNewFollower(followerId)}
                className="text-blue-500 text-sm sm:text-base font-semibold py-3 hover:bg-gray-100"
              >
                Subscribe
              </button>
            )}

            <div className="border-t border-gray-300" />

            <button className="py-[10px] text-sm sm:text-base hover:bg-gray-100">
              Report
            </button>
            <div className="border-t border-gray-300" />

            <button className="py-[10px] text-sm sm:text-base hover:bg-gray-100">
              Block
            </button>
            <div className="border-t border-gray-300" />

            <button className="py-[10px] text-sm sm:text-base hover:bg-gray-100">
              Restrict
            </button>
            <div className="border-t border-gray-300" />

            <button className="py-[10px] text-sm sm:text-base hover:bg-gray-100">
              Copy profile link
            </button>
            <div className="border-t border-gray-300" />

            <button className="py-[10px] text-sm sm:text-base hover:bg-gray-100">
              Share this profile
            </button>

            <div className="mt-2 border-t border-gray-300">
              <button
                onClick={handleCancelFollower}
                className="w-full pt-3 text-sm sm:text-base font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </section>
        </Modal>

        {localPosts.map((e) => (
          <article
            key={e.postId}
            className="w-full pb-4 border-b-1 border-gray-300"
          >
            <div className="flex items-center justify-between">
              <Link
                href={`/profile/${e.userId}`}
                className="flex items-center gap-3"
              >
                {e.userImage ? (
                  <img
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full"
                    src={`${imgUrl}${e.userImage}`}
                    alt={e.userName}
                  />
                ) : (
                  <Image
                    src={userImage}
                    alt="user"
                    width={36}
                    height={36}
                    className="rounded-full w-9 h-9 sm:w-10 sm:h-10"
                  />
                )}
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{e.userName}</h3>
                  <span className="hidden sm:block p-[2px] rounded-full bg-gray-500"></span>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {formatTimeAgo(e.datePublished)}
                  </p>
                </div>
              </Link>
              <HiOutlineDotsHorizontal
                onClick={() => followerModal(e)}
                className="cursor-pointer hover:text-gray-600 text-lg sm:text-xl"
              />
            </div>

            <div className="mt-3 sm:mt-4">
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
                    <SwiperSlide key={i}>
                      <div className="w-full max-h-[400px] sm:max-h-[500px] flex items-center justify-center bg-black rounded">
                        {isVideo ? (
                          <video
                            src={`${imgUrl}${file}`}
                            controls
                            className="w-full max-h-[400px] sm:max-h-[450px] md:min-h-[500px] min-h-[350px] object-contain"
                          />
                        ) : (
                          <img
                            src={`${imgUrl}${file}`}
                            alt="image"
                            className="w-full max-h-[400px] sm:max-h-[450px] md:min-h-[500px] min-h-[350px] object-contain"
                          />
                        )}
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex items-center justify-between text-2xl">
                <div className="flex items-center gap-4">
                  {e.postLike ? (
                    <FaHeart
                      onClick={() => addNewLikedPost(e.postId)}
                      className="text-red-600 cursor-pointer hover:opacity-80 transition"
                    />
                  ) : (
                    <FaRegHeart
                      onClick={() => addNewLikedPost(e.postId)}
                      className="text-gray-800 cursor-pointer hover:opacity-60 transition"
                    />
                  )}
                  <FaRegComment
                    onClick={() => openComment(e)}
                    className="cursor-pointer hover:opacity-60 transition"
                  />
                  <SharePost el={e} />
                </div>
                {e.postFavorite ? (
                  <FaBookmark
                    onClick={() => addNewPostFavourite(e.postId)}
                    className="cursor-pointer transition"
                  />
                ) : (
                  <FaRegBookmark
                    onClick={() => addNewPostFavourite(e.postId)}
                    className="cursor-pointer hover:opacity-60 transition"
                  />
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mt-1">
                {e.postLikeCount} likes
              </h3>
              <div
                className={`text-sm text-gray-800 leading-snug ${
                  e.content ? "" : "hidden"
                }`}
              >
                {e.content && e.content.length > 40 ? (
                  contentModal ? (
                    <p onClick={() => setContentModal(false)}>{e.content}</p>
                  ) : (
                    <p>
                      {e.content.slice(0, 40)}
                      <span
                        className="text-gray-500 cursor-pointer text-sm font-medium"
                        onClick={() => setContentModal(true)}
                      >
                        ... more
                      </span>
                    </p>
                  )
                ) : (
                  <p>{e.content}</p>
                )}
              </div>
              {e.comments?.length > 0 && (
                <p
                  onClick={() => openComment(e)}
                  className="text-sm text-gray-500 cursor-pointer hover:underline"
                >
                  View all ({e.comments.length}) comments
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Posts;
