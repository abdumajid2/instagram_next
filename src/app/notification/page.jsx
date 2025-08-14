"use client";

import {
  useAddCommentMutation,
  useAddStoryViewMutation,
  useDeleteSubscriberMutation,
  useGetFollowingPostsQuery,
  useGetSubscribersQuery,
  useLikePostMutation
} from "@/store/pages/notification/notification";
import { useState } from "react";

export default function Notification() {
  const userId = "da937ebd-9342-43fb-a6a0-01ccb2cf5bb2";


  // function parseJwt(token) {
  //   try {
  //     const base64Payload = token.split(".")[1];
  //     const payload = atob(base64Payload);
  //     return JSON.parse(payload);
  //   } catch (e) {
  //     return null;
  //   }
  // }
 

  // const authToken = localStorage.getItem("authToken");
  // const payload = parseJwt(authToken);
  // const userId = payload?.sub || ""; // или как называется поле в вашем токене




  const { data: subscribersData, isLoading: loadingSubs, refetch: refetchSubs } =
    useGetSubscribersQuery(userId);

  const { data: postsData, isLoading: loadingPosts } =
    useGetFollowingPostsQuery();

  const [likePost] = useLikePostMutation();
  const [addComment] = useAddCommentMutation();
  const [addStoryView] = useAddStoryViewMutation();
  const [deleteSub] = useDeleteSubscriberMutation();

  const [commentText, setCommentText] = useState("");

  if (loadingSubs || loadingPosts) return <p>Загрузка...</p>;

  const subscribers = subscribersData?.data || [];
  const posts = postsData?.data || [];

  // Функция удаления подписчика
  async function deleteID(userIdToDelete) {
    try {
      await deleteSub(userIdToDelete).unwrap();
      refetchSubs(); // Навсозии рӯйхат
    } catch (err) {
      console.error("Ошибка удаления подписчика:", err);
    }
  }

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
              <div>
                <p className="font-medium">
                  {sub.userShortInfo.userName}
                </p>
                <p className="text-[gray]">Folowed you</p>
              </div>
              <div className="flex gap-[20px]">

                <button onClick={() => deleteID(sub.userShortInfo.userId)} className="bg-red-500 text-white rounded-[5px] px-[20px] py-[5px]">Delete</button>
                <button className="px-[20px] py-[5px] rounded-[5px] bg-blue-300 text-blue-700">Follow</button>
              </div>
            </div>
          ))
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold mb-2">Новые посты от подписок</h2>
        {posts.length === 0 ? (<p>Нет новых постов</p>) : (
          posts.map((post) => (
            <div key={post.id} className="border p-2 rounded mb-2">
              <p className="font-medium">{post.description}</p>
              <div className="flex gap-2 mt-2">
                <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={() => likePost(post.id)}>Лайк</button>
                <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={() => addStoryView(post.storyId)}>Смотреть сторис</button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                addComment({ postId: post.id, text: commentText });
                setCommentText("");
              }} className="mt-2 flex gap-2">
                <input type="text" placeholder="Комментарий..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="border p-1 flex-1" />
                <button type="submit" className="px-3 py-1 bg-purple-500 text-white rounded">Отправить</button>
              </form>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
