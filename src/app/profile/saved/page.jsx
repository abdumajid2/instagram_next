'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { useGetPostsQuery, useAddCommentMutation } from '@/store/pages/profile/ProfileApi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Scrollbar } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/scrollbar'
import { FaRegComment, FaRegHeart } from 'react-icons/fa6'
import { LiaTelegramPlane } from "react-icons/lia"
import { Avatar, Input, Button, message } from 'antd'
import p from '../../../assets/img/pages/profile/profile/p.png'
import { useDeleteCommentMutation } from '@/store/pages/explore/exploreApi'
import { MdOutlineDeleteForever } from "react-icons/md";
const Saved = () => {
  const { data, isLoading, isError, refetch } = useGetPostsQuery()
  const posts = data?.data?.filter((post) => post.postFavorite) || []
  const [selectedPost, setSelectedPost] = useState(null)
  const [addComment, { isLoading: isCommenting }] = useAddCommentMutation()
  const [postComment, setPostComment] = useState('')

  const getImageUrl = (fileName) => {
    if (!fileName) return p.src
    if (fileName.startsWith('http')) return fileName
    return `http://37.27.29.18:8003/images/${fileName}`
  }


  const getMediaType = (fileName) => {
    if (!fileName) return "image"
    const ext = fileName.split('.').pop().toLowerCase()
    if (["mp4", "mov", "webm"].includes(ext)) return "video"
    return "image"
  }

  const handleAddComment = async () => {
    if (!postComment.trim() || !selectedPost) return
    try {
      await addComment({
        postId: selectedPost.postId,
        comment: postComment,
      }).unwrap()

      setPostComment('')
      message.success('Комментарий добавлен ✅')
      refetch()
    } catch (err) {
      console.error(err)
      message.error('Ошибка при добавлении комментария')
    }
  }
console.log(postComment);

const [deleteComment] = useDeleteCommentMutation();

const handleDeleteComment = async (commentId) => {
  try {
    await deleteComment(commentId); // без unwrap()
    message.success('Комментарий удалён ✅');
    alert('Комментарий удалён ✅');
    refetch();
  } catch (err) {
    console.error('Ошибка при удалении комментария:', err);
    message.error('Ошибка при удалении комментария');
  }
};


  if (isLoading) return <p>Загрузка сохранённых постов...</p>
  if (isError) return <p>Ошибка при загрузке данных</p>
  if (posts.length === 0) return <p>Нет сохранённых постов</p>

  return (
    <>
      <div className="w-full flex flex-wrap gap-3">
        {posts.map((post) => (
          <div
            key={post.postId}
            className="relative group cursor-pointer"
            onClick={() => setSelectedPost(post)}
          >
            {post.images?.[0] && (
              getMediaType(post.images[0]) === "image" ? (
                <Image
                  src={getImageUrl(post.images[0])}
                  alt="saved post preview"
                  width={200}
                  height={200}
                  className="rounded-lg object-cover w-[200px] h-[250px]"
                />
              ) : (
                <video
                  src={getImageUrl(post.images[0])}
                  className="rounded-lg object-cover w-[200px] h-[250px]"
                  muted
                />
              )
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 transition-opacity duration-300 text-white font-semibold text-lg">
              <div className="flex items-center gap-2">
                <FaRegHeart size={20} /> {post.postLikeCount}
              </div>
              <div className="flex items-center gap-2">
                <FaRegComment size={20} /> {post.commentCount}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-white w-[90%] h-[90%] flex rounded-xl overflow-hidden relative">

            <div className="w-[60%] bg-black flex items-center justify-center">
              {selectedPost.images?.length > 1 ? (
                <Swiper modules={[Navigation, Scrollbar]} navigation scrollbar={{ draggable: true }} className="w-full h-full">
                  {selectedPost.images.map((file, idx) => (
                    <SwiperSlide key={idx} className="flex justify-center items-center bg-black">
                      {getMediaType(file) === "image" ? (
                        <Image
                          src={getImageUrl(file)}
                          alt={`slide-${idx}`}
                          width={600}
                          height={600}
                          className="object-contain w-[100%] h-[100%] max-h-[90vh] mx-auto"
                        />
                      ) : (
                        <video
                          controls
                          autoPlay
                          className="object-contain w-[100%] h-[100%] max-h-[90vh] mx-auto"
                        >
                          <source src={getImageUrl(file)} type="video/mp4" />
                        </video>
                      )}
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                selectedPost.images?.[0] && (
                  getMediaType(selectedPost.images[0]) === "image" ? (
                    <Image
                      src={getImageUrl(selectedPost.images[0])}
                      alt="saved post"
                      width={600}
                      height={600}
                      className="object-contain w-[100%] h-[100%] max-h-[90vh] mx-auto"
                    />
                  ) : (
                    <video
                      controls
                      autoPlay
                      className="object-contain w-[100%] h-[100%] max-h-[90vh] mx-auto"
                    >
                      <source src={getImageUrl(selectedPost.images[0])} type="video/mp4" />
                    </video>
                  )
                )
              )}
            </div>

            <div className="w-[40%] flex flex-col border-l border-gray-200">
              <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                <Avatar size={40} src={getImageUrl(selectedPost.userImage)} />
                <div className="flex flex-col">
                  <span className="font-semibold">{selectedPost.userName}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Avatar size={36} src={getImageUrl(selectedPost.userImage)} />
                  <div className="flex w-[90%] flex-col">
                    <span className="font-semibold">{selectedPost.userName}</span> {selectedPost.content}
                    <div className="text-xs text-gray-400">
                      {new Date(selectedPost.datePublished).toLocaleString()}
                    </div>
                  </div>
                </div>

                {selectedPost.comments.map((comment) => (
                  <div key={comment.postCommentId} className="flex items-start gap-2">
                    <Avatar size={36} src={getImageUrl(comment.userImage)} />
                    <div className="flex w-[90%] flex-col">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold">{comment.userName}</span>
                        <div className='w-[20px] flex flex-col items-center justify-center gap-[5px]'><FaRegHeart className="text-red-500 cursor-pointer" size={14} />
                                   <span
            onClick={() => handleDeleteComment(comment.postCommentId)}
            className="cursor-pointer text-gray-400 hover:text-red-500"
          >
         <MdOutlineDeleteForever className='text-xl' />
          </span>  </div>
                        
               
                      </div>
                      <div className='break-words'>{comment.comment}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(comment.dateCommented).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-200 flex gap-2">
                <Input 
                  value={postComment} 
                  onChange={(e)=>setPostComment(e.target.value)} 
                  placeholder="Добавьте комментарий..." 
                  onPressEnter={handleAddComment}
                  disabled={isCommenting}
                />
                <Button type="primary" loading={isCommenting} onClick={handleAddComment}>
                  Опубликовать
                </Button>
              </div>
            </div>


            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Saved
