import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../utils/theme";
import ArtisticBackground from "../../components/ArtisticBackground";

// Mock de rutinas del usuario
const MOCK_USER_ROUTINES = [
  {
    id: "user_routine1",
    name: "Mi Rutina Pecho",
  },
  // Puedes agregar más rutinas mock aquí
];

const EntrenarHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [showRoutines, setShowRoutines] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ArtisticBackground />
      {/* Rectángulo negro superior con título */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Entrenamiento</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Text style={styles.headerTitle}>Entrenamiento</Text>

        {/* Botones superiores */}
        <View style={styles.topButtonsRow}>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => navigation.navigate("CreateRoutine")}
          >
            <Ionicons name="add" size={32} color="#fff" />
            <Text style={styles.topButtonText}>Nueva Rutina</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => navigation.navigate("ExploreRoutines")}
          >
            <Ionicons name="search" size={32} color="#fff" />
            <Text style={styles.topButtonText}>Explorar</Text>
          </TouchableOpacity>
        </View>

        {/* Rutinas del usuario desplegables */}
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => setShowRoutines((v) => !v)}
        >
          <Ionicons
            name={showRoutines ? "chevron-down" : "chevron-forward"}
            size={18}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.dropdownHeaderText}>
            Mis rutinas {MOCK_USER_ROUTINES.length > 0 ? `(${MOCK_USER_ROUTINES.length})` : ""}
          </Text>
        </TouchableOpacity>

        {showRoutines && (
          <View style={{ width: "100%" }}>
            {MOCK_USER_ROUTINES.length === 0 ? (
              <Text style={styles.noRoutinesText}>No tienes rutinas creadas</Text>
            ) : (
              MOCK_USER_ROUTINES.map((rutina) => (
                <View style={styles.rutinaCard} key={rutina.id}>
                  <View style={styles.rutinaCardHeader}>
                    <Text style={styles.rutinaCardTitle}>{rutina.name}</Text>
                    <Entypo name="dots-three-horizontal" size={20} color="#fff" />
                  </View>
                  <TouchableOpacity
                    style={styles.rutinaStartButton}
                    onPress={() => navigation.navigate("RoutineDetail", { routineId: rutina.id })}
                  >
                    <Text style={styles.rutinaStartButtonText}>Empezar Rutina</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* Botón Agregar Entrenamiento */}
        <TouchableOpacity
          style={styles.addTrainingButton}
          onPress={() => navigation.navigate("CreateRoutine")}
        >
          <Text style={styles.addTrainingButtonText}>Agregar Entrenamiento</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EntrenarHomeScreen;

const styles = StyleSheet.create({
  topBar: {
    width: '100%',
    backgroundColor: '#111',
    paddingTop: 30,
    paddingBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    zIndex: 2,
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    padding: 18,
    paddingBottom: 40,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 18,
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  topButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    alignSelf: "center",
    marginBottom: 18,
  },
  topButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#181818",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  topButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    marginLeft: 8,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 2,
  },
  dropdownHeaderText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  noRoutinesText: {
    color: "#fff",
    fontSize: 15,
    marginVertical: 10,
    alignSelf: "center",
    opacity: 0.8,
  },
  rutinaCard: {
    backgroundColor: "#181818",
    borderRadius: 14,
    padding: 16,
    marginVertical: 10,
    width: '90%',
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  rutinaCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  rutinaCardTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
  rutinaStartButton: {
    backgroundColor: "#E31C1F",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 2,
    marginHorizontal: 10,
  },
  rutinaStartButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  addTrainingButton: {
    backgroundColor: "#181818",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 18,
    width: '90%',
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addTrainingButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
}); 