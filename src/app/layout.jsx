"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import BottomNavigation from "@/components/layout/bottom-navigation/bottom-navigation";
import MiniSideBar from "@/components/layout/mini-side-bar/mini-side-bar";
import SideBar from "@/components/layout/side-bar/side-bar";
import TranslatorProvider from "@/components/providers/translator-provider";
import ThemeWrapper from "@/components/providers/theme-provider";
import "./globals.css";

export default function RootLayout({ children }) {
  const [windowWidth, setWindowWidth] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Проверка токена в localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);

    // Если не авторизован и не на странице регистрации — перенаправить
    if (!token && pathname !== "/registration") {
      router.push("/registration");
    }

    // Обработка ресайза
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
          
          <ThemeWrapper>
            {/* Если на странице регистрации — без баров */}
            {pathname === "/registration"
              ? children
              : wrapWithBar(children)}
          </ThemeWrapper>
        </body>
      </html>
    </TranslatorProvider>
  );
}
