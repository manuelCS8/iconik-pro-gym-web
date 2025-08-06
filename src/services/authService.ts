import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'ADMIN' | 'MEMBER';
  createdAt: Date;
  membershipType?: 'basic' | 'premium' | 'vip';
  membershipEnd?: Date;
  weight?: number;
  height?: number;
  age?: number;
  isActive: boolean;
  createdBy?: string; // ID del admin que creó el usuario
}

export interface CreateUserData {
  email: string;
  password: string;
  displayName: string;
  role: 'ADMIN' | 'MEMBER';
  membershipType?: 'basic' | 'premium' | 'vip';
  membershipEnd?: Date;
  weight?: number;
  height?: number;
  age?: number;
}

class AuthService {
  // Registro con email y contraseña
  async signUpWithEmail(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Crear perfil de usuario por defecto como member
      await this.createUserProfile(user.uid, {
        email,
        displayName,
        role: 'MEMBER',
        membershipType: 'basic',
        membershipEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        isActive: true
      });
      
      return user;
    } catch (error: any) {
      console.error('Error en signUpWithEmail:', error);
      throw error;
    }
  }

  // Inicio de sesión con email y contraseña
  async signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verificar si el usuario tiene un perfil válido
      const profile = await this.getUserProfile(user.uid);
      if (!profile || !profile.isActive) {
        await firebaseSignOut(auth);
        throw new Error('Usuario no autorizado o membresía vencida');
      }
      
      return user;
    } catch (error: any) {
      console.error('Error en signInWithEmail:', error);
      throw error;
    }
  }

  // Inicio de sesión con Google
  async signInWithGoogle(idToken: string): Promise<FirebaseUser> {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      
      // Verificar si el usuario tiene un perfil válido
      const profile = await this.getUserProfile(user.uid);
      if (!profile || !profile.isActive) {
        await firebaseSignOut(auth);
        throw new Error('Usuario no autorizado o membresía vencida');
      }
      
      return user;
    } catch (error: any) {
      console.error('Error en signInWithGoogle:', error);
      throw error;
    }
  }

  // Cerrar sesión
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Error en signOut:', error);
      throw error;
    }
  }

  // Crear perfil de usuario
  async createUserProfile(uid: string, userData: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      // Eliminar campos undefined
      const cleanData = Object.fromEntries(
        Object.entries({
          uid,
          ...userData,
          createdAt: serverTimestamp(),
          isActive: true
        }).filter(([_, v]) => v !== undefined)
      );
      await setDoc(userRef, cleanData);
    } catch (error: any) {
      console.error('Error creando perfil de usuario:', error);
      throw error;
    }
  }

  // Obtener perfil de usuario
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          ...data,
          createdAt: data.createdAt
            ? (typeof data.createdAt === 'string'
                ? new Date(data.createdAt)
                : data.createdAt.toDate())
            : new Date(),
          membershipEnd: data.membershipEnd
            ? (typeof data.membershipEnd === 'string'
                ? new Date(data.membershipEnd)
                : data.membershipEnd.toDate())
            : undefined
        } as UserProfile;
      }
      
      return null;
    } catch (error: any) {
      console.error('Error obteniendo perfil de usuario:', error);
      throw error;
    }
  }

  // Actualizar perfil de usuario
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updates);
    } catch (error: any) {
      console.error('Error actualizando perfil de usuario:', error);
      throw error;
    }
  }

  // Crear usuario desde admin
  async createUserByAdmin(adminUid: string, userData: CreateUserData): Promise<string> {
    try {
      // Verificar que el creador sea admin
      const adminProfile = await this.getUserProfile(adminUid);
      if (!adminProfile || adminProfile.role !== 'ADMIN') {
        throw new Error('Solo los administradores pueden crear usuarios');
      }

      // Verificar límite de administradores si se está creando un admin
      if (userData.role === 'ADMIN') {
        const adminCount = await this.getAdminCount();
        if (adminCount >= 5) {
          throw new Error('Se ha alcanzado el límite máximo de 5 administradores');
        }
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const user = userCredential.user;

      // Crear perfil de usuario
      await this.createUserProfile(user.uid, {
        ...userData,
        createdBy: adminUid,
        isActive: true
      });

      return user.uid;
    } catch (error: any) {
      console.error('Error creando usuario desde admin:', error);
      throw error;
    }
  }

  // Obtener conteo de administradores
  async getAdminCount(): Promise<number> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'ADMIN'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error: any) {
      console.error('Error obteniendo conteo de admins:', error);
      throw error;
    }
  }

  // Obtener todos los usuarios (solo para admins)
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt
            ? (typeof data.createdAt === 'string'
                ? new Date(data.createdAt)
                : data.createdAt.toDate())
            : new Date(),
          membershipEnd: data.membershipEnd
            ? (typeof data.membershipEnd === 'string'
                ? new Date(data.membershipEnd)
                : data.membershipEnd.toDate())
            : undefined
        } as UserProfile;
      });
    } catch (error: any) {
      console.error('Error obteniendo todos los usuarios:', error);
      throw error;
    }
  }

  // Verificar si la membresía está activa
  async checkMembershipStatus(uid: string): Promise<{ isActive: boolean; daysUntilExpiry: number }> {
    try {
      const profile = await this.getUserProfile(uid);
      if (!profile || !profile.isActive) {
        return { isActive: false, daysUntilExpiry: 0 };
      }

      if (!profile.membershipEnd) {
        return { isActive: true, daysUntilExpiry: -1 }; // Sin fecha de vencimiento
      }

      const now = new Date();
      const daysUntilExpiry = Math.ceil((profile.membershipEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        isActive: daysUntilExpiry > 0,
        daysUntilExpiry
      };
    } catch (error: any) {
      console.error('Error verificando estado de membresía:', error);
      throw error;
    }
  }

  // Renovar membresía
  async renewMembership(uid: string, months: number = 1): Promise<void> {
    try {
      const profile = await this.getUserProfile(uid);
      if (!profile) {
        throw new Error('Usuario no encontrado');
      }

      const currentEnd = profile.membershipEnd || new Date();
      const newEnd = new Date(currentEnd.getTime() + months * 30 * 24 * 60 * 60 * 1000);

      await this.updateUserProfile(uid, {
        membershipEnd: newEnd,
        isActive: true
      });
    } catch (error: any) {
      console.error('Error renovando membresía:', error);
      throw error;
    }
  }
}

export const authService = new AuthService(); 