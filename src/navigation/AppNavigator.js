import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';

import CalendarScreen from '../screens/CalendarScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import GamesScreen from '../screens/GamesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TasksScreen from '../screens/TasksScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Games') {
                        iconName = focused ? 'game-controller' : 'game-controller-outline';
                    } else if (route.name === 'Tasks') {
                        iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
                    } else if (route.name === 'Expenses') {
                        iconName = focused ? 'wallet' : 'wallet-outline';
                    } else if (route.name === 'Calendar') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: isDark ? '#8E8E8E' : 'gray',
                tabBarStyle: {
                    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                    borderTopColor: isDark ? '#383838' : '#E0E0E0',
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Games" component={GamesScreen} />
            <Tab.Screen name="Tasks" component={TasksScreen} />
            <Tab.Screen name="Expenses" component={ExpensesScreen} />
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}
