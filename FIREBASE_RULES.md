# 🔥 Reglas de Firebase para Iconik Pro Gym

## 📋 Reglas de Firestore Database

Ve a **Firestore Database** > **Reglas** y reemplaza con:

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

## 📁 Reglas de Storage

Ve a **Storage** > **Reglas** y reemplaza con:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Videos de ejercicios (solo admins pueden subir)
    match /videos/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == "ADMIN";
    }
    
    // Imágenes de ejercicios (solo admins pueden subir)
    match /exercises/thumbnails/{allPaths=**} {
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

## 🛠️ Pasos para Configurar

### 1. Configurar Authentication
1. Ve a **Authentication** > **Sign-in method**
2. Habilita **Correo electrónico/contraseña**
3. Habilita **Google** (opcional para futuras funcionalidades)

### 2. Crear Usuario Admin
1. Ve a **Authentication** > **Users**
2. Clica "Agregar usuario"
3. Email: `admin@iconik.com`
4. Contraseña: `admin123`
5. Clica "Agregar usuario"

### 3. Crear Perfil Admin en Firestore
1. Ve a **Firestore Database**
2. Crea colección: `users`
3. Crea documento con ID: `[UID del usuario admin]`
4. Agrega estos datos:

```json
{
  "uid": "[UID del usuario admin]",
  "email": "admin@iconik.com",
  "name": "Administrador",
  "role": "ADMIN",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "membershipStart": "2024-01-01T00:00:00.000Z",
  "membershipEnd": "2025-12-31T23:59:59.999Z",
  "age": 30,
  "weight": 80,
  "height": 180
}
```

### 4. Verificar Configuración
1. **Prueba registro:** Crea una nueva cuenta en la app
2. **Prueba login:** Inicia sesión con credenciales reales
3. **Prueba admin:** Usa `admin@iconik.com` / `admin123`
4. **Prueba subida:** Como admin, sube un ejercicio con video

## ✅ Estado Actual

- 🔥 **Firebase REAL activado** (no más modo mock)
- 🔥 **SDK completo** configurado
- 🔥 **Servicios actualizados** para Firebase real
- 🔥 **Reglas de seguridad** listas para configurar
- 🔥 **Nuevo proyecto**: app-iconik-pro

## 🚨 Importante

- ❌ **Credenciales mock ya NO funcionan**
- ✅ **Solo usuarios reales** de Firebase pueden acceder
- ✅ **Admin debe ser creado** manualmente en Firebase Console
- ✅ **Reglas de seguridad** deben configurarse para funcionar correctamente
- ✅ **Nuevo proyecto**: app-iconik-pro (no conikprogym) 