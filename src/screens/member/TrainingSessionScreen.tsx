import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS } from '../../utils/theme';
import { routineService } from '../../services/routineService';
import userRoutineService from '../../services/userRoutineService';

interface Exercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime: number;
  notes?: string;
  muscleGroup?: string;
  equipment?: string;
}

interface Routine {
  id: string;
  name: string;
  description?: string;
  category: string;
  difficulty: string;
  duration: number;
  createdBy: string;
  exercises: Exercise[];
  isUserRoutine?: boolean;
}

interface ExerciseSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

type TrainingSessionRouteProp = RouteProp<{
  TrainingSession: { routineId: string; isUserRoutine: boolean };
}, 'TrainingSession'>;

const TrainingSessionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<TrainingSessionRouteProp>();
  const { routineId, isUserRoutine } = route.params || {};
  
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [exerciseSets, setExerciseSets] = useState<{[key: string]: ExerciseSet[]}>({});
  const [totalSets, setTotalSets] = useState(0);
  const [completedSets, setCompletedSets] = useState(0);

  // Cargar rutina
  useEffect(() => {
    const loadRoutine = async () => {
      if (!routineId) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Cargando rutina para entrenamiento:', routineId, 'isUserRoutine:', isUserRoutine);
        
        let routineData: Routine | null = null;
        
        if (isUserRoutine) {
          // Cargar rutina de usuario
          const userRoutine = await userRoutineService.getUserRoutineById(routineId);
          if (userRoutine) {
            routineData = {
              id: userRoutine.id!,
              name: userRoutine.name,
              description: userRoutine.description,
              category: userRoutine.category,
              difficulty: userRoutine.difficulty,
              duration: userRoutine.duration,
              createdBy: userRoutine.createdBy,
              exercises: userRoutine.exercises,
              isUserRoutine: true
            };
          }
        } else {
          // Cargar rutina del gimnasio
          const gymRoutine = await routineService.getRoutineById(routineId);
          if (gymRoutine) {
            routineData = {
              id: gymRoutine.id!,
              name: gymRoutine.name,
              description: gymRoutine.description || '',
              category: gymRoutine.category,
              difficulty: gymRoutine.difficulty,
              duration: gymRoutine.duration,
              createdBy: gymRoutine.createdBy || 'Gimnasio',
              exercises: gymRoutine.exercises || [],
              isUserRoutine: false
            };
          }
        }
        
        if (routineData) {
          console.log('✅ Rutina cargada para entrenamiento:', routineData.name);
          setRoutine(routineData);
        } else {
          console.log('❌ Rutina no encontrada');
          Alert.alert("Error", "Rutina no encontrada");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error loading routine for training:", error);
        Alert.alert("Error", "No se pudo cargar la rutina");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [routineId, isUserRoutine]);

  // Inicializar entrenamiento cuando se carga la rutina
  useEffect(() => {
    if (!routine) {
      return;
    }

    // Inicializar sets para cada ejercicio
    const initialSets: {[key: string]: ExerciseSet[]} = {};
    routine.exercises.forEach(exercise => {
      const sets: ExerciseSet[] = [];
      for (let i = 0; i < exercise.sets; i++) {
        sets.push({
          id: `${exercise.exerciseId}-${i}`,
          weight: '',
          reps: '',
          completed: false,
        });
      }
      initialSets[exercise.exerciseId] = sets;
    });
    setExerciseSets(initialSets);
    
    // Calcular total de sets
    const total = routine.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
    setTotalSets(total);
    
    // Iniciar timer
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, [routine]);



  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}min ${secs.toString().padStart(2, '0')}s`;
  };

  const handleSetComplete = (exerciseId: string, setId: string) => {
    setExerciseSets(prev => {
      const newSets = { ...prev };
      const exerciseSets = newSets[exerciseId];
      const setIndex = exerciseSets.findIndex(set => set.id === setId);
      
      if (setIndex !== -1) {
        exerciseSets[setIndex].completed = !exerciseSets[setIndex].completed;
        
        // Contar sets completados
        const completed = Object.values(newSets).flat().filter(set => set.completed).length;
        setCompletedSets(completed);
      }
      
      return newSets;
    });
  };

  const handleFinishTraining = () => {
    navigation.goBack();
  };

  const handleExercisePress = (exercise: Exercise) => {
    // Navegar al detalle del ejercicio
    navigation.navigate('ExerciseDetail' as never, { 
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName 
    } as never);
  };





  // Mostrar loading mientras se carga la rutina
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Cargando rutina...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Validar que routine existe después de cargar
  if (!routine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: No se encontró la rutina</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-down" size={20} color="#ffffff" />
            <Text style={styles.headerTitle}>Entrenamiento</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.finishButton}
            onPress={handleFinishTraining}
          >
            <Text style={styles.finishButtonText}>Terminar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Workout Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Ejercicios</Text>
          <Text style={styles.summaryValue}>{formatTime(elapsedTime)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Series</Text>
          <Text style={[styles.summaryValue, { color: '#ffffff' }]}>{completedSets}</Text>
        </View>
      </View>

      {/* Exercises List */}
      <ScrollView style={styles.exercisesContainer}>
        {routine.exercises.map((exercise, index) => (
          <View key={`${exercise.exerciseId}-${index}`} style={styles.exerciseBlock}>
            {/* Exercise Header */}
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseIcon}>
                <View style={styles.iconCircle}>
                  <Ionicons name="fitness" size={16} color="#ffffff" />
                </View>
              </View>
              <TouchableOpacity 
                style={styles.exerciseNameContainer}
                onPress={() => handleExercisePress(exercise)}
              >
                <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-vertical" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Exercise Sets Table */}
            <View style={styles.setsTable}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>SERIE</Text>
                <Text style={styles.headerCell}>ANTERIOR</Text>
                <Text style={styles.headerCell}>Kg/LBS</Text>
                <Text style={styles.headerCell}>REPS</Text>
                <View style={styles.checkboxHeader} />
              </View>

              {/* Table Rows */}
              {exerciseSets[exercise.exerciseId]?.map((set, setIndex) => (
                <View key={`${set.id}-${setIndex}`} style={[
                  styles.tableRow,
                  set.completed && styles.completedRow
                ]}>
                  <Text style={[
                    styles.serieCell,
                    setIndex === 0 && styles.firstSet
                  ]}>
                    {setIndex === 0 ? 'F' : setIndex + 1}
                  </Text>
                  <Text style={styles.previousCell}>-</Text>
                  <TextInput
                    style={styles.inputCell}
                    value={set.weight}
                    onChangeText={(text) => {
                      const newSets = { ...exerciseSets };
                      newSets[exercise.exerciseId][setIndex].weight = text;
                      setExerciseSets(newSets);
                    }}
                    placeholder="-"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.inputCell}
                    value={set.reps}
                    onChangeText={(text) => {
                      const newSets = { ...exerciseSets };
                      newSets[exercise.exerciseId][setIndex].reps = text;
                      setExerciseSets(newSets);
                    }}
                    placeholder="-"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      set.completed && styles.checkboxCompleted
                    ]}
                    onPress={() => handleSetComplete(exercise.exerciseId, set.id)}
                  >
                    {set.completed && (
                      <Ionicons name="checkmark" size={14} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
  },
  clockContainer: {
    marginRight: 5,
  },
  finishButton: {
    backgroundColor: '#E31C1F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  finishButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E31C1F',
  },
  exercisesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  exerciseBlock: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  exerciseIcon: {
    marginRight: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E31C1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseNameContainer: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E31C1F',
  },
  moreButton: {
    marginLeft: 10,
  },
  setsTable: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333333',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  headerCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  checkboxHeader: {
    width: 24,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  completedRow: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  serieCell: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  firstSet: {
    color: '#E31C1F',
    fontWeight: 'bold',
  },
  previousCell: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  inputCell: {
    flex: 1,
    height: 32,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    marginHorizontal: 4,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E31C1F',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  checkboxCompleted: {
    backgroundColor: '#E31C1F',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#E31C1F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TrainingSessionScreen; 