"use client"
import { useState, useEffect } from "react"
import {
  useGetPostsQuery,
  useLikePostMutation,
  useAddCommentMutation,
  useDeleteCommentMutation
} from "@/store/pages/explore/exploreApi"
import { MdSlowMotionVideo } from "react-icons/md"
import { FaHeart, FaComment, FaTrash } from "react-icons/fa"

export default function ExplorePage() {
  const { data, isLoading, refetch } = useGetPostsQuery()
  const [selectedPost, setSelectedPost] = useState(null)
  const [comment, setComment] = useState("")
  const [likedPosts, setLikedPosts] = useState({})
  const [postLikes, setPostLikes] = useState({})
  const [likePost] = useLikePostMutation()
  const [addComment] = useAddCommentMutation()
  const [deleteComment] = useDeleteCommentMutation()

  const instagramGradient = "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"

  useEffect(() => {
    if (data?.data) {
      const likes = {}
      const liked = {}
      data.data.forEach(post => {
        likes[post.postId] = post.postLikeCount || 0
        liked[post.postId] = !!post.postLike
      })
      setPostLikes(likes)
      setLikedPosts(liked)
    }
  }, [data])

  if (isLoading) return <div>Loading...</div>

  const handleLike = async (postId) => {
    try {
      await likePost(postId).unwrap()
      setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }))
      setPostLikes(prev => ({ ...prev, [postId]: likedPosts[postId] ? prev[postId] - 1 : prev[postId] + 1 }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim() || !selectedPost) return
    try {
      await addComment({ postId: selectedPost.postId, comment }).unwrap()
      setComment("")
      await refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId).unwrap()
      await refetch()
    } catch (err) {
      console.error(err)
    }
  }

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
              className={`relative overflow-hidden bg-gray-200 group cursor-pointer ${isTall ? "row-span-3" : "row-span-2"}`}
            >
              {isVideo ? (
                <video src={src} className="w-full h-full object-cover" muted loop autoPlay playsInline />
              ) : (
                <img src={src} alt="Post" className="w-full h-full object-cover" />
              )}
              {isVideo && (
                <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white">
                  <MdSlowMotionVideo size={18} />
                </div>
              )}
              <div className="absolute bottom-2 left-2 flex gap-3 bg-black/30 px-2 py-1 rounded">
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); handleLike(post.postId) }}
                >
                  <FaHeart className={likedPosts[post.postId] ? "text-red-500" : "text-white"} />
                  <span className="text-white text-sm">{postLikes[post.postId]}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaComment className="text-white" />
                  <span className="text-white text-sm">{post.commentCount || 0}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] h-[90%] flex">
            <div className="flex-1 bg-black flex items-center justify-center">
              {/\.(mp4)$/i.test(selectedPost.images?.[0]) ? (
                <video
                  src={`http://37.27.29.18:8003/images/${selectedPost.images[0]}`}
                  className="max-h-full rounded-[5px] max-w-full object-cover"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={`http://37.27.29.18:8003/images/${selectedPost.images[0]}`}
                  alt="Post"
                  className="max-h-full rounded-[5px] max-w-full object-contain"
                />
              )}
            </div>

            <div className="w-[350px] flex flex-col border-l">
              <div className="p-4 flex items-center gap-4 border-b">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleLike(selectedPost.postId)}>
                  <FaHeart className={likedPosts[selectedPost.postId] ? "text-red-500" : ""} />
                  <span>{postLikes[selectedPost.postId]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaComment className="text-gray-500" /> {selectedPost.commentCount || 0}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedPost.comments?.map((c) => (
                  <div key={c.commentId} className="flex items-start gap-2">
                    {c.userImage ? (
                      <img
                        src={`http://37.27.29.18:8003/${c.userImage}`}
                        alt={c.userName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full ${instagramGradient} flex items-center justify-center`}>
                        <span className="text-white font-bold">{c.userName?.[0] || "U"}</span>
                      </div>
                    )}

                    <div className="flex-1">
                      <p className="text-sm font-semibold">{c.userName || "User"}</p>
                      <p className="text-sm text-gray-700">{c.comment}</p>
                    </div>

                    <FaTrash
                      className="text-red-500 cursor-pointer"
                      onClick={() => handleDeleteComment(c.commentId)}
                    />
                  </div>
                ))}
              </div>

              <div className="p-4 border border-[gainsboro] flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 border border-[gainsboro] p-2 rounded"
                />
                <button onClick={handleAddComment} className="bg-blue-500 text-white px-3 rounded">
                  Post
                </button>

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
