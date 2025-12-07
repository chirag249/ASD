// Design System - Color Palette
// Consistent colors across the entire app

export const Colors = {
    // Primary Colors (Productivity - Calming Blue)
    primary: {
        main: '#007AFF',      // iOS Blue - Main brand color
        light: '#4A9EFF',     // Lighter variant
        dark: '#0051D5',      // Darker variant
        background: '#E3F2FD', // Very light blue background
    },

    // Secondary Colors (Productivity - Green for success)
    secondary: {
        main: '#4CAF50',      // Green - Success, completion
        light: '#81C784',     // Lighter green
        dark: '#388E3C',      // Darker green
        background: '#E8F5E9', // Very light green background
    },

    // Accent Colors (Entertainment - Vibrant)
    accent: {
        purple: '#9C27B0',    // Nonogram
        orange: '#FF5722',    // Minesweeper, alerts
        cyan: '#00BCD4',      // Hitori
        teal: '#4ECDC4',      // 2048
        pink: '#E91E63',      // Memory game
        amber: '#FFC107',     // Warnings, hints
    },

    // Neutral Colors
    neutral: {
        white: '#FFFFFF',
        black: '#000000',
        gray50: '#FAFAFA',
        gray100: '#F5F5F5',
        gray200: '#EEEEEE',
        gray300: '#E0E0E0',
        gray400: '#BDBDBD',
        gray500: '#9E9E9E',
        gray600: '#757575',
        gray700: '#616161',
        gray800: '#424242',
        gray900: '#212121',
    },

    // Semantic Colors
    semantic: {
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3',
    },

    // Text Colors
    text: {
        primary: '#212121',
        secondary: '#757575',
        disabled: '#BDBDBD',
        inverse: '#FFFFFF',
    },

    // Background Colors
    background: {
        default: '#F5F5F5',
        paper: '#FFFFFF',
        elevated: '#FFFFFF',
    },

    // Dark Mode Colors
    dark: {
        primary: {
            main: '#4A9EFF',
            light: '#7BB8FF',
            dark: '#1976D2',
            background: '#1A237E',
        },
        secondary: {
            main: '#81C784',
            light: '#A5D6A7',
            dark: '#66BB6A',
            background: '#1B5E20',
        },
        neutral: {
            gray50: '#121212',
            gray100: '#1E1E1E',
            gray200: '#2C2C2C',
            gray300: '#383838',
            gray400: '#4A4A4A',
            gray500: '#6C6C6C',
            gray600: '#8E8E8E',
            gray700: '#B0B0B0',
            gray800: '#D2D2D2',
            gray900: '#F5F5F5',
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#B0B0B0',
            disabled: '#6C6C6C',
            inverse: '#000000',
        },
        background: {
            default: '#121212',
            paper: '#1E1E1E',
            elevated: '#2C2C2C',
        },
    },

    // Tab Bar Colors
    tabBar: {
        active: '#007AFF',
        inactive: '#757575',
        background: '#FFFFFF',
        darkBackground: '#1E1E1E',
    },

    // Game-Specific Colors
    games: {
        sudoku: '#007AFF',
        memory: '#FF6B6B',
        puzzle2048: '#4ECDC4',
        nonogram: '#9C27B0',
        minesweeper: '#FF5722',
        hitori: '#00BCD4',
    },
};

export default Colors;
