// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAvWBMxfjs90YP7ccPemiXiJtiVp2KkkcE",
  authDomain: "bpa-2025-b4fca.firebaseapp.com",
  projectId: "bpa-2025-b4fca",
  storageBucket: "bpa-2025-b4fca.firebasestorage.app",
  messagingSenderId: "608672657670",
  appId: "1:608672657670:web:d037bcb4fcea53f825ee87",
  measurementId: "G-TNPNG989TD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);