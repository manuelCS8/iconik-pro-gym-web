import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, RouteProp, useRoute } from "@react-navigation/native";

// Definir los tipos
interface Routine {
  id: string;
  name: string;
  creatorType: string;
  level: string;
  objective: string;
  description: string;
  estimatedTime: number;
  exerciseCount: number;
}

interface RoutineItem {
  id: string;
  exerciseName: string;
  series: number;
  reps: number;
  restTime: number;
  previousReps: number;
  position: number;
  muscleGroup: string;
  equipment: string;
}

const MOCK_ROUTINE_DETAILS: Record<string, Routine> = {
  routine1: {
    id: "routine1",
    name: "Rutina 1 Básica Caballero",
    creatorType: "GYM",
    level: "Principiante",
    objective: "Fuerza",
    description: "Rutina ideal para principiantes enfocada en el tren superior",
    estimatedTime: 45,
    exerciseCount: 6,
  },
  user_routine1: {
    id: "user_routine1",
    name: "Mi Rutina de Pecho",
    creatorType: "USER",
    level: "Intermedio",
    objective: "Hipertrofia",
    description: "Mi rutina personalizada para desarrollar el pecho",
    estimatedTime: 45,
    exerciseCount: 6,
  },
  // ... agrega los demás mocks necesarios ...
};

const MOCK_ROUTINE_EXERCISES: Record<string, RoutineItem[]> = {
  routine1: [
    {
      id: "1",
      exerciseName: "Press Pecho Vertical (Máquina)",
      series: 3,
      reps: 12,
      restTime: 90,
      previousReps: 12,
      position: 1,
      muscleGroup: "Pecho",
      equipment: "Máquina",
    },
    // ... agrega los demás ejercicios ...
  ],
  user_routine1: [
    {
      id: "1",
      exerciseName: "Press Pecho (Mi Favorito)",
      series: 4,
      reps: 10,
      restTime: 90,
      previousReps: 10,
      position: 1,
      muscleGroup: "Pecho",
      equipment: "Máquina",
    },
    // ... agrega los demás ejercicios ...
  ],
  // ... agrega los demás mocks necesarios ...
};

type TrainingRouteParams = {
  Training: {
    routineId: string;
  };
};

const TrainingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<TrainingRouteParams, "Training">>();
  const { routineId } = route.params || {};

  const routine: Routine | undefined = routineId ? MOCK_ROUTINE_DETAILS[routineId] : undefined;
  const exercises: RoutineItem[] = routineId ? MOCK_ROUTINE_EXERCISES[routineId] || [] : [];

  if (!routine) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Rutina no encontrada</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, backgroundColor: '#E31C1F', borderRadius: 8, padding: 12 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={{ width: '100%', backgroundColor: '#222', paddingTop: 30, paddingBottom: 18, alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1 }}>Rutina</Text>
        </View>
        {/* Info principal */}
        <View style={{ backgroundColor: '#181818', borderRadius: 12, marginHorizontal: 16, marginBottom: 18, padding: 18 }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 2 }}>{routine.name}</Text>
          <Text style={{ color: '#aaa', fontSize: 14, marginBottom: 8 }}>Creada por {routine.creatorType === 'GYM' ? 'Iconik Pro Gym' : 'Tú'}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Nivel</Text>
              <Text style={{ color: '#E31C1F', fontWeight: 'bold', fontSize: 15 }}>{routine.level}</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Objetivo</Text>
              <Text style={{ color: '#E31C1F', fontWeight: 'bold', fontSize: 15 }}>{routine.objective}</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Duración</Text>
              <Text style={{ color: '#E31C1F', fontWeight: 'bold', fontSize: 15 }}>{routine.estimatedTime} min</Text>
            </View>
          </View>
          <Text style={{ color: '#aaa', fontSize: 15 }}>{routine.description}</Text>
        </View>
        {/* Ejercicios */}
        <View style={{ marginHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Ejercicios</Text>
            <Text style={{ color: '#aaa', fontSize: 15 }}>{exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''}</Text>
          </View>
          {exercises.map((ex: RoutineItem) => (
            <View key={ex.id} style={{ backgroundColor: '#181818', borderRadius: 14, marginBottom: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#222', marginRight: 10, justifyContent: 'center', alignItems: 'center' }}>
                    {/* Aquí podrías poner un icono o imagen */}
                  </View>
                  <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 15 }}></Text>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{ex.exerciseName}</Text>
                </View>
                <View style={{ backgroundColor: '#E31C1F', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 2 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>{ex.muscleGroup}</Text>
                </View>
              </View>
              {/* Tabla de series */}
              <View style={{ marginTop: 4, marginBottom: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ color: '#888', fontSize: 13, fontWeight: 'bold', width: 60, textAlign: 'center' }}>SERIE</Text>
                  <Text style={{ color: '#888', fontSize: 13, fontWeight: 'bold', width: 60, textAlign: 'center' }}>Kg/LBS</Text>
                  <Text style={{ color: '#888', fontSize: 13, fontWeight: 'bold', width: 60, textAlign: 'center' }}>REPS</Text>
                  <Text style={{ color: '#888', fontSize: 13, fontWeight: 'bold', width: 60, textAlign: 'center' }}>ANTERIOR</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1 }}>
                  <Text style={{ color: '#E31C1F', fontWeight: 'bold', width: 60, textAlign: 'center' }}>{ex.series}</Text>
                  <Text style={{ color: '#fff', width: 60, textAlign: 'center' }}>-</Text>
                  <Text style={{ color: '#E31C1F', width: 60, textAlign: 'center', fontWeight: 'bold' }}>{ex.reps}F</Text>
                  <Text style={{ color: '#E31C1F', width: 60, textAlign: 'center', fontWeight: 'bold' }}>{ex.previousReps}F</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ color: '#aaa', fontSize: 14 }}>📦 {ex.equipment}</Text>
                <Text style={{ color: '#aaa', fontSize: 14 }}>⏱️ {ex.restTime}s descanso</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 0,
    backgroundColor: '#111',
  },
  headerDark: {
    width: '100%',
    backgroundColor: '#222',
    paddingTop: 30,
    paddingBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  routineInfoBox: {
    backgroundColor: '#181818',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 18,
    alignItems: 'center',
  },
  routineName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  routineCreator: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: '#E31C1F',
    borderRadius: 8,
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  startBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  exercisesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  exercisesTitle: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editRoutineText: {
    color: '#E31C1F',
    fontSize: 13,
    fontWeight: 'bold',
  },
  exerciseBox: {
    backgroundColor: '#181818',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: '#222',
  },
  exerciseName: {
    color: '#E31C1F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  seriesTable: {
    marginTop: 4,
    marginBottom: 2,
  },
  seriesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  seriesHeader: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    width: 60,
    textAlign: 'center',
  },
  seriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  seriesF: {
    color: '#E31C1F',
    fontWeight: 'bold',
    width: 60,
    textAlign: 'center',
  },
  seriesWeight: {
    color: '#fff',
    width: 60,
    textAlign: 'center',
  },
  seriesReps: {
    color: '#fff',
    width: 60,
    textAlign: 'center',
  },
});

export default TrainingScreen; 