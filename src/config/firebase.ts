import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDslyn4Z6Ozv8Y4Ttsm6y2vwtsf6qX5Nvo",
  authDomain: "app-iconik-pro.firebaseapp.com",
  projectId: "app-iconik-pro",
  storageBucket: "app-iconik-pro.firebasestorage.app",
  messagingSenderId: "375868728099",
  appId: "1:375868728099:android:d43d836d542c27873b6296"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configurar proveedor de Google
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export default app; 