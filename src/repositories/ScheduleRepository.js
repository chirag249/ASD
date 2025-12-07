import AsyncStorage from '@react-native-async-storage/async-storage';

const SCHEDULE_KEY = 'SCHEDULE_DATA';

export const getAllItems = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(SCHEDULE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Error reading schedule", e);
        return [];
    }
};

const saveItems = async (items) => {
    try {
        const jsonValue = JSON.stringify(items);
        await AsyncStorage.setItem(SCHEDULE_KEY, jsonValue);
    } catch (e) {
        console.error("Error saving schedule", e);
    }
};

export const createItem = async (itemData) => {
    const items = await getAllItems();
    const newItem = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        ...itemData
    };
    const updatedItems = [...items, newItem];
    await saveItems(updatedItems);
    return updatedItems;
};

export const deleteItem = async (itemId) => {
    const items = await getAllItems();
    const updatedItems = items.filter(i => i.id !== itemId);
    await saveItems(updatedItems);
    return updatedItems;
};
