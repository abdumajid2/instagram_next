"use client";
import { useState } from "react";
import { 
  useGetPostsQuery, 
  useLikePostMutation, 
  useAddCommentMutation, 
  useDeleteCommentMutation 
} from "@/store/pages/explore/exploreApi";
import { MdSlowMotionVideo } from "react-icons/md";
import { FaHeart, FaComment, FaTrash, FaUserCircle } from "react-icons/fa";

export default function ExplorePage() {
  const { data, isLoading, refetch } = useGetPostsQuery();
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [likePost] = useLikePostMutation();
  const [addComment] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  if (isLoading) return <div>Loading...</div>;

  const handleLike = async (postId) => {
    try {
      await likePost(postId).unwrap();
      await refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addComment({ postId: selectedPost.postId, text: commentText }).unwrap();
      setCommentText("");
      await refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId).unwrap();
      await refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 p-[5vh] gap-[2px] auto-rows-[150px]">
        {data?.data?.map((post, index) => {
          const firstImage = post.images?.[0];
          const isVideo = /\.(mp4)$/i.test(firstImage);
          const src = `http://37.27.29.18:8003/images/${firstImage}`;
          const isTall = (index + 1) % 3 === 0;

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
            </div>
          );
        })}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] h-[90%] flex">
            <div className="flex-1 bg-black flex items-center justify-center">
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
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleLike(selectedPost.postId)}>
                  <FaHeart className={selectedPost.postLike ? "text-red-500" : ""} />
                  {selectedPost.postLikeCount || 0}
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
                      <FaUserCircle className="w-8 h-8 text-gray-500" />
                    )}

                    <div className="flex-1">
                      <p className="text-sm font-semibold">{c.userName}</p>
                      <p className="text-sm text-gray-700">{c.commentText}</p>
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
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
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
  );
}
