import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@expenses';

const ExpenseRepository = {
    async getAllExpenses() {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error fetching expenses:', error);
            return [];
        }
    },

    async addExpense(expense) {
        try {
            const expenses = await this.getAllExpenses();
            const newExpense = {
                id: Date.now().toString(),
                ...expense,
                createdAt: new Date().toISOString(),
            };
            expenses.push(newExpense);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
            return newExpense;
        } catch (error) {
            console.error('Error adding expense:', error);
            throw error;
        }
    },

    async updateExpense(id, updates) {
        try {
            const expenses = await this.getAllExpenses();
            const index = expenses.findIndex(e => e.id === id);
            if (index !== -1) {
                expenses[index] = { ...expenses[index], ...updates };
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
                return expenses[index];
            }
            return null;
        } catch (error) {
            console.error('Error updating expense:', error);
            throw error;
        }
    },

    async deleteExpense(id) {
        try {
            const expenses = await this.getAllExpenses();
            const filtered = expenses.filter(e => e.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw error;
        }
    },
};

export default ExpenseRepository;
