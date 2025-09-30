# Fitness Tracker

A comprehensive health and fitness companion built with React, TypeScript, and Capacitor, designed to help users track their workouts, monitor nutrition, and achieve their fitness goals. This project showcases modern web development practices and responsive design.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)

## 🚀 Features

### 📊 Health & Fitness Calculators
- **BMI Calculator**: Calculate your Body Mass Index with detailed category classification
- **Body Fat Percentage Calculator**: Advanced calculator using multiple measurement methods
- **TDEE Calculator**: Determine your Total Daily Energy Expenditure
- **Weight Loss Calculator**: Set and track weight loss goals with calorie targets
- **Heart Rate Zone Calculator**: Find your optimal heart rate zones for different training intensities
- **One-Rep Max Calculator**: Calculate your 1RM for strength training
- **Macro Calculator**: Determine your ideal macronutrient distribution

### 💪 Workout Management
- **Workout Planner**: Create and manage custom workout routines
- **Exercise Library**: Comprehensive collection of exercises with detailed instructions
- **Workout Tracker**: Log and track your workout sessions
- **Workout Recommendations**: Get personalized workout suggestions
- **Progress Tracking**: Monitor your strength and fitness improvements over time

### 🥗 Nutrition & Diet
- **Calorie Tracker**: Monitor your daily caloric intake
- **Macro Tracker**: Track protein, carbs, and fat consumption
- **Food Database**: Search and log nutritional information
- **Healthy Food Recommendations**: Discover nutritious food options
- **Diet Recommendations**: Get personalized diet plans based on your goals
- **Meal Planning**: Plan your meals for optimal nutrition

### 👤 User Experience
- **Dark/Light Theme**: Built-in theme support with smooth transitions
- **Responsive Design**: Fully functional on mobile, tablet, and desktop
- **Offline Support**: Access your data without an internet connection
- **Secure Authentication**: Protected user accounts with Firebase Authentication
- **Personalized Dashboard**: Track your fitness journey in one place
- **User Profile**: Manage your personal information and preferences

### 🔄 Account Features
- **Secure Sign Up/Login**: Email/password and social authentication
- **Password Recovery**: Easy account recovery options
- **Profile Management**: Update your personal information and fitness goals
- **Settings**: Customize your app experience

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tools**: 
  - Vite (Build Tool)
  - Capacitor (Cross-platform native runtime)
- **UI/UX**:
  - React Bootstrap v2.9.0
  - Bootstrap v5.3.2
  - Custom CSS Modules
  - React Icons
- **State Management**:
  - React Hooks
  - Context API
- **Routing**: React Router v6
- **Form Handling**: React Hook Form
- **Testing**:
  - Vitest (Test Runner)
  - React Testing Library
  - @vitest/coverage-v8 (Code Coverage)
  - MSW (API Mocking)

## 🎨 UI/UX Strategy

### Design Principles
- **Component-Based Architecture**: Reusable, self-contained components
- **Responsive First**: Mobile-optimized layouts that adapt to any screen size
- **Accessibility**: Built with WCAG guidelines in mind
- **Performance**: Optimized assets and lazy loading for fast load times

### Theming System
- **Dynamic Theme Support**: Toggle between light and dark modes
- **Consistent Styling**: CSS variables for theming and design tokens
- **Responsive Typography**: Readable text across all devices

### Backend & Infrastructure
- **Hosting**: Firebase Hosting
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **CI/CD**: GitHub Actions
## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher) or yarn
- Firebase CLI (for deployment)
- Android Studio / Xcode (for mobile builds)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ssreekaran/fitness-tracker.git
   cd fitness-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password, Google Sign-In)
   - Set up Firestore Database
   - Create a `.env` file in the root directory with your Firebase config:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     VITE_FIREBASE_APP_ID=your-app-id
     ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Building for Production

```bash
# Build the web application
npm run build

# Build for Android
npx cap add android
npx cap open android

# Build for iOS
npx cap add ios
npx cap open ios
```

### 📋 Available Scripts

- `dev` - Start development server
- `build` - Build for production
- `preview` - Preview production build locally
- `test` - Run tests
- `test:watch` - Run tests in watch mode
- `test:coverage` - Generate test coverage report
- `test:ui` - Launch test UI
- `lint` - Run ESLint
- `format` - Format code with Prettier
- `android` - Open Android project in Android Studio
- `ios` - Open iOS project in Xcode
- `cap:sync` - Sync web code with native projects

## 📁 Project Structure

```
src/
├── assets/           # Static assets (images, fonts, etc.)
├── components/       # Reusable UI components
│   ├── common/       # Common components (buttons, inputs, etc.)
│   ├── layout/       # Layout components (header, footer, etc.)
│   └── features/     # Feature-specific components
├── config/          # Application configuration
├── contexts/        # React contexts
├── hooks/           # Custom React hooks
├── pages/           # Page components
│   ├── auth/        # Authentication pages
│   ├── dashboard/   # Main dashboard pages
│   └── settings/    # User settings pages
├── services/        # API and business logic
│   ├── api/         # API clients
│   └── firebase/    # Firebase services
├── styles/          # Global styles and themes
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and helpers
├── App.tsx          # Main application component
├── main.tsx         # Application entry point
└── firebase.ts      # Firebase configuration
```

## 🧪 Testing

The project follows a comprehensive testing strategy:

### Unit Testing
- Test individual components and utility functions in isolation
- Mock external dependencies
- Focus on business logic and rendering

### Integration Testing
- Test component interactions
- Verify API calls and state management
- Test routing and navigation

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test path/to/test.tsx

# Update snapshots
npm test -- -u
```

### Testing Libraries
- **Vitest**: Fast test runner
- **React Testing Library**: Component testing utilities
- **MSW**: API mocking
- **@testing-library/user-event**: User interaction simulation

## 🚀 Deployment

The application can be deployed to multiple platforms:

### Web Deployment (Firebase Hosting)

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   firebase login
   firebase deploy --only hosting
   ```

### Mobile App Deployment

#### Android
1. Build the Android app:
   ```bash
   npx cap sync android
   npx cap open android
   ```
2. Follow Android Studio's build and deployment process

#### iOS
1. Build the iOS app:
   ```bash
   npx cap sync ios
   npx cap open ios
   ```
2. Follow Xcode's build and deployment process

### CI/CD
- Automated deployments on push to `main` branch
- Automated testing on pull requests
- Preview deployments for feature branches

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Firebase](https://firebase.google.com/)
- [Capacitor](https://capacitorjs.com/)
- And all the amazing open-source libraries used in this project

## 📧 Contact

Sarmilan Sreekaran - [fitness.tracker.00001@gmail.com](mailto:fitness.tracker.00001@gmail.com)

Project Link: [https://github.com/ssreekaran/fitness-tracker](https://github.com/ssreekaran/fitness-tracker)

---

<p align="center">
  Made with ❤️ by Sarmilan Sreekaran
</p>