'use client'
import Image from "next/image";
import p from '../../assets/img/pages/profile/profile/p.png'
import { useGetMyProfileQuery } from "@/store/pages/profile/ProfileApi";

export default function Profile() {

  const { data, isLoading, isError, refetch } = useGetMyProfileQuery();
   const profile = data?.data;


 if (isLoading) return <p>Загрузка продуктов...</p>;
  if (isError) return <p>Ошибка при загрузке данных</p>;
	return (
		<>
			<div className="sm:max-w-[640px] bg-blue-600 ml-[100px] ">



<section className="w-full flex items-center justify-between h-[160px] bg-amber-600">
<Image
  alt="Profile photo"
  width={160}
  height={160}
  src={profile.image === "" ? `${p.src}` : profile.image}
/>


<article className="sm:w-[456px] flex flex-col items-start justify-between sm:h-[142px] bg-cyan-600">
<div className="w-full flex items-start justify-between">
<p className="text-[20px] font-[700]">{profile.userName}</p>
<button className="bg-[#F3F4F6] w-[105px] h-[40px] rounded-xl flex items-center justify-center">Edit profile</button>
<button className="bg-[#F3F4F6] w-[105px] h-[40px] rounded-xl flex items-center justify-center">View archive</button>
<p>----</p>
</div>



<div className="flex w-full items-start gap-7">
<p className="text-[14px] font-[600]"> {profile.postCount} <span className="text-[#64748B] font-[400]">posts</span></p>
<p className="text-[14px] font-[600]"> {profile.subscribersCount} <span className="text-[#64748B] font-[400]">followers</span></p>
<p className="text-[14px] font-[600]"> {profile.subscriptionsCount} <span className="text-[#64748B] font-[400]">following</span></p>
</div>

<p className="text-[20px] font-[700]">{profile.firstName}</p>

</article>

</section>

<section>
		
</section>





			</div>
		</>
	)
}
