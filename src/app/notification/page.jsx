// src/app/Notification.jsx
"use client";

import {
  useAddCommentMutation,
  useAddStoryViewMutation,
  useDeleteSubscriberMutation,
  useGetFollowingPostsQuery,
  useGetSubscribersQuery,
  useLikePostMutation
} from "@/store/pages/notification/notification";
// import Image from "next/image";

import { useState } from "react";

export default function Notification() {
  const userId = "da937ebd-9342-43fb-a6a0-01ccb2cf5bb2";

  // API hooks
  const { data: subscribersData, isLoading: loadingSubs } =
    useGetSubscribersQuery(userId);
  const { data: postsData, isLoading: loadingPosts } =
    useGetFollowingPostsQuery();

  const [likePost] = useLikePostMutation();
  const [addComment] = useAddCommentMutation();
  const [addStoryView] = useAddStoryViewMutation();
  const [deleteSub] = useDeleteSubscriberMutation()

  const [commentText, setCommentText] = useState("");

  if (loadingSubs || loadingPosts) return <p>Загрузка...</p>;

  const subscribers = subscribersData?.data || [];
  const posts = postsData?.data || [];

  return (
    <div className="p-4 space-y-6">

      {/* Новые подписчики */}
      <section>
        <h2 className="text-lg font-bold mb-2">Новые подписчики</h2>
        {subscribers.length === 0 ? (
          <p>Нет новых подписчиков</p>
        ) : (
          subscribers.map((sub) => (
            <div key={sub.id} className="border p-2 rounded mb-2 flex justify-between">
              <p className="font-medium">
                {sub.userShortInfo.fullname} (@{sub.userShortInfo.userName})
              </p>
              <button onClick={() => deleteSub(sub.id)}>Delete</button>
            </div>
          ))
        )}
      </section>

      {/* Новые посты */}
      <section>
        <h2 className="text-lg font-bold mb-2">Новые посты от подписок</h2>
        {posts.length === 0 ? ( <p>Нет новых постов</p> ) : (
          posts.map((post) => (
            <div key={post.id} className="border p-2 rounded mb-2">
              <p className="font-medium">{post.description}</p>
              <div className="flex gap-2 mt-2">
                <button  className="px-3 py-1 bg-blue-500 text-white rounded"  onClick={() => likePost(post.id)} > Лайк</button>
                <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={() => addStoryView(post.storyId)} >Смотреть сторис</button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); addComment({ postId: post.id, text: commentText }); setCommentText(""); }} className="mt-2 flex gap-2">
                <input type="text" placeholder="Комментарий..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="border p-1 flex-1" />
                <button type="submit" className="px-3 py-1 bg-purple-500 text-white rounded" > Отправить</button>
              </form>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
