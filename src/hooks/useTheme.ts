// src/hooks/useTheme.ts
import { useState, useEffect } from 'react';
import { themes } from '../themes'; // Assuming themes.ts is in src/

// Define ThemeColors type based on the structure of a theme in the 'themes' object
type ThemeColors = typeof themes['light'];

export const useTheme = () => {
  const [currentThemeName, setCurrentThemeName] = useState<string>(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    // Default to 'light' if no theme is saved or if the saved theme is not found
    return savedTheme && themes[savedTheme] ? savedTheme : 'light';
  });

  // Apply theme CSS variables to the body
  useEffect(() => {
    const selectedThemeColors: ThemeColors = themes[currentThemeName];
    if (selectedThemeColors) {
      for (const [property, value] of Object.entries(selectedThemeColors)) {
        document.body.style.setProperty(property, value);
      }
    }
    localStorage.setItem('selectedTheme', currentThemeName);
  }, [currentThemeName]);

  return { currentThemeName, setTheme: setCurrentThemeName };
};
