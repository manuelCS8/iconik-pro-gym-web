import React, { createContext, useEffect, useState, useContext } from 'react';
import { auth } from '../config/firebase';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
} from 'firebase/auth';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configurar Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.REACT_APP_GOOGLE_WEB_CLIENT_ID || '375868728099-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
      iosClientId: process.env.REACT_APP_GOOGLE_IOS_CLIENT_ID || '375868728099-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });

    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        console.log('Usuario autenticado:', user.email);
      } else {
        console.log('Usuario no autenticado');
      }
    });

    return () => unsubscribe();
  }, []);

  // Iniciar sesión con Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Verificar que Google Play Services esté disponible
      await GoogleSignin.hasPlayServices();
      
      // Iniciar el proceso de sign-in
      const { idToken } = await GoogleSignin.signIn();
      
      // Crear credencial de Firebase
      const credential = GoogleAuthProvider.credential(idToken);
      
      // Iniciar sesión en Firebase
      await signInWithCredential(auth, credential);
      
      console.log('Inicio de sesión con Google exitoso');
    } catch (err: any) {
      setLoading(false);
      
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Usuario canceló el inicio de sesión');
        throw new Error('Inicio de sesión cancelado por el usuario');
      } else if (err.code === statusCodes.IN_PROGRESS) {
        console.log('Inicio de sesión en progreso');
        throw new Error('Inicio de sesión en progreso');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Google Play Services no disponible');
        throw new Error('Google Play Services no disponible');
      } else {
        console.error('Error en Google Sign-In:', err);
        throw new Error('Error al iniciar sesión con Google');
      }
    }
  };

  // Iniciar sesión con email y contraseña
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Inicio de sesión con email exitoso');
    } catch (error: any) {
      setLoading(false);
      console.error('Error en sign-in con email:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('Usuario no encontrado');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Contraseña incorrecta');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Demasiados intentos fallidos. Intenta más tarde');
      } else {
        throw new Error('Error al iniciar sesión');
      }
    }
  };

  // Registrarse con email y contraseña
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registro con email exitoso');
    } catch (error: any) {
      setLoading(false);
      console.error('Error en sign-up con email:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('El email ya está en uso');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('La contraseña es muy débil');
      } else {
        throw new Error('Error al crear la cuenta');
      }
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      setLoading(true);
      
      // Cerrar sesión en Firebase
      await firebaseSignOut(auth);
      
      // Cerrar sesión en Google Sign-In
      await GoogleSignin.signOut();
      
      console.log('Sesión cerrada exitosamente');
    } catch (error: any) {
      setLoading(false);
      console.error('Error al cerrar sesión:', error);
      throw new Error('Error al cerrar sesión');
    }
  };

  const value: AuthContextProps = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 