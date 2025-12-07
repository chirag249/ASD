// Animated Components - Micro-interactions
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

// Animated Pressable with scale feedback
export const AnimatedPressable = ({
    children,
    onPress,
    style,
    scaleValue = 0.95,
    hapticFeedback = true,
    disabled = false,
    ...props
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(scaleValue, {
            damping: 15,
            stiffness: 150,
        });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, {
            damping: 15,
            stiffness: 150,
        });
    };

    const handlePress = () => {
        if (hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.();
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={disabled}
            {...props}
        >
            <Animated.View style={[style, animatedStyle]}>
                {children}
            </Animated.View>
        </Pressable>
    );
};

// Fade In Animation
export const FadeIn = ({ children, duration = 250, delay = 0 }) => {
    const opacity = useSharedValue(0);

    React.useEffect(() => {
        opacity.value = withTiming(1, {
            duration,
            delay,
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

// Slide In Animation
export const SlideIn = ({
    children,
    direction = 'bottom',
    duration = 350,
    delay = 0,
    distance = 50,
}) => {
    const translateX = useSharedValue(direction === 'left' ? -distance : direction === 'right' ? distance : 0);
    const translateY = useSharedValue(direction === 'top' ? -distance : direction === 'bottom' ? distance : 0);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
        translateX.value = withSpring(0, {
            damping: 20,
            stiffness: 90,
            delay,
        });
        translateY.value = withSpring(0, {
            damping: 20,
            stiffness: 90,
            delay,
        });
        opacity.value = withTiming(1, {
            duration: duration / 2,
            delay,
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
        opacity: opacity.value,
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

// Shake Animation (for errors)
export const Shake = ({ children, trigger }) => {
    const translateX = useSharedValue(0);

    React.useEffect(() => {
        if (trigger) {
            // Shake sequence
            translateX.value = withTiming(10, { duration: 50 }, () => {
                translateX.value = withTiming(-10, { duration: 50 }, () => {
                    translateX.value = withTiming(10, { duration: 50 }, () => {
                        translateX.value = withTiming(0, { duration: 50 });
                    });
                });
            });

            // Haptic feedback
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    }, [trigger]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

// Success Checkmark Animation
export const SuccessCheckmark = ({ visible, size = 60, color = '#4CAF50' }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
        if (visible) {
            scale.value = withSpring(1, {
                damping: 10,
                stiffness: 100,
            });
            opacity.value = withTiming(1, { duration: 200 });

            // Haptic feedback
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            scale.value = withTiming(0, { duration: 200 });
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.checkmarkContainer, animatedStyle]}>
            <Animated.Text style={[styles.checkmark, { fontSize: size, color }]}>
                ✓
            </Animated.Text>
        </Animated.View>
    );
};

// Pulse Animation (for notifications)
export const Pulse = ({ children, duration = 1000 }) => {
    const scale = useSharedValue(1);

    React.useEffect(() => {
        const pulse = () => {
            scale.value = withTiming(1.1, { duration: duration / 2 }, () => {
                scale.value = withTiming(1, { duration: duration / 2 }, () => {
                    pulse();
                });
            });
        };
        pulse();
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

// Bounce Animation
export const Bounce = ({ children, trigger }) => {
    const translateY = useSharedValue(0);

    React.useEffect(() => {
        if (trigger) {
            translateY.value = withSpring(-20, {
                damping: 5,
                stiffness: 100,
            }, () => {
                translateY.value = withSpring(0, {
                    damping: 8,
                    stiffness: 100,
                });
            });
        }
    }, [trigger]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

const styles = StyleSheet.create({
    checkmarkContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        fontWeight: 'bold',
    },
});

export default {
    AnimatedPressable,
    FadeIn,
    SlideIn,
    Shake,
    SuccessCheckmark,
    Pulse,
    Bounce,
};
