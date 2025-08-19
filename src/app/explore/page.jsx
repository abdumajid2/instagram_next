"use client"

import { useState, useEffect } from "react"
import {
  useLikePostMutation,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useAddFollowingMutation,
  useDeleteFollowingMutation,
  useGetSubscriptionsQuery,
  useAddPostFavoriteMutation,
  useGetPostsQuery
} from "@/store/pages/explore/exploreApi"
import { FaComment, FaHeart, FaTimes, FaTrash } from 'react-icons/fa'
import defaultAvatar from '../../assets/icon/pages/explore/Без названия.jpg'

const ExplorePage = () => {
  const [selectedPost, setSelectedPost] = useState(null)
  const { data, refetch } = useGetPostsQuery({ pageNumber: 1, pageSize: 999 })

  const [comment, setComment] = useState("")
  const [likedPosts, setLikedPosts] = useState({})
  const [postLikes, setPostLikes] = useState({})
  const [likePost] = useLikePostMutation()
  const [addComment] = useAddCommentMutation()
  const [deleteComment] = useDeleteCommentMutation()
  const [addFollowing] = useAddFollowingMutation()
  const [deleteFollowing] = useDeleteFollowingMutation()
  const [isFollowing, setIsFollowing] = useState(false)

  const currentUserId = 1
  const { data: subscriptions } = useGetSubscriptionsQuery(currentUserId)
  const [addPostFavorite] = useAddPostFavoriteMutation()

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
      const subscriptionList = Array.isArray(subscriptions?.data)
        ? subscriptions.data
        : Array.isArray(subscriptions)
          ? subscriptions
          : []
      const following = subscriptionList.some(u => u.userId === selectedPost.userId)
      setIsFollowing(following)
    }
  }, [selectedPost, subscriptions])

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
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId).unwrap()
      refetch()
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

  return (
    <>
      <div className="container mx-auto px-0 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 md:gap-2">
          {data?.data?.map((post) => {
            const firstMedia = post.images?.[0]
            const isVideo = firstMedia ? /\.(mp4)$/i.test(firstMedia) : false
            const src = firstMedia
              ? `http://37.27.29.18:8003/images/${firstMedia}`
              : 'https://via.placeholder.com/500x500'

            return (
              <div
                key={post.postId}
                onClick={() => setSelectedPost(post)}
                className="relative aspect-square w-full cursor-pointer group overflow-hidden"
              >
                {isVideo ? (
                  <video
                    src={src}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img
                    src={src}
                    alt="Post"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1 text-white font-bold">
                    <FaHeart />
                    <span>{postLikes[post.postId] || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white font-bold">
                    <FaComment />
                    <span>{post.commentCount || 0}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] h-[90%] flex relative">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-3 right-3 text-gray-700 hover:text-black text-2xl z-50"
            >
              <FaTimes />
            </button>

            <div className="flex-1 bg-black flex items-center justify-center relative">
              {selectedPost.images?.[0] && /\.(mp4)$/i.test(selectedPost.images[0]) ? (
                <video
                  src={`http://37.27.29.18:8003/images/${selectedPost.images[0]}`}
                  className="max-w-full w-[70%] h-[90%] max-h-full rounded-[5px]"
                  controls
                />
              ) : (
                <img
                  src={`http://37.27.29.18:8003/images/${selectedPost.images?.[0]}`}
                  alt="Post"
                  className="max-w-full w-[70%] h-[90%] max-h-full rounded-[5px] object-contain"
                />
              )}
            </div>

            <div className="w-[350px] flex flex-col border border-[gainsboro]">
              <div className="p-4 flex items-center justify-between border-b border-[gainsboro]">
                <div className="flex items-center gap-3">
                  <img
                    src={defaultAvatar}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="font-semibold">{selectedPost.userName}</span>
                </div>
                <button
                  onClick={handleFollowToggle}
                  className={`px-3 py-1 rounded text-sm ${isFollowing ? "bg-gray-300" : "bg-blue-500 text-white"}`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>

              <div className="p-4 flex items-center gap-4 border-b border-[gainsboro]">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleLike(selectedPost.postId)}
                >
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
                    <img
                      src={defaultAvatar}
                      alt="User"
                      className="w-8 h-8 rounded-full object-cover"
                    />
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
                  onClick={handleAddComment}
                  className="bg-blue-500 text-white px-3 rounded"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ExplorePage
