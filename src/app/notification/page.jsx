"use client";

import { useGetSubscribersQuery } from "@/store/pages/notification/notification";


export default function Notification() {
  // Здесь можно подставить реальный userId
  const userId = 1;
  const { data, error, isLoading } = useGetSubscribersQuery(userId);

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка при загрузке</p>;

  return (
    <>
      {data?.map((e) => (
        <div key={e.id} className="border border-black p-2">
          <p>{e.name}</p>
        </div>
      ))}
    </>
  );
}


