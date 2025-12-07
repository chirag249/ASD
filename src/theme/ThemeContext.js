// Theme Context - Dark Mode Support
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import Theme from './index';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isSystemTheme, setIsSystemTheme] = useState(true);

    // Load theme preference on mount
    useEffect(() => {
        loadThemePreference();
    }, []);

    // Listen to system theme changes
    useEffect(() => {
        if (isSystemTheme) {
            const subscription = Appearance.addChangeListener(({ colorScheme }) => {
                setIsDarkMode(colorScheme === 'dark');
            });
            return () => subscription.remove();
        }
    }, [isSystemTheme]);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme_preference');
            const savedIsSystem = await AsyncStorage.getItem('theme_is_system');

            if (savedIsSystem !== null) {
                const useSystem = savedIsSystem === 'true';
                setIsSystemTheme(useSystem);

                if (useSystem) {
                    const colorScheme = Appearance.getColorScheme();
                    setIsDarkMode(colorScheme === 'dark');
                } else if (savedTheme !== null) {
                    setIsDarkMode(savedTheme === 'dark');
                }
            } else {
                // Default to system theme
                const colorScheme = Appearance.getColorScheme();
                setIsDarkMode(colorScheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    };

    const toggleTheme = async () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        setIsSystemTheme(false);

        try {
            await AsyncStorage.setItem('theme_preference', newMode ? 'dark' : 'light');
            await AsyncStorage.setItem('theme_is_system', 'false');
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    const setSystemTheme = async () => {
        setIsSystemTheme(true);
        const colorScheme = Appearance.getColorScheme();
        setIsDarkMode(colorScheme === 'dark');

        try {
            await AsyncStorage.setItem('theme_is_system', 'true');
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
    };

    // Get current theme colors
    const colors = isDarkMode ? Theme.colors.dark : Theme.colors;

    const theme = {
        ...Theme,
        colors,
        isDarkMode,
        isSystemTheme,
        toggleTheme,
        setSystemTheme,
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
