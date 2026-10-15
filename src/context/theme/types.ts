export type Theme = {
    background: string;
    text: string;
    card: string;
    primary: string;
};

export type Scheme = 'light' | 'dark';

export type Themes = Record<Scheme, Theme> & {
    main: { primary: string; dark: string };
    palate: {
        black: string;
        white: string;
        gray: string;
        lightGray: string;
        darkGray: string;
    };
};

export type ThemeContextType = {
    mode: Theme;
    themes: Themes;
    scheme: Scheme;
    override: Scheme | null;
    brand: { main: string };
    setOverride: (value: Scheme | null) => void;
};
