import Posts from "@/components/pages/home/posts/posts";

export default function Main() {
  return (
    <div className="p-7">
      <main className="flex gap-7 justify-between ">
        
        <Posts />
        <div className="w-[40%] bg-gray-300"></div>
      </main>
    </div>
  );
}
