
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  compactMode: boolean;
  setCompactMode: (compact: boolean) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  compactMode: false,
  setCompactMode: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("ui-theme") as Theme) || defaultTheme
  );
  
  const [compactMode, setCompactMode] = useState<boolean>(
    localStorage.getItem("ui-compact-mode") === "true"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    localStorage.setItem("ui-theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (compactMode) {
      root.classList.add("compact");
    } else {
      root.classList.remove("compact");
    }
    
    localStorage.setItem("ui-compact-mode", compactMode.toString());
  }, [compactMode]);

  const value = {
    theme,
    setTheme,
    compactMode,
    setCompactMode,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  
  return context;
};
