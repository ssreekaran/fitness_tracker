// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1s4yiPp8IqUpLQc64lRPwtdQe8pHyKTg",
  authDomain: "fitness-tracker-00001.firebaseapp.com",
  databaseURL: "https://fitness-tracker-00001-default-rtdb.firebaseio.com",
  projectId: "fitness-tracker-00001",
  storageBucket: "fitness-tracker-00001.firebasestorage.app",
  messagingSenderId: "894203659946",
  appId: "1:894203659946:web:3ac6ecd0523efd463ff2d3",
  measurementId: "G-K4DGV7MRFY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);
