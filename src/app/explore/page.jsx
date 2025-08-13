"use client"
import { useState } from "react"
import { useGetPostsQuery } from "@/store/pages/explore/exploreApi"
import notImg from "./Без названия.jpg"
import { MdSlowMotionVideo } from "react-icons/md"
import { FaHeart, FaComment } from "react-icons/fa"

export default function ExplorePage() {
  const { data, isLoading } = useGetPostsQuery()
  const [selectedPost, setSelectedPost] = useState(null)

  if (isLoading) return <div>Loading...</div>

  return (
    <>
      <div className="grid grid-cols-3 p-[5vh] gap-[2px] auto-rows-[150px]">
        {data?.data?.map((post, index) => {
          const firstImage = post.images?.[0]
          const isVideo = /\.(mp4)$/i.test(firstImage)
          const src = `http://37.27.29.18:8003/images/${firstImage}`
          const isTall = (index + 1) % 3 === 0

          return (
            <div
              key={post.postId}
              onClick={() => setSelectedPost(post)}
              className={`relative overflow-hidden bg-gray-200 group cursor-pointer ${
                isTall ? "row-span-3" : "row-span-2"
              }`}
            >
              {isVideo ? (
                <video
                  src={src}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  onError={(e) => (e.target.poster = notImg)}
                />
              ) : (
                <img
                  src={src}
                  alt="Post"
                  onError={(e) => (e.target.src = notImg)}
                  className="w-full h-full object-cover"
                />
              )}

              {isVideo && (
                <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white">
                  <MdSlowMotionVideo size={18} />
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white font-semibold text-lg transition-opacity duration-300">
                <div className="flex items-center gap-2">
                  <FaHeart /> {post.likesCount || 0}
                </div>
                <div className="flex items-center gap-2">
                  <FaComment /> {post.commentsCount || 0}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] h-[90%] flex">
            <div className="flex-1 w-[100%] bg-black flex items-center justify-center">
              {/\.(mp4)$/i.test(selectedPost.images?.[0]) ? (
                <video
                  src={`http://37.27.29.18:8003/images/${selectedPost.images[0]}`}
                  className="max-h-full max-w-full object-cover"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={`http://37.27.29.18:8003/images/${selectedPost.images[0]}`}
                  alt="Post"
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            <div className="w-[350px] flex flex-col border-l">
              <div className="p-4 flex items-center gap-4 border-b">
                <FaHeart className="text-red-500" /> {selectedPost.likesCount || 0}
                <FaComment className="text-gray-500" /> {selectedPost.commentsCount || 0}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <p className="text-sm text-gray-700">User1: Nice post!</p>
                <p className="text-sm text-gray-700">User2: Awesome 🔥</p>
              </div>
              <div className="p-4 border-t">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedPost(null)}
            className="absolute top-4 right-4 text-white text-3xl"
          >
            &times;
          </button>
        </div>
      )}
    </>
  )
}
