# Fitness Tracker

A modern, full-stack fitness tracker web application built with React, TypeScript, Firebase, and Bootstrap. This project demonstrates my ability to design and implement a feature-rich, user-friendly web app from scratch. It is intended as a portfolio project.

## Features

- **User Authentication**: Sign up and login with Firebase Authentication. Users can create an account, set a display name, and manage their profile (including account deletion).
- **BMI Calculator**: Calculate Body Mass Index (BMI) with support for metric and imperial units, and see your BMI category.
- **Body Fat Calculator**: Estimate body fat percentage using the U.S. Navy method, supporting both male and female users and multiple units.
- **Weight Loss Calculator**: Get personalized daily calorie recommendations based on your age, sex, height, weight, activity level, and weight loss goals.
- **Food Database**:
  - Search and browse a comprehensive Canadian food nutrient database, with nutritional info for hundreds of foods (data from Health Canada, parsed on the client side, stored on the server side).
  - **Numerical Sorting**: Foods are sorted numerically by Food Code for intuitive browsing.
  - **Improved Search**: Search works for both food names (partial match) and Food Codes (exact numeric match).
- **Healthy Food Suggestions**: Explore healthy food options and nutrition tips.
- **Responsive UI with Dark Mode**: Clean, mobile-friendly design with Bootstrap and custom CSS. Includes a dark mode toggle.
- **Navigation & Routing**: Multi-page SPA with React Router for seamless navigation.
- **Contact & About Pages**: Learn more about the project and easily send feedback via email.

## Recent Improvements

- **Food Database Table**: Now displays foods sorted numerically by Food Code, with robust search for both codes and names.
- **Performance & Usability**: Faster searching and sorting, improved user experience.
- **Removed Query Limit**: All food items are now loaded and searchable.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Bootstrap, React-Bootstrap, React Router, React Icons
- **Backend/Auth**: Firebase Authentication
- **Data**: Canadian Nutrient File (CSV), parsed client-side with PapaParse
- **Other**: ESLint, Prettier, modern React best practices

## Contact

For questions or feedback, please email: [fitness.tracker.00001@gmail.com](mailto:fitness.tracker.00001@gmail.com)

---

**Created by Sarmilan Sreekaran**