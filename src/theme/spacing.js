// Design System - Spacing
// Consistent spacing values (4px base scale)

export const Spacing = {
    // Base spacing unit (4px)
    unit: 4,

    // Spacing scale (multiples of 4)
    xs: 4,      // 4px
    sm: 8,      // 8px
    md: 12,     // 12px
    base: 16,   // 16px (default)
    lg: 20,     // 20px
    xl: 24,     // 24px
    '2xl': 32,  // 32px
    '3xl': 40,  // 40px
    '4xl': 48,  // 48px
    '5xl': 64,  // 64px
    '6xl': 80,  // 80px

    // Semantic spacing
    padding: {
        xs: 4,
        sm: 8,
        md: 12,
        base: 16,
        lg: 20,
        xl: 24,
    },

    margin: {
        xs: 4,
        sm: 8,
        md: 12,
        base: 16,
        lg: 20,
        xl: 24,
    },

    gap: {
        xs: 4,
        sm: 8,
        md: 12,
        base: 16,
        lg: 20,
        xl: 24,
    },

    // Component-specific spacing
    screen: {
        horizontal: 20,  // Horizontal padding for screens
        vertical: 20,    // Vertical padding for screens
        top: 50,         // Top padding (accounting for status bar)
    },

    card: {
        padding: 16,
        margin: 12,
        gap: 12,
    },

    list: {
        itemPadding: 16,
        itemGap: 12,
        sectionGap: 24,
    },

    button: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 8,
    },

    input: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    // Touch targets (minimum 44x44 for accessibility)
    touchTarget: {
        minimum: 44,
        recommended: 48,
    },
};

export default Spacing;
