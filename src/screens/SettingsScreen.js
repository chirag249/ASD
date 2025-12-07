import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import usePreferencesStore from '../store/usePreferencesStore';
import { useTheme } from '../theme/ThemeContext';

export default function SettingsScreen() {
    const theme = useTheme();
    const {
        theme: themeMode,
        notificationSound,
        notificationsEnabled,
        initializePreferences,
        setTheme,
        setNotificationSound,
        toggleNotifications,
    } = usePreferencesStore();

    useEffect(() => {
        initializePreferences();
    }, []);

    const handleThemeChange = (mode) => {
        setTheme(mode);
        // Also update the ThemeContext
        if (mode === 'system') {
            theme.setSystemTheme();
        } else {
            // Update theme context based on selection
            const shouldBeDark = mode === 'dark';
            if (theme.isDarkMode !== shouldBeDark) {
                theme.toggleTheme();
            }
        }
    };

    const handleSoundSelection = () => {
        const sounds = [
            { label: 'Default', value: 'default' },
            { label: 'Chime', value: 'chime' },
            { label: 'Bell', value: 'bell' },
            { label: 'None (Silent)', value: 'none' },
        ];

        Alert.alert(
            'Select Notification Sound',
            'Choose your preferred notification sound',
            sounds.map(sound => ({
                text: sound.label + (notificationSound === sound.value ? ' ✓' : ''),
                onPress: () => setNotificationSound(sound.value),
            })).concat([{ text: 'Cancel', style: 'cancel' }])
        );
    };

    const styles = createStyles(theme);

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
                <Text style={styles.headerSubtitle}>Customize your experience</Text>
            </View>

            {/* General Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>GENERAL</Text>

                {/* Theme Selection */}
                <View style={styles.settingGroup}>
                    <Text style={styles.settingLabel}>Theme</Text>
                    <View style={styles.themeOptions}>
                        <TouchableOpacity
                            style={[
                                styles.themeButton,
                                themeMode === 'light' && styles.themeButtonActive,
                            ]}
                            onPress={() => handleThemeChange('light')}
                        >
                            <Ionicons
                                name="sunny"
                                size={24}
                                color={themeMode === 'light' ? '#007AFF' : theme.colors.text.secondary}
                            />
                            <Text
                                style={[
                                    styles.themeButtonText,
                                    themeMode === 'light' && styles.themeButtonTextActive,
                                ]}
                            >
                                Light
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.themeButton,
                                themeMode === 'dark' && styles.themeButtonActive,
                            ]}
                            onPress={() => handleThemeChange('dark')}
                        >
                            <Ionicons
                                name="moon"
                                size={24}
                                color={themeMode === 'dark' ? '#007AFF' : theme.colors.text.secondary}
                            />
                            <Text
                                style={[
                                    styles.themeButtonText,
                                    themeMode === 'dark' && styles.themeButtonTextActive,
                                ]}
                            >
                                Dark
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.themeButton,
                                themeMode === 'system' && styles.themeButtonActive,
                            ]}
                            onPress={() => handleThemeChange('system')}
                        >
                            <Ionicons
                                name="phone-portrait"
                                size={24}
                                color={themeMode === 'system' ? '#007AFF' : theme.colors.text.secondary}
                            />
                            <Text
                                style={[
                                    styles.themeButtonText,
                                    themeMode === 'system' && styles.themeButtonTextActive,
                                ]}
                            >
                                System
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Notifications Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

                {/* Enable Notifications */}
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={toggleNotifications}
                    activeOpacity={0.7}
                >
                    <View style={styles.settingItemLeft}>
                        <Ionicons
                            name="notifications"
                            size={24}
                            color={theme.colors.primary.main}
                            style={styles.settingIcon}
                        />
                        <View>
                            <Text style={styles.settingItemTitle}>Enable Notifications</Text>
                            <Text style={styles.settingItemDescription}>
                                Receive alerts for scheduled events
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={toggleNotifications}
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={notificationsEnabled ? '#007AFF' : '#f4f3f4'}
                    />
                </TouchableOpacity>

                {/* Notification Sound */}
                <TouchableOpacity
                    style={[styles.settingItem, !notificationsEnabled && styles.settingItemDisabled]}
                    onPress={handleSoundSelection}
                    disabled={!notificationsEnabled}
                    activeOpacity={0.7}
                >
                    <View style={styles.settingItemLeft}>
                        <Ionicons
                            name="volume-high"
                            size={24}
                            color={notificationsEnabled ? theme.colors.primary.main : theme.colors.text.disabled}
                            style={styles.settingIcon}
                        />
                        <View>
                            <Text
                                style={[
                                    styles.settingItemTitle,
                                    !notificationsEnabled && styles.settingItemTitleDisabled,
                                ]}
                            >
                                Notification Sound
                            </Text>
                            <Text
                                style={[
                                    styles.settingItemDescription,
                                    !notificationsEnabled && styles.settingItemDescriptionDisabled,
                                ]}
                            >
                                {notificationSound.charAt(0).toUpperCase() + notificationSound.slice(1)}
                            </Text>
                        </View>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={theme.colors.text.secondary}
                    />
                </TouchableOpacity>
            </View>

            {/* Data Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>DATA</Text>

                {/* Database Info */}
                <View style={styles.settingItem}>
                    <View style={styles.settingItemLeft}>
                        <Ionicons
                            name="server"
                            size={24}
                            color={theme.colors.primary.main}
                            style={styles.settingIcon}
                        />
                        <View>
                            <Text style={styles.settingItemTitle}>Database</Text>
                            <Text style={styles.settingItemDescription}>
                                WatermelonDB - Local Storage
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* About Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ABOUT</Text>

                <View style={styles.settingItem}>
                    <View style={styles.settingItemLeft}>
                        <Ionicons
                            name="information-circle"
                            size={24}
                            color={theme.colors.primary.main}
                            style={styles.settingIcon}
                        />
                        <View>
                            <Text style={styles.settingItemTitle}>Version</Text>
                            <Text style={styles.settingItemDescription}>1.0.0</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom Padding */}
            <View style={styles.bottomPadding} />
        </ScrollView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: theme.colors.background.paper,
        borderBottomWidth: 1,
        borderBottomColor: theme.isDarkMode ? theme.colors.neutral.gray300 : theme.colors.neutral.gray200,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: theme.colors.text.secondary,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.text.secondary,
        paddingHorizontal: 20,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    settingGroup: {
        backgroundColor: theme.colors.background.paper,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.isDarkMode ? theme.colors.neutral.gray300 : theme.colors.neutral.gray200,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: 12,
    },
    themeOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    themeButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: theme.isDarkMode ? theme.colors.neutral.gray200 : theme.colors.neutral.gray100,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    themeButtonActive: {
        borderColor: '#007AFF',
        backgroundColor: theme.isDarkMode ? theme.colors.neutral.gray300 : '#E3F2FD',
    },
    themeButtonText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text.secondary,
    },
    themeButtonTextActive: {
        color: '#007AFF',
        fontWeight: '600',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.background.paper,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: theme.isDarkMode ? theme.colors.neutral.gray300 : theme.colors.neutral.gray200,
        marginBottom: -1, // Prevent double borders
    },
    settingItemDisabled: {
        opacity: 0.5,
    },
    settingItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIcon: {
        marginRight: 16,
    },
    settingItemTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.text.primary,
        marginBottom: 2,
    },
    settingItemTitleDisabled: {
        color: theme.colors.text.disabled,
    },
    settingItemDescription: {
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    settingItemDescriptionDisabled: {
        color: theme.colors.text.disabled,
    },
    bottomPadding: {
        height: 40,
    },
});
