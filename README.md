# Fitness Tracker

A comprehensive health and fitness companion built with React, TypeScript, and Capacitor. Track workouts, monitor nutrition, and achieve your fitness goals with a modern, responsive interface that works seamlessly across web and mobile platforms.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)

## ✨ Features

### 📊 Health & Fitness Calculators

- **BMI Calculator** - Body Mass Index with detailed category classification
- **Body Fat Percentage Calculator** - Multiple measurement methods for accurate results
- **TDEE Calculator** - Total Daily Energy Expenditure estimation
- **Weight Loss Calculator** - Goal setting with calorie targets
- **Heart Rate Zone Calculator** - Optimal training intensity zones
- **One-Rep Max Calculator** - Strength training calculations
- **Macro Calculator** - Personalized macronutrient distribution

### 💪 Fitness Tracking

- **Personal Fitness Dashboard** - Comprehensive fitness profile with body metrics and analytics
- **Workout Tracker** - Log workouts with automatic calorie calculation using MET values
- **Workout Calendar Planner** - Schedule and plan workouts with calendar view
- **Analytics Dashboard** - Visualize progress with charts and insights
- **Goals Manager** - Set, track, and achieve fitness goals
- **Notification Center** - Stay motivated with reminders and achievements

### 🥗 Nutrition & Diet

- **Calorie Tracker** - Daily caloric intake monitoring with meal logging
- **Food Database** - Search comprehensive nutritional information powered by Canadian Nutrient File
- **Healthy Food Resources** - Curated links to trusted nutrition resources from health organizations

### 👤 User Experience

- **Secure Authentication** - Email/password authentication with Firebase
- **Password Recovery** - Easy account recovery via email
- **User Profile** - Manage personal information and fitness data
- **Settings** - Customize app preferences
- **Dark/Light Theme** - Seamless theme switching with system preference detection
- **Responsive Design** - Fully optimized for mobile, tablet, and desktop
- **Cross-Platform** - Available as web app and native mobile apps (Android/iOS)

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript for type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **React Router v6** - Client-side routing
- **React Bootstrap** - UI component library
- **Ant Design** - Additional UI components and icons
- **Ionic React** - Mobile-optimized components

### Mobile

- **Capacitor** - Cross-platform native runtime
- **Android & iOS** - Native mobile app support

### Backend & Services

- **Firebase Authentication** - Secure user management
- **Firebase Firestore** - Real-time NoSQL database
- **Firebase Hosting** - Fast, secure web hosting

### Testing & Quality

- **Vitest** - Fast unit and integration testing
- **Playwright** - End-to-end testing
- **React Testing Library** - Component testing utilities
- **MSW** - API mocking for tests
- **ESLint** - Code quality and consistency
- **TypeScript** - Static type checking

### DevOps

- **GitHub Actions** - CI/CD automation
- **Storybook** - Component development and documentation
- **Chromatic** - Visual regression testing

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Firebase CLI (for deployment)
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ssreekaran/fitness-tracker.git
   cd fitness-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase**

   Create a `.env` file in the root directory:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Building for Production

**Web Application**

```bash
npm run build
npm run preview  # Preview production build locally
```

**Android**

```bash
npx cap sync android
npx cap open android
```

**iOS**

```bash
npx cap sync ios
npx cap open ios
```

## 📁 Project Structure

```
fitness-tracker/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── calculators/        # Calculator-specific components
│   │   ├── common/             # Shared components (LoadingSpinner, Footer, etc.)
│   │   ├── fitness/            # Fitness tracking components
│   │   ├── Navbar/             # Navigation components
│   │   └── __tests__/          # Component unit tests
│   ├── pages/                   # Page components
│   │   ├── auth/               # Authentication pages
│   │   ├── calculators/        # Calculator pages
│   │   ├── fitness/            # Fitness tracking pages
│   │   ├── legal/              # Legal pages (Privacy, Terms)
│   │   ├── nutrition/          # Nutrition tracking pages
│   │   └── *.tsx               # Other pages (Home, About, Profile, Settings)
│   ├── services/                # Business logic and API services
│   │   ├── analyticsService.ts # Progress tracking and analytics
│   │   ├── fitnessService.ts   # Fitness data management
│   │   ├── foodDatabase.ts     # Food database integration
│   │   ├── foodService.ts      # Nutrition services
│   │   ├── goalsService.ts     # Goal management
│   │   ├── notificationService.ts # Notification system
│   │   └── workoutService.ts   # Workout management
│   ├── utils/                   # Utility functions and helpers
│   │   ├── __tests__/          # Utility tests
│   │   ├── logger.ts           # Logging utilities
│   │   └── test-*.tsx          # Testing utilities
│   ├── mocks/                   # MSW API mocks for testing
│   ├── styles/                  # Global styles and themes
│   ├── __tests__/              # Integration tests
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   └── firebase.ts              # Firebase configuration
├── tests/                       # End-to-end tests
│   └── e2e/                    # Playwright E2E tests
├── docs/                        # Project documentation
│   ├── INDEX.md                # Documentation index
│   ├── setup/                  # Setup guides
│   ├── features/               # Feature documentation
│   ├── guides/                 # Development guides
│   └── archive/                # Archived documentation
├── android/                     # Android native project
├── ios/                         # iOS native project
├── public/                      # Static assets
├── .storybook/                  # Storybook configuration
├── .github/                     # GitHub Actions workflows
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Vitest configuration
├── playwright.config.ts        # Playwright configuration
├── capacitor.config.ts         # Capacitor configuration
└── package.json                # Project dependencies

```

## 🧪 Testing

### Run Tests

```bash
# Unit and integration tests
npm test                    # Run once
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
npm run test:ui            # Interactive UI

# End-to-end tests
npm run test:e2e           # Headless mode
npm run test:e2e:headed    # Headed mode
npm run test:e2e:ui        # Interactive UI

# Run all tests
npm run test:all
```

### Testing Strategy

- **Unit Tests** - Individual components and utilities
- **Integration Tests** - Component interactions and workflows
- **E2E Tests** - Full user journeys with Playwright
- **Visual Tests** - Component snapshots with Storybook

## 📦 Available Scripts

| Script                    | Description                |
| ------------------------- | -------------------------- |
| `npm run dev`             | Start development server   |
| `npm run build`           | Build for production       |
| `npm run preview`         | Preview production build   |
| `npm test`                | Run unit tests             |
| `npm run test:e2e`        | Run E2E tests              |
| `npm run lint`            | Lint code with ESLint      |
| `npm run storybook`       | Start Storybook dev server |
| `npm run build-storybook` | Build Storybook            |

## 🚀 Deployment

### Web (Firebase Hosting)

```bash
npm run build
firebase login
firebase deploy --only hosting
```

### Mobile Apps

Follow the standard deployment process for Android (Google Play) and iOS (App Store) after building with Capacitor.

## 🏗️ Architecture

### Component Architecture

- **Atomic Design** - Components organized by complexity
- **Composition** - Reusable, composable components
- **Props Interface** - Strongly typed component APIs

### State Management

- **React Hooks** - Local component state
- **Context API** - Global state (auth, theme)
- **Service Layer** - Business logic separation

### Code Quality

- **TypeScript** - Type safety throughout
- **ESLint** - Code quality enforcement
- **Testing** - Comprehensive test coverage
- **Documentation** - Inline comments and docs

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:

- All tests pass
- Code follows ESLint rules
- TypeScript types are properly defined
- New features include tests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

**Sarmilan Sreekaran**

- Email: [fitness.tracker.00001@gmail.com](mailto:fitness.tracker.00001@gmail.com)
- GitHub: [@ssreekaran](https://github.com/ssreekaran)
- Project: [https://github.com/ssreekaran/fitness-tracker](https://github.com/ssreekaran/fitness-tracker)

## 🙏 Acknowledgments

Built with these amazing technologies:

- [React](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Firebase](https://firebase.google.com/) - Backend services
- [Capacitor](https://capacitorjs.com/) - Mobile runtime
- [Vitest](https://vitest.dev/) - Testing framework
- [Playwright](https://playwright.dev/) - E2E testing

---

<p align="center">
  Made with ❤️ by Sarmilan Sreekaran
</p>
