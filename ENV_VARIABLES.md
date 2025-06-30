# 🔧 Variables de Entorno - Firebase Configuration

## 📋 Configuración de Variables de Entorno

Para mayor seguridad, se recomienda usar variables de entorno en lugar de credenciales hardcodeadas.

### 1. Crear archivo `.env` en la raíz del proyecto

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyAOTdkF5ikku9iRSy6w2qlLGOJaF7GEoS8
REACT_APP_FIREBASE_AUTH_DOMAIN=app-iconik-pro.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=app-iconik-pro
REACT_APP_FIREBASE_STORAGE_BUCKET=app-iconik-pro.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=375868728099
REACT_APP_FIREBASE_APP_ID=1:375868728099:web:dc214ba8eeb00c2f3b6296
REACT_APP_FIREBASE_MEASUREMENT_ID=G-NLR7KCLB7H

# Google Sign-In Configuration
REACT_APP_GOOGLE_WEB_CLIENT_ID=375868728099-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
REACT_APP_GOOGLE_IOS_CLIENT_ID=375868728099-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

### 2. Actualizar `src/config/firebase.ts` para usar variables de entorno

```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY!,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.REACT_APP_FIREBASE_APP_ID!,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Configurar proveedor de Google
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export default app;
```

### 3. Actualizar `src/config/googleSignIn.ts` para usar variables de entorno

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: process.env.REACT_APP_GOOGLE_WEB_CLIENT_ID!,
    iosClientId: process.env.REACT_APP_GOOGLE_IOS_CLIENT_ID!,
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  });
};
```

## 🚨 Notas Importantes

1. **El archivo `.env` NO debe subirse a Git** (ya está en `.gitignore`)
2. **Solo las variables que empiecen con `REACT_APP_` serán accesibles**
3. **Reinicia el servidor de desarrollo** después de crear el archivo `.env`
4. **Para producción**, configura las variables en tu plataforma de hosting

## 🔒 Seguridad

- ✅ Las credenciales no se versionan en Git
- ✅ Cada desarrollador puede tener su propio `.env`
- ✅ Fácil configuración para diferentes entornos (dev, staging, prod)

## 📱 Uso en la Aplicación

Una vez configurado, puedes importar Firebase en cualquier componente:

```typescript
import { auth, db, storage, analytics } from '../config/firebase';
import { signInWithGoogle } from '../config/googleSignIn';
```

## 🔧 Troubleshooting

### Error: "process.env is undefined"
- Asegúrate de que las variables empiecen con `REACT_APP_`
- Reinicia el servidor de desarrollo

### Error: "Firebase not initialized"
- Verifica que el archivo `.env` esté en la raíz del proyecto
- Asegúrate de que las credenciales sean correctas 