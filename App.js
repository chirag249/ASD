import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import usePreferencesStore from './src/store/usePreferencesStore';
import { ThemeProvider } from './src/theme/ThemeContext';

export default function App() {
    const initializePreferences = usePreferencesStore(state => state.initializePreferences);

    useEffect(() => {
        // Initialize preferences from database on app startup
        initializePreferences();
    }, []);

    return (
        <ThemeProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </ThemeProvider>
    );
}
