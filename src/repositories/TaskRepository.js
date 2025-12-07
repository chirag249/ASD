import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'TASKS_DATA';

// Helper to simulate Observable behavior slightly or just simple fetch
export const getAllTasks = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(TASKS_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Error reading tasks", e);
        return [];
    }
};

// Helper to save all tasks
const saveTasks = async (tasks) => {
    try {
        const jsonValue = JSON.stringify(tasks);
        await AsyncStorage.setItem(TASKS_KEY, jsonValue);
    } catch (e) {
        console.error("Error saving tasks", e);
    }
};

export const createTask = async ({ title }) => {
    const tasks = await getAllTasks();
    const newTask = {
        id: Date.now().toString(),
        title,
        completed: false,
        createdAt: Date.now()
    };
    const updatedTasks = [...tasks, newTask];
    await saveTasks(updatedTasks);
    return updatedTasks; // Return updated list to help store update
};

export const toggleTaskCompletion = async (taskId) => {
    const tasks = await getAllTasks();
    const updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    await saveTasks(updatedTasks);
    return updatedTasks;
};

export const updateTask = async (taskId, updates) => {
    const tasks = await getAllTasks();
    const updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, ...updates } : t
    );
    await saveTasks(updatedTasks);
    return updatedTasks;
};

export const deleteTask = async (taskId) => {
    const tasks = await getAllTasks();
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    await saveTasks(updatedTasks);
    return updatedTasks;
};
