import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import useTaskStore from '../store/useTaskStore';

export default function TasksScreen() {
    const fetchTasks = useTaskStore((state) => state.fetchTasks);
    const addTask = useTaskStore((state) => state.addTask);
    const toggleTask = useTaskStore((state) => state.toggleTask);
    const deleteTask = useTaskStore((state) => state.deleteTask);
    const updateTask = useTaskStore((state) => state.updateTask);
    const filter = useTaskStore((state) => state.filter);
    const setFilter = useTaskStore((state) => state.setFilter);
    const filteredTasks = useTaskStore((state) => state.getFilteredTasks());

    // Local state for new task input
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // State for editing
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [editTitle, setEditTitle] = useState('');

    useEffect(() => {
        const subscription = fetchTasks();
        return () => subscription.unsubscribe();
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
                <Text style={styles.header}>My Tasks</Text>
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
                                color={item.completed ? "#4CAF50" : "#555"}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    headerContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 10,
        justifyContent: 'space-around',
        backgroundColor: '#fff',
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    activeFilterButton: {
        backgroundColor: '#007AFF',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeFilterText: {
        color: '#fff',
    },
    listContent: {
        padding: 15,
        paddingBottom: 100, // Space for input area
    },
    taskItem: {
        backgroundColor: 'white',
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
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    checkButton: {
        marginRight: 10,
    },
    taskContent: {
        flex: 1,
    },
    taskText: {
        fontSize: 16,
        color: '#333',
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#aaa',
    },
    deleteButton: {
        padding: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        // Position at bottom 
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontSize: 16,
        marginRight: 10,
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
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    modalInput: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 8,
        fontSize: 16,
        marginBottom: 20,
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
        backgroundColor: '#eee',
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    buttonText: {
        fontWeight: 'bold',
    },
});
