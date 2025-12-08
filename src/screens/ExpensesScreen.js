import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import useExpenseStore from '../store/useExpenseStore';
import { useTheme } from '../theme/ThemeContext';
import {
    calculateTotal,
    EXPENSE_CATEGORIES,
    filterByCategory,
    filterByDate,
    formatCurrency,
    getCategoryTotals
} from '../utils/expenseUtils';

export default function ExpensesScreen() {
    const theme = useTheme();
    const expenses = useExpenseStore((state) => state.expenses);
    const fetchExpenses = useExpenseStore((state) => state.fetchExpenses);
    const addExpense = useExpenseStore((state) => state.addExpense);
    const deleteExpense = useExpenseStore((state) => state.deleteExpense);
    const filter = useExpenseStore((state) => state.filter);
    const setFilter = useExpenseStore((state) => state.setFilter);
    const categoryFilter = useExpenseStore((state) => state.categoryFilter);
    const setCategoryFilter = useExpenseStore((state) => state.setCategoryFilter);

    const [modalVisible, setModalVisible] = useState(false);
    const [amount, setAmount] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Food');
    const [description, setDescription] = useState('');
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    // Custom date filter
    const [customDateFilter, setCustomDateFilter] = useState(null);
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

    useEffect(() => {
        fetchExpenses();
    }, []);

    // Filter expenses based on date and category
    const filteredExpenses = useMemo(() => {
        let filtered = expenses;

        // Apply custom date filter if set, otherwise use regular filter
        if (customDateFilter) {
            const customDate = new Date(customDateFilter).toISOString().split('T')[0];
            filtered = expenses.filter(expense => expense.date === customDate);
        } else {
            filtered = filterByDate(expenses, filter);
        }

        filtered = filterByCategory(filtered, categoryFilter);
        // Sort by date, newest first
        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [expenses, filter, categoryFilter, customDateFilter]);

    // Calculate total for filtered expenses
    const total = useMemo(() => calculateTotal(filteredExpenses), [filteredExpenses]);

    // Get category totals for current filter
    const categoryTotals = useMemo(() => getCategoryTotals(filteredExpenses), [filteredExpenses]);

    const handleAddExpense = async () => {
        if (!amount || parseFloat(amount) <= 0) return;

        await addExpense({
            amount: parseFloat(amount),
            date: selectedDate.toISOString().split('T')[0],
            category: selectedCategory,
            description: description.trim()
        });

        // Reset form
        setAmount('');
        setDescription('');
        setSelectedDate(new Date());
        setSelectedCategory('Food');
        setModalVisible(false);
    };

    const onDateChange = (event, selected) => {
        setShowDatePicker(false);
        if (selected) {
            setSelectedDate(selected);
        }
    };

    const onCustomDateChange = (event, selected) => {
        setShowCustomDatePicker(false);
        if (selected) {
            setCustomDateFilter(selected);
            setFilter('all'); // Reset regular filter when custom date is selected
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCustomDateFilter(null); // Clear custom date when using regular filters
    };

    const clearCustomDate = () => {
        setCustomDateFilter(null);
    };

    const renderExpenseItem = ({ item }) => (
        <View style={styles.expenseCard}>
            <View style={styles.expenseLeft}>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
                    <Ionicons name={getCategoryIcon(item.category)} size={20} color="white" />
                </View>
                <View style={styles.expenseDetails}>
                    <Text style={styles.expenseCategory}>{item.category}</Text>
                    {item.description ? (
                        <Text style={styles.expenseDescription}>{item.description}</Text>
                    ) : null}
                    <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
                </View>
            </View>
            <View style={styles.expenseRight}>
                <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
                <TouchableOpacity onPress={() => deleteExpense(item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color="#FF5252" />
                </TouchableOpacity>
            </View>
        </View>
    );


    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            {/* Summary Section */}
            <View style={styles.summaryContainer}>
                <Text style={styles.summaryLabel}>Total Expenses</Text>
                <Text style={styles.summaryAmount}>{formatCurrency(total)}</Text>

                {/* Custom Date Filter */}
                {customDateFilter ? (
                    <View style={styles.customDateBanner}>
                        <View style={styles.customDateInfo}>
                            <Ionicons name="calendar" size={16} color="#007AFF" />
                            <Text style={styles.customDateText}>
                                Showing: {new Date(customDateFilter).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={clearCustomDate} style={styles.clearDateBtn}>
                            <Ionicons name="close-circle" size={20} color="#FF5252" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.customDateButton}
                        onPress={() => setShowCustomDatePicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={18} color="white" />
                        <Text style={styles.customDateButtonText}>View by Date</Text>
                    </TouchableOpacity>
                )}

                {/* Date Filter Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
                    {['all', 'today', 'week', 'month'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterTab, filter === f && !customDateFilter && styles.filterTabActive]}
                            onPress={() => handleFilterChange(f)}
                        >
                            <Text style={[styles.filterTabText, filter === f && !customDateFilter && styles.filterTabTextActive]}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Category Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilters}>
                    <TouchableOpacity
                        style={[styles.categoryChip, categoryFilter === 'all' && styles.categoryChipActive]}
                        onPress={() => setCategoryFilter('all')}
                    >
                        <Text style={[styles.categoryChipText, categoryFilter === 'all' && styles.categoryChipTextActive]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    {EXPENSE_CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.categoryChip, categoryFilter === cat && styles.categoryChipActive]}
                            onPress={() => setCategoryFilter(cat)}
                        >
                            <Ionicons name={getCategoryIcon(cat)} size={16} color={categoryFilter === cat ? '#fff' : '#666'} />
                            <Text style={[styles.categoryChipText, categoryFilter === cat && styles.categoryChipTextActive]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Expense List */}
            <FlatList
                data={filteredExpenses}
                keyExtractor={(item) => item.id}
                renderItem={renderExpenseItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="wallet-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No expenses recorded</Text>
                    </View>
                }
            />

            {/* Add Button */}
            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>

            {/* Add Expense Modal */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Expense</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Amount"
                            keyboardType="decimal-pad"
                            value={amount}
                            onChangeText={setAmount}
                        />

                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                            <Text style={styles.pickerButtonText}>
                                {selectedDate.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                            />
                        )}

                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                        >
                            <Ionicons name={getCategoryIcon(selectedCategory)} size={20} color="#666" />
                            <Text style={styles.pickerButtonText}>{selectedCategory}</Text>
                            <Ionicons
                                name={showCategoryPicker ? "chevron-up" : "chevron-down"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>

                        {showCategoryPicker && (
                            <ScrollView style={styles.categoryList} nestedScrollEnabled={true}>
                                {EXPENSE_CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryOption,
                                            selectedCategory === cat && styles.categoryOptionSelected
                                        ]}
                                        onPress={() => {
                                            setSelectedCategory(cat);
                                            setShowCategoryPicker(false);
                                        }}
                                    >
                                        <View style={[
                                            styles.categoryIconBadge,
                                            { backgroundColor: getCategoryColor(cat) }
                                        ]}>
                                            <Ionicons name={getCategoryIcon(cat)} size={18} color="white" />
                                        </View>
                                        <Text style={[
                                            styles.categoryOptionText,
                                            selectedCategory === cat && styles.categoryOptionTextSelected
                                        ]}>
                                            {cat}
                                        </Text>
                                        {selectedCategory === cat && (
                                            <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Description (optional)"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.saveBtn]}
                                onPress={handleAddExpense}
                            >
                                <Text style={[styles.btnText, { color: 'white' }]}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Custom Date Picker */}
            {showCustomDatePicker && (
                <DateTimePicker
                    value={customDateFilter || new Date()}
                    mode="date"
                    display="default"
                    onChange={onCustomDateChange}
                />
            )}
        </View>
    );
}

// Helper functions
const getCategoryIcon = (category) => {
    const icons = {
        Food: 'restaurant',
        Transport: 'car',
        Utilities: 'flash',
        Entertainment: 'game-controller',
        Shopping: 'cart',
        Healthcare: 'medical',
        Education: 'school',
        Other: 'ellipsis-horizontal'
    };
    return icons[category] || 'ellipsis-horizontal';
};

const getCategoryColor = (category) => {
    const colors = {
        Food: '#FF6B6B',
        Transport: '#4ECDC4',
        Utilities: '#FFD93D',
        Entertainment: '#A8E6CF',
        Shopping: '#FF8B94',
        Healthcare: '#C7CEEA',
        Education: '#FFDAC1',
        Other: '#B5B5B5'
    };
    return colors[category] || '#B5B5B5';
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    summaryContainer: {
        backgroundColor: '#007AFF',
        padding: 20,
        paddingTop: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 5,
    },
    summaryAmount: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    customDateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    customDateButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    customDateBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    customDateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    customDateText: {
        color: '#007AFF',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 8,
    },
    clearDateBtn: {
        padding: 5,
    },
    filterTabs: {
        marginBottom: 15,
    },
    filterTab: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginRight: 10,
    },
    filterTabActive: {
        backgroundColor: 'white',
    },
    filterTabText: {
        color: 'white',
        fontWeight: '600',
    },
    filterTabTextActive: {
        color: '#007AFF',
    },
    categoryFilters: {
        marginTop: 5,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: 'white',
    },
    categoryChipText: {
        color: 'white',
        fontSize: 12,
        marginLeft: 4,
    },
    categoryChipTextActive: {
        color: '#007AFF',
    },
    listContent: {
        padding: 15,
    },
    expenseCard: {
        backgroundColor: theme.colors.background.paper,
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    expenseLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryBadge: {
        width: 45,
        height: 45,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    expenseDetails: {
        flex: 1,
    },
    expenseCategory: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text.primary,
    },
    expenseDescription: {
        fontSize: 13,
        color: theme.colors.text.secondary,
        marginTop: 2,
    },
    expenseDate: {
        fontSize: 12,
        color: theme.colors.text.disabled,
        marginTop: 4,
    },
    expenseRight: {
        alignItems: 'flex-end',
    },
    expenseAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF5252',
        marginBottom: 5,
    },
    deleteBtn: {
        padding: 5,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: theme.colors.text.disabled,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: theme.colors.background.paper,
        borderRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: theme.colors.text.primary,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: theme.isDarkMode ? theme.colors.neutral.gray400 : '#ddd',
        paddingVertical: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 10,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.isDarkMode ? theme.colors.neutral.gray200 : '#f0f0f0',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    pickerButtonText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: theme.colors.text.primary,
    },
    categoryList: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginBottom: 15,
        maxHeight: 250,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoryOptionSelected: {
        backgroundColor: '#E3F2FD',
    },
    categoryIconBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoryOptionText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    categoryOptionTextSelected: {
        fontWeight: '600',
        color: '#007AFF',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelBtn: {
        backgroundColor: '#eee',
    },
    saveBtn: {
        backgroundColor: '#007AFF',
    },
    btnText: {
        fontWeight: '600',
        fontSize: 16,
    },
});
