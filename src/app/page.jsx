import AsideOfHome from "@/components/pages/home/asidePartOfHome.jsx/asideOfHome";
import Posts from "@/components/pages/home/posts/posts";

export default function Main() {
  return (
    <div className="p-3">
      <main className="flex gap-7 justify-between ">
        <Posts />
        <AsideOfHome />
      </main>
    </div>
  );
}
