# Deployment Guide

This guide explains how to deploy your fitness tracker app to Firebase Hosting.

## 🚀 Manual Deployment (Recommended for now)

### Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in to Firebase: `firebase login`

### Deploy Steps

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Deploy to Firebase:**

   ```bash
   firebase deploy --only hosting
   ```

3. **Your app will be live at:**
   - https://fitness-tracker-clean.web.app
   - https://fitness-tracker-clean.firebaseapp.com

## 🤖 Automatic Deployment (Optional)

To enable automatic deployment when you push to the `main` branch:

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/fitness-tracker-clean/settings/serviceaccounts/adminsdk)
2. Click "Generate new private key"
3. Download the JSON file

### 2. Add GitHub Secret

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Name: `FIREBASE_SERVICE_ACCOUNT_FITNESS_TRACKER_CLEAN`
5. Value: Paste the entire JSON content from the downloaded file
6. Click "Add secret"

### 3. Push to Main Branch

Once the secret is added, any push to the `main` branch will automatically:

- Build your app
- Deploy to Firebase Hosting
- Update your live site

## 🔧 Environment Variables

Make sure these secrets are set in your GitHub repository for deployment:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## 🛠️ Troubleshooting

### Build Fails

- Check that all environment variables are set
- Run `npm run lint` to fix any code issues
- Run `npm run test` to ensure tests pass

### Deployment Fails

- Ensure you're logged in: `firebase login`
- Check Firebase project permissions
- Verify the project ID in `firebase.json`

### App Not Working After Deployment

- Check browser console for errors
- Verify Firebase configuration in production
- Ensure Firestore rules are deployed: `firebase deploy --only firestore:rules`

## 📋 Deployment Checklist

Before deploying:

- [ ] All tests pass: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables are set
- [ ] Firestore rules are secure and deployed
- [ ] App works locally: `npm run dev`

## 🌐 Live URLs

After deployment, your app will be available at:

- **Primary**: https://fitness-tracker-clean.web.app
- **Alternative**: https://fitness-tracker-clean.firebaseapp.com

Both URLs serve the same app, use whichever you prefer!
