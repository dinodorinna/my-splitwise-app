export type Theme = {
  background: string;
  text: string;
  card: string;
  primary: string;
};

export type Scheme = "light" | "dark";

export type ThemeContextType = {
  theme: Theme;
  scheme: Scheme;
  override: Scheme | null;
  brand: { main: string };
  setOverride: (value: Scheme | null) => void;
};
