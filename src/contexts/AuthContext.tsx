import React, { createContext, useEffect, useState, useContext } from 'react';
import { auth } from '../config/firebase';
import {
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { authService, UserProfile } from '../services/authService';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';

interface AuthContextProps {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>; // Alias para signInWithEmail
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMember: boolean;
  membershipStatus: {
    isActive: boolean;
    daysUntilExpiry: number;
  } | null;
  refreshUserProfile: () => Promise<void>;
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
  const [user, setUserState] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [membershipStatus, setMembershipStatus] = useState<{
    isActive: boolean;
    daysUntilExpiry: number;
  } | null>(null);

  const dispatch = useDispatch();

  // Cargar perfil de usuario
  const loadUserProfile = async (uid: string) => {
    try {
      const profile = await authService.getUserProfile(uid);
      setUserProfile(profile);
      
      if (profile) {
        // Sincronizar Redux con el perfil cargado
        dispatch(setUser({
          uid: profile.uid,
          email: profile.email,
          role: profile.role?.toUpperCase(),
          membershipEnd: profile.membershipEnd ? 
            (typeof profile.membershipEnd === 'string' ? 
              profile.membershipEnd : 
              (profile.membershipEnd && typeof profile.membershipEnd.toDate === 'function' ? 
                profile.membershipEnd.toDate().toISOString() : 
                new Date(profile.membershipEnd).toISOString()
              )
            ) : null,
          name: profile.displayName, // Agregar el nombre del usuario
          weight: profile.weight,
          height: profile.height,
          age: profile.age,
        }));
        const status = await authService.checkMembershipStatus(uid);
        setMembershipStatus(status);
      }
    } catch (error) {
      console.error('Error cargando perfil de usuario:', error);
      setUserProfile(null);
      setMembershipStatus(null);
    }
  };

  // Refrescar perfil de usuario
  const refreshUserProfile = async () => {
    if (user) {
      await loadUserProfile(user.uid);
    }
  };

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUserState(user);
      
      if (user) {
        console.log('Usuario autenticado:', user.email);
        await loadUserProfile(user.uid);
      } else {
        console.log('Usuario no autenticado');
        setUserProfile(null);
        setMembershipStatus(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Iniciar sesión con email y contraseña
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authService.signInWithEmail(email, password);
      console.log('Inicio de sesión con email exitoso');
    } catch (error: any) {
      setLoading(false);
      console.error('Error en sign-in con email:', error);
      throw error;
    }
  };

  // Registrarse con email y contraseña
  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      await authService.signUpWithEmail(email, password, displayName);
      console.log('Registro con email exitoso');
    } catch (error: any) {
      setLoading(false);
      console.error('Error en sign-up con email:', error);
      throw error;
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      console.log('Sesión cerrada exitosamente');
    } catch (error: any) {
      setLoading(false);
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  // Cambiar contraseña
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      await authService.changePassword(currentPassword, newPassword);
      console.log('Contraseña cambiada exitosamente');
    } catch (error: any) {
      setLoading(false);
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  };

  const value: AuthContextProps = {
    user,
    userProfile,
    loading,
    signInWithEmail,
    signIn: signInWithEmail, // Alias para signInWithEmail
    signUpWithEmail,
    signOut,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: userProfile?.role === 'ADMIN',
    isMember: userProfile?.role === 'MEMBER',
    membershipStatus,
    refreshUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 