
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import BottomNavigation from "@/components/layout/bottom-navigation/bottom-navigation";
import MiniSideBar from "@/components/layout/mini-side-bar/mini-side-bar";
import SideBar from "@/components/layout/side-bar/side-bar";
import TranslatorProvider from "@/components/providers/translator-provider";
import ThemeWrapper from "@/components/providers/theme-provider";
import "./globals.css";
import ReduxProvider from "@/components/providers/redux-toolkit";

export default function RootLayout({ children }) {
  const [windowWidth, setWindowWidth] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
    <TranslatorProvider>
      <html lang="en">
        <body className="h-full">
          <ReduxProvider>
            <ThemeWrapper>
             
              {pathname === "/login" ? children : wrapWithBar(children)}
            </ThemeWrapper>
          </ReduxProvider>
        </body>
      </html>
    </TranslatorProvider>
  );
}
