# HYPERXGEN - Android APK Build Package

## 📱 About HYPERXGEN
A high-precision synthesis engine for vector graphics and typographic art powered by Gemini AI.
Built with React, TypeScript, and wrapped for Android using Capacitor.

## 📦 What's Included
- ✅ Complete React/TypeScript source code
- ✅ Pre-built web application (dist folder)
- ✅ Android project with Capacitor wrapper
- ✅ All dependencies configuration files
- ✅ Build scripts and configurations

## 🚀 Quick Start - Build APK

### Prerequisites
1. **Java Development Kit (JDK) 17 or 21**
   - Download: https://adoptium.net/
   - Verify: `java -version`

2. **Android Studio** (Recommended) or **Android SDK Command Line Tools**
   - Download: https://developer.android.com/studio
   - Includes Android SDK and build tools

3. **Node.js 18+** and npm
   - Download: https://nodejs.org/
   - Verify: `node -v` and `npm -v`

### Option 1: Build with Android Studio (Easiest)

1. **Install Android Studio**
   - Download from https://developer.android.com/studio
   - Follow installation wizard
   - Install recommended SDK packages

2. **Open the Project**
   - Launch Android Studio
   - Click "Open an Existing Project"
   - Navigate to and select the `android` folder in this package

3. **Wait for Gradle Sync**
   - Android Studio will automatically sync Gradle (3-5 minutes first time)
   - Wait for "Gradle build finished" message

4. **Build APK**
   - Menu: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Wait 5-10 minutes for first build
   - Click "locate" in notification or find at:
     `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Build with Command Line

1. **Set Environment Variables**

   **Windows (Command Prompt):**
   ```cmd
   set ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
   set JAVA_HOME=C:\Program Files\Java\jdk-21
   set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin
   ```

   **macOS/Linux (Terminal):**
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
   # or
   export ANDROID_HOME=$HOME/Android/Sdk          # Linux
   export JAVA_HOME=/usr/lib/jvm/java-21-openjdk  # Adjust path
   export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin
   ```

2. **Navigate to Android Folder**
   ```bash
   cd android
   ```

3. **Build Debug APK**
   ```bash
   # Windows
   gradlew.bat assembleDebug
   
   # macOS/Linux
   ./gradlew assembleDebug
   ```

4. **Find Your APK**
   - Location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 3: Build Release APK (For Distribution)

1. **Generate Signing Key**
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore \
           -alias hyperxgen -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Signing** (Edit `android/app/build.gradle`)
   ```groovy
   android {
       signingConfigs {
           release {
               storeFile file("../../my-release-key.keystore")
               storePassword "your-password"
               keyAlias "hyperxgen"
               keyPassword "your-password"
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
           }
       }
   }
   ```

3. **Build Release APK**
   ```bash
   ./gradlew assembleRelease
   ```

4. **Find Signed APK**
   - Location: `android/app/build/outputs/apk/release/app-release.apk`

## 🔧 Development Workflow

### Modify the Web App
1. Edit React components in `components/`, `services/`, etc.
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Sync to Android: `npx cap sync android`
5. Rebuild APK

### Update Android Configuration
- **App Name:** Edit `android/app/src/main/res/values/strings.xml`
- **Package Name:** Edit `android/app/build.gradle` and `AndroidManifest.xml`
- **Permissions:** Edit `android/app/src/main/AndroidManifest.xml`
- **App Icon:** Replace files in `android/app/src/main/res/mipmap-*/`

## 📱 Install APK on Device

### Android Device (USB)
1. Enable Developer Options (tap Build Number 7 times in Settings → About)
2. Enable USB Debugging in Developer Options
3. Connect device via USB
4. Run: `adb install app-debug.apk`

### Android Device (Direct)
1. Transfer APK to device
2. Enable "Install from Unknown Sources" in Settings → Security
3. Tap APK file and install

### Android Emulator
1. Start emulator from Android Studio (AVD Manager)
2. Drag and drop APK onto emulator window
3. Or use: `adb install app-debug.apk`

## ⚠️ Troubleshooting

### "JAVA_HOME not set"
Set JAVA_HOME environment variable to your JDK installation path.

### "SDK not found"
Set ANDROID_HOME to your Android SDK path (usually in AppData or Library folder).

### "Gradle build failed"
- Check internet connection (downloads dependencies)
- Increase Gradle memory in `android/gradle.properties`:
  ```
  org.gradle.jvmargs=-Xmx2048m
  ```

### "Build too slow"
First build downloads ~500MB dependencies. Subsequent builds are much faster.
Enable Gradle daemon in `android/gradle.properties`:
```
org.gradle.daemon=true
org.gradle.configureondemand=true
```

## 📊 Build Times
- **First build:** 10-20 minutes (downloads all dependencies)
- **Incremental builds:** 1-3 minutes
- **Clean builds:** 3-5 minutes

## 📦 APK Size
- **Debug APK:** ~5-10 MB
- **Release APK (optimized):** ~3-6 MB

## 🌐 Alternative: Run as Web App
The built web app is in the `dist` folder. You can:
1. Host on any web server
2. Access on mobile browser
3. Add to home screen for app-like experience

## 📚 Documentation Links
- **Capacitor:** https://capacitorjs.com/docs
- **React:** https://react.dev/
- **Android Developers:** https://developer.android.com/

## 🆘 Support
For build issues:
1. Check Android Studio build output for errors
2. Verify all prerequisites are installed
3. Ensure environment variables are set correctly

## 📄 License
Check project license files for usage terms.

---

**Built with:** React + TypeScript + Vite + Capacitor
**Target Platform:** Android 8.0+ (API Level 26+)
**Package Name:** com.hyperxgen.app