'use client'
import React, { useRef, useState } from "react";
import { CiHeart } from "react-icons/ci";
import { FaHeart, FaRegComment } from "react-icons/fa";
import { IoVolumeMuteSharp } from "react-icons/io5";
import { GoUnmute } from "react-icons/go";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
import { useGetReelsQuery } from "@/store/pages/reels/ReelsApi";
const Reals = () => {
  let { data, refetch } = useGetReelsQuery()
  console.log(data?.data)
  const videoRef = useRef(null);
  const [mutedStates, setMutedStates] = useState({}); // хранит состояние звука для каждого видео
  const videoRefs = useRef([]);

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

  return <>
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      {data?.data.map((e, i) => {
        return (
          <div className="flex justify-center items-center" key={i}>
            <div className="relative">
              <div className="flex w-110 m-auto h-screen snap-start items-center justify-center bg-black">
                <video onClick={togglePlay} ref={el => videoRefs.current[i] = el} muted={mutedStates[i] ?? true} className="w-full h-[95vh]" autoPlay loop src={`http://37.27.29.18:8003/images/${e.images}`}></video>
              </div>
              <div className="absolute left-2 flex top-[-150px] items-center gap-3 text-white">
                <img className="w-12 h-12 rounded-[50%]" src={`http://37.27.29.18:8003/images/${e.userImage}`} alt="" />
                <p>{e.userName}</p>
                <button className="border py-1 px-3 rounded-xl">{e.isSubscriber ? "Unsubscribe" : "Subscribe"}</button>
              </div>
              <button className="absolute right-2 top-2 rounded-2xl p-1 bg-[#616161c1]" onClick={() => toggleMute(i)}>
                {mutedStates[i] ?? true ? <IoVolumeMuteSharp className="text-white w-6 h-6" /> : <GoUnmute className="text-white w-6 h-6" />}
              </button>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-col items-center">
                {e.postLike ? <FaHeart className="text-red-500 w-10 h-10" /> : <CiHeart className="w-10 h-10" />}
                <p className="text-xl">{e.postLikeCount}</p>
              </div>
              <div className="flex flex-col items-center">
                <FaRegComment className="w-8 h-8" />
                <p className="text-xl">{e.commentCount}</p>
              </div>
              <PiPaperPlaneTiltBold />
            </div>
          </div>
        )
      })}
    </div>
  </>;
};

export default Reals;
