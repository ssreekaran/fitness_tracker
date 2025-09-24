# Fitness Tracker

A modern, full-stack fitness tracker web application built with React, TypeScript, Firebase, and Bootstrap. This project demonstrates my ability to design and implement a feature-rich, user-friendly web app from scratch. It is intended as a portfolio project.

Try it yourself: [Fitness Tracker](https://fitness-tracker-00001.web.app/)

## Features

- **User Authentication**: Secure sign up, log in, and profile management with Firebase Authentication
- **Health Calculators**:
  - BMI Calculator with category classification
  - Body Fat Percentage Calculator
  - Weight Loss Calculator
- **Workout Tracking**: Log and monitor your fitness routines
- **Personal Profile**: View and manage your fitness profile
- **Responsive Design**: Mobile-friendly interface with dark mode support
- **Modern UI**: Built with Ant Design and Bootstrap for a clean, professional look

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: 
  - React Bootstrap v2.9.0 (Primary UI Library)
  - Bootstrap v5.3.2
  - React Icons (for all icon needs)
- **State Management**: React Hooks
- **Routing**: React Router v6
- **Testing**: 
  - Vitest
  - React Testing Library
  - Coverage reporting with @vitest/coverage-v8

## UI Strategy

### Current Implementation
- **Primary UI Library**: React Bootstrap
  - Used consistently across most components
  - Provides responsive design and accessibility out of the box
  - Follows Bootstrap's utility-first approach

- **Icons**: React Icons
  - Single source for all icon needs
  - Includes multiple icon sets (Font Awesome, Material, etc.)
  - Tree-shaking support for optimal bundle size

### Migration Plan
1. **Phase 1: Remove Unused Dependencies** (Completed)
   - Removed `@ant-design/icons` (unused)
   - Removed `@fortawesome` packages (consolidated to react-icons)
   - Moved `@emotion` to devDependencies (only used for testing)

2. **Phase 2: Standardize Components** (In Progress)
   - Migrate remaining Ant Design components to React Bootstrap
   - Update all icon imports to use react-icons
   - Ensure consistent theming using Bootstrap's CSS variables

3. **Phase 3: Optimization**
   - Implement code splitting for better performance
   - Optimize bundle size by importing only necessary components
   - Add performance monitoring

### Backend & Infrastructure
- **Hosting**: Firebase Hosting
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **CI/CD**: GitHub Actions
## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase CLI (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/fitness-tracker.git
   cd fitness-tracker/fitness_tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Create a `.env` file with your Firebase config

4. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:ui` - Launch test UI
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Page components
├── services/       # API and business logic
├── utils/          # Utility functions and helpers
├── App.tsx         # Main application component
├── main.tsx        # Application entry point
└── firebase.ts     # Firebase configuration
```

## Testing

The project includes unit tests for utility functions and components. To run tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Launch test UI
npm run test:ui
```

## Deployment

The application is configured for deployment to Firebase Hosting. To deploy:

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```

## Contact

For questions or feedback, please email: [fitness.tracker.00001@gmail.com](mailto:fitness.tracker.00001@gmail.com)

---
**Created by Sarmilan Sreekaran**