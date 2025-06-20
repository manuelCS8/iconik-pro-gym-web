// src/screens/member/ExercisesScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import { COLORS, SIZES, getBadgeColor, getBadgeStyle, getBadgeTextStyle } from "../../utils/theme";
import { useNavigation } from "@react-navigation/native";

const windowWidth = Dimensions.get("window").width;

interface Exercise {
  id: string;
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  difficulty: string;
  category: string;
}

const muscleGroups = [
  { key: "", value: "Todos" },
  { key: "Pecho", value: "Pecho" },
  { key: "Dorsales", value: "Dorsales" },
  { key: "Biceps", value: "Bíceps" },
  { key: "Triceps", value: "Tríceps" },
  { key: "Cuadriceps", value: "Cuádriceps" },
  { key: "Femorales", value: "Femorales" },
  { key: "Gluteos", value: "Glúteos" },
  { key: "Abdominales", value: "Abdominales" },
  { key: "Pantorrillas", value: "Pantorrillas" },
  { key: "Hombros", value: "Hombros" },
  { key: "Trapecios", value: "Trapecios" },
];

const equipmentTypes = [
  { key: "", value: "Todos" },
  { key: "Maquina", value: "Máquina" },
  { key: "Barra", value: "Barra" },
  { key: "Mancuernas", value: "Mancuernas" },
  { key: "Poleas", value: "Poleas" },
  { key: "SinEquipo", value: "Sin Equipo" },
  { key: "Banco", value: "Banco" },
  { key: "Smith", value: "Smith" },
  { key: "Cables", value: "Cables" },
];

const difficultyLevels = [
  { key: "", value: "Todos" },
  { key: "Principiante", value: "Principiante" },
  { key: "Intermedio", value: "Intermedio" },
  { key: "Avanzado", value: "Avanzado" },
];

// Mock data para ejercicios
const MOCK_EXERCISES: Exercise[] = [
  {
    id: "exercise1",
    name: "Press Pecho Vertical (Máquina)",
    primaryMuscle: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros"],
    equipment: "Maquina",
    difficulty: "Principiante",
    category: "Fuerza",
  },
  {
    id: "exercise2",
    name: "Sentadilla Profunda",
    primaryMuscle: "Cuadriceps",
    secondaryMuscles: ["Gluteos", "Femorales", "Pantorrillas"],
    equipment: "SinEquipo",
    difficulty: "Intermedio",
    category: "Funcional",
  },
  {
    id: "exercise3",
    name: "Press Inclinado (Mancuernas)",
    primaryMuscle: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros"],
    equipment: "Mancuernas",
    difficulty: "Intermedio",
    category: "Fuerza",
  },
  {
    id: "exercise4",
    name: "Extensión de Tríceps",
    primaryMuscle: "Triceps",
    secondaryMuscles: ["Hombros"],
    equipment: "Poleas",
    difficulty: "Principiante",
    category: "Fuerza",
  },
  {
    id: "exercise5",
    name: "Elevaciones Laterales",
    primaryMuscle: "Hombros",
    secondaryMuscles: ["Trapecios"],
    equipment: "Mancuernas",
    difficulty: "Principiante",
    category: "Fuerza",
  },
  {
    id: "exercise6",
    name: "Dominadas",
    primaryMuscle: "Dorsales",
    secondaryMuscles: ["Biceps", "Hombros"],
    equipment: "SinEquipo",
    difficulty: "Avanzado",
    category: "Funcional",
  },
  {
    id: "exercise7",
    name: "Press Banca (Barra)",
    primaryMuscle: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros"],
    equipment: "Barra",
    difficulty: "Intermedio",
    category: "Fuerza",
  },
  {
    id: "exercise8",
    name: "Curl de Bíceps",
    primaryMuscle: "Biceps",
    secondaryMuscles: ["Hombros"],
    equipment: "Mancuernas",
    difficulty: "Principiante",
    category: "Fuerza",
  },
  {
    id: "exercise9",
    name: "Peso Muerto",
    primaryMuscle: "Femorales",
    secondaryMuscles: ["Gluteos", "Dorsales", "Trapecios"],
    equipment: "Barra",
    difficulty: "Avanzado",
    category: "Fuerza",
  },
  {
    id: "exercise10",
    name: "Plancha",
    primaryMuscle: "Abdominales",
    secondaryMuscles: ["Hombros", "Gluteos"],
    equipment: "SinEquipo",
    difficulty: "Intermedio",
    category: "Funcional",
  },
];

const ExercisesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState<string>("");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [exercises, setExercises] = useState<Exercise[]>(MOCK_EXERCISES);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(MOCK_EXERCISES);

  useEffect(() => {
    const filterExercises = () => {
      let filtered = exercises;

      // Filtrar por texto de búsqueda
      if (searchText) {
        filtered = filtered.filter(exercise =>
          exercise.name.toLowerCase().includes(searchText.toLowerCase()) ||
          exercise.primaryMuscle.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      // Filtrar por grupo muscular
      if (selectedMuscle) {
        filtered = filtered.filter(exercise =>
          exercise.primaryMuscle === selectedMuscle ||
          exercise.secondaryMuscles.includes(selectedMuscle)
        );
      }

      // Filtrar por equipo
      if (selectedEquipment) {
        filtered = filtered.filter(exercise =>
          exercise.equipment === selectedEquipment
        );
      }

      // Filtrar por dificultad
      if (selectedDifficulty) {
        filtered = filtered.filter(exercise =>
          exercise.difficulty === selectedDifficulty
        );
      }

      setFilteredExercises(filtered);
    };

    filterExercises();
  }, [searchText, selectedMuscle, selectedEquipment, selectedDifficulty, exercises]);

  const onExercisePress = (exerciseId: string) => {
    console.log(`Navegando a detalle del ejercicio: ${exerciseId}`);
    navigation.navigate("ExerciseDetail" as never, { exerciseId } as never);
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

  const renderExerciseCard = ({ item }: { item: Exercise }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onExercisePress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={getBadgeStyle('difficulty', item.difficulty)}>
          <Text style={getBadgeTextStyle()}>{item.difficulty}</Text>
        </View>
      </View>
      
      <View style={styles.muscleInfo}>
        <View style={styles.primaryMuscleContainer}>
          <Text style={styles.muscleLabel}>Principal:</Text>
          <View style={getBadgeStyle('muscle')}>
            <Text style={getBadgeTextStyle()}>{item.primaryMuscle}</Text>
          </View>
        </View>
        
        {item.secondaryMuscles.length > 0 && (
          <View style={styles.secondaryMuscleContainer}>
            <Text style={styles.muscleLabel}>Secundarios:</Text>
            <Text style={styles.secondaryMuscleText}>
              {item.secondaryMuscles.slice(0, 2).join(", ")}
              {item.secondaryMuscles.length > 2 && " +más"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.equipmentContainer}>
          <Text style={styles.equipmentText}>📦 {item.equipment}</Text>
        </View>
        <View style={getBadgeStyle('objective')}>
          <Text style={getBadgeTextStyle()}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const clearFilters = () => {
    setSearchText("");
    setSelectedMuscle("");
    setSelectedEquipment("");
    setSelectedDifficulty("");
  };

  return (
    <View style={styles.container}>
      {/* Buscador */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar ejercicios..."
        value={searchText}
        onChangeText={setSearchText}
        placeholderTextColor={COLORS.gray}
      />

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          <SelectList
            setSelected={(val: string) => setSelectedMuscle(val)}
            data={muscleGroups}
            placeholder="Músculo"
            boxStyles={[styles.selectBox, { width: (windowWidth - SIZES.padding * 2 - 16) / 2 }]}
            dropdownStyles={styles.dropdown}
            inputStyles={{ color: COLORS.secondary }}
            defaultOption={{ key: "", value: "Todos" }}
          />
          <SelectList
            setSelected={(val: string) => setSelectedEquipment(val)}
            data={equipmentTypes}
            placeholder="Equipo"
            boxStyles={[styles.selectBox, { width: (windowWidth - SIZES.padding * 2 - 16) / 2 }]}
            dropdownStyles={styles.dropdown}
            inputStyles={{ color: COLORS.secondary }}
            defaultOption={{ key: "", value: "Todos" }}
          />
        </View>
        
        <SelectList
          setSelected={(val: string) => setSelectedDifficulty(val)}
          data={difficultyLevels}
          placeholder="Dificultad"
          boxStyles={styles.selectBox}
          dropdownStyles={styles.dropdown}
          inputStyles={{ color: COLORS.secondary }}
          defaultOption={{ key: "", value: "Todos" }}
        />
      </View>

      {/* Botón limpiar filtros */}
      {(searchText || selectedMuscle || selectedEquipment || selectedDifficulty) && (
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Limpiar Filtros</Text>
        </TouchableOpacity>
      )}

      {/* Contador de resultados */}
      <Text style={styles.resultsCounter}>
        {filteredExercises.length} ejercicio{filteredExercises.length !== 1 ? 's' : ''} encontrado{filteredExercises.length !== 1 ? 's' : ''}
      </Text>

      {/* Lista de ejercicios */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExerciseCard}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        numColumns={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    fontSize: SIZES.fontRegular,
    marginBottom: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    color: COLORS.secondary,
  },
  filtersContainer: {
    marginBottom: SIZES.padding,
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.padding / 2,
  },
  selectBox: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderColor: COLORS.grayLight,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.grayLight,
    marginTop: -8,
  },
  clearButton: {
    alignSelf: "center",
    backgroundColor: COLORS.info,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
  },
  clearButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontSmall,
    fontWeight: "bold",
  },
  resultsCounter: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    marginBottom: SIZES.padding,
    textAlign: "center",
  },
  card: {
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: SIZES.fontRegular,
    fontWeight: "bold",
    color: COLORS.secondary,
    flex: 1,
    marginRight: 8,
  },
  muscleInfo: {
    marginBottom: SIZES.paddingSmall,
  },
  primaryMuscleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  muscleLabel: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    marginRight: 8,
    fontWeight: "bold",
  },
  secondaryMuscleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryMuscleText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    fontStyle: "italic",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SIZES.paddingSmall,
  },
  equipmentContainer: {
    flex: 1,
  },
  equipmentText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
  },
});

export default ExercisesScreen; 