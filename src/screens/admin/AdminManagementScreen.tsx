import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../../utils/theme";
import { Ionicons } from "@expo/vector-icons";

const AdminManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const managementOptions = [
    {
      title: "Gestionar Miembros",
      subtitle: "Ver y administrar usuarios",
      icon: "people",
      screen: "ManageMembers",
      color: "#4CAF50",
    },
    {
      title: "Gestionar Ejercicios",
      subtitle: "Añadir y editar ejercicios",
      icon: "fitness",
      screen: "ManageExercises",
      color: "#2196F3",
    },
    {
      title: "Gestionar Rutinas",
      subtitle: "Crear y modificar rutinas",
      icon: "list",
      screen: "ManageRoutines",
      color: "#FF9800",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔧 <Text style={{ color: COLORS.primary }}>Gestión</Text></Text>
        <Text style={styles.subtitle}>Panel de administración</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.optionsContainer}>
          {managementOptions.map((option, idx) => (
            <TouchableOpacity
              key={option.title}
              style={[styles.optionCard, { borderLeftColor: option.color }]}
              onPress={() => navigation.navigate(option.screen)}
            >
              <View style={[styles.iconCircle, { backgroundColor: option.color }]}> 
                <Ionicons name={option.icon as any} size={32} color="#fff" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 12,
  },
  optionsContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  optionCard: {
    backgroundColor: '#222',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginBottom: 18,
    borderLeftWidth: 6,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  optionSubtitle: {
    fontSize: 15,
    color: '#ccc',
    marginTop: 2,
  },
  statsContainer: {
    backgroundColor: COLORS.white || '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text || '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary || '#ff4444',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text || '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  activityContainer: {
    backgroundColor: COLORS.white || '#fff',
    borderRadius: 12,
    padding: 20,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text || '#333',
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary || '#ff4444',
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text || '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
}); 