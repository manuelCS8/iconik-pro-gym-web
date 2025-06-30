import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import { COLORS, SIZES } from "../../utils/theme";
import { useNavigation } from "@react-navigation/native";

const windowWidth = Dimensions.get("window").width;

interface Routine {
  id: string;
  name: string;
  creatorType: string;
  level: string;
  objective: string;
  muscles: string[];
  equipment: string[];
  description: string;
}

const muscleGroups = [
  { key: "", value: "Todos" },
  { key: "Pecho", value: "Pecho" },
  { key: "Dorsales", value: "Dorsales" },
  { key: "Biceps", value: "Bíceps" },
  { key: "Triceps", value: "Tríceps" },
  { key: "Cuadriceps", value: "Cuádriceps" },
  { key: "Femorales", value: "Femorales" },
  { key: "Aductores", value: "Aductores" },
  { key: "Abdominales", value: "Abdominales" },
  { key: "Pantorrilla", value: "Pantorrilla" },
  { key: "Hombro", value: "Hombro" },
  { key: "Trapecios", value: "Trapecios" },
  { key: "Gluteo", value: "Glúteo" },
];

const equipmentTypes = [
  { key: "", value: "Todos" },
  { key: "Maquina", value: "Máquina" },
  { key: "Barra", value: "Barra" },
  { key: "Disco", value: "Disco" },
  { key: "Poleas", value: "Poleas" },
  { key: "SinEquipo", value: "Sin Equipo" },
  { key: "Mancuernas", value: "Mancuernas" },
  { key: "Banco", value: "Banco" },
  { key: "BarraZ", value: "Barra Z" },
  { key: "Cables", value: "Cables" },
  { key: "Smith", value: "Smith" },
  { key: "PesaRusa", value: "Pesa Rusa" },
];

// Mock data para rutinas oficiales
const MOCK_ROUTINES: Routine[] = [
  {
    id: "routine1",
    name: "Rutina 1 Básica Caballero",
    creatorType: "GYM",
    level: "Principiante",
    objective: "Fuerza",
    muscles: ["Pecho", "Triceps", "Hombro"],
    equipment: ["Maquina", "Mancuernas"],
    description: "Rutina ideal para principiantes enfocada en el tren superior",
  },
  {
    id: "routine2",
    name: "Rutina Pecho Intensivo",
    creatorType: "GYM",
    level: "Intermedio",
    objective: "Hipertrofia",
    muscles: ["Pecho", "Triceps"],
    equipment: ["Barra", "Mancuernas", "Banco"],
    description: "Entrenamiento intensivo para desarrollo del pecho",
  },
  {
    id: "routine3",
    name: "Rutina Piernas Completa",
    creatorType: "GYM",
    level: "Avanzado",
    objective: "Fuerza",
    muscles: ["Cuadriceps", "Femorales", "Gluteo"],
    equipment: ["Maquina", "Barra", "Smith"],
    description: "Entrenamiento completo para el tren inferior",
  },
  {
    id: "routine4",
    name: "Rutina Funcional Sin Equipos",
    creatorType: "GYM",
    level: "Principiante",
    objective: "Acondicionamiento",
    muscles: ["Abdominales", "Gluteo", "Cuadriceps"],
    equipment: ["SinEquipo"],
    description: "Ejercicios funcionales que puedes hacer en casa",
  },
  {
    id: "routine5",
    name: "Rutina Espalda y Bíceps",
    creatorType: "GYM",
    level: "Intermedio",
    objective: "Hipertrofia",
    muscles: ["Dorsales", "Biceps", "Trapecios"],
    equipment: ["Poleas", "Mancuernas", "Barra"],
    description: "Enfoque en el desarrollo del tren superior posterior",
  },
];

const RoutinesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState<string>("");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");
  const [routines, setRoutines] = useState<Routine[]>(MOCK_ROUTINES);
  const [filteredRoutines, setFilteredRoutines] = useState<Routine[]>(MOCK_ROUTINES);

  useEffect(() => {
    const filterRoutines = () => {
      let filtered = routines;

      // Filtrar por texto de búsqueda
      if (searchText) {
        filtered = filtered.filter(routine =>
          routine.name.toLowerCase().includes(searchText.toLowerCase()) ||
          routine.description.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      // Filtrar por grupo muscular
      if (selectedMuscle) {
        filtered = filtered.filter(routine =>
          routine.muscles.includes(selectedMuscle)
        );
      }

      // Filtrar por equipo
      if (selectedEquipment) {
        filtered = filtered.filter(routine =>
          routine.equipment.includes(selectedEquipment)
        );
      }

      setFilteredRoutines(filtered);
    };

    filterRoutines();
  }, [searchText, selectedMuscle, selectedEquipment, routines]);

  // Función para obtener color del badge según nivel
  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "Principiante":
        return "#28A745"; // Verde
      case "Intermedio":
        return "#FFC107"; // Naranja
      case "Avanzado":
        return "#C82333"; // Rojo oscuro
      default:
        return COLORS.primary;
    }
  };

  // Función para obtener color del texto según nivel
  const getLevelTextColor = (level: string) => {
    switch (level) {
      case "Principiante":
        return "#FFFFFF"; // Texto blanco
      case "Intermedio":
        return "#000000"; // Texto oscuro
      case "Avanzado":
        return "#FFFFFF"; // Texto blanco
      default:
        return COLORS.white;
    }
  };

  const onStartRoutine = (routineId: string) => {
    console.log(`Navigando a detalle de rutina: ${routineId}`);
    navigation.navigate("RoutineDetail" as never, { routineId } as never);
  };

  const renderRoutineCard = ({ item }: { item: Routine }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={[styles.levelBadge, { backgroundColor: getLevelBadgeColor(item.level) }]}>
          <Text style={[styles.levelText, { color: getLevelTextColor(item.level) }]}>{item.level}</Text>
        </View>
      </View>
      
      <Text style={styles.cardDescription}>{item.description}</Text>
      
      <View style={styles.cardInfo}>
        <Text style={styles.cardSubtitle}>
          Objetivo: {item.objective}
        </Text>
        <Text style={styles.cardSubtitle}>
          Músculos: {item.muscles.slice(0, 2).join(", ")}
          {item.muscles.length > 2 && " +más"}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.cardButton, { backgroundColor: COLORS.danger }]}
        onPress={() => onStartRoutine(item.id)}
      >
        <Text style={styles.cardButtonText}>🚀 Comenzar Rutina</Text>
      </TouchableOpacity>
    </View>
  );

  const clearFilters = () => {
    setSearchText("");
    setSelectedMuscle("");
    setSelectedEquipment("");
  };

  return (
    <View style={styles.container}>
      {/* Buscador */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar rutinas..."
        value={searchText}
        onChangeText={setSearchText}
        placeholderTextColor="#ccc"
      />

      {/* Filtros */}
      <View style={styles.filtersRow}>
        <SelectList
          setSelected={(val: string) => setSelectedMuscle(val)}
          data={muscleGroups}
          placeholder="Grupo Muscular"
          boxStyles={styles.selectBox}
          dropdownStyles={styles.dropdown}
          inputStyles={{ color: '#ccc' }}
          defaultOption={{ key: "", value: "Todos" }}
        />
        <SelectList
          setSelected={(val: string) => setSelectedEquipment(val)}
          data={equipmentTypes}
          placeholder="Equipo"
          boxStyles={styles.selectBox}
          dropdownStyles={styles.dropdown}
          inputStyles={{ color: '#ccc' }}
          defaultOption={{ key: "", value: "Todos" }}
        />
      </View>

      {/* Botón limpiar filtros */}
      {(searchText || selectedMuscle || selectedEquipment) && (
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Limpiar Filtros</Text>
        </TouchableOpacity>
      )}

      {/* Contador de resultados */}
      <Text style={styles.resultsCounter}>
        {filteredRoutines.length} rutina{filteredRoutines.length !== 1 ? 's' : ''} encontrada{filteredRoutines.length !== 1 ? 's' : ''}
      </Text>

      {/* Lista de Rutinas Oficiales */}
      <FlatList
        data={filteredRoutines}
        keyExtractor={(item) => item.id}
        renderItem={renderRoutineCard}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default RoutinesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Fondo negro
    padding: SIZES.padding,
  },
  searchInput: {
    backgroundColor: '#181818', // Gris oscuro
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    fontSize: SIZES.fontRegular,
    marginBottom: SIZES.padding,
    borderWidth: 1,
    borderColor: '#333', // Gris más oscuro
    color: '#fff', // Texto blanco
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SIZES.padding,
  },
  selectBox: {
    backgroundColor: '#181818', // Gris oscuro
    borderRadius: SIZES.radius,
    width: (windowWidth - SIZES.padding * 2 - 16) / 2,
    borderColor: '#333',
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  dropdown: {
    backgroundColor: '#181818',
    borderColor: '#333',
    marginTop: -8,
  },
  clearButton: {
    alignSelf: "center",
    backgroundColor: '#333', // Gris oscuro
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: SIZES.fontSmall,
    fontWeight: "bold",
  },
  resultsCounter: {
    fontSize: SIZES.fontSmall,
    color: '#aaa', // Gris claro
    marginBottom: SIZES.padding,
    textAlign: "center",
  },
  card: {
    backgroundColor: '#181818', // Gris oscuro
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#222',
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
    color: '#fff', // Blanco
    flex: 1,
  },
  levelBadge: {
    backgroundColor: '#222', // Badge más oscuro
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radius / 2,
    borderWidth: 1,
    borderColor: '#444',
    minWidth: 80,
    alignItems: 'center',
  },
  levelText: {
    fontSize: SIZES.fontSmall,
    fontWeight: "bold",
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: SIZES.fontSmall,
    color: '#ccc', // Gris claro
    marginBottom: 8,
    lineHeight: 18,
  },
  cardInfo: {
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: SIZES.fontSmall,
    color: '#aaa', // Gris claro
    marginBottom: 2,
  },
  cardButton: {
    backgroundColor: COLORS.primary, // Rojo
    paddingVertical: SIZES.padding / 2,
    borderRadius: SIZES.radius,
    alignItems: "center",
    shadowColor: '#E31C1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 4,
  },
  cardButtonText: {
    color: '#fff',
    fontSize: SIZES.fontRegular,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
}); 