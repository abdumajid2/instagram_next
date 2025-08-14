'use client'
import Image from "next/image";
import p from '../../assets/img/pages/profile/profile/p.png'
import { useGetMyProfileQuery, useGetMyStoriesQuery, useGetSubscriptionsQuery, useGetUsersQuery } from "@/store/pages/profile/ProfileApi";
import { CgMenu } from "react-icons/cg";
import { TiThSmallOutline } from "react-icons/ti";
import { FaRegBookmark } from "react-icons/fa6";
import { BsPersonSquare } from "react-icons/bs";
import { useState } from "react";
import Posts from "@/app/profile/posts/page";
import Saved from "@/app/profile/saved/page"; 
import { ImCancelCircle } from "react-icons/im";
import Link from "next/link";
import { Input, QRCode, Space } from 'antd';
import { useGetSubscribersQuery } from "@/store/pages/notification/notification";
export default function Profile() {
  const { data, isLoading, isError } = useGetMyProfileQuery();
  const profile = data?.data;

  const { data: getMyStories } = useGetMyStoriesQuery();
  const stories = getMyStories?.data?.stories || [];

  const {data:getUsers}=useGetUsersQuery()

 
  
 const { data: subscribersData } = useGetSubscribersQuery(profile?.id, { skip: !profile?.id });
const { data: subscriptionsData } = useGetSubscriptionsQuery(profile?.id, { skip: !profile?.id });


const followers = subscribersData?.data || [];
const followings = subscriptionsData?.data || [];


  const [activeTab, setActiveTab] = useState("posts"); 
const [isMenuLoading, setIsMenuLoading] = useState(false);
const [showQRCode, setShowQRCode] = useState(false);

const [modalType, setModalType] = useState(""); // "followers" | "followings"
const [searchText, setSearchText] = useState("");




  if (isLoading) return <p>Загрузка...</p>;
  if (isError) return <p>Ошибка при загрузке данных</p>;

  return (
    <div className="sm:max-w-[640px] ml-[100px] mt-5">
      {/* HEADER */}
      <section className="w-full flex items-center justify-between  h-[160px] ">
        <Image
          alt="Profile photo"
          width={160}
          height={160}
          src={profile.image === "" ? `${p.src}` : profile.image}
        />
{isMenuLoading && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-[500px]   flex flex-col gap-[30px] p-[50px] rounded-4xl bg-white">
     <ImCancelCircle className="ml-auto text-2xl" onClick={()=>setIsMenuLoading(false)} />
 <p className="text-2xl font-bold"  onClick={() => {setShowQRCode(true),setIsMenuLoading(false)}}>Qr code</p>
 <Link href={'/notification'}>   
    <p className="text-2xl font-bold">Notification</p></Link>
    <Link href={'/setting'}>   
    <p className="text-2xl font-bold" >Settings and privacy</p></Link>
  <p
  className="text-red-600 text-2xl font-bold cursor-pointer"
  onClick={() => {
    localStorage.removeItem("authToken"); 
    setIsMenuLoading(false);         
    window.location.href = "/login"; 
  }}
>
  Log out
</p>
    </div>
  </div>
)}
{showQRCode && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-[400px] h-[400px] flex flex-col gap-4 p-6 rounded-2xl bg-white items-center justify-center">
      <ImCancelCircle
        className="ml-auto text-2xl cursor-pointer"
        onClick={() => setShowQRCode(false)}
      />
      <QRCode value="https://ant.design/" size={300} />
    </div>
  </div>
)}



        <article className="sm:w-[456px] flex flex-col items-start justify-between sm:h-[142px] ">
          <div className="w-full flex items-center justify-between">
            <p className="text-[20px] font-[700]">{profile.userName}</p>
            <button className="bg-[#F3F4F6] w-[105px] h-[40px] rounded-xl flex items-center justify-center">Edit profile</button>
            <button className="bg-[#F3F4F6] w-[105px] h-[40px] rounded-xl flex items-center justify-center">View archive</button>
            <CgMenu className="text-2xl"   onClick={() => setIsMenuLoading(true)} />
          </div>

     <div className="flex w-full items-start gap-7">
  <p className="text-[14px] font-[600]">{profile.postCount} <span className="text-[#64748B] font-[400]">posts</span></p>
  <p 
    className="text-[14px] font-[600] cursor-pointer"
    onClick={() => { setModalType("followers"); setSearchText(""); }}
  >
    {profile.subscribersCount} <span className="text-[#64748B] font-[400]">followers</span>
  </p>
  <p 
    className="text-[14px] font-[600] cursor-pointer"
    onClick={() => { setModalType("followings"); setSearchText(""); }}
  >
    {profile.subscriptionsCount} <span className="text-[#64748B] font-[400]">following</span>
  </p>
</div>

          <p className="text-[20px] font-[700]">{profile.firstName}</p>
        </article>
      </section>

{modalType && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="w-[400px] max-h-[500px] overflow-y-auto flex flex-col gap-4 p-6 rounded-2xl bg-white">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{modalType === "followers" ? "Followers" : "Following"}</h2>
        <ImCancelCircle className="text-2xl cursor-pointer" onClick={() => setModalType("")} />
      </div>

      <Input 
        placeholder="Search..." 
        value={searchText} 
        onChange={(e) => setSearchText(e.target.value)}
      />

      <div className="flex flex-col gap-3 mt-2">
        {(modalType === "followers" ? followers : followings)
          .filter(user => user.userShortInfo.userName.toLowerCase().includes(searchText.toLowerCase()))
          .map(user => (
            <div key={user.userShortInfo.userId} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Image
                  src={user.userShortInfo.userPhoto || p.src}
                  width={40}
                  height={40}
                  className="rounded-full"
                  alt={user.userShortInfo.userName}
                />
                <p className="font-[500]">{user.userShortInfo.userName}</p>
              </div>
              {/* Кнопка Follow если нужно */}
              {modalType === "followers" && !followings.find(f => f.userShortInfo.userId === user.userShortInfo.userId) && (
                <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={() => alert('Follow logic')}>
                  Follow
                </button>
              )}
            </div>
        ))}
      </div>
    </div>
  </div>
)}

      {/* STORIES */}
      <div className="flex items-center space-x-5 p-5 bg-white">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500">
              <Image 
                src={`http://37.27.29.18:8003/images/${story.fileName}`}
                className="object-cover bg-center bg-cover"
                alt="story"
                width={100}
                height={100}
              />
            </div>
          </div>
        ))}

        <button className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700">
          <span className="text-3xl font-bold leading-none">+</span>
          <p className="text-xs mt-1">New</p>
        </button>
      </div>

      {/* TABS */}
      <section className="w-full bg my-[30px] p-[20px] border-t flex items-center justify-center space-x-10 border-gray-400">
        <article 
          onClick={() => setActiveTab("posts")}
          className={`cursor-pointer font-[500] flex items-center gap-[10px] 
          ${activeTab === "posts" ? "text-[#2563EB] border-t-2 border-[#2563EB]" : "text-[#64748B]"}`}>
          <TiThSmallOutline className="text-xl" />
          <p>Posts</p>
        </article>

        <article 
          onClick={() => setActiveTab("saved")}
          className={`cursor-pointer font-[500] flex items-center gap-[10px] 
          ${activeTab === "saved" ? "text-[#2563EB] border-t-2 border-[#2563EB]" : "text-[#64748B]"}`}>
          <FaRegBookmark className="text-xl" />
          <p>Saved</p>
        </article>

        <article 
          onClick={() => setActiveTab("tagged")}
          className={`cursor-pointer font-[500] flex items-center gap-[10px] 
          ${activeTab === "tagged" ? "text-[#2563EB] border-t-2 border-[#2563EB]" : "text-[#64748B]"}`}>
          <BsPersonSquare className="text-xl" />
          <p>Tagged</p>
        </article>
      </section>

      {/* TAB CONTENT */}
      <div className="">
        {activeTab === "posts" && <Posts />}
        {activeTab === "saved" && <Saved />}
        {activeTab === "tagged" && <p>Tagged content</p>}
      </div>
    </div>
  );
}
