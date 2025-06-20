import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, SIZES } from '../../utils/theme';
import {
  firestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from '../../config/firebase';
import RoleGuard from '../../components/RoleGuard';

interface Exercise {
  id: string;
  name: string;
  primaryMuscle: string;
  equipment: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  instructions: string;
  tips?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  createdAt: Date;
  isActive: boolean;
}

interface NewExerciseForm {
  name: string;
  primaryMuscle: string;
  equipment: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  instructions: string;
  tips: string;
}

const ManageExercisesScreen: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterMuscle, setFilterMuscle] = useState<string>('All');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newExercise, setNewExercise] = useState<NewExerciseForm>({
    name: '',
    primaryMuscle: '',
    equipment: '',
    difficulty: 'Principiante',
    instructions: '',
    tips: '',
  });
  
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<{ uri: string; name: string }>({ uri: '', name: '' });

  // Opciones para dropdowns
  const muscleGroups = [
    'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 
    'Glúteos', 'Pantorrillas', 'Cardio', 'Funcional'
  ];

  const equipmentOptions = [
    'Peso libre', 'Máquina', 'Calistenia', 'Cardio', 'Cable', 'Funcional'
  ];

  const difficultyLevels: Array<'Principiante' | 'Intermedio' | 'Avanzado'> = [
    'Principiante', 'Intermedio', 'Avanzado'
  ];

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [exercises, searchText, filterMuscle, filterDifficulty]);

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      
      // Simular ejercicios (en producción vendría de Firestore)
      const mockExercises: Exercise[] = [
        {
          id: "ex1",
          name: "Press Pecho Vertical",
          primaryMuscle: "Pecho",
          equipment: "Máquina",
          difficulty: "Principiante",
          instructions: "1. Ajusta el asiento a la altura adecuada\n2. Agarra las manijas con las palmas hacia adelante\n3. Empuja hacia adelante manteniendo la espalda recta\n4. Regresa lentamente a la posición inicial",
          tips: "Mantén los codos ligeramente flexionados. No uses momentum.",
          thumbnailUrl: "https://mock-url.com/press-pecho.jpg",
          videoUrl: "https://mock-url.com/press-pecho.mp4",
          createdAt: new Date("2024-01-15"),
          isActive: true, 
        },
        {
          id: "ex2",
          name: "Sentadilla Profunda",
          primaryMuscle: "Piernas",
          equipment: "Peso libre",
          difficulty: "Intermedio",
          instructions: "1. Colócate con los pies separados al ancho de los hombros\n2. Baja como si fueras a sentarte manteniendo el pecho arriba\n3. Desciende hasta que los muslos estén paralelos al suelo\n4. Empuja a través de los talones para volver arriba",
          tips: "Mantén las rodillas alineadas con los pies. No dejes que se vayan hacia adentro.",
          thumbnailUrl: "https://mock-url.com/sentadilla.jpg",
          videoUrl: "https://mock-url.com/sentadilla.mp4",
          createdAt: new Date("2024-02-01"),
          isActive: true,
        },
        {
          id: "ex3",
          name: "Peso Muerto",
          primaryMuscle: "Espalda",
          equipment: "Peso libre",
          difficulty: "Avanzado",
          instructions: "1. Párate con los pies separados al ancho de caderas\n2. Agarra la barra con las manos fuera de las piernas\n3. Mantén la espalda recta y levanta usando piernas y caderas\n4. Termina de pie con los hombros hacia atrás",
          tips: "La barra debe mantenerse cerca del cuerpo durante todo el movimiento.",
          thumbnailUrl: "https://mock-url.com/peso-muerto.jpg",
          videoUrl: "https://mock-url.com/peso-muerto.mp4",
          createdAt: new Date("2024-03-01"),
          isActive: false, // Ejemplo de ejercicio desactivado
        },
        {
          id: "ex4",
          name: "Curl de Bíceps",
          primaryMuscle: "Brazos",
          equipment: "Peso libre",
          difficulty: "Principiante",
          instructions: "1. Mantén los pies separados al ancho de hombros\n2. Agarra las mancuernas con las palmas hacia adelante\n3. Flexiona los codos llevando las pesas hacia los hombros\n4. Baja controladamente a la posición inicial",
          tips: "Evita balancear el cuerpo. Solo se mueven los antebrazos.",
          thumbnailUrl: "https://mock-url.com/curl-biceps.jpg",
          videoUrl: "https://mock-url.com/curl-biceps.mp4",
          createdAt: new Date("2024-04-01"),
          isActive: true,
        },
      ];

      setExercises(mockExercises);
      console.log(`✅ Cargados ${mockExercises.length} ejercicios`);

    } catch (error) {
      console.error("Error loading exercises:", error);
      Alert.alert("Error", "No se pudieron cargar los ejercicios");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...exercises];

    // Filtro por texto de búsqueda
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(search) ||
        exercise.primaryMuscle.toLowerCase().includes(search) ||
        exercise.equipment.toLowerCase().includes(search)
      );
    }

    // Filtro por grupo muscular
    if (filterMuscle !== 'All') {
      filtered = filtered.filter(exercise => exercise.primaryMuscle === filterMuscle);
    }

    // Filtro por dificultad
    if (filterDifficulty !== 'All') {
      filtered = filtered.filter(exercise => exercise.difficulty === filterDifficulty);
    }

    setFilteredExercises(filtered);
  };

  const getDifficultyColor = (difficulty: Exercise['difficulty']) => {
    switch (difficulty) {
      case 'Principiante': return COLORS.success;
      case 'Intermedio': return COLORS.warning;
      case 'Avanzado': return COLORS.error;
      default: return COLORS.gray;
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert("Permiso requerido", "Se necesita acceso a la galería para seleccionar imágenes.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Validar tamaño (5MB máximo)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert("Archivo muy grande", "La imagen no puede ser mayor a 5MB");
          return;
        }
        
        setSelectedImage(asset.uri);
        Alert.alert("Éxito", "Imagen seleccionada correctamente");
      }
    } catch (error: any) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Validar tamaño (50MB máximo)
        if (asset.size && asset.size > 50 * 1024 * 1024) {
          Alert.alert("Archivo muy grande", "El video no puede ser mayor a 50MB");
          return;
        }
        
        setSelectedVideo({ uri: asset.uri, name: asset.name || "video.mp4" });
        Alert.alert("Éxito", "Video seleccionado correctamente");
      }
    } catch (error: any) {
      console.error("Error al seleccionar video:", error);
      Alert.alert("Error", "No se pudo seleccionar el video");
    }
  };

  const handleCreateExercise = async () => {
    try {
      if (!newExercise.name.trim() || !newExercise.primaryMuscle || !newExercise.equipment || !newExercise.instructions.trim()) {
        Alert.alert("Error", "Por favor completa todos los campos obligatorios");
        return;
      }

      setIsUploading(true);

      // En modo mock, simular URLs
      const thumbnailUrl = selectedImage ? `https://mock-storage.com/thumbnails/${Date.now()}.jpg` : undefined;
      const videoUrl = selectedVideo.uri ? `https://mock-storage.com/videos/${Date.now()}.mp4` : undefined;

      const newExerciseData: Exercise = {
        id: `exercise-${Date.now()}`,
        name: newExercise.name.trim(),
        primaryMuscle: newExercise.primaryMuscle,
        equipment: newExercise.equipment,
        difficulty: newExercise.difficulty,
        instructions: newExercise.instructions.trim(),
        tips: newExercise.tips.trim() || undefined,
        thumbnailUrl,
        videoUrl,
        createdAt: new Date(),
        isActive: true,
      };

      setExercises(prev => [...prev, newExerciseData]);
      
      // Resetear formulario y cerrar modal
      resetForm();
      setShowCreateModal(false);

      Alert.alert("Éxito", `Ejercicio "${newExerciseData.name}" creado correctamente`);
      console.log("✅ Nuevo ejercicio creado:", newExerciseData.name);

    } catch (error) {
      console.error("Error creating exercise:", error);
      Alert.alert("Error", "No se pudo crear el ejercicio");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateExercise = async () => {
    if (!editingExercise) return;

    try {
      setIsUploading(true);

      const updatedExercises = exercises.map(exercise =>
        exercise.id === editingExercise.id
          ? {
              ...exercise,
              name: newExercise.name.trim(),
              primaryMuscle: newExercise.primaryMuscle,
              equipment: newExercise.equipment,
              difficulty: newExercise.difficulty,
              instructions: newExercise.instructions.trim(),
              tips: newExercise.tips.trim() || undefined,
              // Solo actualizar URLs si se seleccionaron nuevos archivos
              thumbnailUrl: selectedImage ? `https://mock-storage.com/thumbnails/${Date.now()}.jpg` : exercise.thumbnailUrl,
              videoUrl: selectedVideo.uri ? `https://mock-storage.com/videos/${Date.now()}.mp4` : exercise.videoUrl,
            }
          : exercise
      );

      setExercises(updatedExercises);
      setEditingExercise(null);
      resetForm();
      setShowCreateModal(false);

      Alert.alert("Éxito", "Ejercicio actualizado correctamente");
      console.log("✅ Ejercicio actualizado:", newExercise.name);

    } catch (error) {
      console.error("Error updating exercise:", error);
      Alert.alert("Error", "No se pudo actualizar el ejercicio");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setNewExercise({
      name: exercise.name,
      primaryMuscle: exercise.primaryMuscle,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      instructions: exercise.instructions,
      tips: exercise.tips || '',
    });
    setSelectedImage(''); // No pre-cargar imagen existente
    setSelectedVideo({ uri: '', name: '' }); // No pre-cargar video existente
    setShowCreateModal(true);
  };

  const handleDeleteExercise = (exercise: Exercise) => {
    Alert.alert(
      "Eliminar Ejercicio",
      `¿Estás seguro de que quieres eliminar "${exercise.name}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setExercises(prev => prev.filter(ex => ex.id !== exercise.id));
            Alert.alert("Éxito", `El ejercicio "${exercise.name}" ha sido eliminado`);
            console.log("❌ Ejercicio eliminado:", exercise.name);
          }
        }
      ]
    );
  };

  const handleToggleActive = (exercise: Exercise) => {
    const newStatus = !exercise.isActive;
    const updatedExercises = exercises.map(ex =>
      ex.id === exercise.id ? { ...ex, isActive: newStatus } : ex
    );
    setExercises(updatedExercises);
    
    Alert.alert(
      "Éxito",
      `Ejercicio "${exercise.name}" ${newStatus ? 'activado' : 'desactivado'}`
    );
    console.log(`🔄 Ejercicio ${newStatus ? 'activado' : 'desactivado'}:`, exercise.name);
  };

  const resetForm = () => {
    setNewExercise({
      name: '',
      primaryMuscle: '',
      equipment: '',
      difficulty: 'Principiante',
      instructions: '',
      tips: '',
    });
    setSelectedImage('');
    setSelectedVideo({ uri: '', name: '' });
    setEditingExercise(null);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadExercises();
    setIsRefreshing(false);
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <View style={[styles.exerciseCard, !item.isActive && styles.inactiveCard]}>
      <View style={styles.cardHeader}>
        {item.thumbnailUrl && (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
        )}
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.muscleBadge}>
              <Text style={styles.badgeText}>{item.primaryMuscle}</Text>
            </View>
            <View style={styles.equipmentBadge}>
              <Text style={styles.badgeText}>{item.equipment}</Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
              <Text style={styles.badgeText}>{item.difficulty}</Text>
            </View>
            {!item.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.badgeText}>INACTIVO</Text>
              </View>
            )}
          </View>
          <Text style={styles.instructions} numberOfLines={2}>
            {item.instructions}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: item.isActive ? COLORS.warning : COLORS.success }]}
          onPress={() => handleToggleActive(item)}
        >
          <Ionicons 
            name={item.isActive ? "pause" : "play"} 
            size={16} 
            color={COLORS.white} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.info }]}
          onPress={() => handleEditExercise(item)}
        >
          <Ionicons name="create" size={16} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.error }]}
          onPress={() => handleDeleteExercise(item)}
        >
          <Ionicons name="trash" size={16} color={COLORS.white} />
        </TouchableOpacity>

        {item.videoUrl && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.secondary }]}
            onPress={() => Alert.alert("Video", "Aquí se abriría el reproductor de video")}
          >
            <Ionicons name="play-circle" size={16} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <RoleGuard 
      requiredRole="ADMIN" 
      fallbackMessage="Solo los administradores pueden gestionar los ejercicios del gimnasio."
    >
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Gestión de Ejercicios</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add-circle" size={20} color={COLORS.white} />
            <Text style={styles.createButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>
        
        {/* Filtros y búsqueda */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar ejercicios..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={COLORS.gray}
            />
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterTags}
          >
            <TouchableOpacity 
              style={[styles.filterTag, filterMuscle === 'All' && styles.activeFilterTag]}
              onPress={() => setFilterMuscle('All')}
            >
              <Text style={[styles.filterTagText, filterMuscle === 'All' && styles.activeFilterTagText]}>
                Todos
              </Text>
            </TouchableOpacity>
            
            {muscleGroups.map((muscle) => (
              <TouchableOpacity 
                key={muscle}
                style={[styles.filterTag, filterMuscle === muscle && styles.activeFilterTag]}
                onPress={() => setFilterMuscle(muscle)}
              >
                <Text style={[styles.filterTagText, filterMuscle === muscle && styles.activeFilterTagText]}>
                  {muscle}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <Text style={styles.resultsText}>
          {filteredExercises.length} ejercicio{filteredExercises.length !== 1 ? 's' : ''} encontrado{filteredExercises.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Lista de ejercicios */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExercise}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No se encontraron ejercicios</Text>
            <Text style={styles.emptySubtext}>
              {searchText ? "Prueba con otros términos de búsqueda" : "Agrega el primer ejercicio"}
            </Text>
          </View>
        }
      />

      {/* Modal para crear/editar ejercicio */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowCreateModal(false);
              resetForm();
            }}>
              <Ionicons name="close" size={24} color={COLORS.secondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingExercise ? "Editar Ejercicio" : "Agregar Ejercicio"}
            </Text>
            <TouchableOpacity 
              onPress={editingExercise ? handleUpdateExercise : handleCreateExercise}
              disabled={isUploading}
              style={[styles.saveButton, isUploading && styles.disabledButton]}
            >
              <Text style={styles.saveButtonText}>
                {isUploading ? "Guardando..." : editingExercise ? "Actualizar" : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre del Ejercicio *</Text>
              <TextInput
                style={styles.formInput}
                value={newExercise.name}
                onChangeText={(text) => setNewExercise(prev => ({ ...prev, name: text }))}
                placeholder="Ej: Press de banca con mancuernas"
                placeholderTextColor={COLORS.gray}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Grupo Muscular Principal *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                {muscleGroups.map((muscle) => (
                  <TouchableOpacity 
                    key={muscle}
                    style={[
                      styles.optionChip, 
                      newExercise.primaryMuscle === muscle && styles.activeOptionChip
                    ]}
                    onPress={() => setNewExercise(prev => ({ ...prev, primaryMuscle: muscle }))}
                  >
                    <Text style={[
                      styles.optionChipText, 
                      newExercise.primaryMuscle === muscle && styles.activeOptionChipText
                    ]}>
                      {muscle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tipo de Equipo *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
                {equipmentOptions.map((equipment) => (
                  <TouchableOpacity 
                    key={equipment}
                    style={[
                      styles.optionChip, 
                      newExercise.equipment === equipment && styles.activeOptionChip
                    ]}
                    onPress={() => setNewExercise(prev => ({ ...prev, equipment }))}
                  >
                    <Text style={[
                      styles.optionChipText, 
                      newExercise.equipment === equipment && styles.activeOptionChipText
                    ]}>
                      {equipment}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nivel de Dificultad *</Text>
              <View style={styles.difficultySelector}>
                {difficultyLevels.map((difficulty) => (
                  <TouchableOpacity 
                    key={difficulty}
                    style={[
                      styles.difficultyOption, 
                      newExercise.difficulty === difficulty && styles.activeDifficultyOption,
                      { backgroundColor: newExercise.difficulty === difficulty ? getDifficultyColor(difficulty) : COLORS.grayLight }
                    ]}
                    onPress={() => setNewExercise(prev => ({ ...prev, difficulty }))}
                  >
                    <Text style={[
                      styles.difficultyOptionText, 
                      newExercise.difficulty === difficulty && styles.activeDifficultyOptionText
                    ]}>
                      {difficulty}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Instrucciones paso a paso *</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={newExercise.instructions}
                onChangeText={(text) => setNewExercise(prev => ({ ...prev, instructions: text }))}
                placeholder="1. Paso uno&#10;2. Paso dos&#10;3. Paso tres..."
                placeholderTextColor={COLORS.gray}
                multiline
                numberOfLines={6}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Consejos y Tips (opcional)</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={newExercise.tips}
                onChangeText={(text) => setNewExercise(prev => ({ ...prev, tips: text }))}
                placeholder="Consejos importantes para la ejecución correcta..."
                placeholderTextColor={COLORS.gray}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Sección de multimedia */}
            <View style={styles.mediaSection}>
              <Text style={styles.sectionTitle}>Multimedia</Text>
              
              <View style={styles.mediaRow}>
                <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                  <Ionicons name="image" size={24} color={COLORS.primary} />
                  <Text style={styles.mediaButtonText}>
                    {selectedImage ? "Cambiar Imagen" : "Seleccionar Imagen"}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
                  <Ionicons name="videocam" size={24} color={COLORS.secondary} />
                  <Text style={styles.mediaButtonText}>
                    {selectedVideo.uri ? "Cambiar Video" : "Seleccionar Video"}
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedImage && (
                <View style={styles.mediaPreview}>
                  <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                  <Text style={styles.previewLabel}>Imagen seleccionada</Text>
                </View>
              )}

              {selectedVideo.uri && (
                <View style={styles.mediaPreview}>
                  <View style={styles.videoPreview}>
                    <Ionicons name="videocam" size={32} color={COLORS.secondary} />
                    <Text style={styles.videoFileName}>{selectedVideo.name}</Text>
                  </View>
                  <Text style={styles.previewLabel}>Video seleccionado</Text>
                </View>
              )}
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={COLORS.info} />
              <Text style={styles.infoText}>
                • La imagen debe ser máximo 5MB (recomendado 16:9){'\n'}
                • El video debe ser máximo 50MB (MP4, MOV o AVI){'\n'}
                • Los archivos se subirán automáticamente al guardar
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
    </RoleGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  title: {
    fontSize: SIZES.fontLarge,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    borderRadius: SIZES.radius,
  },
  createButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  filtersContainer: {
    marginBottom: SIZES.padding,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayLight,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding / 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: SIZES.padding / 2,
    fontSize: SIZES.fontRegular,
    color: COLORS.secondary,
  },
  filterTags: {
    flexDirection: 'row',
  },
  filterTag: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    backgroundColor: COLORS.grayLight,
    borderRadius: SIZES.radius,
    marginRight: SIZES.padding / 2,
  },
  activeFilterTag: {
    backgroundColor: COLORS.primary,
  },
  filterTagText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    fontWeight: '600',
  },
  activeFilterTagText: {
    color: COLORS.white,
  },
  resultsText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    marginTop: SIZES.padding / 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: SIZES.padding,
  },
  exerciseCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveCard: {
    opacity: 0.7,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: SIZES.padding,
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: SIZES.padding,
    backgroundColor: COLORS.grayLight,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SIZES.padding / 2,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SIZES.padding / 2,
  },
  muscleBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding / 2,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  equipmentBadge: {
    backgroundColor: COLORS.info,
    paddingHorizontal: SIZES.padding / 2,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  difficultyBadge: {
    paddingHorizontal: SIZES.padding / 2,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  inactiveBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SIZES.padding / 2,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.paddingLarge * 2,
  },
  emptyText: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginTop: SIZES.padding,
  },
  emptySubtext: {
    fontSize: SIZES.fontRegular,
    color: COLORS.gray,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  modalTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    borderRadius: SIZES.radius,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: SIZES.padding,
  },
  formGroup: {
    marginBottom: SIZES.padding,
  },
  formLabel: {
    fontSize: SIZES.fontRegular,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SIZES.padding / 2,
  },
  formInput: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    fontSize: SIZES.fontRegular,
    color: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsScroll: {
    flexDirection: 'row',
  },
  optionChip: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    backgroundColor: COLORS.grayLight,
    borderRadius: SIZES.radius,
    marginRight: SIZES.padding / 2,
  },
  activeOptionChip: {
    backgroundColor: COLORS.primary,
  },
  optionChipText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    fontWeight: '600',
  },
  activeOptionChipText: {
    color: COLORS.white,
  },
  difficultySelector: {
    flexDirection: 'row',
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: SIZES.padding,
    alignItems: 'center',
    marginRight: SIZES.padding / 2,
    borderRadius: SIZES.radius,
  },
  activeDifficultyOption: {
    // Color dinámico aplicado inline
  },
  difficultyOptionText: {
    fontSize: SIZES.fontRegular,
    color: COLORS.gray,
    fontWeight: 'bold',
  },
  activeDifficultyOptionText: {
    color: COLORS.white,
  },
  mediaSection: {
    marginVertical: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SIZES.padding,
  },
  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayLight,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginHorizontal: 4,
  },
  mediaButtonText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  mediaPreview: {
    marginTop: SIZES.padding,
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 120,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.grayLight,
  },
  videoPreview: {
    width: 200,
    height: 120,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoFileName: {
    fontSize: SIZES.fontSmall,
    color: COLORS.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  previewLabel: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.grayLight,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginTop: SIZES.padding,
  },
  infoText: {
    flex: 1,
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    marginLeft: SIZES.padding / 2,
    lineHeight: 18,
  },
});

export default ManageExercisesScreen; 