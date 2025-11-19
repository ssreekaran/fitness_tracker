# Android App Deployment Guide

This guide explains how to complete the transfer of your Android app to the new Firebase project.

## 🚨 SECURITY ALERT - API Key Exposure

**IMMEDIATE ACTION REQUIRED**: The Google API key in `android/app/google-services.json` was exposed in your repository. This file has been removed from Git tracking, but you must:

1. **Regenerate the API key** in Firebase Console immediately
2. **Review Firebase Console logs** for any unauthorized usage
3. **Follow the secure setup process** below

### Secure Setup Process

1. **Regenerate API key** in Firebase Console:
   - Go to Project Settings → General → Your apps → Android app
   - Delete and regenerate the API key
2. **Download new `google-services.json`** from Firebase Console
3. **Place it in `android/app/`** (it's now gitignored and won't be committed)
4. **Verify the file structure** should include:
   - `project_info` with your project details
   - `client` array with your app configuration
   - `api_key` with the new regenerated key
   - Package name: `com.olnbd.fitnesstracker`

## ✅ What's Already Done

- ✅ Created Android app in new Firebase project (`fitness-tracker-clean`)
- ✅ Updated `google-services.json` with new project configuration
- ✅ Synced web assets to Android project
- ✅ Updated Capacitor configuration

## 🔧 Next Steps to Complete Transfer

### 1. Build and Test Android App

**Important:** Always build for Android with compression disabled to avoid duplicate resource errors:

```bash
# Set environment variable and build for Android
$env:CAPACITOR_PLATFORM="android"; npm run build
npx cap sync android

# Then open Android Studio
npx cap open android
```

### 2. In Android Studio:

1. **Clean and Rebuild Project:**

   - Go to `Build` → `Clean Project`
   - Then `Build` → `Rebuild Project`

2. **Update Dependencies:**

   - If prompted, update any outdated dependencies
   - Sync Gradle files when prompted

3. **Test the App:**
   - Run the app on an emulator or device
   - Test Firebase authentication and data sync
   - Verify all features work with the new Firebase project

### 3. Update App Signing (if needed)

If you're using a production keystore, make sure your environment variables are set:

```bash
# Set these environment variables for production builds
KEYSTORE_PATH=path/to/your/keystore.jks
KEYSTORE_ALIAS=your_alias
KEYSTORE_PASSWORD=your_password
KEYSTORE_ALIAS_PASSWORD=your_alias_password
```

### 4. Generate Release Build

```bash
# In Android Studio, go to:
# Build → Generate Signed Bundle / APK
# Choose Android App Bundle (recommended for Play Store)
```

### 5. Update Play Store Listing (if applicable)

If you're publishing to Google Play Store:

1. **Update App Description** (if needed)
2. **Update Screenshots** (if UI changed)
3. **Test Internal/Alpha Release** before production
4. **Upload new App Bundle**

## 🔍 Key Changes Made

### Firebase Configuration

- **Old Project:** `fitness-tracker-00001`
- **New Project:** `fitness-tracker-clean`
- **⚠️ API Key:** REGENERATE IMMEDIATELY (previous key was exposed)
- **New Project Number:** `913212904877`

### App Configuration

- **Package Name:** `com.olnbd.fitnesstracker` (unchanged)
- **App ID:** `1:913212904877:android:8eaa5749ac3b9dd32e7d24`

## 🚨 Important Notes

1. **Data Migration:** User data from the old Firebase project won't automatically transfer. Users may need to re-register or you'll need to migrate data manually.

2. **Authentication:** Users will need to sign in again as they're now using a different Firebase project.

3. **Testing:** Thoroughly test all Firebase features:

   - User authentication
   - Firestore database operations
   - File uploads (if any)
   - Push notifications (if implemented)

4. **Rollback Plan:** Keep the old `google-services.json` backed up in case you need to revert.

## 🔧 Troubleshooting

### If Build Fails:

```bash
# Clean everything and rebuild
cd android
./gradlew clean
cd ..
npx cap sync android
npx cap open android
```

### If Firebase Connection Issues:

1. Verify `google-services.json` is in `android/app/`
2. Check that package name matches in Firebase Console
3. Ensure Firebase services are enabled in Firebase Console

### If Authentication Issues:

1. Enable Authentication methods in new Firebase project
2. Configure OAuth providers if using social login
3. Update any hardcoded Firebase URLs in your code

## 📱 Testing Checklist

- [ ] App builds successfully
- [ ] User registration works
- [ ] User login works
- [ ] Data saves to Firestore
- [ ] Data loads from Firestore
- [ ] All calculators work
- [ ] Workout tracking functions
- [ ] Goals management works
- [ ] Settings save properly

## 🎉 Deployment Complete!

Once testing is successful, your Android app is ready for distribution with the new Firebase project!

---

**Need Help?** If you encounter any issues, check the Firebase Console logs and Android Studio build logs for specific error messages.

## 🔧 Troubleshooting

### If Build Fails with "Duplicate Resources" Error:

This happens when compression creates .gz files alongside regular files. Always build for Android with:

```bash
$env:CAPACITOR_PLATFORM="android"; npm run build
npx cap sync android
```

### If Build Still Fails:

```bash
# Clean everything and rebuild
$env:CAPACITOR_PLATFORM="android"; npm run build
npx cap sync android
npx cap open android
```

### If Firebase Connection Issues:

1. Verify `google-services.json` is in `android/app/`
2. Check that package name matches in Firebase Console
3. Ensure Firebase services are enabled in Firebase Console

### If Authentication Issues:

1. Enable Authentication methods in new Firebase project
2. Configure OAuth providers if using social login
3. Update any hardcoded Firebase URLs in your code

## ⏰ OAuth Configuration Timing

### Mobile Authentication Redirect Issues

**IMPORTANT**: Google Cloud Console OAuth configuration changes take time to propagate:

- **Propagation Time**: 5 minutes to several hours (Google's official timeframe)
- **Common Issue**: Localhost redirect errors persist after removing localhost from authorized domains
- **Root Cause**: Configuration changes haven't fully propagated across Google's systems
- **Solution**: Wait 1-2 hours after making OAuth configuration changes before testing
- **Testing**: Mobile authentication should work properly once propagation is complete

**Note**: If you only waited 5 minutes after making OAuth changes, that's likely why authentication issues persisted. The mobile auth flow should work correctly now that more time has passed.
