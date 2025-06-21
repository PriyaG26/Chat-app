//when user selects a theme, we want to store it to the local storage

import { create } from "zustand";

export const useThemeStore = create((set) => ({ //returns the theme state
  theme: localStorage.getItem("chat-theme") || "coffee", //if local storage has a theme, then render it, otherwise use coffee as default
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));