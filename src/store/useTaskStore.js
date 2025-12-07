import { create } from 'zustand';
import * as TaskRepository from '../repositories/TaskRepository';

const useTaskStore = create((set, get) => ({
    tasks: [],
    isLoading: true,
    filter: 'all', // 'all', 'active', 'completed'

    // Initialize and subscribe to changes
    fetchTasks: () => {
        const subscription = TaskRepository.observeTasks().subscribe(tasks => {
            // tasks is an array of immutable Model objects.
            // We set them to state.
            set({ tasks, isLoading: false });
        });
        return subscription;
    },

    setFilter: (filter) => set({ filter }),

    addTask: async (taskData) => {
        await TaskRepository.createTask(taskData);
    },

    updateTask: async (id, updates) => {
        await TaskRepository.updateTask(id, updates);
    },

    deleteTask: async (id) => {
        await TaskRepository.deleteTask(id);
    },

    toggleTask: async (id) => {
        await TaskRepository.toggleTaskCompletion(id);
    },

    // Selector helper to get filtered tasks
    getFilteredTasks: () => {
        const { tasks, filter } = get();
        if (filter === 'active') return tasks.filter(t => !t.completed);
        if (filter === 'completed') return tasks.filter(t => t.completed);
        return tasks;
    }
}));

export default useTaskStore;
