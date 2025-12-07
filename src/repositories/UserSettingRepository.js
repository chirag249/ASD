import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Get a setting by key
 * @param {string} key - The setting key
 * @returns {Promise<string|null>} The setting value or null if not found
 */
export async function getSetting(key) {
    try {
        const value = await AsyncStorage.getItem(`@settings:${key}`);
        return value;
    } catch (error) {
        console.error('Error getting setting:', error);
        return null;
    }
}

/**
 * Set a setting value
 * @param {string} key - The setting key
 * @param {string} value - The setting value
 */
export async function setSetting(key, value) {
    try {
        await AsyncStorage.setItem(`@settings:${key}`, value);
    } catch (error) {
        console.error('Error setting setting:', error);
        throw error;
    }
}

/**
 * Get all settings as a key-value object
 * @returns {Promise<Object>} Object with all settings
 */
export async function getAllSettings() {
    try {
        const keys = ['theme', 'notificationSound', 'notificationsEnabled'];
        const values = await AsyncStorage.multiGet(keys.map(k => `@settings:${k}`));

        const settingsObject = {};
        values.forEach(([key, value]) => {
            const settingKey = key.replace('@settings:', '');
            if (value !== null) {
                settingsObject[settingKey] = value;
            }
        });

        return settingsObject;
    } catch (error) {
        console.error('Error getting all settings:', error);
        return {};
    }
}

/**
 * Initialize default settings if they don't exist
 */
export async function initializeDefaultSettings() {
    try {
        const currentSettings = await getAllSettings();

        const defaults = {
            theme: 'light',
            notificationSound: 'default',
            notificationsEnabled: 'true',
        };

        for (const [key, defaultValue] of Object.entries(defaults)) {
            if (!(key in currentSettings)) {
                await setSetting(key, defaultValue);
            }
        }
    } catch (error) {
        console.error('Error initializing default settings:', error);
    }
}
