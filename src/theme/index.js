// Design System - Main Export
// Central theme configuration

import Colors from './colors';
import Spacing from './spacing';
import Typography from './typography';

export const Theme = {
    colors: Colors,
    typography: Typography,
    spacing: Spacing,

    // Border Radius
    borderRadius: {
        none: 0,
        sm: 4,
        base: 8,
        md: 10,
        lg: 12,
        xl: 16,
        '2xl': 20,
        '3xl': 24,
        full: 9999,
    },

    // Shadows (iOS-style)
    shadows: {
        none: {
            shadowColor: 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
        },
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        base: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 4,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
        },
        xl: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 6,
        },
    },

    // Opacity
    opacity: {
        disabled: 0.5,
        hover: 0.8,
        pressed: 0.6,
        overlay: 0.4,
    },

    // Animation Durations
    animation: {
        fast: 150,
        base: 250,
        slow: 350,
    },

    // Z-Index
    zIndex: {
        base: 0,
        dropdown: 1000,
        sticky: 1100,
        fixed: 1200,
        modalBackdrop: 1300,
        modal: 1400,
        popover: 1500,
        tooltip: 1600,
    },
};

// Helper function to get theme value
export const getThemeValue = (path, theme = Theme) => {
    return path.split('.').reduce((obj, key) => obj?.[key], theme);
};

export { Colors, Spacing, Typography };
export default Theme;
