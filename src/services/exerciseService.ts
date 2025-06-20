import { firestore } from "../config/firebase";
import { doc, setDoc, collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";

export interface Exercise {
  id?: string;
  name: string;
  primaryMuscle: string;
  secondaryMuscles?: string[];
  equipment: string;
  difficulty: "Principiante" | "Intermedio" | "Avanzado";
  instructions: string;
  tips?: string;
  thumbnailUrl: string;
  videoUrl: string;
  category?: string;
  restTime?: number; // segundos
  createdAt: string;
  updatedAt?: string;
  createdBy: string; // UID del admin que lo creó
}

export interface CreateExerciseData {
  name: string;
  primaryMuscle: string;
  secondaryMuscles?: string[];
  equipment: string;
  difficulty: "Principiante" | "Intermedio" | "Avanzado";
  instructions: string;
  tips?: string;
  thumbnailUrl: string;
  videoUrl: string;
  category?: string;
  restTime?: number;
  createdBy: string;
}

class ExerciseService {
  private collectionName = "exercises";

  /**
   * Crea un nuevo ejercicio en Firestore
   * @param exerciseData Datos del ejercicio
   * @returns Promise con el ID del ejercicio creado
   */
  async createExercise(exerciseData: CreateExerciseData): Promise<string> {
    try {
      console.log("💾 Creando ejercicio en Firestore...");
      
      const exerciseToSave: Omit<Exercise, 'id'> = {
        ...exerciseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(firestore, this.collectionName), exerciseToSave);
      
      console.log("✅ Ejercicio creado con ID:", docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error("❌ Error al crear ejercicio:", error);
      throw new Error(`Error al crear ejercicio: ${error.message}`);
    }
  }

  /**
   * Obtiene todos los ejercicios
   * @returns Promise con array de ejercicios
   */
  async getAllExercises(): Promise<Exercise[]> {
    try {
      console.log("📋 Obteniendo todos los ejercicios...");
      
      const q = query(
        collection(firestore, this.collectionName),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const exercises: Exercise[] = [];
      
      querySnapshot.forEach((doc) => {
        exercises.push({
          id: doc.id,
          ...doc.data()
        } as Exercise);
      });
      
      console.log(`✅ Obtenidos ${exercises.length} ejercicios`);
      return exercises;
    } catch (error: any) {
      console.error("❌ Error al obtener ejercicios:", error);
      throw new Error(`Error al obtener ejercicios: ${error.message}`);
    }
  }

  /**
   * Obtiene ejercicios filtrados por grupo muscular
   * @param muscleGroup Grupo muscular a filtrar
   * @returns Promise con array de ejercicios filtrados
   */
  async getExercisesByMuscle(muscleGroup: string): Promise<Exercise[]> {
    try {
      console.log("🔍 Filtrando ejercicios por músculo:", muscleGroup);
      
      const q = query(
        collection(firestore, this.collectionName),
        where("primaryMuscle", "==", muscleGroup),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const exercises: Exercise[] = [];
      
      querySnapshot.forEach((doc) => {
        exercises.push({
          id: doc.id,
          ...doc.data()
        } as Exercise);
      });
      
      console.log(`✅ Encontrados ${exercises.length} ejercicios para ${muscleGroup}`);
      return exercises;
    } catch (error: any) {
      console.error("❌ Error al filtrar ejercicios:", error);
      throw new Error(`Error al filtrar ejercicios: ${error.message}`);
    }
  }

  /**
   * Obtiene ejercicios filtrados por equipo
   * @param equipment Tipo de equipo a filtrar
   * @returns Promise con array de ejercicios filtrados
   */
  async getExercisesByEquipment(equipment: string): Promise<Exercise[]> {
    try {
      console.log("🔍 Filtrando ejercicios por equipo:", equipment);
      
      const q = query(
        collection(firestore, this.collectionName),
        where("equipment", "==", equipment),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const exercises: Exercise[] = [];
      
      querySnapshot.forEach((doc) => {
        exercises.push({
          id: doc.id,
          ...doc.data()
        } as Exercise);
      });
      
      console.log(`✅ Encontrados ${exercises.length} ejercicios para ${equipment}`);
      return exercises;
    } catch (error: any) {
      console.error("❌ Error al filtrar ejercicios por equipo:", error);
      throw new Error(`Error al filtrar ejercicios: ${error.message}`);
    }
  }

  /**
   * Obtiene un ejercicio por su ID
   * @param exerciseId ID del ejercicio
   * @returns Promise con el ejercicio o null si no existe
   */
  async getExerciseById(exerciseId: string): Promise<Exercise | null> {
    try {
      console.log("🔍 Obteniendo ejercicio por ID:", exerciseId);
      
      const docRef = doc(firestore, this.collectionName, exerciseId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const exercise = {
          id: docSnap.id,
          ...docSnap.data()
        } as Exercise;
        
        console.log("✅ Ejercicio encontrado:", exercise.name);
        return exercise;
      } else {
        console.log("⚠️ Ejercicio no encontrado");
        return null;
      }
    } catch (error: any) {
      console.error("❌ Error al obtener ejercicio:", error);
      throw new Error(`Error al obtener ejercicio: ${error.message}`);
    }
  }

  /**
   * Actualiza un ejercicio existente
   * @param exerciseId ID del ejercicio a actualizar
   * @param updateData Datos a actualizar
   * @returns Promise que se resuelve cuando se completa la actualización
   */
  async updateExercise(exerciseId: string, updateData: Partial<Exercise>): Promise<void> {
    try {
      console.log("✏️ Actualizando ejercicio:", exerciseId);
      
      const docRef = doc(firestore, this.collectionName, exerciseId);
      
      const dataToUpdate = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(docRef, dataToUpdate);
      
      console.log("✅ Ejercicio actualizado exitosamente");
    } catch (error: any) {
      console.error("❌ Error al actualizar ejercicio:", error);
      throw new Error(`Error al actualizar ejercicio: ${error.message}`);
    }
  }

  /**
   * Elimina un ejercicio
   * @param exerciseId ID del ejercicio a eliminar
   * @returns Promise que se resuelve cuando se completa la eliminación
   */
  async deleteExercise(exerciseId: string): Promise<void> {
    try {
      console.log("🗑️ Eliminando ejercicio:", exerciseId);
      
      const docRef = doc(firestore, this.collectionName, exerciseId);
      await deleteDoc(docRef);
      
      console.log("✅ Ejercicio eliminado exitosamente");
    } catch (error: any) {
      console.error("❌ Error al eliminar ejercicio:", error);
      throw new Error(`Error al eliminar ejercicio: ${error.message}`);
    }
  }

  /**
   * Busca ejercicios por nombre
   * @param searchTerm Término de búsqueda
   * @returns Promise con array de ejercicios que coinciden
   */
  async searchExercises(searchTerm: string): Promise<Exercise[]> {
    try {
      console.log("🔍 Buscando ejercicios:", searchTerm);
      
      // Nota: Firestore no tiene búsqueda full-text nativa
      // Esta es una implementación básica que busca por coincidencia exacta del inicio
      const q = query(
        collection(firestore, this.collectionName),
        where("name", ">=", searchTerm),
        where("name", "<=", searchTerm + "\uf8ff"),
        orderBy("name")
      );
      
      const querySnapshot = await getDocs(q);
      const exercises: Exercise[] = [];
      
      querySnapshot.forEach((doc) => {
        exercises.push({
          id: doc.id,
          ...doc.data()
        } as Exercise);
      });
      
      console.log(`✅ Encontrados ${exercises.length} ejercicios para "${searchTerm}"`);
      return exercises;
    } catch (error: any) {
      console.error("❌ Error en búsqueda de ejercicios:", error);
      throw new Error(`Error en búsqueda: ${error.message}`);
    }
  }

  /**
   * Obtiene estadísticas de ejercicios
   * @returns Promise con estadísticas
   */
  async getExerciseStats(): Promise<{
    total: number;
    byMuscle: Record<string, number>;
    byEquipment: Record<string, number>;
    byDifficulty: Record<string, number>;
  }> {
    try {
      console.log("📊 Obteniendo estadísticas de ejercicios...");
      
      const exercises = await this.getAllExercises();
      
      const stats = {
        total: exercises.length,
        byMuscle: {} as Record<string, number>,
        byEquipment: {} as Record<string, number>,
        byDifficulty: {} as Record<string, number>,
      };
      
      exercises.forEach(exercise => {
        // Contar por músculo
        stats.byMuscle[exercise.primaryMuscle] = (stats.byMuscle[exercise.primaryMuscle] || 0) + 1;
        
        // Contar por equipo
        stats.byEquipment[exercise.equipment] = (stats.byEquipment[exercise.equipment] || 0) + 1;
        
        // Contar por dificultad
        stats.byDifficulty[exercise.difficulty] = (stats.byDifficulty[exercise.difficulty] || 0) + 1;
      });
      
      console.log("✅ Estadísticas calculadas:", stats);
      return stats;
    } catch (error: any) {
      console.error("❌ Error al calcular estadísticas:", error);
      throw new Error(`Error al calcular estadísticas: ${error.message}`);
    }
  }
}

export const exerciseService = new ExerciseService();
export default exerciseService; 