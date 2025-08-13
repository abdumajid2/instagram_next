'use client'
import Image from "next/image";
import p from '../../assets/img/pages/profile/profile/p.png'
import { useGetMyProfileQuery, useGetMyStoriesQuery } from "@/store/pages/profile/ProfileApi";
import { CgMenu } from "react-icons/cg";
import { TiThSmallOutline } from "react-icons/ti";
import { FaRegBookmark } from "react-icons/fa6";
import { BsPersonSquare } from "react-icons/bs";
import Link from "next/link";
import Posts from "@/components/pages/profile/profile/posts/posts";
export default function Profile() {

  const { data, isLoading, isError, refetch } = useGetMyProfileQuery();
   const profile = data?.data;
     const { data:getMyStories } = useGetMyStoriesQuery()
const stories = getMyStories?.data?.stories || [];


 if (isLoading) return <p>Загрузка продуктов...</p>;
  if (isError) return <p>Ошибка при загрузке данных</p>;
	return (
		<>
			<div className="sm:max-w-[640px] ml-[100px] ">



<section className="w-full flex items-center justify-between  h-[160px] ">
<Image
  alt="Profile photo"
  width={160}
  height={160}
  src={profile.image === "" ? `${p.src}` : profile.image}
/>


<article className="sm:w-[456px] flex flex-col items-start justify-between sm:h-[142px] ">
<div className="w-full flex items-center justify-between">
<p className="text-[20px] font-[700]">{profile.userName}</p>
<button className="bg-[#F3F4F6] w-[105px] h-[40px] rounded-xl flex items-center justify-center">Edit profile</button>
<button className="bg-[#F3F4F6] w-[105px] h-[40px] rounded-xl flex items-center justify-center">View archive</button>
<CgMenu className="text-2xl" />
</div>



<div className="flex w-full items-start gap-7">
<p className="text-[14px] font-[600]"> {profile.postCount} <span className="text-[#64748B] font-[400]">posts</span></p>
<p className="text-[14px] font-[600]"> {profile.subscribersCount} <span className="text-[#64748B] font-[400]">followers</span></p>
<p className="text-[14px] font-[600]"> {profile.subscriptionsCount} <span className="text-[#64748B] font-[400]">following</span></p>
</div>

<p className="text-[20px] font-[700]">{profile.firstName}</p>

</article>

</section>

  <div className="flex items-center space-x-5 p-5 bg-white    ">
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500">
        <Image 
          src={`http://37.27.29.18:8003/images/${story.fileName}`}
  className="object-cover  bg-center bg-cover"
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


<section className="w-full my-[30px] p-[20px] border-t flex items-center justify-center space-x-10  border-gray-400">
<article className="text-[#64748B] font-[500]  hover:text-[#2563EB]  hover:border-t-2 border-[#2563EB] flex items-center gap-[10px]">
<TiThSmallOutline className="text-xl" />
<p>Posts</p>
</article>


<article className="text-[#64748B] font-[500] hover:text-[#2563EB]  hover:border-t-2 border-[#2563EB] flex items-center gap-[10px]">
<FaRegBookmark  className="text-xl" />
<p>Saved</p>
</article>
<article className="text-[#64748B] font-[500] hover:text-[#2563EB]  hover:border-t-2 border-[#2563EB] flex items-center gap-[10px]">
<BsPersonSquare   className="text-xl" />
<p>Tagged</p>
</article>
</section>
  <Posts/>



			</div>
		</>
	)
}
