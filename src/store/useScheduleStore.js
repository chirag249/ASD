import { create } from 'zustand';
import * as ScheduleRepository from '../repositories/ScheduleRepository';

const useScheduleStore = create((set, get) => ({
    items: [],
    isLoading: true,

    fetchItems: async () => {
        set({ isLoading: true });
        try {
            const items = await ScheduleRepository.getAllItems();
            set({ items, isLoading: false });
        } catch (error) {
            console.error("Failed to fetch schedule items", error);
            set({ isLoading: false });
        }
    },

    addItem: async (itemData) => {
        const updatedItems = await ScheduleRepository.createItem(itemData);
        set({ items: updatedItems });
    },

    deleteItem: async (id) => {
        const updatedItems = await ScheduleRepository.deleteItem(id);
        set({ items: updatedItems });
    },

    // Selector helper
    getItemsForDate: (dateString) => {
        const { items } = get();
        return items.filter(i => i.date === dateString);
    }
}));

export default useScheduleStore;
