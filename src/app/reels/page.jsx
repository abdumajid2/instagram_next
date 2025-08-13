'use client'
import React from "react";
import { useGetReelsQuery } from "@/store/pages/reels/ReelsApi";
// import ReelsSlider from "@/components/pages/reels/ReelsSlider";
const Reals = () => {
  let { data, refetch } = useGetReelsQuery()
  console.log(data?.data)
  return <>
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      {data?.data.map((e, i) => {
        return (
          <div key={i}>
            <div className="flex w-110 m-auto h-screen snap-start items-center justify-center bg-black">
              <video className="w-full h-[95vh]" controls muted autoPlay loop src={`http://37.27.29.18:8003/images/${e.images}`}></video>
              <div className="">
                <img src="" alt="" />
                
              </div>
            </div>

          </div>
        )
      })}
    </div>
  </>;
};

export default Reals;
