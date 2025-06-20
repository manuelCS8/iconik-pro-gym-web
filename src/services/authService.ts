import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../config/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'member' | 'admin';
  createdAt: Date;
  membershipType?: 'basic' | 'premium' | 'vip';
  membershipEnd?: string; // ISO string
  weight?: number;
  height?: number;
  age?: number;
}

export const authService = {
  // Iniciar sesión
  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await this.getUserProfile(userCredential.user.uid);
      return { user: userCredential.user, profile: userProfile };
    } catch (error) {
      throw error;
    }
  },

  // Registrarse
  async signUp(email: string, password: string, displayName: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar el perfil con el nombre
      await updateProfile(userCredential.user, { displayName });
      
      // Crear perfil en Firestore
      const membershipEnd = new Date();
      membershipEnd.setFullYear(membershipEnd.getFullYear() + 1); // 1 año de membresía
      
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        role: 'member', // Por defecto es member
        createdAt: new Date(),
        membershipType: 'basic',
        membershipEnd: membershipEnd.toISOString(),
        weight: null,
        height: null,
        age: null
      };
      
      await this.createUserProfile(userProfile);
      
      return { user: userCredential.user, profile: userProfile };
    } catch (error) {
      throw error;
    }
  },

  // Cerrar sesión
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  // Crear perfil de usuario en Firestore
  async createUserProfile(userProfile: UserProfile) {
    try {
      await setDoc(doc(firestore, 'users', userProfile.uid), userProfile);
    } catch (error) {
      throw error;
    }
  },

  // Obtener perfil de usuario
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(firestore, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  },

  // Actualizar información física del usuario
  async updatePhysicalInfo(uid: string, data: { weight?: number; height?: number; age?: number }) {
    try {
      const docRef = doc(firestore, 'users', uid);
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      throw error;
    }
  }
}; 