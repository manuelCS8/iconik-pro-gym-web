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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🛠️ Gestión</Text>
          <Text style={styles.subtitle}>Panel de administración</Text>
        </View>

        {/* Management Options */}
        <View style={styles.optionsContainer}>
          {managementOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.optionCard, { borderLeftColor: option.color }]}
              onPress={() => navigation.navigate(option.screen)}
            >
              <View style={styles.optionContent}>
                <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                  <Ionicons name={option.icon as any} size={28} color="#fff" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>📊 Resumen Rápido</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Miembros Activos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Ejercicios</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Rutinas</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.activityTitle}>🕒 Actividad Reciente</Text>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <Text style={styles.activityText}>Nuevo miembro registrado</Text>
            <Text style={styles.activityTime}>Hace 2h</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <Text style={styles.activityText}>Ejercicio actualizado</Text>
            <Text style={styles.activityTime}>Hace 4h</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <Text style={styles.activityText}>Rutina creada</Text>
            <Text style={styles.activityTime}>Ayer</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.padding || 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary || '#ff4444',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text || '#666',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: COLORS.white || '#fff',
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text || '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: COLORS.text || '#666',
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