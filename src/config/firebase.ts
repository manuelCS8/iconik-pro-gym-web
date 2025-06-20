// src/config/firebase.ts - Configuración REAL de Firebase
// Esta configuración usa Firebase real para producción

// 🔥 MODO ACTUAL: FIREBASE REAL
// Para cambiar a modo mock, cambia USE_MOCK_FIREBASE a true
const USE_MOCK_FIREBASE = false; // ✅ Cambiado a false para usar Firebase real

console.log(USE_MOCK_FIREBASE ? "🧪 Firebase: Usando modo Mock para desarrollo" : "🔥 Firebase: Usando configuración real");

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseCreateUser,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDZoK4MZ8ORqD6nfMswbZMLmSNsZoS1X-w",
  authDomain: "conikprogym.firebaseapp.com",
  projectId: "conikprogym",
  storageBucket: "conikprogym.firebasestorage.app",
  messagingSenderId: "113622948013",
  appId: "1:113622948013:web:5eecb446a91a47d1b44e24"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export { serverTimestamp, Timestamp };

// Auth functions - Firebase SDK real
export const signInWithEmailAndPassword = firebaseSignIn;
export const createUserWithEmailAndPassword = firebaseCreateUser;
export const signOut = firebaseSignOut;
export const onAuthStateChanged = firebaseOnAuthStateChanged;
export const sendPasswordResetEmail = firebaseSendPasswordResetEmail;

// Firestore functions - Firebase SDK real
export { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, limit };

// Storage functions - Firebase SDK real
export { ref, uploadBytes, getDownloadURL, deleteObject };

// Export configuration flag
export { USE_MOCK_FIREBASE };

// 🔥 CONFIGURACIÓN ACTUAL: FIREBASE REAL
// 
// ✅ CREDENCIALES QUE FUNCIONAN:
// 🔥 Cualquier cuenta registrada en Firebase Console
// 🔥 Usuarios creados a través de SignUpScreen
// 
// ❌ CREDENCIALES MOCK YA NO FUNCIONAN
// 
// 🛠️ PARA CREAR USUARIO ADMIN:
// 1. Ve a Firebase Console > Authentication > Users
// 2. Crea usuario: admin@iconik.com / admin123
// 3. Ve a Firestore > users > [UID] y agrega:
//    {
//      "name": "Administrador",
//      "email": "admin@iconik.com", 
//      "role": "ADMIN",
//      "membershipStart": "2024-01-01T00:00:00.000Z",
//      "membershipEnd": "2025-12-31T23:59:59.999Z",
//      "age": 30,
//      "weight": 80,
//      "height": 180,
//      "createdAt": "2024-01-01T00:00:00.000Z"
//    } 