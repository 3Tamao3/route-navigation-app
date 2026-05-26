import React, { createContext, useContext, useState } from 'react';

export const lightColors = {
  bg: '#f5f5f5',
  card: '#ffffff',
  input: '#fafafa',
  text: '#111111',
  subtext: '#666666',
  muted: '#999999',
  border: '#e0e0e0',
  tabBar: '#ffffff',
  searchBox: '#ffffff',
};

export const darkColors = {
  bg: '#121212',
  card: '#1e1e1e',
  input: '#2a2a2a',
  text: '#f0f0f0',
  subtext: '#aaaaaa',
  muted: '#666666',
  border: '#333333',
  tabBar: '#1a1a1a',
  searchBox: '#1e1e1e',
};

type Colors = typeof lightColors;

type ThemeCtx = {
  isDark: boolean;
  colors: Colors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeCtx>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? darkColors : lightColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
