import { useEffect, useState } from "react";

export default function useDarkSide() {
  const [theme, setTheme] = useState(() => {
    // Check if we are on the client side before accessing localStorage
    if (typeof window !== "undefined" && localStorage.getItem("theme")) {
      return localStorage.getItem("theme");
    }
    // Default to 'light' if no theme is set
    return "light";
  });

  const colorTheme = theme === "dark" ? "light" : "dark";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;

      // Update the theme class on the root element
      root.classList.remove(colorTheme);
      root.classList.add(theme);

      // Save the theme to localStorage
      localStorage.setItem("theme", theme);
    }
  }, [theme, colorTheme]);

  return [colorTheme, setTheme];
}
