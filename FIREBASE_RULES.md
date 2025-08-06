# Reglas de Seguridad de Firebase

## Firestore Rules

Configura estas reglas en tu consola de Firebase > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para usuarios
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Reglas para ejercicios
    match /exercises/{exerciseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Reglas para rutinas - ACTUALIZADAS
    match /routines/{routineId} {
      // Permitir lectura a usuarios autenticados para rutinas activas
      allow read: if request.auth != null && 
        (resource.data.isActive == true || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Permitir escritura solo a administradores
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Reglas Alternativas (Si las anteriores no funcionan)

Si el problema persiste, usa estas reglas más permisivas temporalmente:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para usuarios
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN');
      allow write: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN');
      allow create: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN');
    }
    
    // Reglas para ejercicios
    match /exercises/{exerciseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Reglas para rutinas - ALTERNATIVAS (más permisivas)
    match /routines/{routineId} {
      // Permitir lectura a TODOS los usuarios autenticados (temporal)
      allow read: if request.auth != null;
      
      // Permitir escritura solo a administradores
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
  }
}
```

## Storage Rules

Configura estas reglas en tu consola de Firebase > Storage > Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura de todos los archivos a usuarios autenticados
    match /{allPaths=**} {
      allow read: if request.auth != null;
    }
    
    // Permitir escritura solo a administradores para ejercicios
    match /exercises/{allPaths=**} {
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Permitir escritura solo a administradores para rutinas
    match /routines/{allPaths=**} {
      allow write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
  }
}
```

## Configuración de Autenticación

En Firebase Console > Authentication > Sign-in method:

1. **Habilitar Email/Password**
2. **Habilitar Google Sign-in**
3. **Configurar dominios autorizados** para Google Sign-in

## Configuración de Google Sign-in

Para Android, asegúrate de que tu `google-services.json` esté configurado correctamente.

Para iOS, verifica que tu `GoogleService-Info.plist` esté en el proyecto.

## Variables de Entorno

Asegúrate de que las siguientes variables estén configuradas en tu proyecto:

```env
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu_proyecto
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
REACT_APP_FIREBASE_APP_ID=tu_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

## Índices de Firestore

Crea los siguientes índices compuestos en Firestore:

1. **Collection: exercises**
   - Fields: isActive (Ascending), createdAt (Descending)

2. **Collection: exercises**
   - Fields: category (Ascending), isActive (Ascending), createdAt (Descending)

3. **Collection: exercises**
   - Fields: muscleGroups (Array), isActive (Ascending), createdAt (Descending)

4. **Collection: routines**
   - Fields: isActive (Ascending), createdAt (Descending)

5. **Collection: routines**
   - Fields: category (Ascending), isActive (Ascending), createdAt (Descending)

6. **Collection: routines**
   - Fields: difficulty (Ascending), isActive (Ascending), createdAt (Descending)

7. **Collection: users**
   - Fields: role (Ascending), isActive (Ascending)

## Notas Importantes

1. **Límite de Administradores**: El sistema limita a máximo 5 administradores.
2. **Membresías**: Los usuarios deben tener membresía activa para acceder.
3. **Contenido Público**: Solo las rutinas activas son visibles para miembros.
4. **Seguridad**: Solo los administradores pueden crear, editar y eliminar contenido.
5. **Backup**: Considera configurar backups automáticos de Firestore.

## Solución de Problemas

### Si las rutinas no aparecen para miembros:

1. **Verificar reglas**: Asegúrate de que las reglas usen `isActive == true`
2. **Forzar actualización**: Agrega un espacio en las reglas y publica
3. **Usar reglas alternativas**: Si persiste, usa las reglas más permisivas
4. **Verificar usuario**: Confirma que el usuario tenga rol 'MEMBER' y esté activo
5. **Verificar rutina**: Confirma que la rutina tenga `isActive: true`

### Pasos para forzar actualización de reglas:

1. Ve a Firebase Console > Firestore Database > Rules
2. Agrega un espacio o comentario en cualquier línea
3. Publica las reglas
4. Espera 2-3 minutos para que se propaguen
5. Prueba de nuevo

## Próximos Pasos

1. Configura las reglas de seguridad en Firebase Console
2. Crea los índices compuestos necesarios
3. Verifica que la autenticación esté habilitada
4. Prueba la funcionalidad con usuarios de prueba
5. Configura notificaciones push si es necesario 