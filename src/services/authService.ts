// Servicio de autenticación mock para desarrollo sin Firebase

// Puedes agregar aquí funciones mock si tu app las requiere para pruebas.

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
  // Puedes agregar aquí funciones mock para pruebas si lo necesitas
}; 