# Reglas de Firebase para Rutinas de Usuario

## Colección: userRoutines

```javascript
// Reglas para rutinas de usuario
match /userRoutines/{routineId} {
  // Permitir lectura si el usuario es el creador
  allow read: if request.auth != null && 
    (resource.data.createdBy == request.auth.uid || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN');
  
  // Permitir escritura si el usuario es el creador
  allow write: if request.auth != null && 
    (resource.data.createdBy == request.auth.uid || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN');
  
  // Permitir creación si el usuario está autenticado
  allow create: if request.auth != null && 
    request.resource.data.createdBy == request.auth.uid;
  
  // Permitir actualización si el usuario es el creador
  allow update: if request.auth != null && 
    resource.data.createdBy == request.auth.uid;
  
  // Permitir eliminación si el usuario es el creador
  allow delete: if request.auth != null && 
    resource.data.createdBy == request.auth.uid;
}
```

## Explicación de las Reglas:

1. **Lectura**: Los usuarios solo pueden leer sus propias rutinas, excepto los administradores que pueden leer todas.

2. **Escritura**: Los usuarios solo pueden escribir en sus propias rutinas, excepto los administradores.

3. **Creación**: Cualquier usuario autenticado puede crear rutinas, pero el campo `createdBy` debe coincidir con su UID.

4. **Actualización**: Los usuarios solo pueden actualizar sus propias rutinas.

5. **Eliminación**: Los usuarios solo pueden eliminar sus propias rutinas.

## Implementación:

Para implementar estas reglas, agrega el bloque anterior a tu archivo `firestore.rules` existente, después de las reglas actuales.

## Ejemplo de uso:

```javascript
// Crear una nueva rutina
const routineData = {
  name: "Mi Rutina de Pecho",
  description: "Rutina para desarrollar el pecho",
  category: "Fuerza",
  difficulty: "intermediate",
  duration: 45,
  exercises: [],
  isPublic: false,
  createdBy: uid, // Se establece automáticamente
  createdAt: serverTimestamp(),
  isActive: true
};

// Esto funcionará si el usuario está autenticado
await addDoc(collection(db, 'userRoutines'), routineData);
```

## Notas de Seguridad:

- Las rutinas de usuario son privadas por defecto (`isPublic: false`)
- Solo el creador puede modificar sus rutinas
- Los administradores tienen acceso completo para moderación
- Se valida que el `createdBy` coincida con el UID del usuario autenticado 