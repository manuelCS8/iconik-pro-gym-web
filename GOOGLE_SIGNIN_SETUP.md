# 🔐 Google Sign-In y Media Picker - Configuración

## 📋 Resumen

Este documento explica cómo configurar y usar:
- **Google Sign-In** para autenticación
- **Media Picker** para selección de imágenes y videos

## 🛠️ Dependencias Instaladas

### Google Sign-In
```bash
npm install @react-native-google-signin/google-signin
```

### Media Picker
```bash
# Ya incluido en expo-image-picker
expo-image-picker: ~16.1.4
```

## 🔧 Configuración de Google Sign-In

### 1. Obtener Credenciales de Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `app-iconik-pro`
3. Ve a **Authentication** > **Sign-in method**
4. Habilita **Google** como proveedor
5. Obtén las credenciales:
   - **Web Client ID**
   - **iOS Client ID**

### 2. Actualizar Configuración

Edita `src/config/googleSignIn.ts` y reemplaza los placeholders:

```typescript
GoogleSignin.configure({
  webClientId: 'TU_WEB_CLIENT_ID_AQUI',
  iosClientId: 'TU_IOS_CLIENT_ID_AQUI',
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});
```

### 3. Configurar en Firebase Console

1. **Authentication** > **Sign-in method** > **Google**
2. Habilita Google Sign-In
3. Agrega los dominios autorizados
4. Configura el SHA-1 fingerprint para Android

## 📱 Uso de Google Sign-In

### Inicializar en App.tsx
```typescript
import { configureGoogleSignIn } from './src/config/googleSignIn';

// En useEffect o al inicio de la app
useEffect(() => {
  configureGoogleSignIn();
}, []);
```

### Iniciar Sesión
```typescript
import { signInWithGoogle } from './src/config/googleSignIn';

const handleGoogleSignIn = async () => {
  try {
    const { userInfo, accessToken } = await signInWithGoogle();
    console.log('Usuario conectado:', userInfo);
    
    // Aquí puedes crear el usuario en Firebase Auth
    // usando el accessToken
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Cerrar Sesión
```typescript
import { signOutFromGoogle } from './src/config/googleSignIn';

const handleSignOut = async () => {
  try {
    await signOutFromGoogle();
    console.log('Sesión cerrada');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🖼️ Uso de Media Picker

### Importar Servicios
```typescript
import { 
  pickImage, 
  takePhoto, 
  pickVideo, 
  recordVideo,
  showMediaOptions 
} from './src/services/mediaService';
```

### Seleccionar Imagen
```typescript
const handlePickImage = async () => {
  const image = await pickImage({
    aspect: [4, 3],
    quality: 0.8,
  });
  
  if (image) {
    console.log('Imagen seleccionada:', image.uri);
    // Subir a Firebase Storage
  }
};
```

### Tomar Foto
```typescript
const handleTakePhoto = async () => {
  const photo = await takePhoto({
    aspect: [4, 3],
    quality: 0.8,
  });
  
  if (photo) {
    console.log('Foto tomada:', photo.uri);
    // Subir a Firebase Storage
  }
};
```

### Seleccionar Video
```typescript
const handlePickVideo = async () => {
  const video = await pickVideo({
    aspect: [16, 9],
    quality: 0.8,
    videoMaxDuration: 60,
  });
  
  if (video) {
    console.log('Video seleccionado:', video.uri);
    // Subir a Firebase Storage
  }
};
```

### Mostrar Opciones
```typescript
const handleShowOptions = async () => {
  const media = await showMediaOptions('both'); // 'image', 'video', 'both'
  
  if (media) {
    console.log('Media seleccionado:', media);
    // Subir a Firebase Storage
  }
};
```

## 🔒 Permisos

### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
```

### iOS (Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>La aplicación necesita acceso a la cámara para tomar fotos de ejercicios.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>La aplicación necesita acceso a tus fotos para seleccionar imágenes de ejercicios.</string>
```

## 🚀 Integración con Firebase

### Subir Media a Firebase Storage
```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './src/config/firebase';

const uploadToFirebase = async (uri: string, path: string) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading:', error);
    throw error;
  }
};
```

### Ejemplo Completo
```typescript
const handleUploadExerciseMedia = async () => {
  try {
    // 1. Seleccionar imagen
    const image = await pickImage();
    if (!image) return;
    
    // 2. Subir a Firebase Storage
    const imagePath = `exercises/${Date.now()}_image.jpg`;
    const imageURL = await uploadToFirebase(image.uri, imagePath);
    
    // 3. Guardar en Firestore
    const exerciseData = {
      name: 'Ejercicio Ejemplo',
      imageURL: imageURL,
      createdAt: new Date(),
    };
    
    const docRef = await addDoc(collection(db, 'exercises'), exerciseData);
    console.log('Ejercicio guardado con ID:', docRef.id);
    
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🔧 Troubleshooting

### Error: "Google Sign-In not configured"
- Verifica que las credenciales estén correctas
- Asegúrate de que Google Sign-In esté habilitado en Firebase Console

### Error: "Permission denied"
- Verifica que los permisos estén configurados en app.json
- Asegúrate de que el usuario haya dado permisos en el dispositivo

### Error: "Network request failed"
- Verifica la conexión a internet
- Asegúrate de que las reglas de Firebase permitan la operación

## 📚 Recursos Adicionales

- [Google Sign-In Documentation](https://developers.google.com/identity/sign-in/android)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/image-picker/)
- [Firebase Storage](https://firebase.google.com/docs/storage) 