import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadFile, generateStoragePath } from './storage';

export interface ExerciseWithLocalImage {
  id: string;
  name: string;
  mediaURL?: string;
  mediaType?: string;
}

/**
 * Encuentra todos los ejercicios con imágenes locales
 */
export async function findExercisesWithLocalImages(): Promise<ExerciseWithLocalImage[]> {
  try {
    const exercisesRef = collection(db, 'exercises');
    const snapshot = await getDocs(exercisesRef);
    
    const exercisesWithLocalImages: ExerciseWithLocalImage[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.mediaType === 'image' && data.mediaURL && data.mediaURL.startsWith('file://')) {
        exercisesWithLocalImages.push({
          id: doc.id,
          name: data.name || '',
          mediaURL: data.mediaURL,
          mediaType: data.mediaType,
        });
      }
    });
    
    console.log(`📊 Encontrados ${exercisesWithLocalImages.length} ejercicios con imágenes locales`);
    return exercisesWithLocalImages;
  } catch (error) {
    console.error('Error buscando ejercicios con imágenes locales:', error);
    throw error;
  }
}

/**
 * Migra una imagen local a Firebase Storage
 */
export async function migrateLocalImageToStorage(
  exerciseId: string,
  localImageUri: string,
  exerciseName: string
): Promise<string> {
  try {
    console.log(`🔄 Migrando imagen para: ${exerciseName}`);
    
    // Generar nombre de archivo
    const fileName = `migrated_${exerciseName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`;
    const storagePath = generateStoragePath(fileName, 'exercises/images');
    
    // Subir imagen a Firebase Storage
    const uploadResult = await uploadFile(localImageUri, storagePath, (progress) => {
      console.log(`Subiendo imagen: ${progress.percent.toFixed(1)}%`);
    });
    
    console.log(`✅ Imagen migrada exitosamente: ${uploadResult.url}`);
    return uploadResult.url;
  } catch (error) {
    console.error(`Error migrando imagen para ${exerciseName}:`, error);
    throw error;
  }
}

/**
 * Actualiza un ejercicio con la nueva URL de imagen
 */
export async function updateExerciseWithImageURL(
  exerciseId: string,
  imageURL: string
): Promise<void> {
  try {
    const exerciseRef = doc(db, 'exercises', exerciseId);
    await updateDoc(exerciseRef, {
      imageURL: imageURL,
      updatedAt: new Date(),
    });
    
    console.log(`✅ Ejercicio actualizado con nueva URL de imagen: ${exerciseId}`);
  } catch (error) {
    console.error('Error actualizando ejercicio con URL de imagen:', error);
    throw error;
  }
}

/**
 * Migra todas las imágenes locales a Firebase Storage
 */
export async function migrateAllLocalImages(): Promise<{
  total: number;
  success: number;
  failed: number;
  results: Array<{
    exerciseId: string;
    exerciseName: string;
    success: boolean;
    imageURL?: string;
    error?: string;
  }>;
}> {
  try {
    const exercises = await findExercisesWithLocalImages();
    const results = [];
    let success = 0;
    let failed = 0;
    
    console.log(`🚀 Iniciando migración de ${exercises.length} imágenes...`);
    
    for (const exercise of exercises) {
      try {
        // Migrar imagen a Firebase Storage
        const imageURL = await migrateLocalImageToStorage(
          exercise.id,
          exercise.mediaURL!,
          exercise.name
        );
        
        // Actualizar ejercicio con nueva URL
        await updateExerciseWithImageURL(exercise.id, imageURL);
        
        results.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          success: true,
          imageURL: imageURL,
        });
        
        success++;
        console.log(`✅ ${exercise.name} - Migrado exitosamente`);
        
      } catch (error) {
        results.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          success: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
        
        failed++;
        console.error(`❌ ${exercise.name} - Error en migración:`, error);
      }
    }
    
    console.log(`🎉 Migración completada: ${success} exitosas, ${failed} fallidas`);
    
    return {
      total: exercises.length,
      success,
      failed,
      results,
    };
  } catch (error) {
    console.error('Error en migración masiva:', error);
    throw error;
  }
}

/**
 * Verifica si un ejercicio ya tiene imagen migrada
 */
export async function checkExerciseImageStatus(exerciseId: string): Promise<{
  hasLocalImage: boolean;
  hasMigratedImage: boolean;
  localImageURL?: string;
  migratedImageURL?: string;
}> {
  try {
    const exerciseRef = doc(db, 'exercises', exerciseId);
    const exerciseDoc = await getDocs(collection(db, 'exercises'));
    
    let exerciseData: any = null;
    exerciseDoc.forEach((doc) => {
      if (doc.id === exerciseId) {
        exerciseData = doc.data();
      }
    });
    
    if (!exerciseData) {
      throw new Error('Ejercicio no encontrado');
    }
    
    return {
      hasLocalImage: !!(exerciseData.mediaURL && exerciseData.mediaURL.startsWith('file://')),
      hasMigratedImage: !!(exerciseData.imageURL && exerciseData.imageURL.startsWith('https://')),
      localImageURL: exerciseData.mediaURL,
      migratedImageURL: exerciseData.imageURL,
    };
  } catch (error) {
    console.error('Error verificando estado de imagen:', error);
    throw error;
  }
} 