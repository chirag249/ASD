import database from '../database';

/**
 * Get a setting by key
 * @param {string} key - The setting key
 * @returns {Promise<string|null>} The setting value or null if not found
 */
export async function getSetting(key) {
    try {
        const settingsCollection = database.get('user_settings');
        const settings = await settingsCollection.query().fetch();
        const setting = settings.find(s => s.key === key);
        return setting ? setting.value : null;
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
        const settingsCollection = database.get('user_settings');
        const settings = await settingsCollection.query().fetch();
        const existingSetting = settings.find(s => s.key === key);

        await database.write(async () => {
            if (existingSetting) {
                // Update existing setting
                await existingSetting.update(setting => {
                    setting.value = value;
                    setting.updatedAt = Date.now();
                });
            } else {
                // Create new setting
                await settingsCollection.create(setting => {
                    setting.key = key;
                    setting.value = value;
                    setting.updatedAt = Date.now();
                });
            }
        });
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
        const settingsCollection = database.get('user_settings');
        const settings = await settingsCollection.query().fetch();

        const settingsObject = {};
        settings.forEach(setting => {
            settingsObject[setting.key] = setting.value;
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
