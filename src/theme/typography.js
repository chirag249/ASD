// Design System - Typography
// Consistent fonts and text styles

export const Typography = {
    // Font Families
    fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
        // For custom fonts, use:
        // regular: 'Inter-Regular',
        // medium: 'Inter-Medium',
        // bold: 'Inter-Bold',
    },

    // Font Sizes (using 4px scale)
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 28,
        '4xl': 32,
        '5xl': 36,
        '6xl': 48,
    },

    // Font Weights
    fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
    },

    // Line Heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
        loose: 2,
    },

    // Text Styles (Predefined combinations)
    styles: {
        // Headers
        h1: {
            fontSize: 32,
            fontWeight: '700',
            lineHeight: 1.2,
        },
        h2: {
            fontSize: 28,
            fontWeight: '700',
            lineHeight: 1.2,
        },
        h3: {
            fontSize: 24,
            fontWeight: '600',
            lineHeight: 1.3,
        },
        h4: {
            fontSize: 20,
            fontWeight: '600',
            lineHeight: 1.4,
        },
        h5: {
            fontSize: 18,
            fontWeight: '600',
            lineHeight: 1.4,
        },
        h6: {
            fontSize: 16,
            fontWeight: '600',
            lineHeight: 1.5,
        },

        // Body Text
        bodyLarge: {
            fontSize: 18,
            fontWeight: '400',
            lineHeight: 1.5,
        },
        body: {
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 1.5,
        },
        bodySmall: {
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 1.5,
        },

        // Labels
        label: {
            fontSize: 14,
            fontWeight: '500',
            lineHeight: 1.4,
        },
        labelSmall: {
            fontSize: 12,
            fontWeight: '500',
            lineHeight: 1.4,
        },

        // Captions
        caption: {
            fontSize: 12,
            fontWeight: '400',
            lineHeight: 1.4,
        },
        captionBold: {
            fontSize: 12,
            fontWeight: '600',
            lineHeight: 1.4,
        },

        // Buttons
        button: {
            fontSize: 16,
            fontWeight: '600',
            lineHeight: 1.2,
        },
        buttonSmall: {
            fontSize: 14,
            fontWeight: '600',
            lineHeight: 1.2,
        },

        // Special
        overline: {
            fontSize: 12,
            fontWeight: '600',
            lineHeight: 1.2,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
    },
};

export default Typography;
