"use client"
import { useState, useEffect } from "react"
import {
  useGetPostsQuery,
  useLikePostMutation,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useAddFollowingMutation,
  useDeleteFollowingMutation,
  useGetSubscriptionsQuery,
  useAddPostFavoriteMutation
} from "@/store/pages/explore/exploreApi"
import { FaHeart, FaComment, FaTrash, FaTimes } from "react-icons/fa"
import { MdSlowMotionVideo } from "react-icons/md"
import EmojiPicker from 'emoji-picker-react'

export default function ExplorePage() {
  const { data, isLoading, refetch } = useGetPostsQuery()
  const [selectedPost, setSelectedPost] = useState(null)
  const [comment, setComment] = useState("")
  const [likedPosts, setLikedPosts] = useState({})
  const [postLikes, setPostLikes] = useState({})
  const [likePost] = useLikePostMutation()
  const [addComment] = useAddCommentMutation()
  const [deleteComment] = useDeleteCommentMutation()
  const [addFollowing] = useAddFollowingMutation()
  const [deleteFollowing] = useDeleteFollowingMutation()
  const currentUserId = 1
  const { data: subscriptions } = useGetSubscriptionsQuery(currentUserId)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const subscriptionList = Array.isArray(subscriptions?.data)
    ? subscriptions.data
    : Array.isArray(subscriptions)
      ? subscriptions
      : []

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

  useEffect(() => {
    if (selectedPost) {
      const following = subscriptionList.some(
        (u) => u.userId === selectedPost.userId
      )
      setIsFollowing(following)
    }
  }, [selectedPost, subscriptionList])

  let [addPostFavorite] = useAddPostFavoriteMutation()
  const handleLike = async (postId) => {
    try {
      await likePost(postId).unwrap()
      setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }))
      setPostLikes(prev => ({
        ...prev,
        [postId]: likedPosts[postId] ? prev[postId] - 1 : prev[postId] + 1
      }))
      await addPostFavorite(postId)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim() || !selectedPost) return
    try {
      await addComment({ postId: selectedPost.postId, comment }).unwrap()
      setComment("")
      setShowEmojiPicker(false)
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

  const handleFollowToggle = async () => {
    if (!selectedPost) return
    try {
      if (isFollowing) {
        await deleteFollowing(selectedPost.userId).unwrap()
        setIsFollowing(false)
      } else {
        await addFollowing(selectedPost.userId).unwrap()
        setIsFollowing(true)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const onEmojiClick = (emojiData, event) => {
    setComment(emojiData.emoji)
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
                <div className="relative w-full h-full">
                  <video
                    src={src}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                  <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-black/40 p-1.5 rounded">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleLike(post.postId) }}>
                      <FaHeart
                        className={likedPosts[post.postId] ? "text-red-500" : "text-white"}
                      />
                      <span className="text-white text-sm">{postLikes[post.postId]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaComment className="text-white" />
                      <span className="text-white text-sm">{post.commentCount || 0}</span>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white">
                    <MdSlowMotionVideo size={18} />
                  </div>
                </div>
              ) : (
                <img src={src} alt="Post" className="w-full h-full object-cover" />
              )}
            </div>
          )
        })}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 m-auto flex items-center justify-center z-50">
          <div className="bg-white w-[90%] h-[90%] flex">
            <div className="flex-1 bg-black flex items-center justify-center">
              {/\.(mp4)$/i.test(selectedPost.images?.[0]) ? (
                <video
                  src={`http://37.27.29.18:8003/images/${selectedPost.images[0]}`}
                  className="max-w-full w-[90%] h-[90%] max-h-full rounded-[5px]"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={`http://37.27.29.18:8003/images/${selectedPost.images[0]}`}
                  alt="Post"
                  className="max-w-full w-[90%] h-[90%] max-h-full rounded-[5px]"
                />
              )}
            </div>



            <div className="w-[350px] flex flex-col border border-[gainsboro]">
              <div className="p-4 flex items-center justify-between border-b border-[gainsboro]">
                <div className="flex items-center gap-3">
                  {selectedPost.userImage ? (
                    <img
                      src={`http://37.27.29.18:8003/${selectedPost.userImage}`}
                      alt={selectedPost.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold">{selectedPost.userName?.[0] || "U"}</span>
                    </div>
                  )}
                  <span className="font-semibold">{selectedPost.userName || "User"}</span>
                </div>

                <button
                  onClick={handleFollowToggle}
                  className={`px-3 py-1 rounded text-sm ${isFollowing ? "bg-gray-300" : "bg-blue-500 text-white"}`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>


              <div className="p-4 flex items-center gap-4 border-b border-[gainsboro]">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleLike(selectedPost.postId)}>
                  <FaHeart className={likedPosts[selectedPost.postId] ? "text-red-500" : ""} />
                  <span>{postLikes[selectedPost.postId]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaComment className="text-gray-300" /> {selectedPost.commentCount || 0}
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
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
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

              <div className="p-4 border-t border-[gainsboro] flex gap-2 relative">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 border border-[gainsboro] p-2 rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(prev => !prev)}
                  className="px-2 bg-gray-200 rounded"
                >
                  😊
                </button>
                <button onClick={handleAddComment} className="bg-blue-500 text-white px-3 rounded">
                  Post
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-12 right-0 z-50">
                    <div className="flex justify-end mb-1">
                      <button onClick={() => setShowEmojiPicker(false)} className="text-red-500"><FaTimes /></button>
                    </div>
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                  </div>
                )}
              </div>
            </div>
          </div>

          import {FaTimes} from "react-icons/fa"

          <button
            onClick={() => setSelectedPost(null)}
            className="absolute top-4 right-4 text-white text-3xl"
          >
            <FaTimes />
          </button>

        </div>
      )}
    </>
  )
}
