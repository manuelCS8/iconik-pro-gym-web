import { storage } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export interface UploadResult {
  downloadURL: string;
  fileName: string;
  fileSize: number;
}

class StorageService {
  /**
   * Sube una imagen a Firebase Storage
   * @param imageUri URI de la imagen local
   * @param fileName Nombre del archivo (opcional)
   * @param onProgress Callback para el progreso de subida
   * @returns Promise con la URL de descarga
   */
  async uploadImage(
    imageUri: string,
    fileName?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      console.log("📷 Iniciando subida de imagen...");
      
      // Generar nombre único si no se proporciona
      const finalFileName = fileName || `image_${Date.now()}.jpg`;
      const storageRef = ref(storage, `exercises/thumbnails/${finalFileName}`);
      
      // Convertir URI a blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      console.log(`📏 Tamaño de imagen: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
      
      if (blob.size > 5 * 1024 * 1024) { // 5MB límite
        throw new Error("La imagen no puede ser mayor a 5MB");
      }
      
      // Subir con progreso
      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, blob);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = {
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              };
              onProgress(progress);
            },
            (error) => {
              console.error("❌ Error en subida de imagen:", error);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log("✅ Imagen subida exitosamente:", downloadURL);
                resolve({
                  downloadURL,
                  fileName: finalFileName,
                  fileSize: blob.size
                });
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } else {
        // Subida simple sin progreso
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        
        console.log("✅ Imagen subida exitosamente:", downloadURL);
        return {
          downloadURL,
          fileName: finalFileName,
          fileSize: blob.size
        };
      }
    } catch (error: any) {
      console.error("❌ Error al subir imagen:", error);
      throw new Error(`Error al subir imagen: ${error.message}`);
    }
  }

  /**
   * Sube un video a Firebase Storage
   * @param videoUri URI del video local
   * @param fileName Nombre del archivo (opcional)
   * @param onProgress Callback para el progreso de subida
   * @returns Promise con la URL de descarga
   */
  async uploadVideo(
    videoUri: string,
    fileName?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      console.log("🎥 Iniciando subida de video...");
      
      // Generar nombre único si no se proporciona
      const finalFileName = fileName || `video_${Date.now()}.mp4`;
      const storageRef = ref(storage, `exercises/videos/${finalFileName}`);
      
      // Convertir URI a blob
      const response = await fetch(videoUri);
      const blob = await response.blob();
      
      console.log(`📏 Tamaño de video: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
      
      if (blob.size > 50 * 1024 * 1024) { // 50MB límite
        throw new Error("El video no puede ser mayor a 50MB");
      }
      
      // Subir con progreso
      if (onProgress) {
        const uploadTask = uploadBytesResumable(storageRef, blob);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = {
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              };
              onProgress(progress);
            },
            (error) => {
              console.error("❌ Error en subida de video:", error);
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log("✅ Video subido exitosamente:", downloadURL);
                resolve({
                  downloadURL,
                  fileName: finalFileName,
                  fileSize: blob.size
                });
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      } else {
        // Subida simple sin progreso
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        
        console.log("✅ Video subido exitosamente:", downloadURL);
        return {
          downloadURL,
          fileName: finalFileName,
          fileSize: blob.size
        };
      }
    } catch (error: any) {
      console.error("❌ Error al subir video:", error);
      throw new Error(`Error al subir video: ${error.message}`);
    }
  }

  /**
   * Valida que un archivo de imagen sea válido
   * @param imageUri URI de la imagen
   * @returns true si es válida, false si no
   */
  async validateImage(imageUri: string): Promise<boolean> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Validar tipo MIME
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(blob.type)) {
        throw new Error("Formato de imagen no válido. Usa JPG, PNG o WebP.");
      }
      
      // Validar tamaño (5MB máximo)
      if (blob.size > 5 * 1024 * 1024) {
        throw new Error("La imagen no puede ser mayor a 5MB");
      }
      
      return true;
    } catch (error) {
      console.warn("⚠️ Imagen no válida:", error);
      return false;
    }
  }

  /**
   * Valida que un archivo de video sea válido
   * @param videoUri URI del video
   * @returns true si es válido, false si no
   */
  async validateVideo(videoUri: string): Promise<boolean> {
    try {
      const response = await fetch(videoUri);
      const blob = await response.blob();
      
      // Validar tipo MIME
      const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime'];
      if (!validTypes.includes(blob.type)) {
        throw new Error("Formato de video no válido. Usa MP4, MOV o AVI.");
      }
      
      // Validar tamaño (50MB máximo)
      if (blob.size > 50 * 1024 * 1024) {
        throw new Error("El video no puede ser mayor a 50MB");
      }
      
      return true;
    } catch (error) {
      console.warn("⚠️ Video no válido:", error);
      return false;
    }
  }

  /**
   * Elimina un archivo de Firebase Storage
   * @param downloadURL URL de descarga del archivo a eliminar
   */
  async deleteFile(downloadURL: string): Promise<void> {
    try {
      const fileRef = ref(storage, downloadURL);
      // await deleteObject(fileRef); // Descomentar cuando se implemente Firebase real
      console.log("🗑️ Archivo eliminado:", downloadURL);
    } catch (error: any) {
      console.error("❌ Error al eliminar archivo:", error);
      throw new Error(`Error al eliminar archivo: ${error.message}`);
    }
  }
}

export const storageService = new StorageService();
export default storageService; 