import { create } from 'zustand';

const useExpenseStore = create((set) => ({
    expenses: [],
    addExpense: (expense) => set((state) => ({
        expenses: [...state.expenses, { id: Date.now().toString(), ...expense }]
    })),
    deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id)
    })),
    // Basic categorization logic can be handled in the component or via derived state
    // For now, we just store the expense object which should have a category field
}));

export default useExpenseStore;
