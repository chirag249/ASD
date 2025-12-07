import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import useScheduleStore from '../store/useScheduleStore';

const { width } = Dimensions.get('window');

export default function CalendarScreen() {
    const items = useScheduleStore((state) => state.items);
    const fetchItems = useScheduleStore((state) => state.fetchItems);
    const addItem = useScheduleStore((state) => state.addItem);
    const deleteItem = useScheduleStore((state) => state.deleteItem);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newItemTitle, setNewItemTitle] = useState('');
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const markedDates = useMemo(() => {
        const marks = {};
        items.forEach(item => {
            marks[item.date] = { marked: true, dotColor: '#007AFF' };
        });
        marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: '#007AFF' };
        return marks;
    }, [items, selectedDate]);

    const selectedItems = useMemo(() => {
        return items.filter(i => i.date === selectedDate);
    }, [items, selectedDate]);

    const onTimeChange = (event, selected) => {
        setShowTimePicker(false);
        if (selected) {
            setSelectedTime(selected);
        }
    };

    const handleAddItem = async () => {
        if (!newItemTitle.trim()) return;

        const timeString = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        await addItem({
            title: newItemTitle,
            date: selectedDate,
            time: timeString
        });

        Alert.alert(
            '✅ Event Created',
            `"${newItemTitle}"\n\n📅 ${selectedDate}\n⏰ ${timeString}\n\n🔔 Reminders would be set for:\n• 15 minutes before\n• 1 day before\n\n(Note: Real notifications require a custom build)`,
            [{ text: 'OK' }]
        );

        setNewItemTitle('');
        setModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.content}>
                <CalendarList
                    current={selectedDate}
                    onDayPress={day => setSelectedDate(day.dateString)}
                    markedDates={markedDates}
                    horizontal={true}
                    pagingEnabled={true}
                    calendarWidth={width}
                    pastScrollRange={12}
                    futureScrollRange={12}
                    theme={{
                        selectedDayBackgroundColor: '#007AFF',
                        todayTextColor: '#007AFF',
                        arrowColor: '#007AFF',
                    }}
                />

                <View style={styles.listContainer}>
                    <View style={styles.listHeader}>
                        <Text style={styles.dateTitle}>{selectedDate}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                            <Ionicons name="add" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={selectedItems}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.itemCard}>
                                <View>
                                    <Text style={styles.itemTitle}>{item.title}</Text>
                                    {item.time ? <Text style={styles.itemTime}>{item.time}</Text> : null}
                                </View>
                                <TouchableOpacity onPress={() => deleteItem(item.id)}>
                                    <Ionicons name="trash-outline" size={20} color="#FF5252" />
                                </TouchableOpacity>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>No events for this day.</Text>}
                    />
                </View>

                <Modal
                    transparent={true}
                    visible={modalVisible}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>New Event</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Event Title"
                                value={newItemTitle}
                                onChangeText={setNewItemTitle}
                            />

                            <TouchableOpacity
                                style={styles.timePickerButton}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Ionicons name="time-outline" size={20} color="#666" />
                                <Text style={styles.timePickerText}>
                                    {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </TouchableOpacity>

                            {showTimePicker && (
                                <DateTimePicker
                                    value={selectedTime}
                                    mode="time"
                                    is24Hour={false}
                                    display="default"
                                    onChange={onTimeChange}
                                />
                            )}

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.cancelBtn]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.btnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtn, styles.saveBtn]}
                                    onPress={handleAddItem}
                                >
                                    <Text style={[styles.btnText, { color: 'white' }]}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
    },
    listContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    dateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    addButton: {
        backgroundColor: '#007AFF',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    itemTime: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
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
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    timePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    timePickerText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
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
    },
});
