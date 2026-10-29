// Firebase core
import { initializeApp } from "firebase/app";

// Auth
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Analytics (опционально)
import { getAnalytics } from "firebase/analytics";

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDNtOt6vM4_ac3NoG24rlFuCr9ol4yA5m8",
  authDomain: "firsthotel-bcc13.firebaseapp.com",
  projectId: "firsthotel-bcc13",
  storageBucket: "firsthotel-bcc13.firebasestorage.app",
  messagingSenderId: "468144060678",
  appId: "1:468144060678:web:b450a67ee68b6cb9600687",
  measurementId: "G-K7PRE9LZ3V",
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация сервисов
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics (можно удалить, если не нужен)
export const analytics = getAnalytics(app);
