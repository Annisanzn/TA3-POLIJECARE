import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeTest = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <p className="text-gray-900 dark:text-white">
        Current theme: {theme}
      </p>
      <p className="text-gray-900 dark:text-white">
        Is dark: {isDark.toString()}
      </p>
      <button 
        onClick={toggleTheme}
        className="mt-2 px-4 py-2 bg-primary text-white rounded"
      >
        Toggle Theme
      </button>
    </div>
  );
};

export default ThemeTest;
