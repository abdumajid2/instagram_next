"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import BottomNavigation from "@/components/layout/bottom-navigation/bottom-navigation";
import MiniSideBar from "@/components/layout/mini-side-bar/mini-side-bar";
import SideBar from "@/components/layout/side-bar/side-bar";

export default function ReduxProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [windowWidth, setWindowWidth] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);

    if (!token && pathname !== "/login") {
      router.push("/login");
    }

    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pathname, router]);

  const barType = useMemo(() => {
    if (windowWidth <= 767) return "bottom";
    if (
      windowWidth <= 1279 ||
      pathname === "/search" ||
      pathname.includes("chat")
    )
      return "minibar";
    return "bar";
  }, [windowWidth, pathname]);

  const wrapWithBar = (content) => {
    switch (barType) {
      case "bottom":
        return <BottomNavigation>{content}</BottomNavigation>;
      case "minibar":
        return <MiniSideBar>{content}</MiniSideBar>;
      default:
        return <SideBar>{content}</SideBar>;
    }
  };

  return (
    <Provider store={store}>
      {pathname === "/login" ? children : wrapWithBar(children)}
    </Provider>
  );
}
