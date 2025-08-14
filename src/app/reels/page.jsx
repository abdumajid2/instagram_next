'use client'
import React, { useRef, useState } from "react";
import { CiHeart } from "react-icons/ci";
import { FaHeart, FaRegComment } from "react-icons/fa";
import { IoVolumeMuteSharp } from "react-icons/io5";
import { GoUnmute } from "react-icons/go";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
import { LiaBookmark } from "react-icons/lia";
import { useGetReelsQuery, useAddLikeMutation } from "@/store/pages/reels/ReelsApi";
import userimg from "./user.png"
const Reals = () => {
  let { data, refetch } = useGetReelsQuery()
  let [ addLike ] = useAddLikeMutation()
  console.log(data?.data)
  const [mutedStates, setMutedStates] = useState({});
  const videoRefs = useRef([]);
  const [likedStates, setLikedStates] = useState({});

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
    setMutedStates(prev => ({ ...prev, [index]: video.muted }));
  };

  const handleLike = async (postId) => {
    // синхронно меняем состояние
    setLikedStates(prev => ({ ...prev, [postId]: !prev[postId] }));
    try {
      // асинхронно отправляем запрос
      await addLike(postId);
    } catch (err) {
      // если ошибка, можно откатить состояние
      setLikedStates(prev => ({ ...prev, [postId]: !prev[postId] }));
      console.error(err);
    }
  };

  return <>
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      {data?.data.map((e, i) => {
        const isLiked = likedStates[e.postId] ?? e.postLike;
        return (
          <div className="relative flex justify-center items-end w-[100%]" key={i}>
            <div className="relative">
              <div className="flex lg:w-110 m-auto h-screen snap-start items-center justify-center bg-black">
                <video onClick={togglePlay} ref={el => videoRefs.current[i] = el} muted={mutedStates[i] ?? true} className="lg:w-full w-[100%] h-[95vh]" autoPlay loop src={`http://37.27.29.18:8003/images/${e.images}`}></video>
              </div>
              <div className="absolute left-2 flex flex-col top-[-120px] items-start gap-3 text-white">
                <div className="flex items-center gap-4">
                  <img className="w-12 h-12 rounded-[50%]" src={`http://37.27.29.18:8003/images/${e.userImage}`} alt="" />
                  <p>{e.userName}</p>
                  <button className="border py-1 px-3 rounded-xl">{e.isSubscriber ? "Unsubscribe" : "Subscribe"}</button>
                </div>
                <div className="flex justify-between items-center w-[170%]">
                  <p>🎵 {e.userName} original audio</p>
                  <img className="w-10 h-10 rounded-[10px]" src={`http://37.27.29.18:8003/images/${e.userImage}`} alt="" />
                </div>
              </div>
              <button className="absolute right-2 top-2 rounded-2xl p-1 bg-[#616161c1]" onClick={() => toggleMute(i)}>
                {mutedStates[i] ?? true ? <IoVolumeMuteSharp className="text-white w-6 h-6" /> : <GoUnmute className="text-white w-6 h-6" />}
              </button>
              <div className="flex flex-col items-center gap-2 mb-45 absolute bottom-0 right-1 text-white">
                <div className="flex flex-col items-center">
                  {isLiked ? <FaHeart className="text-red-500 w-10 h-10" onClick={() => handleLike(e.postId)} /> : <CiHeart className="w-10 h-10" onClick={() => handleLike(e.postId)} />}
                  <p>{e.postLikeCount}</p>
                </div>
                <div className="flex flex-col items-center">
                  <FaRegComment className="w-8 h-8" />
                  <p>{e.commentCount}</p>
                </div>
                <PiPaperPlaneTiltBold className="w-7 h-7" />
                <LiaBookmark className="w-10 h-10" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  </>;
};

export default Reals;
