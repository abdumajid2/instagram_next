
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ImCancelCircle } from 'react-icons/im';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import { Skeleton } from 'antd';
import { jwtDecode } from 'jwt-decode';

import {
  useGetUserProfileByIdQuery,
  useGetUserStoryByIdQuery,
  useGetSubscriptionsQuery,
  useAddFollowingMutation,
  useDeleteFollowingMutation,
  useGetChatsQuery,
  useCreateChatMutation,
} from '@/store/pages/profile/ProfileApi';

import FollowersMenu from '@/components/pages/profile/followers';
import FollowingMenu from '@/components/pages/profile/following';
import Posts from '@/app/profile/posts/page';

const API = 'http://37.27.29.18:8003';
const IMG = (f) => (f ? `${API}/images/${f}` : '/placeholder.png');

export default function ProfileById() {
  const params = useParams();
  const userId = String(params['profile-by-id'] || '');
  const router = useRouter();


  const [myId, setMyId] = useState(null);
  useEffect(() => {
    try {
      const raw =
        typeof window !== 'undefined'
          ? localStorage.getItem('authToken') || localStorage.getItem('access_token')
          : null;
      if (!raw) return;
      const d = jwtDecode(raw);
      setMyId(String(d?.sid || d?.sub || d?.userId || d?.nameid || ''));
    } catch (e) {
      console.error('JWT decode error:', e);
    }
  }, []);

 
  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useGetUserProfileByIdQuery(userId, { skip: !userId });

  const {
    data: storiesData,
    isLoading: storiesLoading,
  } = useGetUserStoryByIdQuery(userId, { skip: !userId });

  const user = userData?.data;
  const userStories = storiesData?.data?.stories || [];

  const freshStories = useMemo(
    () =>
      userStories.filter((s) => {
        const t = Date.parse(s?.createAt || s?.createdAt || '');
        if (Number.isNaN(t)) return false;
        return Date.now() - t < 24 * 60 * 60 * 1000;
      }),
    [userStories]
  );
  const hasStory = freshStories.length > 0;

  /** === Мои подписки (для статуса Follow) === */
  const { data: mySubsResp } = useGetSubscriptionsQuery(myId, { skip: !myId });
  const myFollowingIds = useMemo(() => {
    const arr = mySubsResp?.data || [];
    return new Set(
      arr
        .map((u) =>
          String(u?.userShortInfo?.userId || u?.id || u?.userId || u?.followingUserId || '')
        )
        .filter(Boolean)
    );
  }, [mySubsResp]);
  const isFollowing = useMemo(() => myFollowingIds.has(String(userId)), [myFollowingIds, userId]);

  const [addFollowing, { isLoading: followLoading }] = useAddFollowingMutation();
  const [deleteFollowing, { isLoading: unfollowLoading }] = useDeleteFollowingMutation();

  const onToggleFollow = async () => {
    if (!userId) return;
    try {
      if (isFollowing) {
        await deleteFollowing(userId).unwrap();
      } else {
        await addFollowing(userId).unwrap();
      }
    } catch (e) {
      console.error('Follow toggle error:', e);
    }
  };


  const [showProfileImage, setShowProfileImage] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const timerRef = useRef(null);

  const openStoryAt = (idx) => {
    if (!hasStory) return;
    setStoryIndex(idx);
    setStoryOpen(true);
  };
  const closeStory = () => {
    setStoryOpen(false);
    clearTimeout(timerRef.current);
  };

  useEffect(() => {
    if (!storyOpen) return;
    timerRef.current = setTimeout(() => {
      setStoryIndex((i) => {
        if (i < freshStories.length - 1) return i + 1;
        closeStory();
        return i;
      });
    }, 5000);
    return () => clearTimeout(timerRef.current);
  }, [storyOpen, storyIndex, freshStories.length]);




 
  const { data: chatsData } = useGetChatsQuery(undefined, { skip: !myId });
  const myChats = chatsData?.data || [];


  function getPeer(chat, meId) {
    if (String(chat.sendUserId) === String(meId)) {
      return {
        id: chat.receiveUserId,
        name: chat.receiveUserName,
        image: chat.receiveUserImage,
      };
    }
    return {
      id: chat.sendUserId,
      name: chat.sendUserName,
      image: chat.sendUserImage,
    };
 
  }

  const existingChat = useMemo(() => {
    if (!myId) return null;
    return myChats.find((c) => String(getPeer(c, myId).id) === String(userId)) || null;
  }, [myChats, myId, userId]);

  const [createChat, { isLoading: creatingChat }] = useCreateChatMutation();

  async function goToChat() {
    try {
      let chatId;
      let name;
      let avatar;

      if (existingChat) {
        const peer = getPeer(existingChat, myId);
        chatId = existingChat.chatId;
        name = peer.name || user?.userName || 'user';
        avatar = (peer.image || user?.image || '').trim();
      } else {
     
        const res = await createChat(userId).unwrap();
        chatId = res?.data ?? res;
        name = user?.userName || 'user';
        avatar = (user?.image || '').trim();
      }

      router.push(
        `/chats/${chatId}?name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatar)}`
      );
    } catch (e) {
      console.error('Ошибка при открытии/создании чата:', e);
      alert('Не удалось открыть чат');
    }
  }


  const [activeTab, setActiveTab] = useState('posts'); 
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);

  if (userLoading || storiesLoading) return <Skeleton active paragraph={{ rows: 5 }} />;
  if (userError) return <div>Ошибка: {String(userError)}</div>;
  if (!user) return <div>Пользователь не найден</div>;

  return (
    <div className="w-full sm:max-w-[640px] mx-auto sm:ml-[100px] mt-2 sm:mt-5 px-3 sm:px-0">
      {/* HEADER */}
        <section className="w-full flex  sm:flex-row items-start sm:items-start justify-between gap-4 sm:gap-[30px] h-auto sm:h-[160px]">
        <div
          className={
            hasStory
              ? 'p-[3px] rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 cursor-pointer'
              : 'cursor-pointer'
          }
          onClick={() => (hasStory ? openStoryAt(0) : setShowProfileImage(true))}
        >
          <Image
            alt="Profile photo"
            width={160}
            height={160}
            src={IMG(user?.image)}
                 className="h-[96px] w-[96px] sm:h-[160px] sm:w-[160px] object-cover rounded-full bg-white"
          />
        </div>

      <article className="w-[70%] flex flex-col items-start justify-between h-auto sm:h-[142px]">
          <div className="w-full flex sm:flex-row flex-col items-start gap-[20px]">
            <p className="text-[20px] font-[700]">{user.userName}</p>

            {/* Follow/Unfollow */}
            {myId && myId !== String(userId) && (
              <div className='flex items-start gap-[20px] mb-[10px]'>
                <button
                  onClick={onToggleFollow}
                  disabled={followLoading || unfollowLoading}
                  className={`sm:px-9 px-5 py-1 rounded-md text-white font-semibold transition ${
                    isFollowing ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                    <button onClick={goToChat} disabled={creatingChat} className="sm:px-4 sm:hidden px-1 text-[10px]  py-2 sm:py-1 rounded-md border">
              Send message
            </button>
              </div>
            )}

            <button onClick={goToChat} disabled={creatingChat} className="sm:px-4 px-1 sm:block hidden text-[10px]  py-2 rounded-md border">
              Send message
            </button>
          </div>




          <div className="flex gap-6">
            <p className="text-[14px] font-[600]">
              {user.postCount || 0} <span className="text-[#64748B] font-[400]">posts</span>
            </p>

            <p
              className="text-[14px] font-[600] cursor-pointer"
              onClick={() => setFollowersOpen(true)}
            >
              {user.subscribersCount || 0}{' '}
              <span className="text-[#64748B] font-[400]">followers</span>
            </p>

            <p
              className="text-[14px] font-[600] cursor-pointer"
              onClick={() => setFollowingOpen(true)}
            >
              {user.subscriptionsCount || 0}{' '}
              <span className="text-[#64748B] font-[400]">following</span>
            </p>
          </div>

          <p className="text-[20px] font-[700]">
            {user.firstName} {user.lastName}
          </p>
        </article>
      </section>

      {/* Модалка аватара */}
      {showProfileImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="relative">
            <ImCancelCircle
              className="absolute top-2 right-2 text-white text-3xl cursor-pointer"
              onClick={() => setShowProfileImage(false)}
            />
            <Image
              src={IMG(user?.image)}
              alt="Profile large"
              width={400}
              height={400}
              className="object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* STORIES */}
      {hasStory && (
        <div className="p-5 bg-white">
          <Swiper slidesPerView={6} spaceBetween={10} freeMode modules={[FreeMode]}>
            {freshStories.map((story, idx) => (
              <SwiperSlide key={story.id} className="flex flex-col items-center">
                <button onClick={() => openStoryAt(idx)} title="View story">
                  <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      <Image
                        src={IMG(story.fileName)}
                        alt="story"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}




      {/* STORY VIEWER */}
      {storyOpen && freshStories[storyIndex] && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center select-none"
          onClick={(e) => {
            const mid = window.innerWidth / 2;
            if (e.clientX > mid) {
              if (storyIndex < freshStories.length - 1) setStoryIndex(storyIndex + 1);
              else closeStory();
            } else {
              if (storyIndex > 0) setStoryIndex(storyIndex - 1);
            }
          }}
        >
          {/* прогресс */}
          <div className="absolute top-4 left-4 right-4">
            <div className="flex gap-2 mb-3">
              {freshStories.map((_, i) => (
                <div key={i} className="h-1 flex-1 bg-white/30 overflow-hidden rounded">
                  <div
                    className="h-full bg-white"
                    style={{
                      width: i < storyIndex ? '100%' : i === storyIndex ? '100%' : '0%',
                      opacity: i === storyIndex ? 0.9 : 0.6,
                      transition: i === storyIndex ? 'width 5s linear' : 'none',
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <Image
                src={IMG(user?.image)}
                alt="user"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-sm font-semibold">{user?.userName}</span>
            </div>
          </div>

          <Image
            src={IMG(freshStories[storyIndex].fileName)}
            alt="story-large"
            width={800}
            height={800}
            className="max-h-[80vh] w-auto object-contain rounded-xl"
            priority
            unoptimized
          />

          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl"
            onClick={(e) => {
              e.stopPropagation();
              closeStory();
            }}
            title="Close story"
          >
            ×
          </button>
        </div>
      )}

      {/* Вкладки */}
      <div className="flex mt-5">
        <button
          className={`px-4 py-2 ${
            activeTab === 'posts' ? 'text-[#2563EB] border-t-2 border-[#2563EB]' : ''
          }`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'tagged' ? 'text-[#2563EB] border-t-2 border-[#2563EB]' : ''
          }`}
          onClick={() => setActiveTab('tagged')}
        >
          Tagged
        </button>
      </div>

      {/* Контент вкладок */}
      <div className="mt-4">
        {activeTab === 'posts' ? (
          <Posts userId={userId} />
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton.Image key={i} active />
            ))}
          </div>
        )}
      </div>

      {/* Модалки */}
      <FollowersMenu open={followersOpen} onClose={() => setFollowersOpen(false)} userId={userId} />
      <FollowingMenu open={followingOpen} onClose={() => setFollowingOpen(false)} userId={userId} />
    </div>
  );
}