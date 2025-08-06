import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../../utils/theme";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { routineService } from "../../services/routineService";
import userRoutineService from "../../services/userRoutineService";

type RouteParams = {
  RoutineDetail: {
    routineId: string;
    isUserRoutine?: boolean;
  };
};

interface Routine {
  id: string;
  name: string;
  description?: string;
  category: string;
  difficulty: string;
  duration: number;
  createdBy: string;
  isUserRoutine?: boolean;
}

interface RoutineItem {
  id: string;
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

const windowWidth = Dimensions.get("window").width;

const RoutineDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, "RoutineDetail">>();
  const navigation = useNavigation();
  const { routineId, isUserRoutine } = route.params;
  const { user } = useSelector((state: RootState) => state.auth);

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoutine = async () => {
      try {
        console.log('🔄 Cargando rutina con ID:', routineId, 'isUserRoutine:', isUserRoutine);
        
        let routineData: Routine | null = null;
        let exerciseData: RoutineItem[] = [];
        
        if (isUserRoutine) {
          // Cargar rutina de usuario
          console.log('👤 Cargando rutina de usuario...');
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
              isUserRoutine: true
            };
            console.log('👤 Ejercicios del usuario:', userRoutine.exercises);
            exerciseData = userRoutine.exercises.map((ex, index) => {
              console.log(`👤 Ejercicio ${index}:`, ex);
              return {
                id: index.toString(),
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight,
                restTime: ex.restTime,
                notes: ex.notes,
                muscleGroup: 'No especificado',
                equipment: 'No especificado'
              };
            });
          }
        } else {
          // Cargar rutina del gimnasio
          console.log('🏋️ Cargando rutina del gimnasio...');
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
              isUserRoutine: false
            };
            console.log('🏋️ Ejercicios del gimnasio:', gymRoutine.exercises);
            exerciseData = (gymRoutine.exercises || []).map((ex, index) => {
              console.log(`🏋️ Ejercicio ${index}:`, ex);
              return {
                id: index.toString(),
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight,
                restTime: ex.restTime,
                notes: ex.notes,
                muscleGroup: 'No especificado',
                equipment: 'No especificado'
              };
            });
          }
        }
        
        if (routineData) {
          console.log('✅ Rutina encontrada:', routineData.name);
          console.log('✅ Ejercicios encontrados:', exerciseData.length);
          console.log('✅ Datos finales de ejercicios:', exerciseData);
          setRoutine(routineData);
          setItems(exerciseData);
        } else {
          console.log('❌ Rutina no encontrada');
          Alert.alert("Error", "Rutina no encontrada");
        }
      } catch (error) {
        console.error("Error loading routine:", error);
        Alert.alert("Error", "No se pudo cargar la rutina");
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [routineId, isUserRoutine]);

  const onStartRoutine = () => {
    (navigation as any).navigate("TrainingSession", { routineId, isUserRoutine });
  };

  const onEditRoutine = () => {
    console.log(`Editando rutina: ${routineId}`);
    Alert.alert(
      "Editar Rutina",
      "La funcionalidad de edición estará disponible pronto",
      [{ text: "OK" }]
    );
    // TODO: navigation.navigate("EditRoutine", { routineId });
  };

  const renderItem = ({ item }: { item: RoutineItem }) => (
    <View style={styles.itemRow}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.exerciseName}</Text>
        <View style={styles.muscleTag}>
          <Text style={styles.muscleTagText}>{item.muscleGroup}</Text>
        </View>
      </View>
      
      <View style={styles.itemStatsRow}>
        <View style={styles.itemStatBox}>
          <Text style={styles.itemStatLabel}>SERIE</Text>
          <Text style={styles.itemStatValue}>{item.sets}</Text>
        </View>
        <View style={styles.itemStatBox}>
          <Text style={styles.itemStatLabel}>Kg/LBS</Text>
          <Text style={styles.itemStatValue}>{item.weight || '-'}</Text>
        </View>
        <View style={styles.itemStatBox}>
          <Text style={styles.itemStatLabel}>REPS</Text>
          <Text style={styles.itemStatValue}>{item.reps}</Text>
        </View>
        <View style={styles.itemStatBox}>
          <Text style={styles.itemStatLabel}>ANTERIOR</Text>
          <Text style={styles.itemStatValue}>-</Text>
        </View>
      </View>
      
      <View style={styles.itemFooter}>
        <Text style={styles.itemEquipment}>📦 {item.equipment}</Text>
        <Text style={styles.itemRestTime}>⏱️ {item.restTime}s descanso</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Cargando rutina...</Text>
      </View>
    );
  }

  if (!routine) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Rutina no encontrada</Text>
        <TouchableOpacity 
          style={{ marginTop: 20, backgroundColor: '#E31C1F', borderRadius: 8, padding: 12 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Header oscuro */}
      <View style={{ width: '100%', backgroundColor: '#222', paddingTop: 32, paddingBottom: 18, alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1 }}>Rutina</Text>
      </View>
      {/* Info principal */}
      <View style={{ backgroundColor: '#181818', borderRadius: 18, marginHorizontal: 14, marginBottom: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 3, elevation: 2 }}>
        <Text style={{ color: '#fff', fontSize: 21, fontWeight: 'bold', marginBottom: 2 }}>{routine.name}</Text>
        <Text style={{ color: '#aaa', fontSize: 14, marginBottom: 8, fontWeight: '500' }}>Creada por {routine.isUserRoutine ? (user?.name || 'Tú') : 'Iconik Pro Gym'}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: '#888', fontSize: 13, fontWeight: '500' }}>Nivel</Text>
            <Text style={{ color: '#E31C1F', fontWeight: 'bold', fontSize: 15 }}>{routine.difficulty}</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: '#888', fontSize: 13, fontWeight: '500' }}>Objetivo</Text>
            <Text style={{ color: '#E31C1F', fontWeight: 'bold', fontSize: 15 }}>{routine.category}</Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ color: '#888', fontSize: 13, fontWeight: '500' }}>Duración</Text>
            <Text style={{ color: '#E31C1F', fontWeight: 'bold', fontSize: 15 }}>{routine.duration} min</Text>
          </View>
        </View>
      </View>
      {/* Botones de acción */}
      <View style={{ marginHorizontal: 14, marginBottom: 10 }}>
        <TouchableOpacity style={{ backgroundColor: '#E31C1F', borderRadius: 8, paddingVertical: 12, alignItems: 'center', width: '100%', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.10, shadowRadius: 2, elevation: 1 }} onPress={onStartRoutine}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Comenzar Rutina</Text>
        </TouchableOpacity>
        {routine.isUserRoutine && (
          <TouchableOpacity style={{ backgroundColor: '#333', borderRadius: 8, paddingVertical: 12, alignItems: 'center', width: '100%' }} onPress={onEditRoutine}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Editar Rutina</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Ejercicios */}
      <View style={{ marginHorizontal: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: 'bold' }}>Ejercicios</Text>
          <Text style={{ color: '#aaa', fontSize: 14 }}>{items.length} ejercicio{items.length !== 1 ? 's' : ''}</Text>
        </View>
        {items.map((ex) => {
          console.log('🎯 Renderizando ejercicio:', ex.exerciseName, 'sets:', ex.sets, 'reps:', ex.reps);
          return (
          <View key={ex.id} style={{ backgroundColor: '#181818', borderRadius: 14, marginBottom: 10, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.10, shadowRadius: 2, elevation: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#222', marginRight: 8, justifyContent: 'center', alignItems: 'center' }} />
                <TouchableOpacity onPress={() => (navigation as any).navigate('ExerciseDetail', { exerciseId: ex.id })}>
                  <Text style={{ color: '#E31C1F', fontWeight: 'bold', fontSize: 15, marginRight: 6, textDecorationLine: 'underline' }}>{ex.exerciseName}</Text>
                </TouchableOpacity>
                <View style={{ backgroundColor: '#E31C1F', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 1, marginLeft: 2, alignSelf: 'flex-start' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>{ex.muscleGroup}</Text>
                </View>
              </View>
            </View>
            {/* Tabla de series */}
            <View style={{ marginTop: 2, marginBottom: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 }}>
                <Text style={{ color: '#888', fontSize: 12, fontWeight: 'bold', width: 55, textAlign: 'center' }}>SERIE</Text>
                <Text style={{ color: '#888', fontSize: 12, fontWeight: 'bold', width: 55, textAlign: 'center' }}>Kg/LBS</Text>
                <Text style={{ color: '#888', fontSize: 12, fontWeight: 'bold', width: 55, textAlign: 'center' }}>REPS</Text>
                <Text style={{ color: '#888', fontSize: 12, fontWeight: 'bold', width: 55, textAlign: 'center' }}>ANTERIOR</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 }}>
                <Text style={{ color: '#E31C1F', fontWeight: 'bold', width: 55, textAlign: 'center', fontSize: 14 }}>{ex.sets}</Text>
                <Text style={{ color: '#fff', width: 55, textAlign: 'center', fontSize: 14 }}>{ex.weight || '-'}</Text>
                <Text style={{ color: '#E31C1F', width: 55, textAlign: 'center', fontWeight: 'bold', fontSize: 14 }}>{ex.reps}</Text>
                <Text style={{ color: '#E31C1F', width: 55, textAlign: 'center', fontWeight: 'bold', fontSize: 14 }}>-</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
              <Text style={{ color: '#aaa', fontSize: 13, fontWeight: '500' }}>Maq: {ex.equipment}</Text>
              <Text style={{ color: '#aaa', fontSize: 13, fontWeight: '500' }}>{ex.restTime}s descanso</Text>
            </View>
          </View>
        );
        })}
      </View>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
};

export default RoutineDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding,
  },
  emptyText: {
    fontSize: SIZES.fontMedium,
    color: COLORS.grayDark,
    textAlign: "center",
    marginBottom: SIZES.padding,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontRegular,
    fontWeight: "bold",
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
     headerTitle: {
     fontSize: SIZES.fontLarge,
     fontWeight: "bold",
     color: COLORS.background,
   },
  itemRow: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding,
  },
     itemName: {
     fontSize: SIZES.fontMedium,
     fontWeight: "bold",
     color: COLORS.background,
     flex: 1,
   },
  muscleTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.paddingSmall,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSmall,
  },
  muscleTagText: {
    color: COLORS.white,
    fontSize: SIZES.fontSmall,
    fontWeight: "bold",
  },
  itemStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.padding,
  },
  itemStatBox: {
    alignItems: "center",
    flex: 1,
  },
  itemStatLabel: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    marginBottom: 4,
  },
  itemStatValue: {
    fontSize: SIZES.fontMedium,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemEquipment: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
  },
  itemRestTime: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
  },
}); 