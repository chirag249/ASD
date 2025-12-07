# 🏗️ Development Build Setup Guide

## Current Situation

Your app uses **WatermelonDB** which requires native modules. You have two options:

### Option 1: Build APK for Android (Recommended for Testing)
### Option 2: Use EAS Build (Cloud Build - Easiest)

---

## 🚀 Option 1: Build APK Locally (Requires Android Studio)

### Prerequisites
1. **Install Android Studio**: https://developer.android.com/studio
2. **Install Java JDK 17**: https://www.oracle.com/java/technologies/downloads/

### Setup Steps

#### 1. Install Android Studio
- Download from: https://developer.android.com/studio
- Install with default settings
- Open Android Studio
- Go to: Tools → SDK Manager
- Install:
  - Android SDK Platform 34
  - Android SDK Build-Tools
  - Android Emulator
  - Android SDK Platform-Tools

#### 2. Set Environment Variables
Add to Windows Environment Variables:

```
ANDROID_HOME = C:\Users\YourUsername\AppData\Local\Android\Sdk
```

Add to PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

#### 3. Create Android Emulator (Optional)
In Android Studio:
- Tools → Device Manager
- Create Virtual Device
- Select Pixel 6
- Download System Image (API 34)
- Finish

#### 4. Build the App
```bash
# In your project directory
npx expo run:android
```

This will:
- Generate native Android code
- Install dependencies
- Build APK
- Install on connected device/emulator
- Start Metro bundler

---

## ☁️ Option 2: EAS Build (Cloud Build - EASIEST) ⭐

This is the **recommended approach** - no Android Studio needed!

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
(Use your Expo account or create one)

### Step 3: Configure EAS
```bash
eas build:configure
```

### Step 4: Build Development APK
```bash
# For development build (includes dev tools)
eas build --profile development --platform android

# For production APK (smaller, faster)
eas build --profile preview --platform android
```

### Step 5: Download and Install
- EAS will build in the cloud
- You'll get a download link
- Download APK to your phone
- Install and run!

**Build time**: ~10-15 minutes
**No Android Studio required**: ✅
**Works on any computer**: ✅

---

## 🎯 Quick Start: EAS Build (Recommended)

Run these commands in order:

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure
eas build:configure

# 4. Build development version
eas build --profile development --platform android
```

Wait for build to complete, then download and install the APK!

---

## 📱 Option 3: Use Expo Go (Limited Features)

If you just want to test the **Settings page** right now:

```bash
# Already running, just scan QR code
npx expo start
```

**What works in Expo Go**:
- ✅ Settings page (theme, notifications)
- ✅ UI and navigation
- ❌ Tasks (needs WatermelonDB)
- ❌ Expenses (needs WatermelonDB)
- ❌ Calendar (needs WatermelonDB)

---

## 🔧 Alternative: Replace WatermelonDB with AsyncStorage

If you want everything to work in Expo Go immediately, we can replace WatermelonDB with AsyncStorage for all features:

**Pros**:
- ✅ Works in Expo Go
- ✅ No build required
- ✅ Simpler code

**Cons**:
- ❌ Less powerful queries
- ❌ No relationships
- ❌ Slower for large datasets

Let me know if you want this option!

---

## 📊 Comparison Table

| Method | Time | Difficulty | Requirements | All Features |
|--------|------|------------|--------------|--------------|
| **EAS Build** | 15 min | Easy | Expo account | ✅ Yes |
| Local Build | 1-2 hours | Hard | Android Studio | ✅ Yes |
| Expo Go | 0 min | Very Easy | None | ❌ Settings only |
| AsyncStorage | 30 min | Medium | Code changes | ✅ Yes (simpler) |

---

## 🎯 My Recommendation

### For Quick Testing → **Use EAS Build**
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform android
```

### For Production → **Use EAS Build (Production)**
```bash
eas build --profile production --platform android
```

---

## 🆘 Need Help?

### If EAS Build fails:
1. Make sure you're logged in: `eas whoami`
2. Check your internet connection
3. Try again: `eas build --profile development --platform android`

### If you want to use Expo Go:
- Settings page already works!
- Other features need development build

### If you want everything in Expo Go:
- Let me know, I'll convert WatermelonDB to AsyncStorage

---

## 📝 Next Steps

**Choose your path**:

1. **EAS Build (Recommended)** → Run the commands above
2. **Local Build** → Install Android Studio first
3. **Expo Go** → Already working for Settings
4. **AsyncStorage** → Let me know, I'll convert

Which option would you like to proceed with?
