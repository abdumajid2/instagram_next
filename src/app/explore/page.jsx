"use client";
import { useGetPostsQuery } from "@/store/pages/explore/exploreApi";

export default function ExplorePage() {
  const { data, isLoading } = useGetPostsQuery({ pageNumber: 1, pageSize: 20 });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-1 sm:grid-cols-2 md:grid-cols-3">
      {data?.data?.map((post) => {
        const file = post.images[0];
        const isVideo = file?.endsWith(".mp4");
        const mediaUrl = `http://37.27.29.18:8003/Uploads/${file}`;

        return (
          <div key={post.postId} className="relative group aspect-square overflow-hidden">
            {isVideo ? (
              <video
                src={mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={mediaUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-4 text-white font-semibold">
                <span>❤️ {post.postLikeCount}</span>
                <span>💬 {post.commentCount}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 
