import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configurar Google Sign-In
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '375868728099-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com', // Necesitas obtener esto de Firebase Console
    iosClientId: '375868728099-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com', // Necesitas obtener esto de Firebase Console
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  });
};

// Función para iniciar sesión con Google
export const signInWithGoogle = async () => {
  try {
    // Verificar si el dispositivo soporta Google Play Services
    await GoogleSignin.hasPlayServices();
    
    // Iniciar el proceso de sign-in
    const userInfo = await GoogleSignin.signIn();
    
    // Obtener el token de ID
    const { accessToken } = await GoogleSignin.getTokens();
    
    return {
      userInfo,
      accessToken,
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Función para cerrar sesión
export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Error signing out from Google:', error);
    throw error;
  }
};

// Verificar si el usuario está conectado
export const isSignedIn = async () => {
  try {
    return await GoogleSignin.isSignedIn();
  } catch (error) {
    console.error('Error checking sign-in status:', error);
    return false;
  }
};

// Obtener usuario actual
export const getCurrentUser = async () => {
  try {
    return await GoogleSignin.getCurrentUser();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}; 