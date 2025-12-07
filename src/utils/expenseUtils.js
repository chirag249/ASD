// Expense calculation utilities

/**
 * Calculate total sum of expenses
 * @param {Array} expenses - Array of expense objects
 * @returns {number} Total sum
 */
export const calculateTotal = (expenses) => {
    return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
};

/**
 * Filter expenses by date range
 * @param {Array} expenses - Array of expense objects
 * @param {string} filter - 'today', 'week', 'month', or 'all'
 * @returns {Array} Filtered expenses
 */
export const filterByDate = (expenses, filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
        case 'today':
            return expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= today;
            });

        case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= weekAgo;
            });

        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= monthStart;
            });

        case 'all':
        default:
            return expenses;
    }
};

/**
 * Filter expenses by category
 * @param {Array} expenses - Array of expense objects
 * @param {string} category - Category name or 'all'
 * @returns {Array} Filtered expenses
 */
export const filterByCategory = (expenses, category) => {
    if (category === 'all') return expenses;
    return expenses.filter(expense => expense.category === category);
};

/**
 * Group expenses by date
 * @param {Array} expenses - Array of expense objects
 * @returns {Object} Expenses grouped by date
 */
export const groupByDate = (expenses) => {
    return expenses.reduce((groups, expense) => {
        const date = expense.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(expense);
        return groups;
    }, {});
};

/**
 * Get category totals
 * @param {Array} expenses - Array of expense objects
 * @returns {Object} Object with category names as keys and totals as values
 */
export const getCategoryTotals = (expenses) => {
    return expenses.reduce((totals, expense) => {
        const category = expense.category || 'Uncategorized';
        totals[category] = (totals[category] || 0) + parseFloat(expense.amount || 0);
        return totals;
    }, {});
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
};

// Predefined expense categories
export const EXPENSE_CATEGORIES = [
    'Food',
    'Transport',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Education',
    'Other'
];
