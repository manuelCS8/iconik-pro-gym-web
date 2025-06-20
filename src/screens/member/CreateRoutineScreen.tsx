import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  Alert 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../../utils/theme";
import { Ionicons } from "@expo/vector-icons";

const CreateRoutineScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [routineName, setRoutineName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!routineName.trim()) {
      Alert.alert("Error", "Por favor ingresa un nombre para la rutina");
      return;
    }
    
    // Aquí iría la lógica para guardar la rutina
    Alert.alert(
      "Rutina Guardada", 
      `Rutina "${routineName}" creada exitosamente`,
      [
        {
          text: "OK",
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Nueva Rutina</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre de la rutina</Text>
            <TextInput
              style={styles.input}
              value={routineName}
              onChangeText={setRoutineName}
              placeholder="Ej: Rutina de Fuerza"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe tu rutina..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Placeholder for exercises */}
          <View style={styles.exercisesSection}>
            <Text style={styles.sectionTitle}>Ejercicios</Text>
            <View style={styles.placeholder}>
              <Ionicons name="add-circle-outline" size={48} color="#ccc" />
              <Text style={styles.placeholderText}>Toca para agregar ejercicios</Text>
              <Text style={styles.placeholderSubtext}>
                (Funcionalidad completa en desarrollo)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateRoutineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 18,
    paddingHorizontal: 20,
    backgroundColor: '#181818',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    fontSize: 16,
    color: '#E31C1F',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: '#000',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    color: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  exercisesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  placeholder: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 15,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 