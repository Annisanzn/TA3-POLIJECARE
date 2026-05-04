import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // POIN: Mematikan dark mode sepenuhnya sesuai permintaan user
  // Mengunci tema ke 'light'
  const [theme] = useState('light');

  useEffect(() => {
    const root = document.documentElement;
    // Selalu hapus class dark untuk memastikan mode terang aktif
    root.classList.remove('dark');
    // Hapus juga dari localStorage agar tidak ada sisa preferensi
    localStorage.removeItem('theme');
  }, []);

  // Fungsi toggle dibuat tidak melakukan apa-apa
  const toggleTheme = () => {
    console.log('Dark mode has been disabled by system administrator.');
  };

  const value = {
    theme: 'light',
    toggleTheme,
    isDark: false
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
