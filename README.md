# Fitness Tracker

A modern, full-stack fitness tracker web application built with React, TypeScript, Firebase, and Bootstrap. This project demonstrates my ability to design and implement a feature-rich, user-friendly web app from scratch. It is intended as a portfolio project.

## Features

- **User Authentication**: Sign up and login with Firebase Authentication. Users can create an account, set a display name, and manage their profile (including account deletion).
- **BMI Calculator**: Calculate Body Mass Index (BMI) with support for metric and imperial units, and see your BMI category.
- **Body Fat Calculator**: Estimate body fat percentage using the U.S. Navy method, supporting both male and female users and multiple units.
- **Weight Loss Calculator**: Get personalized daily calorie recommendations based on your age, sex, height, weight, activity level, and weight loss goals.
- **Food Database**: Search and browse a comprehensive Canadian food nutrient database, with nutritional info for hundreds of foods (data from Health Canada, parsed on the client side).
- **Healthy Food Suggestions**: Explore healthy food options and nutrition tips.
- **Responsive UI with Dark Mode**: Clean, mobile-friendly design with Bootstrap and custom CSS. Includes a dark mode toggle.
- **Navigation & Routing**: Multi-page SPA with React Router for seamless navigation.
- **Contact & About Pages**: Learn more about the project and easily send feedback via email.

## Screenshots

> _Add screenshots or a short demo GIF here to showcase the UI and features._

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Bootstrap, React-Bootstrap, React Router, React Icons
- **Backend/Auth**: Firebase Authentication
- **Data**: Canadian Nutrient File (CSV), parsed client-side with PapaParse
- **Other**: ESLint, Prettier, modern React best practices

## Project Structure

```
fitness-tracker/
└── fitness_tracker/
    ├── src/
    │   ├── pages/         # Main app pages (BMI, Body Fat, Food DB, etc.)
    │   ├── components/    # Reusable components (Navbar, Header, etc.)
    │   ├── firebase.ts    # Firebase config
    │   └── ...
    ├── public/            # Static files and assets
    ├── index.html         # App entry point
    ├── package.json       # Dependencies and scripts
    └── ...
```

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/fitness-tracker.git
   cd fitness-tracker/fitness_tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com/).
   - Add your Firebase configuration to `.env` (see `.env.example` if available).

4. **Run the app locally**

   ```bash
   npm run dev
   ```

5. **Build for production**

   ```bash
   npm run build
   ```

## Contact

For questions or feedback, please email: [fitness.tracker.00001@gmail.com](mailto:fitness.tracker.00001@gmail.com)

---

**Created by Sarmilan Sreekaran**