/* eslint-disable @typescript-eslint/no-unused-vars */
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "w3-map-veto-tool-b3c87.firebaseapp.com",
  databaseURL:
    "https://w3-map-veto-tool-b3c87-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "w3-map-veto-tool-b3c87",
  storageBucket: "w3-map-veto-tool-b3c87.appspot.com",
  messagingSenderId: "314245453265",
  appId: "1:314245453265:web:ba58063c732a8ac22bfcf0",
  measurementId: "G-XZXJBTP2CW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getDatabase();
