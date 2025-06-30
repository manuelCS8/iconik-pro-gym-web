# 🔥 Configuración de Firebase - Iconik Pro Gym

## 📋 Resumen de Configuración

Este proyecto está configurado para usar **Firebase** como backend completo, incluyendo:
- **Authentication** (Autenticación)
- **Firestore** (Base de datos)
- **Storage** (Almacenamiento de archivos)

## 🛠️ Archivos de Configuración

### 1. Configuración Principal
- `src/config/firebase.ts` - Configuración principal de Firebase
- `google-services.json` - Configuración para Android
- `GoogleService-Info.plist` - Configuración para iOS

### 2. Configuración de Expo
- `app.json` - Configuración de bundle ID y plugins

## 🔑 Credenciales de Firebase

### Proyecto
- **Project ID**: `app-iconik-pro`
- **Project Number**: `375868728099`
- **Storage Bucket**: `app-iconik-pro.firebasestorage.app`

### Android
- **Package Name**: `com.tuempresa.iconikprogym`
- **App ID**: `1:375868728099:android:d43d836d542c27873b6296`
- **API Key**: `AIzaSyDslyn4Z6Ozv8Y4Ttsm6y2vwtsf6qX5Nvo`

### iOS
- **Bundle ID**: `com.tuempresa.iconikprogym`
- **App ID**: `1:375868728099:ios:842f9b20c4cd5d7a3b6296`
- **API Key**: `AIzaSyBgOL8NShlRu34cFQt3hCHonSblKbdVvm0`

## 🚀 Cómo Usar Firebase en el Proyecto

### Importar Firebase
```typescript
import { auth, db, storage } from '../config/firebase';
```

### Autenticación
```typescript
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Iniciar sesión
const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
  }
};
```

### Firestore (Base de Datos)
```typescript
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Agregar documento
const addExercise = async (exerciseData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'exercises'), exerciseData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
  }
};

// Obtener documentos
const getExercises = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'exercises'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting documents:', error);
  }
};
```

### Storage (Archivos)
```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Subir archivo
const uploadFile = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};
```

## 📱 Configuración para Build

### Android
1. El archivo `google-services.json` debe estar en la raíz del proyecto
2. Expo automáticamente lo copiará a `android/app/` durante el build
3. No necesitas configurar manualmente los archivos Gradle

### iOS
1. El archivo `GoogleService-Info.plist` debe estar en la raíz del proyecto
2. Expo automáticamente lo incluirá en el bundle durante el build
3. No necesitas configurar manualmente Xcode

## 🔒 Seguridad

### Reglas de Firestore
Ver archivo `FIREBASE_RULES.md` para las reglas de seguridad completas.

### Reglas de Storage
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         request.auth.token.uid == resource.metadata.owner);
    }
  }
}
```

## 🚨 Notas Importantes

1. **API Keys**: Las API keys están incluidas en el código. En producción, considera usar variables de entorno.
2. **Bundle ID**: Asegúrate de que el bundle ID coincida con el configurado en Firebase Console.
3. **Reglas de Seguridad**: Siempre configura reglas de seguridad apropiadas en Firebase Console.
4. **Testing**: Prueba la autenticación y las operaciones de base de datos antes de hacer deploy.

## 🔧 Troubleshooting

### Error: "Firebase App named '[DEFAULT]' already exists"
- Asegúrate de que Firebase solo se inicialice una vez
- Verifica que no haya múltiples imports de la configuración

### Error: "Permission denied"
- Verifica las reglas de seguridad en Firebase Console
- Asegúrate de que el usuario esté autenticado

### Error: "Network request failed"
- Verifica la conexión a internet
- Asegúrate de que las reglas de Firestore permitan la operación

## 📚 Recursos Adicionales

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)
- [Expo Firebase](https://docs.expo.dev/guides/using-firebase/) 