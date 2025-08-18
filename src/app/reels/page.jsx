"use client";
import React, { useRef, useState } from "react";
import { CiHeart } from "react-icons/ci";
import { FaHeart, FaRegComment } from "react-icons/fa";
import { IoVolumeMuteSharp } from "react-icons/io5";
import { GoUnmute } from "react-icons/go";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
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

let userImage =
  "https://www.transparentpng.com/download/user/gray-user-profile-icon-png-fP8Q1P.png";

const Reals = () => {
  let { data, isLoading, refetch } = useGetReelsQuery();
  let [addLike] = useAddLikeMutation();
  let [Folow] = useFollowMutation();
  let [UnFolow] = useUnFollowMutation();
  let [addToFavorite] = useAddToFavoriteMutation();
  let [addCommentf] = useAddCommentMutation();
  let [deleteComment] = useDeleteCommentMutation();

  const [mutedStates, setMutedStates] = useState({});
  const videoRefs = useRef([]);
  const [likedStates, setLikedStates] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [savedStates, setSavedStates] = useState({});
  const [expanded, setExpanded] = useState({});
  const [subscribet, setSubscribet] = useState({});

  let [comments, setcomments] = useState([]);
  let [addcomment, setaddcomment] = useState("");
  let [postid, setpostid] = useState(null);
  let [isSubscribet, setIsSubscribet] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showMoreModal = () => {
    setIsModalOpen(true);
  };

  const handleMoreCancel = () => {
    setIsModalOpen(false);
  };

  const [open, setOpen] = useState(false);
  const showModal = () => {
    setOpen(true);
  };

  const handleOk = async () => {
    if (!addcomment.trim()) return;
    try {
      await addCommentf({ comment: addcomment, postId: postid }).unwrap();
      setcomments((prev) => [
        {
          userImage: null,
          userName: "You",
          comment: addcomment,
        },
        ...prev,
      ]);
      setaddcomment("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const togglePlay = (e) => {
    const video = e.currentTarget;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;
    video.muted = !video.muted;
    setMutedStates((prev) => ({ ...prev, [index]: video.muted }));
  };

  const handleLike = async (postId, currentCount) => {
    const isLiked = likedStates[postId] ?? false;
    setLikedStates((prev) => ({ ...prev, [postId]: !isLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: isLiked
        ? (prev[postId] ?? currentCount) - 1
        : (prev[postId] ?? currentCount) + 1,
    }));
    try {
      await addLike(postId);
    } catch (err) {
      setLikedStates((prev) => ({ ...prev, [postId]: isLiked }));
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: currentCount,
      }));
      console.error(err);
    }
  };

  const handleSubscribe = async (userId, isSubscribed) => {
    setSubscribet((prev) => ({ ...prev, [userId]: !isSubscribed }));

    try {
      if (isSubscribed) {
        await UnFolow(userId).unwrap();
      } else {
        await Folow(userId).unwrap();
      }
    } catch (err) {
      console.error(err);
      setSubscribet((prev) => ({ ...prev, [userId]: isSubscribed }));
    }
  };

  const handleSave = async (postId, currentState) => {
    const isSaved = savedStates[postId] ?? currentState;
    setSavedStates((prev) => ({ ...prev, [postId]: !isSaved }));
    try {
      await addToFavorite({ postId });
    } catch (err) {
      setSavedStates((prev) => ({ ...prev, [postId]: isSaved }));
      console.error(err);
    }
  };

  return (
    <>
      <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory">
        {data?.data.map((e, i) => {
          const isLiked = likedStates[e.postId] ?? e.postLike;
          if (isLoading) return <ReelsLoader />;
          return (
            <div
              className="relative flex justify-center items-end w-full lg:h-screen h-[98vh]"
              key={i}
            >
              <div className="relative w-full lg:w-110 h-screen cursor-pointer">
                <div className="flex lg:w-110 w-full m-auto h-screen snap-start items-center justify-center bg-black">
                  <video
                    onClick={togglePlay}
                    ref={(el) => (videoRefs.current[i] = el)}
                    muted={mutedStates[i] ?? true}
                    className="w-full h-screen"
                    autoPlay
                    loop
                    src={`http://37.27.29.18:8003/images/${e.images}`}
                  ></video>
                </div>
                <div className="absolute left-2 flex flex-col lg:bottom-[0px] bottom-[60px] w-full items-start gap-3 text-[#e4e4e4]">
                  <div className="flex items-center gap-4">
                    <img
                      className="w-12 h-12 rounded-[50%] bg-white"
                      src={
                        e.userImage
                          ? `http://37.27.29.18:8003/images/${e.userImage}`
                          : userImage
                      }
                      alt=""
                    />
                    <Link href={`/profile/${e.userId}`}>{e.userName}</Link>
                    {subscribet[e.userId] ?? e.isSubscriber ? (
                      <button
                        onClick={() => handleSubscribe(e.userId, true)}
                        className="border py-1 px-3 rounded-xl"
                      >
                        You are subscribet
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(e.userId, false)}
                        className="border py-1 px-3 rounded-xl"
                      >
                        Subscribe
                      </button>
                    )}
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
                  <p className="lg:w-95">🎵 {e.userName} original audio</p>
                </div>
                <button
                  className="absolute right-2 top-3 rounded-2xl p-1 bg-[#616161c1]"
                  onClick={() => toggleMute(i)}
                >
                  {mutedStates[i] ?? true ? (
                    <IoVolumeMuteSharp className="text-white w-6 h-6" />
                  ) : (
                    <GoUnmute className="text-white w-6 h-6" />
                  )}
                </button>
                <div className="flex flex-col items-center gap-2 lg:mb-5 mb-20 absolute bottom-0 right-1 text-white">
                  <div className="flex flex-col items-center">
                    {isLiked ? (
                      <FaHeart
                        className="text-red-500 w-8 h-8"
                        onClick={() => handleLike(e.postId, e.postLikeCount)}
                      />
                    ) : (
                      <CiHeart
                        className="w-10 h-10 hover:text-[#949494]"
                        onClick={() => handleLike(e.postId, e.postLikeCount)}
                      />
                    )}
                    <p>{likeCounts[e.postId] ?? e.postLikeCount}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <FaRegComment
                      onClick={() => {
                        showModal(),
                          setcomments(e.comments),
                          setpostid(e.postId);
                      }}
                      className="w-8 h-8 hover:text-[#cdcdcd]"
                    />
                    <p>{e.commentCount}</p>
                  </div>
                  <div className="flex flex-col gap-5 items-center">
                    <PiPaperPlaneTiltBold className="w-7 h-7 hover:text-[#cacaca]" />
                    <button>
                      {savedStates[e.postId] ?? e.postFavorite ? (
                        <FaBookmark className="w-8 h-8" />
                      ) : (
                        <LiaBookmark
                          className="w-10 h-10 hover:text-[#949494]"
                          onClick={() => handleSave(e.postId, e.postFavorite)}
                        />
                      )}
                    </button>
                  </div>
                  <div className="flex flex-col items-center lg:gap-15 gap-2">
                    <p
                      className="text-4xl cursor-pointer"
                      onClick={() => {
                        showMoreModal(), setIsSubscribet(e.isSubscriber);
                      }}
                    >
                      ...
                    </p>
                    <img
                      className="w-10 h-10 rounded-[10px] bg-white"
                      src={
                        e.userImage
                          ? `http://37.27.29.18:8003/images/${e.userImage}`
                          : userImage
                      }
                      alt=""
                    />
                  </div>
                </div>
                <Modal
                  title={null}
                  open={isModalOpen}
                  onCancel={handleMoreCancel}
                  mask={false}
                  styles={{
                    mask: { backgroundColor: "transparent" },
                  }}
                  footer={null}
                  closable={false}
                  className="absolute top-0"
                  modalRender={(modal) => (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onClick={handleMoreCancel}
                    >
                      {modal}
                    </div>
                  )}
                >
                  <div className="text-xl text-center lg:text-start lg:top-100 top-50 lg:w-[300px] rounded-2xl">
                    <p className="text-red-500 py-3 px-4 hover:bg-gray-200 rounded-xl">
                      complain
                    </p>
                    {isSubscribet ? (
                      <p
                        className="py-3 px-4 hover:bg-gray-200 rounded-xl text-red-500"
                        onClick={() => {
                          UnFolow(e.userId);
                        }}
                      >
                        unsubcribe
                      </p>
                    ) : (
                      <p
                        className="py-3 px-4 hover:bg-gray-200 rounded-xl text-blue-500"
                        onClick={() => {
                          Folow(e.userId);
                        }}
                      >
                        subcribe
                      </p>
                    )}
                    <p className="py-3 px-4 hover:bg-gray-200 rounded-xl">
                      go to publication
                    </p>
                    <p className="py-3 px-4 hover:bg-gray-200 rounded-xl">
                      share
                    </p>
                    <p className="py-3 px-4 hover:bg-gray-200 rounded-xl">
                      copy link
                    </p>
                    <p className="py-3 px-4 hover:bg-gray-200 rounded-xl">
                      embed on site
                    </p>
                    <p className="py-3 px-4 hover:bg-gray-200 rounded-xl">
                      about the account
                    </p>
                  </div>
                </Modal>
              </div>
            </div>
          );
        })}
        <Modal
          title="Comments"
          open={open}
          mask={false}
          onCancel={handleCancel}
          footer={[
            <div key="custom-footer" className="flex gap-2 w-full">
              <input
                type="text"
                placeholder="Add comment..."
                name="addCommentInp"
                value={addcomment}
                onChange={(e) => {
                  setaddcomment(e.target.value);
                }}
                className="flex-1 border rounded-lg px-3 py-2 outline-none"
              />
              <button
                onClick={() => {
                  handleOk();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Send
              </button>
            </div>,
          ]}
        >
          <div className="overflow-x-auto h-100 flex flex-col gap-10">
            {comments.map((c, ind) => {
              if (comments == []) return <p>not Comments yet</p>;
              return (
                <div
                  key={ind}
                  className="flex items-center gap-2 justify-between px-5"
                >
                  <div className="flex items-start gap-2">
                    <img
                      className="w-12 h-12 rounded-[50%]"
                      src={
                        c.userImage
                          ? `http://37.27.29.18:8003/images/${c.userImage}`
                          : userImage
                      }
                      alt=""
                    />
                    <div className="flex flex-col justify-between">
                      <h3 className="text-[18px]">{c.userName}</h3>
                      <p>{c.comment}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteComment(c.postCommentId)}>
                    ❌
                  </button>
                </div>
              );
            })}
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Reals;
