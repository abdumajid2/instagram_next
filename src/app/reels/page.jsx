"use client";
import React, { useRef, useState } from "react";
import { CiHeart } from "react-icons/ci";
import { FaHeart, FaRegComment } from "react-icons/fa";
import { IoVolumeMuteSharp } from "react-icons/io5";
import { GoUnmute } from "react-icons/go";
import { BsPlayCircleFill } from "react-icons/bs";
import { LiaBookmark } from "react-icons/lia";
import { FaBookmark } from "react-icons/fa6";
import {
  useGetReelsQuery,
  useAddLikeMutation,
  useFollowMutation,
  useAddToFavoriteMutation,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useUnFollowMutation,
} from "@/store/pages/reels/ReelsApi";
import { Modal } from "antd";
import ReelsLoader from "./ReelsLoader";
import Link from "next/link";
import SharePost from "@/components/pages/home/posts/sharePost";
import Image from "next/image";

const FALLBACK_USER_IMG =
  "https://www.transparentpng.com/download/user/gray-user-profile-icon-png-fP8Q1P.png";

const Reels = () => {
  const { data, isLoading } = useGetReelsQuery();
  const [addLike] = useAddLikeMutation();
  const [follow] = useFollowMutation();
  const [unfollow] = useUnFollowMutation();
  const [addToFavorite] = useAddToFavoriteMutation();
  const [addCommentf] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const videoRefs = useRef([]);
  const [mutedStates, setMutedStates] = useState({});
  const [likedStates, setLikedStates] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [savedStates, setSavedStates] = useState({});
  const [expanded, setExpanded] = useState({});
  const [subscribet, setSubscribet] = useState({});
  const [showPlayIcon, setShowPlayIcon] = useState({});

  const [comments, setcomments] = useState([]);
  const [addcomment, setaddcomment] = useState("");
  const [postid, setpostid] = useState(null);
  const [isSubscribet, setIsSubscribet] = useState(false);

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [openComments, setOpenComments] = useState(false);

  if (isLoading) return <ReelsLoader />;

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory">
      {data?.data?.map((e, i) => {
        const isLiked = likedStates[e.postId] ?? e.postLike;
        return (
          <div
            key={e.postId ?? i}
            className="relative flex justify-center items-end w-full lg:h-screen h-[98vh]"
          >
            <div className="relative w-full lg:w-110 h-screen cursor-pointer">
              <div className="flex lg:w-110 w-full m-auto h-screen snap-start items-center justify-center bg-black">
                <video
                  onClick={() => {
                    const video = videoRefs.current[i];
                    if (video.paused) {
                      video.play();
                      setShowPlayIcon((p) => ({ ...p, [i]: false }));
                    } else {
                      video.pause();
                      setShowPlayIcon((p) => ({ ...p, [i]: true }));
                    }
                  }}
                  ref={(el) => (videoRefs.current[i] = el)}
                  muted={mutedStates[i] ?? true}
                  className="w-full h-screen"
                  autoPlay
                  loop
                  src={`http://37.27.29.18:8003/images/${e.images}`}
                />
              </div>

              {/* Автор */}
              <div className="absolute left-2 flex flex-col lg:bottom-[0px] bottom-[60px] w-full items-start gap-3 text-[#e4e4e4]">
                <div className="flex items-center gap-4">
                  <Image
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full bg-white"
                    src={
                      e.userImage
                        ? `http://37.27.29.18:8003/images/${e.userImage}`
                        : FALLBACK_USER_IMG
                    }
                    alt={`${e.userName ?? "user"} avatar`}
                  />
                  <Link href={`/profile/${e.userId}`}>{e.userName}</Link>
                </div>

                <div className="flex w-[80%] items-end">
                  <p
                    className={
                      expanded[e.postId]
                        ? "whitespace-pre-line w-[90%]"
                        : "line-clamp-1 w-[90%]"
                    }
                  >
                    {e.content}
                  </p>
                  {e.content?.length > 10 && (
                    <button
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [e.postId]: !prev[e.postId],
                        }))
                      }
                      className="text-sm text-gray-300 mt-1"
                    >
                      {expanded[e.postId] ? "скрыть" : "ещё"}
                    </button>
                  )}
                </div>
              </div>

              {/* Play icon */}
              {showPlayIcon[i] && (
                <BsPlayCircleFill
                  size={80}
                  className="absolute left-1/2 top-1/2 text-white"
                />
              )}

              {/* Мьют */}
              <button
                onClick={() => {
                  const video = videoRefs.current[i];
                  video.muted = !video.muted;
                  setMutedStates((p) => ({ ...p, [i]: video.muted }));
                }}
                className="absolute right-2 top-3 rounded-2xl p-1 bg-[#616161c1]"
              >
                {mutedStates[i] ?? true ? (
                  <IoVolumeMuteSharp className="text-white w-6 h-6" />
                ) : (
                  <GoUnmute className="text-white w-6 h-6" />
                )}
              </button>

              {/* Лайки / комменты */}
              <div className="flex flex-col items-center gap-2 absolute bottom-0 right-1 text-white">
                <div className="flex flex-col items-center">
                  {isLiked ? (
                    <FaHeart
                      className="text-red-500 w-8 h-8"
                      onClick={() => addLike(e.postId)}
                    />
                  ) : (
                    <CiHeart
                      className="w-10 h-10 hover:text-[#949494]"
                      onClick={() => addLike(e.postId)}
                    />
                  )}
                  <p>{likeCounts[e.postId] ?? e.postLikeCount}</p>
                </div>

                <div className="flex flex-col items-center">
                  <FaRegComment
                    onClick={() => {
                      setOpenComments(true);
                      setcomments(Array.isArray(e.comments) ? e.comments : []);
                      setpostid(e.postId);
                    }}
                    className="w-8 h-8 hover:text-[#cdcdcd]"
                  />
                  <p>{e.commentCount}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Комментарии */}
      <Modal open={openComments} onCancel={() => setOpenComments(false)} footer={null}>
        {comments.length === 0 && <p>нет комментариев</p>}
        {comments.map((c, ind) => (
          <div
            key={c.postCommentId ?? ind}
            className="flex items-center gap-2 justify-between px-5"
          >
            <Image
              width={40}
              height={40}
              className="w-10 h-10 rounded-full"
              src={
                c.userImage
                  ? `http://37.27.29.18:8003/images/${c.userImage}`
                  : FALLBACK_USER_IMG
              }
              alt={`${c.userName ?? "user"} avatar`}
            />
            <div>
              <h3>{c.userName}</h3>
              <p>{c.comment}</p>
            </div>
          </div>
        ))}
      </Modal>
    </div>
  );
};

export default Reels;
