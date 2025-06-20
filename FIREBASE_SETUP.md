# 🔥 Configuración de Firebase para Iconik Pro Gym

## ✅ ESTADO ACTUAL: FIREBASE REAL ACTIVADO

**¡Tu proyecto ya está usando Firebase 100% real!** 

- 🔥 **Modo mock desactivado**
- 🔥 **SDK completo configurado**
- 🔥 **Servicios actualizados**
- 🔥 **Credenciales reales activas**

## 📋 Configuración Actual

### Archivo: `src/config/firebase.ts`
```typescript
const USE_MOCK_FIREBASE = false; // ✅ Firebase real activado
```

### Proyecto Firebase: `conikprogym`
- **API Key**: AIzaSyDZoK4MZ8ORqD6nfMswbZMLmSNsZoS1X-w
- **Project ID**: conikprogym
- **Auth Domain**: conikprogym.firebaseapp.com

## 🛠️ Pasos Restantes (Solo si no lo has hecho)

### 1. Configurar Reglas de Firestore

Ve a **Firestore Database** > **Reglas** y usa las reglas del archivo `FIREBASE_RULES.md`

### 2. Configurar Reglas de Storage

Ve a **Storage** > **Reglas** y usa las reglas del archivo `FIREBASE_RULES.md`

### 3. Crear Usuario Admin

1. Ve a **Authentication** > **Users**
2. Crea usuario: `admin@iconik.com` / `admin123`
3. Ve a **Firestore** > **users** > **[UID]** y agrega perfil admin

## 🧪 Cambiar de Vuelta a Modo Mock (Si necesitas)

Si por alguna razón necesitas volver al modo mock:

```typescript
// En src/config/firebase.ts
const USE_MOCK_FIREBASE = true; // Cambiar a true
```

## 🔄 Diferencias entre Modo Mock y Real

| Característica | Modo Mock | Firebase Real |
|----------------|-----------|---------------|
| **Autenticación** | Credenciales hardcodeadas | Usuarios reales de Firebase |
| **Base de datos** | Datos simulados | Firestore real |
| **Storage** | URLs simuladas | Firebase Storage real |
| **Reglas de seguridad** | No aplican | Reglas de Firestore/Storage |
| **Persistencia** | No persiste | Datos persistentes en la nube |
| **Escalabilidad** | Limitada | Escalable automáticamente |

## ✅ Verificar que Todo Funciona

1. **Registro de usuario nuevo** ✅
2. **Login con credenciales reales** ✅
3. **Acceso como admin** ✅
4. **Subida de archivos** ✅
5. **Sincronización de datos** ✅

## 🚨 Importante

- ❌ **Credenciales mock ya NO funcionan**
- ✅ **Solo usuarios reales** de Firebase pueden acceder
- ✅ **Datos persisten** en la nube
- ✅ **Escalable** para producción

---

## 📚 Documentación Original (Para Referencia)

Esta guía te ayudará a configurar Firebase real para reemplazar el sistema mock actual.

## 🚀 Pasos para Configuración

### 1. Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Clica "Crear un proyecto"
3. Nombre del proyecto: `iconik-pro-gym`
4. Habilita Google Analytics (opcional)
5. Clica "Crear proyecto"

### 2. Configurar Authentication

1. En el menú lateral, ve a **Authentication**
2. Clica "Comenzar"
3. Ve a la pestaña **Sign-in method**
4. Habilita **Correo electrónico/contraseña**
5. Habilita **Google** (opcional para futuras funcionalidades)

### 3. Configurar Firestore Database

1. En el menú lateral, ve a **Firestore Database**
2. Clica "Crear base de datos"
3. Selecciona **Modo de producción** (configuraremos reglas después)
4. Elige la ubicación más cercana (ej: `us-central1`)
5. Clica "Listo"

### 4. Configurar Storage

1. En el menú lateral, ve a **Storage**
2. Clica "Comenzar"
3. Acepta las reglas por defecto
4. Selecciona la misma ubicación que Firestore
5. Clica "Listo"

### 5. Obtener Configuración de la App

1. En **Configuración del proyecto** (ícono engranaje)
2. Ve a la pestaña **General**
3. En "Tus apps", clica el ícono **Web** `</>`
4. Registra la app con nombre: `Iconik Pro Gym Web`
5. **NO** selecciones "Configurar Firebase Hosting"
6. Clica "Registrar app"
7. **Copia la configuración** que aparece:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-project-id.firebaseapp.com",
  projectId: "tu-project-id",
  storageBucket: "tu-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id-aqui"
};
```

### 6. Actualizar Configuración en la App

Reemplaza la configuración en `src/config/firebase.ts`:

```typescript
// src/config/firebase.ts - Configuración REAL de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ✅ TUS CREDENCIALES REALES AQUÍ
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID_AQUI"
};

// ... resto del archivo igual
```

### 7. Configurar Reglas de Firestore

En **Firestore Database** > **Reglas**, reemplaza con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "ADMIN";
    }
    
    // Reglas para ejercicios
    match /exercises/{exerciseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "ADMIN";
    }
    
    // Reglas para rutinas
    match /routines/{routineId} {
      allow read, write: if request.auth != null;
    }
    
    // Reglas para progreso de usuarios
    match /progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "ADMIN";
    }
  }
}
```

### 8. Configurar Reglas de Storage

En **Storage** > **Reglas**, reemplaza con:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Imágenes y videos de ejercicios (solo admins pueden subir)
    match /exercises/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == "ADMIN";
    }
    
    // Avatares de usuarios
    match /users/{userId}/avatar {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 9. Crear Usuario Admin Inicial

Después de configurar todo, ve a **Authentication** > **Usuarios** y:

1. Clica "Agregar usuario"
2. Email: `admin@iconik.com`
3. Contraseña: `admin123` (o la que prefieras)
4. Clica "Agregar usuario"

Luego ve a **Firestore Database** y crea manualmente el documento:

- Colección: `users`
- ID del documento: `[UID del usuario admin]`
- Datos:
```json
{
  "name": "Administrador",
  "email": "admin@iconik.com",
  "role": "ADMIN",
  "membershipStart": "2024-01-01T00:00:00.000Z",
  "membershipEnd": "2025-12-31T23:59:59.999Z",
  "age": 30,
  "weight": 80,
  "height": 180,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## ✅ Verificar la Configuración

1. **Prueba registro:** Crea una nueva cuenta en la app
2. **Prueba login:** Inicia sesión con credenciales reales
3. **Prueba admin:** Usa `admin@iconik.com` / `admin123`
4. **Prueba subida:** Como admin, sube un ejercicio con imagen/video

## 🧪 Modo Híbrido (Demo + Firebase)

La app está configurada para funcionar en **modo híbrido**:

- ✅ **Credenciales demo** siguen funcionando para pruebas rápidas
- ✅ **Firebase real** funciona para usuarios registrados
- ✅ **Ambos sistemas** coexisten sin problemas

### Credenciales Demo (siempre disponibles):
- 🛠️ **Admin:** `admin@iconik.com` / `admin123`
- 👤 **Miembro:** `member@iconik.com` / `member123`

### Firebase Real:
- 🔥 **Cualquier cuenta** registrada a través de SignUpScreen
- 🔥 **Usuario admin** creado manualmente en Firebase Console

## 🛠️ Solución de Problemas

### Error: "Firebase Config not found"
- Verifica que copiaste correctamente las credenciales
- Asegúrate de que no hay espacios extra en los strings

### Error: "Auth domain not authorized"
- En Firebase Console > Authentication > Settings
- Agrega tu dominio a "Authorized domains"

### Error: "Permission denied"
- Revisa las reglas de Firestore y Storage
- Asegúrate de que el usuario tiene el rol correcto

### Error: "Network request failed"
- Verifica tu conexión a internet
- Asegúrate de que Firebase está configurado correctamente

## 📱 Testing

1. **Modo Demo:** Usa los botones de demo para pruebas rápidas
2. **Registro Real:** Registra una cuenta nueva y verifica que funcione
3. **Upload Real:** Como admin, sube un ejercicio real a Storage
4. **Base de Datos:** Verifica que los datos se guarden en Firestore

¡Firebase está listo para producción! 🚀 