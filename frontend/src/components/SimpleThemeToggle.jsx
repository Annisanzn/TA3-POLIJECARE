import React from 'react';

const SimpleThemeToggle = () => {
  const handleToggle = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    
    console.log('Current dark mode:', isDark);
    
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('Switched to light mode');
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('Switched to dark mode');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Toggle Theme (Simple)
    </button>
  );
};

export default SimpleThemeToggle;
