import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Colors, ColorScheme } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ColorScheme;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  colors: Colors.light,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('tema').then(val => {
      if (val === 'dark') setIsDark(true);
    });
  }, []);

  function toggleTheme() {
    const nuevo = !isDark;
    setIsDark(nuevo);
    AsyncStorage.setItem('tema', nuevo ? 'dark' : 'light');
  }

  return (
    <ThemeContext.Provider value={{
      isDark,
      toggleTheme,
      colors: isDark ? Colors.dark : Colors.light,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}