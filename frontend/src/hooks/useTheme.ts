"use client";

import { useEffect, useState } from "react";

type Theme = "corporate" | "midnight" | "cyberpunk";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("corporate");

  useEffect(() => {
    const saved = localStorage.getItem("stratosai-theme") as Theme | null;
    if (saved) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("stratosai-theme", newTheme);
  };

  return { theme, setTheme };
}
