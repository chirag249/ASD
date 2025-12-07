# Settings Integration Quick Reference

## Using Theme in Your Components

### Basic Usage
```javascript
import { useTheme } from '../theme/ThemeContext';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background.default }}>
      <Text style={{ color: theme.colors.text.primary }}>
        Hello World
      </Text>
    </View>
  );
}
```

### Available Theme Properties
```javascript
const theme = useTheme();

// Colors
theme.colors.primary.main          // #007AFF
theme.colors.background.default    // #F5F5F5 (light) or #121212 (dark)
theme.colors.background.paper      // #FFFFFF (light) or #1E1E1E (dark)
theme.colors.text.primary          // #212121 (light) or #FFFFFF (dark)
theme.colors.text.secondary        // #757575 (light) or #B0B0B0 (dark)

// State
theme.isDarkMode                   // boolean
theme.isSystemTheme                // boolean

// Actions
theme.toggleTheme()                // Switch between light/dark
theme.setSystemTheme()             // Use system preference
```

## Using Preferences in Your Components

### Accessing Preferences
```javascript
import usePreferencesStore from '../store/usePreferencesStore';

function MyComponent() {
  const { 
    theme, 
    notificationSound, 
    notificationsEnabled 
  } = usePreferencesStore();
  
  // Use preferences...
}
```

### Updating Preferences
```javascript
import usePreferencesStore from '../store/usePreferencesStore';

function MyComponent() {
  const { setTheme, setNotificationSound } = usePreferencesStore();
  
  const handleThemeChange = () => {
    setTheme('dark'); // Automatically saves to database
  };
  
  const handleSoundChange = () => {
    setNotificationSound('chime'); // Automatically saves to database
  };
}
```

## Scheduling Notifications with User Preferences

### Example: Calendar Event Notification
```javascript
import * as Notifications from 'expo-notifications';
import usePreferencesStore from '../store/usePreferencesStore';

async function scheduleEventNotification(event) {
  // Get user preferences
  const { notificationSound, notificationsEnabled } = usePreferencesStore.getState();
  
  // Check if notifications are enabled
  if (!notificationsEnabled) {
    console.log('Notifications disabled by user');
    return;
  }
  
  // Schedule with user's preferred sound
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: event.title,
      body: event.description || 'Event starting soon',
      sound: notificationSound === 'none' ? null : `${notificationSound}.wav`,
      data: { eventId: event.id },
    },
    trigger: {
      date: new Date(event.alertTime),
    },
  });
  
  return notificationId;
}
```

### Sound File Mapping
```javascript
const soundFiles = {
  'default': 'default.wav',  // System default
  'chime': 'chime.wav',      // Gentle chime
  'bell': 'bell.wav',        // Classic bell
  'none': null,              // Silent notification
};
```

## Creating Theme-Aware Styles

### Using StyleSheet.create with Theme
```javascript
import { StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

function MyComponent() {
  const theme = useTheme();
  const styles = createStyles(theme);
  
  return <View style={styles.container}>...</View>;
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: 12,
    padding: 16,
    shadowColor: theme.isDarkMode ? '#000' : '#000',
    shadowOpacity: theme.isDarkMode ? 0.3 : 0.1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
});
```

### Conditional Styling Based on Theme
```javascript
<View 
  style={[
    styles.button,
    theme.isDarkMode && styles.buttonDark
  ]}
>
  <Text style={styles.buttonText}>Click Me</Text>
</View>
```

## Common Patterns

### Pattern 1: Loading Preferences on Screen Mount
```javascript
import { useEffect } from 'react';
import usePreferencesStore from '../store/usePreferencesStore';

function MyScreen() {
  const { initializePreferences, isLoading } = usePreferencesStore();
  
  useEffect(() => {
    initializePreferences();
  }, []);
  
  if (isLoading) {
    return <ActivityIndicator />;
  }
  
  return <View>...</View>;
}
```

### Pattern 2: Conditional Rendering Based on Preferences
```javascript
function NotificationBadge() {
  const { notificationsEnabled } = usePreferencesStore();
  
  if (!notificationsEnabled) {
    return null; // Don't show badge if notifications disabled
  }
  
  return <Badge count={5} />;
}
```

### Pattern 3: Theme-Aware Icons
```javascript
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

function ThemedIcon({ name, size = 24 }) {
  const theme = useTheme();
  
  return (
    <Ionicons 
      name={name} 
      size={size} 
      color={theme.colors.text.primary} 
    />
  );
}
```

### Pattern 4: Subscribing to Preference Changes
```javascript
import { useEffect } from 'react';
import usePreferencesStore from '../store/usePreferencesStore';

function MyComponent() {
  const theme = usePreferencesStore(state => state.theme);
  
  useEffect(() => {
    console.log('Theme changed to:', theme);
    // React to theme change
  }, [theme]);
}
```

## Best Practices

### 1. Always Use Theme Colors
❌ **Don't:**
```javascript
<Text style={{ color: '#000000' }}>Text</Text>
```

✅ **Do:**
```javascript
<Text style={{ color: theme.colors.text.primary }}>Text</Text>
```

### 2. Check Notification Preference Before Scheduling
❌ **Don't:**
```javascript
await Notifications.scheduleNotificationAsync({...});
```

✅ **Do:**
```javascript
const { notificationsEnabled } = usePreferencesStore.getState();
if (notificationsEnabled) {
  await Notifications.scheduleNotificationAsync({...});
}
```

### 3. Use Theme-Aware Shadow
```javascript
shadowColor: theme.isDarkMode ? '#000' : '#000',
shadowOpacity: theme.isDarkMode ? 0.5 : 0.1,
shadowOffset: { width: 0, height: 2 },
shadowRadius: 4,
elevation: 3,
```

### 4. Provide Visual Feedback for Theme Changes
```javascript
import { LayoutAnimation } from 'react-native';

const handleThemeToggle = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  theme.toggleTheme();
};
```

## Debugging

### Check Current Preferences
```javascript
// In any component or console
import usePreferencesStore from '../store/usePreferencesStore';

console.log('Current preferences:', usePreferencesStore.getState());
```

### Check Theme State
```javascript
import { useTheme } from '../theme/ThemeContext';

const theme = useTheme();
console.log('Is Dark Mode:', theme.isDarkMode);
console.log('Is System Theme:', theme.isSystemTheme);
```

### Verify Database Persistence
```javascript
import * as UserSettingRepository from '../repositories/UserSettingRepository';

// Check all saved settings
const settings = await UserSettingRepository.getAllSettings();
console.log('Saved settings:', settings);
```

## Common Issues & Solutions

### Issue: Theme not updating
**Solution:** Ensure ThemeProvider wraps your entire app in App.js

### Issue: Preferences not persisting
**Solution:** Check that initializePreferences() is called on app startup

### Issue: Notifications still showing when disabled
**Solution:** Always check `notificationsEnabled` before scheduling

### Issue: Colors look wrong in dark mode
**Solution:** Use `theme.colors.dark.*` properties, not hardcoded colors
