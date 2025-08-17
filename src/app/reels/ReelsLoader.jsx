"use client";
import React from "react";

const ReelsLoader = () => {
  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="relative flex justify-center items-end w-full lg:h-screen h-[98vh]"
        >
          <div className="relative w-full lg:w-110 h-screen cursor-pointer">
            <div className="flex lg:w-110 w-full m-auto h-screen snap-start items-center justify-center bg-gray-600">
              <div className="w-full h-screen bg-gray-500 animate-pulse rounded-xl" />
            </div>
            <div className="absolute left-2 flex flex-col lg:top-[89vh] top-[500px] w-full items-start gap-3 text-[#e4e4e4]">
              <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-700 animate-pulse rounded"></div>
            </div>
            <div className="absolute right-2 bottom-10 flex flex-col items-center gap-4 text-white">
              <div className="w-10 h-10 bg-gray-700 animate-pulse rounded-full"></div>
              <div className="w-10 h-10 bg-gray-700 animate-pulse rounded-full"></div>
              <div className="w-10 h-10 bg-gray-700 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReelsLoader;
