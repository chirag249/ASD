import { create } from 'zustand';
import * as TaskRepository from '../repositories/TaskRepository';

const useTaskStore = create((set, get) => ({
    tasks: [],
    isLoading: true,
    filter: 'all', // 'all', 'active', 'completed'

    // Initialize
    fetchTasks: async () => {
        set({ isLoading: true });
        try {
            const tasks = await TaskRepository.getAllTasks();
            set({ tasks, isLoading: false });
        } catch (error) {
            console.error("Failed to fetch tasks", error);
            set({ isLoading: false });
        }
    },

    setFilter: (filter) => set({ filter }),

    addTask: async (taskData) => {
        const updatedTasks = await TaskRepository.createTask(taskData);
        set({ tasks: updatedTasks });
    },

    updateTask: async (id, updates) => {
        const updatedTasks = await TaskRepository.updateTask(id, updates);
        set({ tasks: updatedTasks });
    },

    deleteTask: async (id) => {
        const updatedTasks = await TaskRepository.deleteTask(id);
        set({ tasks: updatedTasks });
    },

    toggleTask: async (id) => {
        const updatedTasks = await TaskRepository.toggleTaskCompletion(id);
        set({ tasks: updatedTasks });
    },


}));

export default useTaskStore;
