# 📁 Sistema de Storage - Guía Completa

## 📋 Resumen

Este proyecto incluye un sistema completo de subida de archivos a Firebase Storage con:
- **Subida con progreso** en tiempo real
- **Validación de archivos** (tipo, tamaño)
- **Manejo de errores** robusto
- **Componentes reutilizables** para UI
- **Funciones utilitarias** para gestión de archivos

## 🏗️ Arquitectura

### Componentes Principales

1. **Storage Service** (`src/services/storage.ts`)
   - Funciones principales de subida/eliminación
   - Validación y utilidades de archivos
   - Manejo de progreso

2. **Media Service** (`src/services/mediaService.ts`)
   - Integración con expo-image-picker
   - Selección de imágenes y videos
   - Permisos de cámara y galería

3. **UploadProgress Component** (`src/components/UploadProgress.tsx`)
   - Componente reutilizable para mostrar progreso
   - Estados de éxito/error
   - Información del archivo

4. **CreateExerciseScreen** (`src/screens/admin/CreateExerciseScreen.tsx`)
   - Ejemplo completo de uso
   - Formulario con subida de media
   - Integración con Firestore

## 🚀 Funciones Principales

### Subida de Archivos

```typescript
import { uploadFile, uploadMultipleFiles } from '../services/storage';

// Subir un archivo
const result = await uploadFile(
  uri,           // URI local del archivo
  storagePath,   // Ruta en Firebase Storage
  (progress) => {
    console.log(`Progreso: ${progress.percent}%`);
  }
);

console.log('URL de descarga:', result.url);

// Subir múltiples archivos
const results = await uploadMultipleFiles(
  [uri1, uri2, uri3],  // Array de URIs
  'exercises',         // Carpeta base
  (overallProgress) => {
    console.log(`Progreso total: ${overallProgress}%`);
  }
);
```

### Validación de Archivos

```typescript
import { validateFile, isImage, isVideo } from '../services/storage';

// Validar archivo
const validation = validateFile(fileName, fileSize, maxSize);
if (!validation.isValid) {
  console.error('Error:', validation.error);
}

// Verificar tipo
if (isImage(fileName)) {
  console.log('Es una imagen');
}

if (isVideo(fileName)) {
  console.log('Es un video');
}
```

### Gestión de Archivos

```typescript
import { 
  deleteFile, 
  deleteMultipleFiles, 
  generateStoragePath,
  formatFileSize 
} from '../services/storage';

// Eliminar archivo
await deleteFile('exercises/image.jpg');

// Eliminar múltiples archivos
await deleteMultipleFiles(['file1.jpg', 'file2.mp4']);

// Generar ruta única
const path = generateStoragePath('photo.jpg', 'exercises');
// Resultado: exercises/1703123456789_abc123.jpg

// Formatear tamaño
const size = formatFileSize(1024000); // "1000 KB"
```

## 📱 Uso en Componentes

### Componente de Progreso

```typescript
import UploadProgress from '../components/UploadProgress';

const MyComponent = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'uploading' | 'success' | 'error'>('uploading');

  return (
    <UploadProgress
      progress={progress}
      fileName="exercise.jpg"
      fileSize={1024000}
      status={status}
      errorMessage="Error de conexión"
    />
  );
};
```

### Selección de Media

```typescript
import { pickImage, pickVideo, showMediaOptions } from '../services/mediaService';

const handleSelectImage = async () => {
  try {
    const image = await pickImage({
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (image) {
      console.log('Imagen seleccionada:', image.uri);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const handleSelectVideo = async () => {
  try {
    const video = await pickVideo({
      videoMaxDuration: 60,
      quality: 0.8,
    });
    
    if (video) {
      console.log('Video seleccionado:', video.uri);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🎯 Ejemplo Completo

### Crear Ejercicio con Media

```typescript
import React, { useState } from 'react';
import { pickImage } from '../services/mediaService';
import { uploadFile, validateFile, generateStoragePath } from '../services/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import UploadProgress from '../components/UploadProgress';

const CreateExercise = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async () => {
    try {
      const image = await pickImage();
      if (image) {
        // Validar archivo
        const validation = validateFile(image.fileName, image.fileSize);
        if (!validation.isValid) {
          Alert.alert('Error', validation.error);
          return;
        }
        
        setSelectedFile(image);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      
      // Generar ruta única
      const storagePath = generateStoragePath(
        selectedFile.fileName,
        'exercises'
      );

      // Subir archivo
      const result = await uploadFile(
        selectedFile.uri,
        storagePath,
        (progress) => {
          setUploadProgress(progress.percent);
        }
      );

      // Guardar en Firestore
      await addDoc(collection(db, 'exercises'), {
        name: 'Mi Ejercicio',
        mediaURL: result.url,
        createdAt: new Date(),
      });

      Alert.alert('Éxito', 'Ejercicio creado');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={handleFileSelect}>
        <Text>Seleccionar Imagen</Text>
      </TouchableOpacity>

      {isUploading && (
        <UploadProgress
          progress={uploadProgress}
          fileName={selectedFile?.fileName}
          fileSize={selectedFile?.fileSize}
          status="uploading"
        />
      )}

      <TouchableOpacity onPress={handleSubmit} disabled={isUploading}>
        <Text>Crear Ejercicio</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## 🔒 Configuración de Seguridad

### Reglas de Firebase Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura a usuarios autenticados
    match /exercises/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'admin' || 
         request.auth.token.uid == resource.metadata.owner);
    }
    
    // Validar tipos de archivo
    match /{allPaths=**} {
      allow write: if request.auth != null &&
        request.resource.size < 50 * 1024 * 1024 && // 50MB
        request.resource.contentType.matches('image/.*|video/.*');
    }
  }
}
```

### Validaciones del Cliente

```typescript
// Tamaños máximos
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Tipos permitidos
const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const ALLOWED_VIDEO_TYPES = ['mp4', 'avi', 'mov', 'wmv', 'flv'];

// Validación personalizada
const validateExerciseMedia = (file: any) => {
  const validation = validateFile(file.fileName, file.fileSize, MAX_IMAGE_SIZE);
  
  if (!validation.isValid) {
    return validation;
  }

  const extension = getFileExtension(file.fileName);
  const isImage = ALLOWED_IMAGE_TYPES.includes(extension);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(extension);

  if (!isImage && !isVideo) {
    return {
      isValid: false,
      error: 'Solo se permiten imágenes y videos'
    };
  }

  return { isValid: true };
};
```

## 🎨 Personalización

### Estilos del Componente de Progreso

```typescript
// Personalizar colores
const customStyles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
  },
  progressFill: {
    backgroundColor: '#28a745',
    borderRadius: 4,
  },
});
```

### Configuración de Subida

```typescript
// Configuración personalizada
const uploadConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['jpg', 'png', 'mp4'],
  compression: {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
  },
  retryAttempts: 3,
  timeout: 30000, // 30 segundos
};
```

## 🚨 Manejo de Errores

### Errores Comunes

```typescript
// Errores de red
if (error.code === 'storage/network-request-failed') {
  Alert.alert('Error', 'Problema de conexión. Intenta de nuevo.');
}

// Archivo muy grande
if (error.code === 'storage/invalid-argument') {
  Alert.alert('Error', 'El archivo es muy grande.');
}

// Permisos insuficientes
if (error.code === 'storage/unauthorized') {
  Alert.alert('Error', 'No tienes permisos para subir archivos.');
}

// Archivo no encontrado
if (error.code === 'storage/object-not-found') {
  Alert.alert('Error', 'El archivo no existe.');
}
```

### Reintentos Automáticos

```typescript
const uploadWithRetry = async (uri: string, path: string, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uploadFile(uri, path);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`Intento ${attempt} fallido, reintentando...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};
```

## 📊 Monitoreo y Analytics

### Tracking de Subidas

```typescript
import { analytics } from '../config/firebase';

const trackUpload = (fileType: string, fileSize: number, success: boolean) => {
  analytics.logEvent('file_upload', {
    file_type: fileType,
    file_size: fileSize,
    success: success,
    timestamp: new Date().toISOString(),
  });
};
```

### Métricas de Uso

```typescript
// Contar archivos subidos
const getUploadStats = async () => {
  const stats = await getDocs(collection(db, 'upload_stats'));
  return stats.docs.map(doc => doc.data());
};
```

## 🔧 Troubleshooting

### Error: "Network request failed"
- Verificar conexión a internet
- Comprobar reglas de Firebase Storage
- Verificar tamaño del archivo

### Error: "Permission denied"
- Verificar reglas de seguridad
- Comprobar autenticación del usuario
- Verificar permisos de la app

### Error: "File too large"
- Comprimir archivo antes de subir
- Reducir calidad de imagen/video
- Verificar límites de Firebase

### Error: "Invalid file type"
- Verificar extensión del archivo
- Comprobar tipos permitidos
- Validar MIME type

## 📚 Recursos Adicionales

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/image-picker/)
- [React Native File System](https://github.com/itinance/react-native-fs)
- [Firebase Storage Rules](https://firebase.google.com/docs/storage/security)

## 🎯 Mejores Prácticas

1. **Validar archivos** antes de subir
2. **Mostrar progreso** para archivos grandes
3. **Manejar errores** de forma elegante
4. **Comprimir archivos** cuando sea posible
5. **Usar rutas únicas** para evitar conflictos
6. **Limpiar archivos** no utilizados
7. **Monitorear uso** de storage
8. **Configurar reglas** de seguridad apropiadas 