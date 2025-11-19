# Firebase Authentication Setup Guide

Since you switched to the new Firebase project (`fitness-tracker-clean`), you need to configure Google Sign-In authentication.

## 🔧 Enable Google Authentication

### 1. Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **fitness-tracker-clean**
3. Go to **Authentication** → **Sign-in method**

### 2. Enable Google Sign-In

1. Click on **Google** in the sign-in providers list
2. Click the **Enable** toggle
3. **Project support email**: Enter your email address
4. Click **Save**

### 3. Configure OAuth Consent Screen (if needed)

If you see warnings about OAuth consent screen:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **fitness-tracker-clean**
3. Go to **APIs & Services** → **OAuth consent screen**
4. Fill in required fields:
   - **App name**: Fitness Tracker
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**

### 4. Add Authorized Domains

In Firebase Console → Authentication → Settings → Authorized domains:

Make sure these domains are added:

- `fitness-tracker-clean.web.app`
- `fitness-tracker-clean.firebaseapp.com`
- `localhost` (for development)

## 🧪 Test Google Sign-In

### Web Testing:

1. Go to https://fitness-tracker-clean.web.app/login
2. Click "Sign in with Google"
3. Should work without issues

### Android Testing:

1. Build and install the Android app
2. Click "Sign in with Google"
3. Should open browser and redirect to web app for authentication

## 🚨 Common Issues & Solutions

### Issue: "OAuth client not found"

**Solution**: Make sure the OAuth client is properly configured in Google Cloud Console

### Issue: "Unauthorized domain"

**Solution**: Add your domain to authorized domains in Firebase Console

### Issue: "App not verified"

**Solution**: This is normal for development. Users will see a warning but can proceed.

## 📋 Verification Checklist

- [ ] Google Sign-In enabled in Firebase Console
- [ ] Project support email configured
- [ ] Authorized domains added
- [ ] OAuth consent screen configured (if needed)
- [ ] Web app Google sign-in working
- [ ] Android app Google sign-in working

## 🔗 Quick Links

- [Firebase Console - Authentication](https://console.firebase.google.com/project/fitness-tracker-clean/authentication/providers)
- [Google Cloud Console - OAuth](https://console.cloud.google.com/apis/credentials/consent)
- [Your Web App](https://fitness-tracker-clean.web.app/login)

---

**Note**: After enabling Google authentication, users from the old Firebase project will need to sign in again as they're now using a different authentication system.
