import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useTaskStore from '../store/useTaskStore';
import { useTheme } from '../theme/ThemeContext';

export default function TasksScreen() {
    const theme = useTheme();

    // Select state pieces individually to avoid re-renders on every store update
    const tasks = useTaskStore((state) => state.tasks);
    const filter = useTaskStore((state) => state.filter);

    // Actions are stable
    const fetchTasks = useTaskStore((state) => state.fetchTasks);
    const addTask = useTaskStore((state) => state.addTask);
    const toggleTask = useTaskStore((state) => state.toggleTask);
    const deleteTask = useTaskStore((state) => state.deleteTask);
    const updateTask = useTaskStore((state) => state.updateTask);
    const setFilter = useTaskStore((state) => state.setFilter);

    // Compute filtered tasks here to avoid "Maximum update depth" and selector issues
    const filteredTasks = useMemo(() => {
        if (filter === 'active') return tasks.filter(t => !t.completed);
        if (filter === 'completed') return tasks.filter(t => t.completed);
        return tasks;
    }, [tasks, filter]);

    // Local state for new task input
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // State for editing
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editTitle, setEditTitle] = useState('');

    useEffect(() => {
        fetchTasks();
        // No subscription cleanup needed for simple async fetch
    }, []);

    const handleAddTask = () => {
        if (newTaskTitle.trim().length === 0) return;
        addTask({ title: newTaskTitle.trim() });
        setNewTaskTitle('');
    };

    const startEditing = (task) => {
        setEditingTask(task);
        setEditTitle(task.title);
        setEditModalVisible(true);
    };

    const saveEdit = () => {
        if (editingTask && editTitle.trim().length > 0) {
            updateTask(editingTask.id, { title: editTitle.trim() });
            setEditModalVisible(false);
            setEditingTask(null);
        }
    };

    const styles = createStyles(theme);

    const renderFilterButton = (title, value) => (
        <TouchableOpacity
            style={[styles.filterButton, filter === value && styles.activeFilterButton]}
            onPress={() => setFilter(value)}
        >
            <Text style={[styles.filterText, filter === value && styles.activeFilterText]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Tasks</Text>
                <Text style={styles.headerSubtitle}>Manage your to-do list</Text>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {renderFilterButton('All', 'all')}
                {renderFilterButton('Active', 'active')}
                {renderFilterButton('Done', 'completed')}
            </View>

            {/* Task List */}
            <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.taskItem}>
                        <TouchableOpacity onPress={() => toggleTask(item.id)} style={styles.checkButton}>
                            <Ionicons
                                name={item.completed ? "checkbox" : "square-outline"}
                                size={24}
                                color={item.completed ? "#4CAF50" : theme.colors.text.secondary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.taskContent}
                            onPress={() => startEditing(item)}
                        >
                            <Text style={[styles.taskText, item.completed && styles.completedText]}>
                                {item.title}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={20} color="#FF5252" />
                        </TouchableOpacity>
                    </View>
                )}
            />

            {/* Add Task Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                style={styles.inputContainer}
            >
                <TextInput
                    style={styles.input}
                    placeholder="Add a new task..."
                    placeholderTextColor={theme.colors.text.disabled}
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    onSubmitEditing={handleAddTask}
                />
                <TouchableOpacity onPress={handleAddTask} style={styles.addButton}>
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </KeyboardAvoidingView>

            {/* Edit Modal */}
            <Modal
                visible={isEditModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Task</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={editTitle}
                            onChangeText={setEditTitle}
                            autoFocus={true}
                            placeholderTextColor={theme.colors.text.disabled}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={saveEdit}
                            >
                                <Text style={[styles.buttonText, { color: 'white' }]}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.default,
    },
    headerContainer: {
        padding: 20,
        backgroundColor: theme.colors.background.paper,
        borderBottomWidth: 1,
        borderBottomColor: theme.isDarkMode ? theme.colors.neutral.gray300 : theme.colors.neutral.gray200,
    },
    header: {
        fontSize: 34,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: theme.colors.text.secondary,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 10,
        justifyContent: 'space-around',
        backgroundColor: theme.colors.background.paper,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: theme.isDarkMode ? theme.colors.neutral.gray200 : '#f0f0f0',
    },
    activeFilterButton: {
        backgroundColor: '#007AFF',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text.secondary,
    },
    activeFilterText: {
        color: '#fff',
    },
    listContent: {
        padding: 15,
        paddingBottom: 100, // Space for input area
    },
    taskItem: {
        backgroundColor: theme.colors.background.paper,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: theme.isDarkMode ? 0.3 : 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: theme.isDarkMode ? theme.colors.neutral.gray300 : 'transparent',
    },
    checkButton: {
        marginRight: 10,
    },
    taskContent: {
        flex: 1,
    },
    taskText: {
        fontSize: 16,
        color: theme.colors.text.primary,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: theme.colors.text.disabled,
    },
    deleteButton: {
        padding: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: theme.colors.background.paper,
        borderTopWidth: 1,
        borderTopColor: theme.isDarkMode ? theme.colors.neutral.gray300 : theme.colors.neutral.gray200,
    },
    input: {
        flex: 1,
        backgroundColor: theme.isDarkMode ? theme.colors.neutral.gray200 : '#f0f0f0',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontSize: 16,
        marginRight: 10,
        color: theme.colors.text.primary,
    },
    addButton: {
        backgroundColor: '#007AFF',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: theme.colors.background.paper,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: theme.colors.text.primary,
    },
    modalInput: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: theme.isDarkMode ? theme.colors.neutral.gray400 : '#ccc',
        paddingVertical: 8,
        fontSize: 16,
        marginBottom: 20,
        color: theme.colors.text.primary,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginLeft: 10,
    },
    cancelButton: {
        backgroundColor: theme.isDarkMode ? theme.colors.neutral.gray300 : '#eee',
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
});
