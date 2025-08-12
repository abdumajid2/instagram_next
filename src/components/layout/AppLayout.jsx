// components/layout/AppLayout.jsx
"use client";

import { useMemo, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BottomNavigation from "@/components/layout/bottom-navigation/bottom-navigation";
import MiniSideBar from "@/components/layout/mini-side-bar/mini-side-bar";
import SideBar from "@/components/layout/side-bar/side-bar";

export default function AppLayout({ children }) {
  const [windowWidth, setWindowWidth] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) router.push("/login");

    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  const barType = useMemo(() => {
    if (windowWidth <= 767) return "bottom";
    if (windowWidth <= 1279 || pathname === "/search" || pathname.includes("chat"))
      return "minibar";
    return "bar";
  }, [windowWidth, pathname]);

  switch (barType) {
    case "bottom":
      return <BottomNavigation>{children}</BottomNavigation>;
    case "minibar":
      return <MiniSideBar>{children}</MiniSideBar>;
    default:
      return <SideBar>{children}</SideBar>;
  }
}
