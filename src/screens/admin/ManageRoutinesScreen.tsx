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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/theme';
import {
  firestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from '../../config/firebase';
import RoleGuard from '../../components/RoleGuard';

interface Exercise {
  id: string;
  name: string;
  primaryMuscle: string;
}

interface RoutineExercise {
  exerciseId: string;
  exerciseName: string;
  series: number;
  reps: number;
  restTime: number;
  order: number;
}

interface GymRoutine {
  id: string;
  name: string;
  description: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  objective: string;
  estimatedDuration: number; // en minutos
  exercises: RoutineExercise[];
  creatorType: 'GYM';
  createdAt: Date;
  isActive: boolean;
}

interface NewRoutineForm {
  name: string;
  description: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  objective: string;
  estimatedDuration: string;
}

const ManageRoutinesScreen: React.FC = () => {
  const [routines, setRoutines] = useState<GymRoutine[]>([]);
  const [filteredRoutines, setFilteredRoutines] = useState<GymRoutine[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterLevel, setFilterLevel] = useState<'All' | 'Principiante' | 'Intermedio' | 'Avanzado'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<GymRoutine | null>(null);
  const [newRoutine, setNewRoutine] = useState<NewRoutineForm>({
    name: '',
    description: '',
    level: 'Principiante',
    objective: '',
    estimatedDuration: '60',
  });

  // Lista de ejercicios disponibles (en producción vendría de Firestore)
  const availableExercises: Exercise[] = [
    { id: 'ex1', name: 'Press Pecho Vertical', primaryMuscle: 'Pecho' },
    { id: 'ex2', name: 'Sentadilla Profunda', primaryMuscle: 'Piernas' },
    { id: 'ex3', name: 'Press Inclinado', primaryMuscle: 'Pecho' },
    { id: 'ex4', name: 'Curl de Bíceps', primaryMuscle: 'Bíceps' },
    { id: 'ex5', name: 'Press Militar', primaryMuscle: 'Hombros' },
    { id: 'ex6', name: 'Peso Muerto', primaryMuscle: 'Espalda' },
    { id: 'ex7', name: 'Extensiones de Tríceps', primaryMuscle: 'Tríceps' },
    { id: 'ex8', name: 'Abdominales', primaryMuscle: 'Core' },
  ];

  useEffect(() => {
    loadRoutines();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [routines, searchText, filterLevel]);

  const loadRoutines = async () => {
    try {
      setIsLoading(true);
      
      // Simular rutinas oficiales del gym
      const mockRoutines: GymRoutine[] = [
        {
          id: "routine1",
          name: "Pecho y Tríceps Básico",
          description: "Rutina ideal para principiantes enfocada en el desarrollo del pecho y tríceps",
          level: "Principiante",
          objective: "Desarrollo muscular",
          estimatedDuration: 45,
          exercises: [
            {
              exerciseId: "ex1",
              exerciseName: "Press Pecho Vertical",
              series: 3,
              reps: 12,
              restTime: 90,
              order: 1
            },
            {
              exerciseId: "ex3",
              exerciseName: "Press Inclinado",
              series: 3,
              reps: 10,
              restTime: 90,
              order: 2
            },
            {
              exerciseId: "ex7",
              exerciseName: "Extensiones de Tríceps",
              series: 3,
              reps: 15,
              restTime: 60,
              order: 3
            }
          ],
          creatorType: "GYM",
          createdAt: new Date("2024-01-15"),
          isActive: true,
        },
        {
          id: "routine2",
          name: "Piernas Completo",
          description: "Entrenamiento completo para el desarrollo de la musculatura de las piernas",
          level: "Intermedio",
          objective: "Fuerza y resistencia",
          estimatedDuration: 60,
          exercises: [
            {
              exerciseId: "ex2",
              exerciseName: "Sentadilla Profunda",
              series: 4,
              reps: 12,
              restTime: 120,
              order: 1
            },
            {
              exerciseId: "ex6",
              exerciseName: "Peso Muerto",
              series: 4,
              reps: 8,
              restTime: 120,
              order: 2
            }
          ],
          creatorType: "GYM",
          createdAt: new Date("2024-02-01"),
          isActive: true,
        },
        {
          id: "routine3",
          name: "Full Body Avanzado",
          description: "Rutina completa para usuarios avanzados que buscan máximo rendimiento",
          level: "Avanzado",
          objective: "Alto rendimiento",
          estimatedDuration: 90,
          exercises: [
            {
              exerciseId: "ex6",
              exerciseName: "Peso Muerto",
              series: 5,
              reps: 5,
              restTime: 180,
              order: 1
            },
            {
              exerciseId: "ex2",
              exerciseName: "Sentadilla Profunda",
              series: 5,
              reps: 5,
              restTime: 180,
              order: 2
            },
            {
              exerciseId: "ex5",
              exerciseName: "Press Militar",
              series: 4,
              reps: 8,
              restTime: 120,
              order: 3
            },
            {
              exerciseId: "ex4",
              exerciseName: "Curl de Bíceps",
              series: 3,
              reps: 12,
              restTime: 90,
              order: 4
            }
          ],
          creatorType: "GYM",
          createdAt: new Date("2024-03-01"),
          isActive: true,
        },
      ];

      setRoutines(mockRoutines);
      console.log(`✅ Cargadas ${mockRoutines.length} rutinas oficiales`);

    } catch (error) {
      console.error("Error loading routines:", error);
      Alert.alert("Error", "No se pudieron cargar las rutinas");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...routines];

    // Filtro por texto de búsqueda
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(routine =>
        routine.name.toLowerCase().includes(search) ||
        routine.description.toLowerCase().includes(search) ||
        routine.objective.toLowerCase().includes(search)
      );
    }

    // Filtro por nivel
    if (filterLevel !== 'All') {
      filtered = filtered.filter(routine => routine.level === filterLevel);
    }

    setFilteredRoutines(filtered);
  };

  const getLevelColor = (level: GymRoutine['level']) => {
    switch (level) {
      case 'Principiante': return COLORS.success;
      case 'Intermedio': return COLORS.warning;
      case 'Avanzado': return COLORS.error;
      default: return COLORS.gray;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${minutes} min`;
  };

  const handleCreateRoutine = async () => {
    try {
      if (!newRoutine.name.trim()) {
        Alert.alert("Error", "El nombre de la rutina es obligatorio");
        return;
      }

      setIsLoading(true);

      const newRoutineData: GymRoutine = {
        id: `routine-${Date.now()}`,
        name: newRoutine.name.trim(),
        description: newRoutine.description.trim(),
        level: newRoutine.level,
        objective: newRoutine.objective.trim(),
        estimatedDuration: parseInt(newRoutine.estimatedDuration) || 60,
        exercises: [], // Se agregarán después en una pantalla separada
        creatorType: "GYM",
        createdAt: new Date(),
        isActive: true,
      };

      setRoutines(prev => [...prev, newRoutineData]);
      
      // Resetear formulario y cerrar modal
      setNewRoutine({
        name: '',
        description: '',
        level: 'Principiante',
        objective: '',
        estimatedDuration: '60',
      });
      setShowCreateModal(false);

      Alert.alert(
        "Éxito", 
        `Rutina "${newRoutineData.name}" creada correctamente. Ahora puedes agregar ejercicios.`,
        [
          {
            text: "OK",
            onPress: () => handleEditRoutine(newRoutineData)
          }
        ]
      );
      console.log("✅ Nueva rutina oficial creada:", newRoutineData.name);

    } catch (error) {
      console.error("Error creating routine:", error);
      Alert.alert("Error", "No se pudo crear la rutina");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRoutine = (routine: GymRoutine) => {
    Alert.alert(
      "Editar Rutina",
      `¿Qué quieres hacer con "${routine.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Editar Información",
          onPress: () => {
            setEditingRoutine(routine);
            setNewRoutine({
              name: routine.name,
              description: routine.description,
              level: routine.level,
              objective: routine.objective,
              estimatedDuration: routine.estimatedDuration.toString(),
            });
            setShowCreateModal(true);
          }
        },
        {
          text: "Gestionar Ejercicios",
          onPress: () => {
            Alert.alert(
              "Gestionar Ejercicios",
              "Esta funcionalidad abrirá una pantalla detallada para agregar/editar/reordenar ejercicios de la rutina.",
              [{ text: "OK" }]
            );
          }
        }
      ]
    );
  };

  const handleUpdateRoutine = async () => {
    if (!editingRoutine) return;

    try {
      setIsLoading(true);

      const updatedRoutines = routines.map(routine =>
        routine.id === editingRoutine.id
          ? {
              ...routine,
              name: newRoutine.name.trim(),
              description: newRoutine.description.trim(),
              level: newRoutine.level,
              objective: newRoutine.objective.trim(),
              estimatedDuration: parseInt(newRoutine.estimatedDuration) || 60,
            }
          : routine
      );

      setRoutines(updatedRoutines);
      setEditingRoutine(null);
      setShowCreateModal(false);
      
      // Resetear formulario
      setNewRoutine({
        name: '',
        description: '',
        level: 'Principiante',
        objective: '',
        estimatedDuration: '60',
      });

      Alert.alert("Éxito", "Rutina actualizada correctamente");
      console.log("✅ Rutina actualizada:", newRoutine.name);

    } catch (error) {
      console.error("Error updating routine:", error);
      Alert.alert("Error", "No se pudo actualizar la rutina");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoutine = (routine: GymRoutine) => {
    Alert.alert(
      "Eliminar Rutina",
      `¿Estás seguro de que quieres eliminar "${routine.name}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setRoutines(prev => prev.filter(r => r.id !== routine.id));
            Alert.alert("Éxito", `La rutina "${routine.name}" ha sido eliminada`);
            console.log("❌ Rutina eliminada:", routine.name);
          }
        }
      ]
    );
  };

  const handleToggleActive = (routine: GymRoutine) => {
    const newStatus = !routine.isActive;
    const updatedRoutines = routines.map(r =>
      r.id === routine.id ? { ...r, isActive: newStatus } : r
    );
    setRoutines(updatedRoutines);
    
    Alert.alert(
      "Éxito",
      `Rutina "${routine.name}" ${newStatus ? 'activada' : 'desactivada'}`
    );
    console.log(`🔄 Rutina ${newStatus ? 'activada' : 'desactivada'}:`, routine.name);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadRoutines();
    setIsRefreshing(false);
  };

  const renderRoutine = ({ item }: { item: GymRoutine }) => (
    <View style={[styles.routineCard, !item.isActive && styles.inactiveCard]}>
      <View style={styles.routineHeader}>
        <View style={styles.routineInfo}>
          <View style={styles.routineTitleRow}>
            <Text style={styles.routineName}>{item.name}</Text>
            <View style={styles.badgeContainer}>
              <View style={[styles.levelBadge, { backgroundColor: getLevelColor(item.level) }]}>
                <Text style={styles.levelText}>{item.level}</Text>
              </View>
              <View style={styles.gymBadge}>
                <Text style={styles.gymBadgeText}>OFICIAL</Text>
              </View>
              {!item.isActive && (
                <View style={styles.inactiveBadge}>
                  <Text style={styles.inactiveText}>INACTIVA</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.routineDescription}>{item.description}</Text>
          
          <View style={styles.routineStats}>
            <View style={styles.statItem}>
              <Ionicons name="flag" size={16} color={COLORS.primary} />
              <Text style={styles.statText}>{item.objective}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={16} color={COLORS.primary} />
              <Text style={styles.statText}>{formatDuration(item.estimatedDuration)}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="fitness" size={16} color={COLORS.primary} />
              <Text style={styles.statText}>{item.exercises.length} ejercicios</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.routineActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: item.isActive ? COLORS.warning : COLORS.success }]}
          onPress={() => handleToggleActive(item)}
        >
          <Ionicons 
            name={item.isActive ? "pause" : "play"} 
            size={16} 
            color={COLORS.white} 
          />
          <Text style={styles.actionButtonText}>
            {item.isActive ? "Desactivar" : "Activar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.info }]}
          onPress={() => handleEditRoutine(item)}
        >
          <Ionicons name="create" size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: COLORS.error }]}
          onPress={() => handleDeleteRoutine(item)}
        >
          <Ionicons name="trash" size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de ejercicios */}
      {item.exercises.length > 0 && (
        <View style={styles.exercisesPreview}>
          <Text style={styles.exercisesTitle}>Ejercicios:</Text>
          {item.exercises.slice(0, 3).map((exercise, index) => (
            <Text key={index} style={styles.exerciseItem}>
              {exercise.order}. {exercise.exerciseName} - {exercise.series}x{exercise.reps}
            </Text>
          ))}
          {item.exercises.length > 3 && (
            <Text style={styles.moreExercises}>
              y {item.exercises.length - 3} más...
            </Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <RoleGuard 
      requiredRole="ADMIN" 
      fallbackMessage="Solo los administradores pueden gestionar las rutinas del gimnasio."
    >
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Rutinas Oficiales</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add-circle" size={20} color={COLORS.white} />
            <Text style={styles.createButtonText}>Crear</Text>
          </TouchableOpacity>
        </View>
        
        {/* Filtros y búsqueda */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar rutinas..."
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
              style={[styles.filterTag, filterLevel === 'All' && styles.activeFilterTag]}
              onPress={() => setFilterLevel('All')}
            >
              <Text style={[styles.filterTagText, filterLevel === 'All' && styles.activeFilterTagText]}>
                Todas
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterTag, filterLevel === 'Principiante' && styles.activeFilterTag]}
              onPress={() => setFilterLevel('Principiante')}
            >
              <Text style={[styles.filterTagText, filterLevel === 'Principiante' && styles.activeFilterTagText]}>
                Principiante
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterTag, filterLevel === 'Intermedio' && styles.activeFilterTag]}
              onPress={() => setFilterLevel('Intermedio')}
            >
              <Text style={[styles.filterTagText, filterLevel === 'Intermedio' && styles.activeFilterTagText]}>
                Intermedio
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterTag, filterLevel === 'Avanzado' && styles.activeFilterTag]}
              onPress={() => setFilterLevel('Avanzado')}
            >
              <Text style={[styles.filterTagText, filterLevel === 'Avanzado' && styles.activeFilterTagText]}>
                Avanzado
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        <Text style={styles.resultsText}>
          {filteredRoutines.length} rutina{filteredRoutines.length !== 1 ? 's' : ''} oficial{filteredRoutines.length !== 1 ? 'es' : ''}
        </Text>
      </View>

      {/* Lista de rutinas */}
      <FlatList
        data={filteredRoutines}
        renderItem={renderRoutine}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No se encontraron rutinas</Text>
            <Text style={styles.emptySubtext}>
              {searchText ? "Prueba con otros términos de búsqueda" : "Crea la primera rutina oficial"}
            </Text>
          </View>
        }
      />

      {/* Modal para crear/editar rutina */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowCreateModal(false);
              setEditingRoutine(null);
              setNewRoutine({
                name: '',
                description: '',
                level: 'Principiante',
                objective: '',
                estimatedDuration: '60',
              });
            }}>
              <Ionicons name="close" size={24} color={COLORS.secondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingRoutine ? "Editar Rutina Oficial" : "Crear Rutina Oficial"}
            </Text>
            <TouchableOpacity 
              onPress={editingRoutine ? handleUpdateRoutine : handleCreateRoutine}
              disabled={isLoading}
              style={[styles.saveButton, isLoading && styles.disabledButton]}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? "Guardando..." : editingRoutine ? "Actualizar" : "Crear"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre de la Rutina *</Text>
              <TextInput
                style={styles.formInput}
                value={newRoutine.name}
                onChangeText={(text) => setNewRoutine(prev => ({ ...prev, name: text }))}
                placeholder="Ej: Pecho y Tríceps Avanzado"
                placeholderTextColor={COLORS.gray}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descripción</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={newRoutine.description}
                onChangeText={(text) => setNewRoutine(prev => ({ ...prev, description: text }))}
                placeholder="Describe los objetivos y características de esta rutina..."
                placeholderTextColor={COLORS.gray}
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nivel de Dificultad</Text>
              <View style={styles.levelSelector}>
                {(['Principiante', 'Intermedio', 'Avanzado'] as const).map((level) => (
                  <TouchableOpacity 
                    key={level}
                    style={[
                      styles.levelOption, 
                      newRoutine.level === level && styles.activeLevelOption,
                      { backgroundColor: newRoutine.level === level ? getLevelColor(level) : COLORS.grayLight }
                    ]}
                    onPress={() => setNewRoutine(prev => ({ ...prev, level }))}
                  >
                    <Text style={[
                      styles.levelOptionText, 
                      newRoutine.level === level && styles.activeLevelOptionText
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Objetivo Principal</Text>
              <TextInput
                style={styles.formInput}
                value={newRoutine.objective}
                onChangeText={(text) => setNewRoutine(prev => ({ ...prev, objective: text }))}
                placeholder="Ej: Desarrollo muscular, Fuerza, Resistencia"
                placeholderTextColor={COLORS.gray}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Duración Estimada (minutos)</Text>
              <TextInput
                style={styles.formInput}
                value={newRoutine.estimatedDuration}
                onChangeText={(text) => setNewRoutine(prev => ({ ...prev, estimatedDuration: text }))}
                placeholder="60"
                placeholderTextColor={COLORS.gray}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={COLORS.info} />
              <Text style={styles.infoText}>
                {editingRoutine 
                  ? "Después de actualizar podrás gestionar los ejercicios de esta rutina."
                  : "Después de crear la rutina podrás agregar y configurar los ejercicios."
                }
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
    backgroundColor: COLORS.secondary,
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
  routineCard: {
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
  routineHeader: {
    marginBottom: SIZES.padding,
  },
  routineInfo: {
    flex: 1,
  },
  routineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.padding / 2,
  },
  routineName: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    color: COLORS.secondary,
    flex: 1,
    marginRight: SIZES.padding / 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  levelBadge: {
    paddingHorizontal: SIZES.padding / 2,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  levelText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  gymBadge: {
    paddingHorizontal: SIZES.padding / 2,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 4,
    marginBottom: 4,
  },
  gymBadgeText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  inactiveBadge: {
    paddingHorizontal: SIZES.padding / 2,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginBottom: 4,
  },
  inactiveText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  routineDescription: {
    fontSize: SIZES.fontRegular,
    color: COLORS.gray,
    marginBottom: SIZES.padding / 2,
    lineHeight: 20,
  },
  routineStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.padding,
    marginBottom: 4,
  },
  statText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    marginLeft: 4,
  },
  routineActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding / 2,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontSmall,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  exercisesPreview: {
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    paddingTop: SIZES.padding / 2,
  },
  exercisesTitle: {
    fontSize: SIZES.fontSmall,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  exerciseItem: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    marginBottom: 2,
  },
  moreExercises: {
    fontSize: SIZES.fontSmall,
    color: COLORS.info,
    fontStyle: 'italic',
    marginTop: 4,
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
    height: 80,
    textAlignVertical: 'top',
  },
  levelSelector: {
    flexDirection: 'row',
  },
  levelOption: {
    flex: 1,
    paddingVertical: SIZES.padding,
    alignItems: 'center',
    marginRight: SIZES.padding / 2,
    borderRadius: SIZES.radius,
  },
  activeLevelOption: {
    // Color dinámico aplicado inline
  },
  levelOptionText: {
    fontSize: SIZES.fontRegular,
    color: COLORS.gray,
    fontWeight: 'bold',
  },
  activeLevelOptionText: {
    color: COLORS.white,
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

export default ManageRoutinesScreen; 