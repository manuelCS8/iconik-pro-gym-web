import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useAuth } from '../../contexts/AuthContext';
import { pickImage, pickVideo, showMediaOptions } from '../../services/mediaService';
import { uploadFile, generateStoragePath, validateFile, formatFileSize } from '../../services/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const { width } = Dimensions.get('window');

interface ExerciseForm {
  name: string;
  description: string;
  muscleGroup: string;
  difficulty: string;
  instructions: string;
}

const CreateExerciseScreen: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<ExerciseForm>({
    name: '',
    description: '',
    muscleGroup: '',
    difficulty: '',
    instructions: '',
  });
  
  const [selectedMedia, setSelectedMedia] = useState<{
    uri: string;
    type: 'image' | 'video';
    fileName: string;
    fileSize: number;
  } | null>(null);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ExerciseForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePickMedia = async (type: 'image' | 'video' | 'both' = 'both') => {
    try {
      let media;
      
      if (type === 'image') {
        media = await pickImage();
      } else if (type === 'video') {
        media = await pickVideo();
      } else {
        media = await showMediaOptions('both');
      }

      if (media) {
        // Validar archivo
        const validation = validateFile(media.fileName || 'file', media.fileSize || 0);
        
        if (!validation.isValid) {
          Alert.alert('Error', validation.error || 'Archivo no válido');
          return;
        }

        const mediaType = media.type === 'video' ? 'video' : 'image';
        
        setSelectedMedia({
          uri: media.uri,
          type: mediaType,
          fileName: media.fileName || 'file',
          fileSize: media.fileSize || 0,
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al seleccionar media');
    }
  };

  const handleUploadMedia = async (): Promise<string | null> => {
    if (!selectedMedia) return null;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Generar ruta única
      const storagePath = generateStoragePath(
        selectedMedia.fileName,
        `exercises/${user?.uid || 'anonymous'}`
      );

      // Subir archivo
      const result = await uploadFile(
        selectedMedia.uri,
        storagePath,
        (progress) => {
          setUploadProgress(progress.percent);
        }
      );

      setIsUploading(false);
      setUploadProgress(0);
      
      return result.url;
    } catch (error: any) {
      setIsUploading(false);
      setUploadProgress(0);
      Alert.alert('Error', 'Error al subir el archivo: ' + error.message);
      return null;
    }
  };

  const handleSubmit = async () => {
    // Validar formulario
    if (!form.name.trim() || !form.description.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setIsSubmitting(true);

      // Subir media si existe
      let mediaURL = '';
      if (selectedMedia) {
        mediaURL = await handleUploadMedia() || '';
      }

      // Crear documento en Firestore
      const exerciseData = {
        ...form,
        mediaURL,
        mediaType: selectedMedia?.type || null,
        createdBy: user?.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'exercises'), exerciseData);

      Alert.alert(
        'Éxito', 
        'Ejercicio creado exitosamente',
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpiar formulario
              setForm({
                name: '',
                description: '',
                muscleGroup: '',
                difficulty: '',
                instructions: '',
              });
              setSelectedMedia(null);
            }
          }
        ]
      );

      console.log('Ejercicio creado con ID:', docRef.id);
    } catch (error: any) {
      Alert.alert('Error', 'Error al crear el ejercicio: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeSelectedMedia = () => {
    setSelectedMedia(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crear Nuevo Ejercicio</Text>
        <Text style={styles.subtitle}>Agrega un nuevo ejercicio a la biblioteca</Text>
      </View>

      <View style={styles.form}>
        {/* Información básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre del Ejercicio *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Ej: Press de Banca"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Describe el ejercicio..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Grupo Muscular</Text>
              <TextInput
                style={styles.input}
                value={form.muscleGroup}
                onChangeText={(value) => handleInputChange('muscleGroup', value)}
                placeholder="Ej: Pecho"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Dificultad</Text>
              <TextInput
                style={styles.input}
                value={form.difficulty}
                onChangeText={(value) => handleInputChange('difficulty', value)}
                placeholder="Ej: Principiante"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Instrucciones</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.instructions}
              onChangeText={(value) => handleInputChange('instructions', value)}
              placeholder="Instrucciones paso a paso..."
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Imagen o Video</Text>
          
          {selectedMedia ? (
            <View style={styles.mediaPreview}>
              {selectedMedia.type === 'image' ? (
                <Image
                  source={{ uri: selectedMedia.uri }}
                  style={styles.mediaPreviewImage}
                  resizeMode="cover"
                />
              ) : (
                <Video
                  source={{ uri: selectedMedia.uri }}
                  style={styles.mediaPreviewVideo}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={false}
                />
              )}
              
              <View style={styles.mediaInfo}>
                <Text style={styles.mediaFileName}>{selectedMedia.fileName}</Text>
                <Text style={styles.mediaFileSize}>
                  {formatFileSize(selectedMedia.fileSize)}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={removeSelectedMedia}
              >
                <Text style={styles.removeMediaButtonText}>❌ Eliminar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.mediaButtons}>
              <TouchableOpacity
                style={[styles.mediaButton, styles.imageButton]}
                onPress={() => handlePickMedia('image')}
              >
                <Text style={styles.mediaButtonText}>📷 Agregar Imagen</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.mediaButton, styles.videoButton]}
                onPress={() => handlePickMedia('video')}
              >
                <Text style={styles.mediaButtonText}>🎥 Agregar Video</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.mediaButton, styles.mixedButton]}
                onPress={() => handlePickMedia('both')}
              >
                <Text style={styles.mediaButtonText}>📁 Seleccionar Media</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Progreso de subida */}
        {isUploading && (
          <View style={styles.uploadProgress}>
            <Text style={styles.uploadProgressText}>
              Subiendo archivo... {uploadProgress.toFixed(1)}%
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${uploadProgress}%` }]} 
              />
            </View>
          </View>
        )}

        {/* Botón de envío */}
        <TouchableOpacity
          style={[styles.submitButton, (isSubmitting || isUploading) && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>💪 Crear Ejercicio</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  mediaButtons: {
    gap: 12,
  },
  mediaButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  imageButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
  },
  videoButton: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  mixedButton: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  mediaButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  mediaPreview: {
    alignItems: 'center',
  },
  mediaPreviewImage: {
    width: width - 80,
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  mediaPreviewVideo: {
    width: width - 80,
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  mediaInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  mediaFileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  mediaFileSize: {
    fontSize: 12,
    color: '#666',
  },
  removeMediaButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#ffebee',
  },
  removeMediaButtonText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '500',
  },
  uploadProgress: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  uploadProgressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateExerciseScreen; 