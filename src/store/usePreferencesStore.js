import { create } from 'zustand';
import * as UserSettingRepository from '../repositories/UserSettingRepository';

const usePreferencesStore = create((set, get) => ({
    // State
    theme: 'light', // 'light' | 'dark' | 'system'
    notificationSound: 'default', // 'default' | 'chime' | 'bell' | 'none'
    notificationsEnabled: true,
    isLoading: true,

    // Initialize preferences from database
    initializePreferences: async () => {
        set({ isLoading: true });
        try {
            await UserSettingRepository.initializeDefaultSettings();
            const settings = await UserSettingRepository.getAllSettings();

            set({
                theme: settings.theme || 'light',
                notificationSound: settings.notificationSound || 'default',
                notificationsEnabled: settings.notificationsEnabled === 'true',
                isLoading: false,
            });
        } catch (error) {
            console.error('Failed to initialize preferences:', error);
            set({ isLoading: false });
        }
    },

    // Set theme
    setTheme: async (theme) => {
        try {
            await UserSettingRepository.setSetting('theme', theme);
            set({ theme });
        } catch (error) {
            console.error('Failed to set theme:', error);
        }
    },

    // Set notification sound
    setNotificationSound: async (sound) => {
        try {
            await UserSettingRepository.setSetting('notificationSound', sound);
            set({ notificationSound: sound });
        } catch (error) {
            console.error('Failed to set notification sound:', error);
        }
    },

    // Toggle notifications
    toggleNotifications: async () => {
        const newValue = !get().notificationsEnabled;
        try {
            await UserSettingRepository.setSetting('notificationsEnabled', String(newValue));
            set({ notificationsEnabled: newValue });
        } catch (error) {
            console.error('Failed to toggle notifications:', error);
        }
    },
}));

export default usePreferencesStore;
