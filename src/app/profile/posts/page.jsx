'use client'
import React from 'react'
import Image from 'next/image'
import { useGetMyPostsQuery } from '@/store/pages/profile/ProfileApi'

const Posts = () => {
  const { data: postsData, isLoading, isError } = useGetMyPostsQuery()
  const posts = postsData || []

  if (isLoading) return <p>Загрузка постов...</p>
  if (isError) return <p>Ошибка при загрузке постов</p>
  if (posts.length === 0) return <p>Нет постов</p>

  return (
    <div className='w-full  flex flex-wrap items-start justify-between gap-y-[10px]'>
      {posts.map((post) => (
        <div key={post.postId} >
         
       
            {post.images?.map((img, idx) => (
              <Image
                key={idx}
                src={`http://37.27.29.18:8003/images/${img}`}
                alt="post image"
                width={200}
                height={200}
                className="rounded-xl"
              />
            ))}
       
        </div>
      ))}
    </div>
  )
}

export default Posts
