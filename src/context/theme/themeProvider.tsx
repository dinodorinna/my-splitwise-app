import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReactNode, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { Scheme, Theme } from "./types";
import { ThemeContext } from "./themeContext";

type ThemeProviderProps = {
  children: ReactNode;
};

const STORAGE_KEY = "themePreference";
const themes: Record<Scheme, Theme> = {
  light: {
    background: "#ffffff",
    text: "#000000",
    card: "#f2f2f2",
    primary: "#007AFF",
  },
  dark: {
    background: "#0B0F17",
    text: "#ffffff",
    card: "#1c1c1e",
    primary: "#0A84FF",
  },
};

const brand = {
  main: "#1CC29F",
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [override, setOverrideState] = useState<Scheme | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "light" || saved === "dark") setOverrideState(saved);
      setIsLoaded(true);
    });
  }, []);

  const setOverride = (value: Scheme | null) => {
    setOverrideState(value);
    if (value === null) {
      AsyncStorage.removeItem(STORAGE_KEY);
    } else {
      AsyncStorage.setItem(STORAGE_KEY, value);
    }
  };

  const scheme: Scheme = override ?? (systemScheme as Scheme) ?? "light";
  const theme = themes[scheme];

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider
      value={{ theme, scheme, override, brand, setOverride }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
