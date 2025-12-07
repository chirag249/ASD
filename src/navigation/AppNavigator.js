import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ExpensesScreen from '../screens/ExpensesScreen';
import SudokuScreen from '../screens/SudokuScreen';
import TasksScreen from '../screens/TasksScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Tasks') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Expenses') {
                        iconName = focused ? 'wallet' : 'wallet-outline';
                    } else if (route.name === 'Sudoku') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF', // Standard Blue
                tabBarInactiveTintColor: 'gray',
                headerShown: true, // Optional, can be false if screens have their own headers
            })}
        >
            <Tab.Screen name="Tasks" component={TasksScreen} />
            <Tab.Screen name="Expenses" component={ExpensesScreen} />
            <Tab.Screen name="Sudoku" component={SudokuScreen} />
        </Tab.Navigator>
    );
}
