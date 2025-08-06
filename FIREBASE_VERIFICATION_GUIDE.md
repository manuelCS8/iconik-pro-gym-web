# 🔍 Guía de Verificación de Firebase

## 📋 **Pasos para Verificar tu Configuración**

### 1. **Verificación Rápida desde la App**

1. **Añade la pantalla de test a tu navegación** (temporalmente):
   ```typescript
   // En tu navegador, añade temporalmente:
   <Stack.Screen name="FirebaseTest" component={FirebaseTestScreen} />
   ```

2. **Navega a la pantalla de test** y ejecuta "Ejecutar Todos los Tests"

3. **Revisa los resultados** en la pantalla y en la consola de desarrollo

### 2. **Verificación Manual desde Consola**

Abre la consola de desarrollo en tu app y ejecuta:

```javascript
// Importa la función de verificación
import { runFirebaseCheck } from './src/utils/firebaseVerification';

// Ejecuta la verificación
runFirebaseCheck();
```

### 3. **Verificación de Firebase Console**

#### 🔐 **Authentication**
1. Ve a **Firebase Console** > **Authentication**
2. Verifica que esté habilitado:
   - ✅ **Email/Password**
   - ✅ **Google** (si vas a usar Google Sign-in)

#### 📊 **Firestore Database**
1. Ve a **Firestore Database**
2. Verifica que esté creado y activo
3. Ve a **Reglas** y copia las reglas de `FIREBASE_RULES.md`

#### 📁 **Storage**
1. Ve a **Storage**
2. Verifica que esté creado y activo
3. Ve a **Reglas** y copia las reglas de `FIREBASE_RULES.md`

### 4. **Verificación de Variables de Entorno**

Verifica que tu archivo `.env` tenga estas variables:

```env
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=app-iconik-pro.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=app-iconik-pro
REACT_APP_FIREBASE_STORAGE_BUCKET=app-iconik-pro.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=375868728099
REACT_APP_FIREBASE_APP_ID=1:375868728099:web:dc214ba8eeb00c2f3b6296
REACT_APP_FIREBASE_MEASUREMENT_ID=G-NLR7KCLB7H
```

### 5. **Verificación de Dependencias**

Verifica que tengas estas dependencias en `package.json`:

```json
{
  "dependencies": {
    "firebase": "^11.9.1",
    "@react-native-google-signin/google-signin": "^15.0.0"
  }
}
```

### 6. **Verificación de Configuración**

Tu archivo `src/config/firebase.ts` debe verse así:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAOTdkF5ikku9iRSy6w2qlLGOJaF7GEoS8",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "app-iconik-pro.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "app-iconik-pro",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "app-iconik-pro.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "375868728099",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:375868728099:web:dc214ba8eeb00c2f3b6296",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-NLR7KCLB7H"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export default app;
```

## 🧪 **Tests Automáticos**

### **Test 1: Conexión Básica**
```javascript
// En la consola de desarrollo:
import { auth, db, storage } from './src/config/firebase';
console.log('Auth:', !!auth);
console.log('Firestore:', !!db);
console.log('Storage:', !!storage);
```

### **Test 2: Servicios**
```javascript
// En la consola de desarrollo:
import { authService } from './src/services/authService';
import { exerciseService } from './src/services/exerciseService';
import { routineService } from './src/services/routineService';

console.log('AuthService:', !!authService);
console.log('ExerciseService:', !!exerciseService);
console.log('RoutineService:', !!routineService);
```

### **Test 3: Autenticación**
```javascript
// En la consola de desarrollo:
import { auth } from './src/config/firebase';
console.log('Usuario actual:', auth.currentUser);
```

## ✅ **Lista de Verificación**

### **Configuración Básica**
- [ ] Firebase Console creado
- [ ] Authentication habilitado
- [ ] Firestore Database creado
- [ ] Storage creado
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas

### **Reglas de Seguridad**
- [ ] Reglas de Firestore configuradas
- [ ] Reglas de Storage configuradas
- [ ] Índices compuestos creados

### **Servicios**
- [ ] `authService.ts` implementado
- [ ] `exerciseService.ts` implementado
- [ ] `routineService.ts` implementado
- [ ] `AuthContext.tsx` actualizado

### **Funcionalidades**
- [ ] Registro con email funciona
- [ ] Registro con Google funciona
- [ ] Inicio de sesión funciona
- [ ] Control de roles funciona
- [ ] Verificación de membresías funciona

## 🚨 **Problemas Comunes y Soluciones**

### **Error: "Firebase not initialized"**
**Solución:**
1. Verifica que `firebase.ts` esté importado correctamente
2. Asegúrate de que las variables de entorno estén configuradas
3. Reinicia la app después de cambios en la configuración

### **Error: "Permission denied"**
**Solución:**
1. Verifica las reglas de Firestore/Storage
2. Asegúrate de que el usuario esté autenticado
3. Verifica que las reglas permitan la operación

### **Error: "Google Sign-in not working"**
**Solución:**
1. Verifica que Google Sign-in esté habilitado en Firebase Console
2. Asegúrate de que `google-services.json` esté configurado
3. Verifica que el SHA-1 esté añadido en Firebase Console

### **Error: "Storage upload failed"**
**Solución:**
1. Verifica las reglas de Storage
2. Asegúrate de que el archivo no sea muy grande
3. Verifica que el formato de archivo esté permitido

## 📊 **Resultados Esperados**

### **Verificación Exitosa**
```
🚀 Iniciando verificación completa de Firebase...

🔍 Verificando conexión con Firebase...
✅ Firebase está inicializado correctamente
📊 Servicios disponibles:
  - Auth: true
  - Firestore: true
  - Storage: true

🔍 Verificando servicio de autenticación...
✅ Servicio de autenticación disponible

🔍 Verificando servicio de ejercicios...
✅ Servicio de ejercicios disponible

🔍 Verificando servicio de rutinas...
✅ Servicio de rutinas disponible

🔍 Verificando acceso a Firestore...
✅ Acceso a Firestore funcionando

🔍 Verificando acceso a Storage...
✅ Storage disponible

📊 Resumen de verificación:
========================
✅ Firebase Connection: OK
✅ Auth Service: OK
✅ Exercise Service: OK
✅ Routine Service: OK
✅ Firestore Access: OK
✅ Storage Access: OK

🎉 ¡Todas las verificaciones pasaron! Firebase está correctamente configurado.
```

### **Verificación Fallida**
Si alguna verificación falla, revisa:
1. La configuración de Firebase Console
2. Las reglas de seguridad
3. Las variables de entorno
4. Las dependencias instaladas

## 🎯 **Próximos Pasos**

1. **Ejecuta todos los tests** usando la pantalla de verificación
2. **Revisa la consola** para logs detallados
3. **Configura las reglas** si hay errores de permisos
4. **Prueba las funcionalidades** con usuarios reales
5. **Elimina la pantalla de test** cuando todo funcione

---

**¡Con esta guía podrás verificar que Firebase está correctamente configurado!** 🔥 

---

¡Perfecto! Aquí tienes los **comandos exactos y pasos detallados** para migrar tu proyecto Expo a EAS Build y poder usar Google Sign-In nativo:

---

## 🚀 **Guía Paso a Paso para EAS Build + Custom Dev Client**

### 1. **Instala EAS CLI**
Si no lo tienes instalado:
```sh
npm install -g eas-cli
```

---

### 2. **Inicia sesión en tu cuenta de Expo**
```sh
eas login
```
(Si no tienes cuenta, crea una gratis en [expo.dev](https://expo.dev/))

---

### 3. **Configura tu proyecto para EAS**
En la raíz de tu proyecto:
```sh
eas build:configure
```
- Elige **Android** y/o **iOS** según lo que uses.
- Esto creará un archivo `eas.json` y configurará tu proyecto.

---

### 4. **Haz un build de desarrollo (custom dev client)**
#### **Para Android:**
```sh
eas build --profile development --platform android
```
#### **Para iOS:**
```sh
eas build --profile development --platform ios
```
- Esto subirá tu proyecto y generará un APK (Android) o IPA (iOS).
- El proceso puede tardar unos minutos.

---

### 5. **Descarga e instala el APK/IPA**
- Cuando termine el build, Expo te dará un enlace para descargar el archivo.
- **Android:** Descarga el APK y ábrelo en tu teléfono para instalarlo.
- **iOS:** Necesitas usar TestFlight (Expo te dará instrucciones).

---

### 6. **Corre tu app con el custom dev client**
- En tu terminal, ejecuta:
  ```sh
  expo start
  ```
- Escanea el QR **con tu nueva app personalizada** (no con Expo Go).
- Ahora puedes usar Google Sign-In y cualquier otro módulo nativo.

---

## 🟢 **Notas importantes**
- **Expo Go** ya no funcionará para Google Sign-In nativo.
- Cada vez que agregues un nuevo módulo nativo, deberás volver a hacer un build con EAS.
- Puedes seguir desarrollando normalmente, solo asegúrate de abrir el QR con tu custom dev client.

---

## 🛠️ **¿Qué sigue?**
1. Haz estos pasos y confirma que puedes instalar y abrir tu app.
2. Prueba Google Sign-In: ahora debe funcionar sin errores.
3. Si tienes algún error en el proceso, dime exactamente en qué paso y te ayudo.

---

¿Quieres que te ayude a personalizar el archivo `eas.json` o tienes dudas sobre algún paso?
