import { create } from 'zustand';
import ExpenseRepository from '../repositories/ExpenseRepository';

const useExpenseStore = create((set, get) => ({
    expenses: [],
    isLoading: false,
    filter: 'all', // 'all', 'today', 'week', 'month'
    categoryFilter: 'all', // 'all' or specific category

    // Fetch all expenses from repository
    fetchExpenses: async () => {
        set({ isLoading: true });
        try {
            const expenses = await ExpenseRepository.getAllExpenses();
            set({ expenses, isLoading: false });
        } catch (error) {
            console.error('Error fetching expenses:', error);
            set({ isLoading: false });
        }
    },

    // Add a new expense
    addExpense: async (expenseData) => {
        try {
            const newExpense = await ExpenseRepository.addExpense(expenseData);
            set((state) => ({
                expenses: [...state.expenses, newExpense]
            }));
            return newExpense;
        } catch (error) {
            console.error('Error adding expense:', error);
            throw error;
        }
    },

    // Update an existing expense
    updateExpense: async (id, updates) => {
        try {
            const updated = await ExpenseRepository.updateExpense(id, updates);
            if (updated) {
                set((state) => ({
                    expenses: state.expenses.map(e => e.id === id ? updated : e)
                }));
            }
            return updated;
        } catch (error) {
            console.error('Error updating expense:', error);
            throw error;
        }
    },

    // Delete an expense
    deleteExpense: async (id) => {
        try {
            await ExpenseRepository.deleteExpense(id);
            set((state) => ({
                expenses: state.expenses.filter(e => e.id !== id)
            }));
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    },

    // Set date filter
    setFilter: (filter) => set({ filter }),

    // Set category filter
    setCategoryFilter: (category) => set({ categoryFilter: category }),
}));

export default useExpenseStore;
