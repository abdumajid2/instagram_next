'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { useGetMyPostsQuery } from '@/store/pages/profile/ProfileApi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Scrollbar } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/scrollbar'
import { FaRegComment, FaRegHeart, FaShare } from 'react-icons/fa6'
import { Avatar, Input, Button } from 'antd'
import { LiaTelegramPlane } from "react-icons/lia";
const Posts = () => {
  const { data: postsData, isLoading, isError } = useGetMyPostsQuery()
  const posts = postsData || []
  const [selectedPost, setSelectedPost] = useState(null)

  if (isLoading) return <p>Загрузка постов...</p>
  if (isError) return <p>Ошибка при загрузке постов</p>
  if (posts.length === 0) return <p>Нет постов</p>

  return (
    <>
      {/* Сетка постов */}
      <div className="w-full flex flex-wrap gap-2">
        {posts.map((post) => (
          <div
            key={post.postId}
            className="relative group cursor-pointer"
            onClick={() => setSelectedPost(post)}
          >
            {post.images?.[0] && (
              <Image
                src={`http://37.27.29.18:8003/images/${post.images[0]}`}
                alt="post preview"
                width={200}
                height={200}
                className="rounded-lg object-cover"
              />
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

      {/* Модалка Instagram-стиля */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-white w-[90%] h-[90%] flex rounded-xl overflow-hidden relative">
            
            {/* Левая часть — фото/слайдер */}
            <div className="w-[60%] bg-black flex items-center justify-center">
              {selectedPost.images?.length > 1 ? (
                <Swiper
                  modules={[Navigation, Scrollbar]}
                  navigation
                  scrollbar={{ draggable: true }}
                  className="w-full h-full"
                >
                  {selectedPost.images.map((img, idx) => (
                    <SwiperSlide key={idx} className="flex justify-center items-center bg-black">
                      <Image
                        src={`http://37.27.29.18:8003/images/${img}`}
                        alt={`slide-${idx}`}
                        width={800}
                        height={800}
                        className="object-contain max-h-full"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                selectedPost.images?.[0] && (
                  <Image
                    src={`http://37.27.29.18:8003/images/${selectedPost.images[0]}`}
                    alt="post"
                    width={800}
                    height={800}
                    className="object-contain max-h-full"
                  />
                )
              )}
            </div>

            {/* Правая часть — инфо и комментарии */}
            <div className="w-[40%] flex flex-col border-l border-gray-200">
              
              {/* Заголовок с аватаром, именем и датой */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                <Avatar size={40} src={selectedPost.userImage} />
                <div className="flex flex-col">
                  <span className="font-semibold">{selectedPost.userName}</span>
                  
                </div>
              </div>

              {/* Комментарии и описание */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Avatar size={32} src={selectedPost.userImage} />
                  <div className="flex flex-col">
                    <span className="font-semibold">{selectedPost.userName}</span> {selectedPost.content}
                    <div className="text-xs text-gray-400">
                      {new Date(selectedPost.datePublished).toLocaleString()}
                    </div>
                  </div>
                </div>

                {selectedPost.comments.map((comment) => (
                  <div key={comment.postCommentId} className="flex  items-start gap-2">
                    <Avatar size={32} src={comment.userImage} />
                    <div className="flex w-[90%]   flex-col">
                      <div className="flex  items-center justify-between gap-1">
                        <span className="font-bold">{comment.userName}</span>
                        <FaRegHeart className="text-red-500 cursor-pointer" size={14} />
                      </div>
                      <div className='break-words  w-[90%]'>{comment.comment}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(comment.dateCommented).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Лайки и кнопки поста */}
              <div className="p-4 border-t border-gray-200  flex flex-col items-start gap-[10px]">
                <div className='flex items-start gap-[20px]'>  <FaRegHeart size={24} className="cursor-pointer" />
                <FaRegComment size={24} className="cursor-pointer" />
                <LiaTelegramPlane  size={24} className="cursor-pointer" /> </div>
               
                <span className=" font-semibold">{selectedPost.postLikeCount} отметок "Нравится"</span>
                <span className="text-xs text-gray-500">
                    Posted on: {new Date(selectedPost.datePublished).toLocaleString()}
                  </span>
              </div>

              {/* Поле для ввода комментария */}
              <div className="p-4 border-t border-gray-200 flex gap-2">
                <Input placeholder="Добавьте комментарий..." />
                <Button type="primary">Опубликовать</Button>
              </div>
            </div>

            {/* Кнопка закрытия */}
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

export default Posts
