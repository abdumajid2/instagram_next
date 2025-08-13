"use client";
import { useGetPostsQuery } from "@/store/pages/explore/exploreApi";
import { FaVideo } from "react-icons/fa"; 
import notImg from "./Без названия.jpg";

export default function ExplorePage() {
  const { data, isLoading } = useGetPostsQuery();
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-1 p-[2vh] sm:grid-cols-2 md:grid-cols-3">
      {data?.data?.map((post) => {
        const firstImage = post.images?.[0];
        const isVideo = /\.(mp4)$/i.test(firstImage);
        return (
          <div
            key={post.postId}
            className="relative flex bg-[gainsboro] overflow-hidden"
          >
            <img
              src={`http://37.27.29.18:8003/images/${firstImage}`}
              alt="Post"
              onError={(e) => (e.target.src = notImg)}
              className="rounded-[9px] w-[400px] h-[500px] object-cover"
            />

            {isVideo && (
              <div className="absolute top-2 right-2 bg-black/50 p-2 rounded-full">
                <FaVideo className="text-white text-lg" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
