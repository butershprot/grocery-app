import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2D4C4W4W1hdCXonUvcZXi0Chis3CIHR0",
  authDomain: "grocery-calculator-f2922.firebaseapp.com",
  projectId: "grocery-calculator-f2922",
  storageBucket: "grocery-calculator-f2922.firebasestorage.app",
  messagingSenderId: "456725496326",
  appId: "1:456725496326:web:730cc6142c43894a8f7987"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);