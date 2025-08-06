// src/screens/member/ExercisesScreen.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';
import { Video } from 'expo-av';

import { COLORS, SIZES } from "../../utils/theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

interface Exercise {
  id: string;
  name: string;
  primaryMuscleGroups: string[];
  secondaryMuscleGroups?: string[];
  equipment: string;
  difficulty: string;
  category?: string;
  description?: string;
  instructions?: string;
  mediaType?: string;
  mediaURL?: string;
  thumbnailURL?: string; // Nuevo campo para thumbnails
  imageURL?: string; // Nuevo campo para imágenes migradas
  isActive?: boolean;
}

// Opciones para filtros
const muscleGroups = [
  { id: "all", name: "Todos los músculos" },
  { id: "pecho", name: "Pecho" },
  { id: "espalda", name: "Espalda" },
  { id: "piernas", name: "Piernas" },
  { id: "hombros", name: "Hombros" },
  { id: "brazos", name: "Brazos" },
  { id: "core", name: "Core" },
  { id: "gluteos", name: "Glúteos" },
  { id: "pantorrillas", name: "Pantorrillas" },
  { id: "cardio", name: "Cardio" },
  { id: "funcional", name: "Funcional" },
  // Agregando grupos musculares adicionales basados en la imagen
  { id: "abdominales", name: "Abdominales" },
  { id: "abductores", name: "Abductores" },
  { id: "antebrazos", name: "Antebrazos" },
  { id: "biceps", name: "Bíceps" },
  { id: "cuadriceps", name: "Cuádriceps" },
  { id: "dorsales", name: "Dorsales" },
  { id: "isquiotibiales", name: "Isquiotibiales" },
  { id: "lumbares", name: "Lumbares" },
  { id: "trapecios", name: "Trapecios" },
  { id: "triceps", name: "Tríceps" },
];

const equipmentTypes = [
  { id: "all", name: "Todo el equipamiento" },
  { id: "peso_libre", name: "Peso libre" },
  { id: "maquina", name: "Máquina" },
  { id: "calistenia", name: "Calistenia" },
  { id: "cardio", name: "Cardio" },
  { id: "cable", name: "Cable" },
  { id: "funcional", name: "Funcional" },
  { id: "barra", name: "Barra" },
  { id: "mancuernas", name: "Mancuernas" },
  { id: "disco", name: "Disco" },
  { id: "bandas_resistencia", name: "Bandas de resistencia" },
  { id: "peso_rusa", name: "Peso rusa" },
  { id: "barra_z", name: "Barra Z" },
  { id: "banda_suspendida", name: "Banda suspendida" },
  { id: "ninguno", name: "Ninguno" },
  { id: "poleas", name: "Poleas" },
];

const difficultyLevels = [
  { id: "all", name: "Todas las dificultades" },
  { id: "principiante", name: "Principiante" },
  { id: "intermedio", name: "Intermedio" },
  { id: "avanzado", name: "Avanzado" },
];

const ExercisesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  
  // Obtener parámetros de navegación
  const { onExerciseSelect } = route.params || {};
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const videoRefs = useRef<{ [key: string]: any }>({});
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para filtros
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  
  // Estados para modales
  const [showMuscleModal, setShowMuscleModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [videoAnimations] = useState(() => new Map());


  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchText, selectedMuscle, selectedEquipment, selectedDifficulty]);

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Iniciando carga de ejercicios...");
      
      const exercisesRef = collection(db, 'exercises');
      const snapshot = await getDocs(exercisesRef);
      
      console.log(`📊 Encontrados ${snapshot.docs.length} documentos en Firestore`);
      
      const exercisesFromFirestore: Exercise[] = [];
      
      // Procesar ejercicios de forma más segura
      snapshot.docs.forEach((docSnap, index) => {
        try {
          const data = docSnap.data();
          
          // Solo procesar ejercicios con nombre válido
          if (data.name && data.isActive !== false) {
            exercisesFromFirestore.push({
              id: docSnap.id,
              name: data.name || '',
              primaryMuscleGroups: Array.isArray(data.primaryMuscleGroups) 
                ? data.primaryMuscleGroups 
                : (data.muscleGroup ? [data.muscleGroup] : []),
              secondaryMuscleGroups: Array.isArray(data.secondaryMuscleGroups) 
                ? data.secondaryMuscleGroups 
                : [],
              equipment: data.equipment || '',
              difficulty: data.difficulty || 'Principiante',
              category: 'Fuerza',
              description: data.description || '',
              instructions: data.instructions || data.description || '',
              mediaType: data.mediaType || '',
              mediaURL: data.mediaURL || '',
              thumbnailURL: data.thumbnailURL || '',
        imageURL: data.imageURL || '',
              isActive: true,
            });
          }
        } catch (exerciseError) {
          console.error(`❌ Error procesando ejercicio ${index + 1}:`, exerciseError);
          // Continuar con el siguiente ejercicio en lugar de fallar
        }
      });
      
      // Ordenar por nombre para mejor rendimiento
      exercisesFromFirestore.sort((a, b) => a.name.localeCompare(b.name));
      
      console.log(`✅ ${exercisesFromFirestore.length} ejercicios válidos procesados`);
      
      setExercises(exercisesFromFirestore);
      setFilteredExercises(exercisesFromFirestore);
      
    } catch (error) {
      console.error("❌ Error loading exercises:", error);
      // En caso de error, usar array vacío
      setExercises([]);
      setFilteredExercises([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    // Filtro por búsqueda
    if (searchText) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (exercise.primaryMuscleGroups && exercise.primaryMuscleGroups.some(muscle => 
          muscle.toLowerCase().includes(searchText.toLowerCase())
        ))
      );
    }

    // Filtro por músculo
    if (selectedMuscle !== 'all') {
      filtered = filtered.filter(exercise =>
        exercise.primaryMuscleGroups && exercise.primaryMuscleGroups.some(muscle => 
          muscle.toLowerCase() === selectedMuscle
        )
      );
    }

    // Filtro por equipo
    if (selectedEquipment !== 'all') {
      filtered = filtered.filter(exercise =>
        exercise.equipment.toLowerCase() === selectedEquipment
      );
    }

    // Filtro por dificultad
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(exercise =>
        exercise.difficulty.toLowerCase() === selectedDifficulty
      );
    }

    setFilteredExercises(filtered);
  };

  const onExercisePress = (exercise: Exercise) => {
    console.log(`🎯 Ejercicio seleccionado: ${exercise.name}`);
    console.log(`📋 onExerciseSelect existe:`, !!onExerciseSelect);
    console.log(`📋 onExerciseSelect tipo:`, typeof onExerciseSelect);
    
    // Si hay un callback de selección (viene desde creación de rutina)
    if (onExerciseSelect) {
      console.log(`✅ Ejecutando callback de selección...`);
      try {
        onExerciseSelect(exercise);
        console.log(`✅ Callback ejecutado, regresando...`);
        navigation.goBack();
        return;
      } catch (error) {
        console.error(`❌ Error en callback:`, error);
      }
    }
    
    // Si no hay callback, navegar al detalle del ejercicio
    console.log(`📱 Navegando a detalle del ejercicio...`);
    navigation.navigate("ExerciseDetail" as never, { exerciseId: exercise.id } as never);
  };





  const getVideoAnimation = (exerciseId: string) => {
    if (!videoAnimations.has(exerciseId)) {
      const animatedValue = new Animated.Value(0);
      videoAnimations.set(exerciseId, animatedValue);
      
      // Crear animación de "video" que simule reproducción
      const videoAnimation = () => {
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]).start(() => videoAnimation()); // Repetir infinitamente
      };
      
      videoAnimation();
    }
    return videoAnimations.get(exerciseId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Principiante":
        return "#4CAF50"; // Verde
      case "Intermedio":
        return "#FF9800"; // Naranja
      case "Avanzado":
        return "#F44336"; // Rojo
      default:
        return COLORS.gray;
    }
  };

  const getExerciseIcon = (exerciseName: string, muscleGroups: string[]) => {
    const name = exerciseName.toLowerCase();
    const muscles = muscleGroups?.map(m => m.toLowerCase()) || [];

    // Iconos por tipo de ejercicio
    if (name.includes('prensa') || name.includes('sentadilla') || muscles.includes('cuádriceps')) {
      return <Ionicons name="body" size={40} color={COLORS.primary} />;
    }
    if (name.includes('press') || name.includes('banca') || muscles.includes('pecho')) {
      return <Ionicons name="fitness" size={40} color={COLORS.primary} />;
    }
    if (name.includes('curl') || muscles.includes('bíceps')) {
      return <Ionicons name="hand-right" size={40} color={COLORS.primary} />;
    }
    if (name.includes('remo') || muscles.includes('dorsales')) {
      return <Ionicons name="body" size={40} color={COLORS.primary} />;
    }
    if (name.includes('femoral') || muscles.includes('femorales')) {
      return <Ionicons name="body" size={40} color={COLORS.primary} />;
    }
    if (name.includes('pantorrilla') || muscles.includes('pantorrilla')) {
      return <Ionicons name="body" size={40} color={COLORS.primary} />;
    }
    if (name.includes('hombro') || muscles.includes('hombro')) {
      return <Ionicons name="body" size={40} color={COLORS.primary} />;
    }
    if (name.includes('abdominal') || muscles.includes('abdominales')) {
      return <Ionicons name="body" size={40} color={COLORS.primary} />;
    }
    if (name.includes('flexion') || name.includes('fondos')) {
      return <Ionicons name="body" size={40} color={COLORS.primary} />;
    }
    
    // Icono por defecto
    return <Ionicons name="fitness" size={40} color={COLORS.gray} />;
  };

  const getExerciseThumbnail = (exerciseName: string, muscleGroups: string[]) => {
    const name = exerciseName.toLowerCase();
    const muscles = muscleGroups?.map(m => m.toLowerCase()) || [];

    // Colores de fondo para diferentes tipos de ejercicios
    if (name.includes('prensa') || name.includes('sentadilla') || muscles.includes('cuádriceps')) {
      return { backgroundColor: '#FF6B6B', icon: 'body', color: '#fff' };
    }
    if (name.includes('press') || name.includes('banca') || muscles.includes('pecho')) {
      return { backgroundColor: '#4ECDC4', icon: 'fitness', color: '#fff' };
    }
    if (name.includes('curl') || muscles.includes('bíceps')) {
      return { backgroundColor: '#45B7D1', icon: 'hand-right', color: '#fff' };
    }
    if (name.includes('remo') || muscles.includes('dorsales')) {
      return { backgroundColor: '#96CEB4', icon: 'body', color: '#fff' };
    }
    if (name.includes('femoral') || muscles.includes('femorales')) {
      return { backgroundColor: '#FFEAA7', icon: 'body', color: '#2D3436' };
    }
    if (name.includes('pantorrilla') || muscles.includes('pantorrilla')) {
      return { backgroundColor: '#DDA0DD', icon: 'body', color: '#fff' };
    }
    if (name.includes('hombro') || muscles.includes('hombro')) {
      return { backgroundColor: '#98D8C8', icon: 'body', color: '#fff' };
    }
    if (name.includes('abdominal') || muscles.includes('abdominales')) {
      return { backgroundColor: '#F7DC6F', icon: 'body', color: '#2D3436' };
    }
    if (name.includes('flexion') || name.includes('fondos')) {
      return { backgroundColor: '#BB8FCE', icon: 'body', color: '#fff' };
    }
    
    // Por defecto
    return { backgroundColor: '#95A5A6', icon: 'fitness', color: '#fff' };
  };

  // Componente de video optimizado para evitar crashes
  const ExerciseVideo = ({ mediaURL, mediaType }: { 
    mediaURL?: string; 
    mediaType?: string;
  }) => {
    // Solo mostrar video si es una URL pública de Firebase Storage
    if (mediaType === 'video' && mediaURL && mediaURL.startsWith('https://')) {
      return (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: mediaURL }}
            style={styles.exerciseVideo}
            resizeMode="cover"
            shouldPlay={false} // No autoplay para evitar crashes
            isMuted={true}
            isLooping={false}
            useNativeControls={true}
            onError={(error) => {
              console.log(`❌ Error cargando video: ${mediaURL}`, error);
            }}
          />
        </View>
      );
    }
    
    // Placeholder para videos locales o sin video
    return (
      <View style={styles.placeholderContainer}>
        <Ionicons name="videocam" size={50} color={COLORS.gray} />
        <Text style={styles.placeholderText}>
          {mediaURL && mediaURL.startsWith('file://') ? 'Video local' : 'Video disponible'}
        </Text>
      </View>
    );
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => {
    // Verificación de seguridad para evitar errores de renderizado
    if (!item || !item.id) {
      console.warn("⚠️ Ejercicio inválido detectado:", item);
      return null;
    }
    
    try {
      return (
      <TouchableOpacity 
        style={[styles.card, onExerciseSelect && styles.cardSelectable]}
        onPress={() => onExercisePress(item)}
        activeOpacity={0.8}
      >
      {/* Video/Imagen del ejercicio */}
      <View style={styles.videoContainer}>
              {item.imageURL && item.imageURL.startsWith('https://') ? (
        // PRIORIDAD 1: Imagen migrada a Firebase Storage
        <Image
          source={{ uri: item.imageURL }}
          style={styles.exerciseImage}
          resizeMode="cover"
          onError={() => {
            console.log(`❌ Error cargando imagen migrada para ejercicio: ${item.name}`);
          }}
        />
      ) : item.mediaURL && item.mediaType === 'image' && item.mediaURL.startsWith('http') ? (
        // PRIORIDAD 2: Imagen real subida por el admin
        <Image
          source={{ uri: item.mediaURL }}
          style={styles.exerciseImage}
          resizeMode="cover"
          onError={() => {
            console.log(`❌ Error cargando imagen para ejercicio: ${item.name}`);
          }}
        />
      ) : item.thumbnailURL && item.thumbnailURL.startsWith('http') ? (
        // PRIORIDAD 3: Thumbnail específico subido por el admin
        <Image
          source={{ uri: item.thumbnailURL }}
          style={styles.exerciseImage}
          resizeMode="cover"
          onError={() => {
            console.log(`❌ Error cargando thumbnail para ejercicio: ${item.name}`);
          }}
        />
      ) : (
        // PRIORIDAD 4: Video del ejercicio (igual que en ExerciseDetailScreen)
        <ExerciseVideo 
          mediaURL={item.mediaURL}
          mediaType={item.mediaType}
        />
      )}
        {onExerciseSelect && (
          <View style={styles.selectIndicator}>
            <Ionicons name="add-circle" size={24} color={COLORS.primary} />
          </View>
        )}
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="star-outline" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Información del ejercicio */}
      <View style={styles.cardInfo}>
        <Text style={styles.exerciseName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.muscleGroups}>
          {item.primaryMuscleGroups && item.primaryMuscleGroups.length > 0 
            ? item.primaryMuscleGroups.join(', ') 
            : 'No especificado'}
        </Text>
        <View style={styles.badgeContainer}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
            <Text style={styles.badgeText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
    );
    } catch (error) {
      console.error(`❌ Error renderizando tarjeta de ejercicio ${item.name}:`, error);
      // Retornar una tarjeta de fallback simple
      return (
        <TouchableOpacity 
          style={[styles.card, onExerciseSelect && styles.cardSelectable]}
          onPress={() => onExercisePress(item)}
          activeOpacity={0.8}
        >
          <View style={styles.videoContainer}>
            <View style={styles.placeholderContainer}>
              <Ionicons name="heart" size={40} color={COLORS.red} />
            </View>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="star-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.exerciseName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.muscleGroups}>
              {item.primaryMuscleGroups && item.primaryMuscleGroups.length > 0 
                ? item.primaryMuscleGroups.join(', ') 
                : 'No especificado'}
            </Text>
            <View style={styles.badgeContainer}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
                <Text style={styles.badgeText}>{item.difficulty}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedMuscle("all");
    setSelectedEquipment("all");
    setSelectedDifficulty("all");
  };

  const getFilterButtonText = (type: 'muscle' | 'equipment' | 'difficulty') => {
    switch (type) {
      case 'muscle':
        const muscle = muscleGroups.find(m => m.id === selectedMuscle);
        return muscle ? muscle.name : "Todos los músculos";
      case 'equipment':
        const equipment = equipmentTypes.find(e => e.id === selectedEquipment);
        return equipment ? equipment.name : "Todo el equipamiento";
      case 'difficulty':
        const difficulty = difficultyLevels.find(d => d.id === selectedDifficulty);
        return difficulty ? difficulty.name : "Todas las dificultades";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header con "Buscar" */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {onExerciseSelect ? 'Seleccionar Ejercicio' : 'Buscar'}
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ejercicio"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={COLORS.gray}
          />
        </View>
      </View>

      {/* Filtros tipo píldora */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          <TouchableOpacity 
            style={[styles.filterPill, styles.filterPillActive]}
            onPress={() => {
              setSelectedMuscle('all');
              setSelectedEquipment('all');
            }}
          >
            <Text style={styles.filterPillText}>Todos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterPill, selectedMuscle !== 'all' && styles.filterPillActive]}
            onPress={() => setShowMuscleModal(true)}
          >
            <Text style={styles.filterPillText}>Grupos Musculares</Text>
            {selectedMuscle !== 'all' && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>1</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterPill, selectedEquipment !== 'all' && styles.filterPillActive]}
            onPress={() => setShowEquipmentModal(true)}
          >
            <Text style={styles.filterPillText}>Equipo</Text>
            {selectedEquipment !== 'all' && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>1</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>



      {/* Lista de ejercicios */}
      <FlatList
        data={filteredExercises}
        renderItem={renderExerciseCard}
        keyExtractor={(item) => item?.id || Math.random().toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onError={(error) => {
          console.error("❌ Error en FlatList:", error);
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color={COLORS.white} />
            <Text style={styles.emptyText}>No se encontraron ejercicios</Text>
            <Text style={styles.emptySubtext}>
              {searchText ? "Prueba con otros términos de búsqueda" : "No hay ejercicios disponibles"}
            </Text>
          </View>
        }
      />

      {/* Botón flotante "Crear ejercicio" */}
      <TouchableOpacity style={styles.floatingButton}>
        <Ionicons name="add" size={24} color={COLORS.secondary} />
        <Text style={styles.floatingButtonText}>Crear ejercicio</Text>
      </TouchableOpacity>

      {/* Modal para filtro de músculos */}
      <Modal
        visible={showMuscleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowMuscleModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Grupos musculares</Text>
              <TouchableOpacity onPress={() => {
                setSelectedMuscle('all');
                setShowMuscleModal(false);
              }}>
                <Text style={styles.clearButton}>Limpiar</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {muscleGroups.map((muscle) => (
                <TouchableOpacity
                  key={muscle.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedMuscle(muscle.id);
                    setShowMuscleModal(false);
                  }}
                >
                  <View style={styles.checkboxContainer}>
                    <View style={[
                      styles.checkbox,
                      selectedMuscle === muscle.id && styles.checkboxSelected
                    ]}>
                      {selectedMuscle === muscle.id && (
                        <Ionicons name="checkmark" size={16} color={COLORS.white} />
                      )}
                    </View>
                  </View>
                  <Text style={styles.modalItemText}>{muscle.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setShowMuscleModal(false)}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para filtro de equipamiento */}
      <Modal
        visible={showEquipmentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowEquipmentModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Equipos</Text>
              <TouchableOpacity onPress={() => {
                setSelectedEquipment('all');
                setShowEquipmentModal(false);
              }}>
                <Text style={styles.clearButton}>Limpiar</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {equipmentTypes.map((equipment) => (
                <TouchableOpacity
                  key={equipment.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedEquipment(equipment.id);
                    setShowEquipmentModal(false);
                  }}
                >
                  <View style={styles.checkboxContainer}>
                    <View style={[
                      styles.checkbox,
                      selectedEquipment === equipment.id && styles.checkboxSelected
                    ]}>
                      {selectedEquipment === equipment.id && (
                        <Ionicons name="checkmark" size={16} color={COLORS.white} />
                      )}
                    </View>
                  </View>
                  <Text style={styles.modalItemText}>{equipment.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setShowEquipmentModal(false)}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Fondo negro
  },
  header: {
    marginBottom: 12, // Menos espacio entre header y filtros
    paddingHorizontal: 16, // Padding horizontal más pequeño para que la barra sea más ancha
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10, // Volver al valor original
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    flex: 1,
  },
  headerPlaceholder: {
    width: 40, // Placeholder para el espacio entre el botón de regreso y el título
  },
  searchSection: {
    marginBottom: SIZES.padding,
    paddingHorizontal: SIZES.padding,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 10, // Bordes más redondeados como en la imagen
    paddingHorizontal: 16, // Más padding horizontal para el icono y texto
    paddingVertical: 12, // Más padding vertical para mejor altura
    borderWidth: 0, // Sin borde para un look más limpio
    height: 48, // Altura más generosa como en la imagen
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16, // Tamaño de fuente más grande
    color: COLORS.secondary,
    marginLeft: 12, // Más espacio entre icono y texto
    height: "100%", // Ocupar toda la altura del container
  },
  filtersContainer: {
    marginBottom: SIZES.padding,
    paddingHorizontal: SIZES.padding,
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.grayDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25, // Forma de píldora
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginHorizontal: 5,
    justifyContent: "center",
  },
  filterPillActive: {
    backgroundColor: COLORS.primary, // Naranja/rojo cuando está activo
    borderColor: COLORS.white,
  },
  filterPillText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  filterBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  filterBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "bold",
  },

  listContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    width: (windowWidth - SIZES.padding * 3) / 2, // Ancho de cada tarjeta con espacio entre ellas
    backgroundColor: "#000", // Cuadrado negro como fondo
    marginBottom: SIZES.padding,
    borderRadius: 12, // Bordes redondeados del cuadrado negro
    borderWidth: 1,
    borderColor: COLORS.white,
    overflow: "hidden", // Para que el contenido respete los bordes redondeados
  },
  videoContainer: {
    width: "100%",
    height: 120, // Altura fija para el video
    overflow: "hidden",
    backgroundColor: "#fff", // Fondo blanco para la sección del video
    borderTopLeftRadius: 12, // Bordes redondeados en la parte superior
    borderTopRightRadius: 12,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  exerciseVideo: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  videoWrapper: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Fondo blanco para el placeholder
    borderTopLeftRadius: 12, // Bordes redondeados en la parte superior
    borderTopRightRadius: 12,
  },
  placeholderText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: "center",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 20, // Círculo perfecto
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cardInfo: {
    padding: SIZES.padding,
    backgroundColor: "#333", // Fondo gris para la información
    borderBottomLeftRadius: 12, // Bordes redondeados en la parte inferior
    borderBottomRightRadius: 12,
  },
  exerciseName: {
    fontSize: SIZES.fontRegular,
    fontWeight: "bold",
    color: COLORS.white, // Texto blanco sobre fondo negro
    marginBottom: 5,
    textAlign: "center",
  },
  muscleGroups: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray, // Texto gris para los grupos musculares
    marginBottom: 8,
    textAlign: "center",
  },
  badgeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8, // Bordes redondeados para el badge
    backgroundColor: "#4CAF50", // Verde como en las imágenes
  },
  badgeText: {
    color: COLORS.white,
    fontSize: SIZES.fontSmall,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding,
  },
  emptyText: {
    fontSize: SIZES.fontLarge,
    color: COLORS.white,
    marginTop: SIZES.padding,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: SIZES.fontSmall,
    color: COLORS.white,
    marginTop: SIZES.padding / 2,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Fondo semi-transparente
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.grayDark, // Fondo gris oscuro acorde a la paleta
    marginTop: 100, // Dejar espacio arriba
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  modalTitle: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  clearButton: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  checkbox: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: "transparent",
  },
  checkboxSelected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
  },
  modalItemText: {
    color: COLORS.white,
    fontSize: 16,
    flex: 1,
  },
  applyButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
  },

  applyButtonText: {
    color: COLORS.primary, // Texto rojo para contraste con fondo blanco
    fontSize: 18,
    fontWeight: "bold",
  },
  videoContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  exerciseVideo: {
    width: '100%',
    height: '100%',
  },
  floatingButton: {
    position: "absolute",
    bottom: 100, // Subido para que sea más visible
    right: 20,
    backgroundColor: "#FFA500", // Naranja como en la imagen
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000, // Asegurar que esté por encima de otros elementos
  },
  floatingButtonText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  cardSelectable: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(227, 28, 31, 0.05)',
  },
  selectIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
    zIndex: 10,
  },
});

export default ExercisesScreen; 