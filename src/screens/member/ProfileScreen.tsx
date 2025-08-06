import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from "../../utils/theme";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { setUser } from "../../redux/slices/authSlice";
import { logout } from "../../redux/slices/authSlice";
import { useNavigation } from '@react-navigation/native';
import WeightChart from "../../components/WeightChart";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { VictoryChart, VictoryBar, VictoryAxis } from "victory-native";

const windowWidth = Dimensions.get("window").width;

interface UserProfile {
  name: string;
  bio: string;
  profileImage: string;
  gender: string;
  birthday: string;
  weight?: number;
  height?: number;
  age?: number;
}

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { uid, email, user, role } = useSelector((state: RootState) => state.auth);
  const insets = useSafeAreaInsets();

  // Función para generar nombre de usuario basado en el correo
  const generateUsername = (email: string) => {
    if (!email) return "usuario";
    const username = email.split('@')[0];
    // Limpiar caracteres especiales y agregar números si es necesario
    const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, '');
    // Usar un hash simple basado en el email para consistencia
    const hash = email.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return cleanUsername + '_' + Math.abs(hash % 100);
  };

  // Estados para el perfil
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || "Emmanuel Castro Salvador",
    bio: "Sobre carga progresiva, pesado y al fallo, pre entreno después de entrenar",
    profileImage: "https://via.placeholder.com/150",
    gender: "Hombre",
    birthday: "abr 27, 2005",
    weight: user?.weight,
    height: user?.height,
    age: user?.age,
  });

  // Estados para modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Estados para edición
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editGender, setEditGender] = useState(profile.gender);
  const [editBirthday, setEditBirthday] = useState(profile.birthday);

  // Estados para medidas
  const [weightInput, setWeightInput] = useState(profile.weight?.toString() || "");
  const [heightInput, setHeightInput] = useState(profile.height?.toString() || "");
  const [ageInput, setAgeInput] = useState(profile.age?.toString() || "");

  // Datos de ejemplo para la gráfica de entrenamientos (en horas)
  const trainingData = [
    { month: "mar 16", hours: 5 },
    { month: "mar 23", hours: 5.5 },
    { month: "mar 30", hours: 6 },
    { month: "abr 6", hours: 6.5 },
    { month: "abr 13", hours: 4 },
    { month: "abr 20", hours: 7 },
    { month: "abr 27", hours: 7.5 },
    { month: "may 4", hours: 8 },
    { month: "may 11", hours: 6 },
    { month: "may 18", hours: 6.5 },
    { month: "may 25", hours: 5 },
  ];

  const saveProfile = () => {
    setProfile({
      ...profile,
      name: editName,
      bio: editBio,
      gender: editGender,
      birthday: editBirthday,
    });
    setShowEditModal(false);
    Alert.alert("✅ Perfil actualizado", "Los cambios se han guardado correctamente.");
  };

  const saveMeasurements = () => {
    const w = parseFloat(weightInput);
    const h = parseFloat(heightInput);
    const a = parseInt(ageInput);

    if (isNaN(w) || w <= 0 || w > 300) {
      Alert.alert("Error", "Peso inválido (1-300 kg)");
      return;
    }
    if (isNaN(h) || h <= 0 || h > 250) {
      Alert.alert("Error", "Altura inválida (1-250 cm)");
      return;
    }
    if (isNaN(a) || a <= 0 || a > 120) {
      Alert.alert("Error", "Edad inválida (1-120 años)");
      return;
    }

    setProfile({ ...profile, weight: w, height: h, age: a });
    setShowMeasurementsModal(false);
    Alert.alert("✅ Medidas guardadas", "Las medidas se han actualizado correctamente.");
  };

  const calculateBMI = (weight: number, height: number): number => {
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return "Bajo peso";
    if (bmi < 25) return "Peso normal";
    if (bmi < 30) return "Sobrepeso";
    return "Obesidad";
  };

  const getBMIColor = (bmi: number): string => {
    if (bmi < 18.5) return "#2196F3";
    if (bmi < 25) return "#4CAF50";
    if (bmi < 30) return "#FF9800";
    return "#F44336";
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: () => {
            dispatch(logout());
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => setShowEditModal(true)}>
          <Text style={styles.editButton}>Editar</Text>
          <Text style={styles.editButton}>Perfil</Text>
        </TouchableOpacity>
        
        <Text style={styles.username}>{generateUsername(email || '')}</Text>
        
        <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Forzar que el ScrollView no tenga espacio extra al final */}
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 0, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: profile.profileImage }} 
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{profile.name}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>139</Text>
              <Text style={styles.statLabel}>Entrenos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>Siguiendo</Text>
            </View>
          </View>
          
          <Text style={styles.bio}>{profile.bio}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <View style={styles.actionGrid}>
                         <TouchableOpacity 
               style={styles.actionButton}
               onPress={() => setShowStatsModal(true)}
             >
               <Ionicons name="bar-chart-outline" size={24} color="#fff" />
               <Text style={styles.actionText}>Estadísticas</Text>
             </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                // Navegar al tab de Entrenar y luego a la pantalla de ejercicios
                navigation.navigate('EntrenarTab' as never, {
                  screen: 'ExercisesList'
                } as never);
              }}
            >
              <Ionicons name="barbell-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>Ejercicios</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setShowMeasurementsModal(true)}
            >
              <Ionicons name="body-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>Medidas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="calendar-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>Calendario</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancel}>←</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={saveProfile}>
              <Text style={styles.modalSave}>Ok</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.photoSection}>
              <Image source={{ uri: profile.profileImage }} style={styles.editProfileImage} />
              <TouchableOpacity>
                <Text style={styles.changePhotoText}>Cambiar Foto</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSectionTitle}>Datos del perfil público</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholderTextColor="#888"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.modalInput, styles.bioInput]}
                value={editBio}
                onChangeText={setEditBio}
                multiline
                numberOfLines={3}
                placeholderTextColor="#888"
              />
            </View>
            
            <Text style={styles.modalSectionTitle}>Datos privados</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sexo</Text>
              <TouchableOpacity style={styles.modalInput}>
                <Text style={styles.inputValue}>{editGender}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cumpleaños</Text>
              <TouchableOpacity style={styles.modalInput}>
                <Text style={styles.inputValue}>{editBirthday}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.settingsOverlay}>
          <View style={styles.settingsModal}>
            <TouchableOpacity 
              style={styles.settingsOption}
              onPress={() => {
                setShowSettingsModal(false);
                Alert.alert("Info", "Funcionalidad disponible próximamente");
              }}
            >
              <Text style={styles.settingsText}>🔒 Cambiar Contraseña</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsOption}
              onPress={() => {
                setShowSettingsModal(false);
                Alert.alert("Info", "Funcionalidad disponible próximamente");
              }}
            >
              <Text style={styles.settingsText}>📧 Actualizar Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingsOption, styles.logoutOption]}
              onPress={() => {
                setShowSettingsModal(false);
                handleLogout();
              }}
            >
              <Text style={[styles.settingsText, styles.logoutText]}>🚪 Cerrar Sesión</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelOption}
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Measurements Modal */}
      <Modal
        visible={showMeasurementsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowMeasurementsModal(false)}>
              <Text style={styles.modalCancel}>←</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Registrar Medidas</Text>
            <TouchableOpacity onPress={saveMeasurements}>
              <Text style={styles.modalSave}>Guardar</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Peso (kg)</Text>
              <TextInput
                style={styles.modalInput}
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder="Ej: 70"
                keyboardType="numeric"
                placeholderTextColor="#888"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Altura (cm)</Text>
              <TextInput
                style={styles.modalInput}
                value={heightInput}
                onChangeText={setHeightInput}
                placeholder="Ej: 170"
                keyboardType="numeric"
                placeholderTextColor="#888"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Edad (años)</Text>
              <TextInput
                style={styles.modalInput}
                value={ageInput}
                onChangeText={setAgeInput}
                placeholder="Ej: 25"
                keyboardType="numeric"
                placeholderTextColor="#888"
              />
            </View>
            
            {profile.weight && profile.height && (
              <View style={styles.currentMeasures}>
                <Text style={styles.currentMeasuresTitle}>Medidas actuales:</Text>
                <Text style={styles.currentMeasuresText}>Peso: {profile.weight} kg</Text>
                <Text style={styles.currentMeasuresText}>Altura: {profile.height} cm</Text>
                <Text style={styles.currentMeasuresText}>Edad: {profile.age} años</Text>
              </View>
            )}
          </ScrollView>
                 </SafeAreaView>
       </Modal>

       {/* Stats Modal */}
       <Modal
         visible={showStatsModal}
         animationType="slide"
         presentationStyle="pageSheet"
       >
         <SafeAreaView style={styles.modalContainer}>
           <View style={styles.modalHeader}>
             <TouchableOpacity onPress={() => setShowStatsModal(false)}>
               <Text style={styles.modalCancel}>←</Text>
             </TouchableOpacity>
             <Text style={styles.modalTitle}>Estadísticas</Text>
             <View style={{width: 40}} />
           </View>
           
           <ScrollView style={styles.modalContent}>
             {/* Información actual del perfil */}
             {profile.weight && profile.height && profile.age && (
               <View style={styles.statsCard}>
                 <Text style={styles.statsCardTitle}>📊 Información Física</Text>
                 <View style={styles.statsMainRow}>
                   <View style={styles.statItem}>
                     <Text style={styles.statValue}>🧳 {profile.weight} kg</Text>
                     <Text style={styles.statLabel}>Peso</Text>
                   </View>
                   <View style={styles.statItem}>
                     <Text style={styles.statValue}>📏 {profile.height} cm</Text>
                     <Text style={styles.statLabel}>Altura</Text>
                   </View>
                   <View style={styles.statItem}>
                     <Text style={styles.statValue}>🎂 {profile.age} años</Text>
                     <Text style={styles.statLabel}>Edad</Text>
                   </View>
                 </View>
                 
                 {/* BMI */}
                 {(() => {
                   const bmi = calculateBMI(profile.weight, profile.height);
                   return (
                     <View style={styles.bmiCard}>
                       <Text style={styles.bmiLabel}>Índice de Masa Corporal (BMI)</Text>
                       <Text style={[styles.bmiValue, { color: getBMIColor(bmi) }]}>{bmi}</Text>
                       <Text style={styles.bmiCategory}>{getBMICategory(bmi)}</Text>
                     </View>
                   );
                 })()}
               </View>
             )}

             {/* Evolución de peso */}
             <View style={{ marginVertical: 16 }}>
               <Text style={{ fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 8, paddingHorizontal: 16 }}>
                 📈 Evolución de peso
               </Text>
               <WeightChart userId={uid!} />
             </View>
             
             {/* Estadísticas de entrenamientos */}
             <View style={styles.statsCard}>
               <Text style={styles.statsCardTitle}>💪 Entrenamientos</Text>
               <View style={styles.statsMainRow}>
                 <View style={styles.statItem}>
                   <Text style={styles.statValue}>139</Text>
                   <Text style={styles.statLabel}>Total Entrenos</Text>
                 </View>
                 <View style={styles.statItem}>
                   <Text style={styles.statValue}>0</Text>
                   <Text style={styles.statLabel}>Esta Semana</Text>
                 </View>
                 <View style={styles.statItem}>
                   <Text style={styles.statValue}>3</Text>
                   <Text style={styles.statLabel}>Racha (días)</Text>
                 </View>
               </View>
             </View>
             
             {/* Estadísticas de volumen */}
             <View style={styles.statsCard}>
               <Text style={styles.statsCardTitle}>🏋️ Volumen</Text>
               <View style={styles.statsMainRow}>
                 <View style={styles.statItem}>
                   <Text style={styles.statValue}>48.5K kg</Text>
                   <Text style={styles.statLabel}>Total</Text>
                 </View>
                 <View style={styles.statItem}>
                   <Text style={styles.statValue}>0 kg</Text>
                   <Text style={styles.statLabel}>Esta Semana</Text>
                 </View>
                 <View style={styles.statItem}>
                   <Text style={styles.statValue}>5.8K kg</Text>
                   <Text style={styles.statLabel}>Promedio</Text>
                 </View>
               </View>
             </View>
           </ScrollView>
         </SafeAreaView>
       </Modal>
     </SafeAreaView>
   );
 };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
     header: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     paddingHorizontal: 16,
     paddingVertical: 20, // Volver al valor original
     backgroundColor: '#000',
     marginTop: 10,
   },
   editButton: {
     color: '#888',
     fontSize: 16,
     lineHeight: 18,
   },
  username: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  profileName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  bio: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 16,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (windowWidth - 48) / 2,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalCancel: {
    color: '#fff',
    fontSize: 18,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSave: {
    color: '#4A90E2',
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  editProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  changePhotoText: {
    color: '#4A90E2',
    fontSize: 16,
  },
  modalSectionTitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 20,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputValue: {
    color: '#4A90E2',
    fontSize: 16,
  },
  settingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  settingsModal: {
    backgroundColor: '#333',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 20,
  },
  settingsOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  settingsText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutOption: {
    borderBottomColor: '#ff4444',
  },
  logoutText: {
    color: '#ff4444',
  },
  cancelOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 10,
    backgroundColor: '#555',
    marginHorizontal: 20,
    borderRadius: 8,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  currentMeasures: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  currentMeasuresTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
     currentMeasuresText: {
     color: '#888',
     fontSize: 14,
     marginBottom: 4,
   },
   statsCard: {
     backgroundColor: '#333',
     borderRadius: 12,
     padding: 20,
     marginBottom: 16,
   },
   statsCardTitle: {
     color: '#fff',
     fontSize: 18,
     fontWeight: 'bold',
     marginBottom: 16,
   },
   statsMainRow: {
     flexDirection: 'row',
     justifyContent: 'space-around',
     marginBottom: 16,
   },
   statValue: {
     color: '#ff4444',
     fontSize: 16,
     fontWeight: 'bold',
     textAlign: 'center',
   },
   bmiCard: {
     backgroundColor: '#222',
     borderRadius: 8,
     padding: 16,
     alignItems: 'center',
     marginTop: 8,
   },
   bmiLabel: {
     color: '#888',
     fontSize: 14,
     marginBottom: 8,
   },
   bmiValue: {
     fontSize: 28,
     fontWeight: 'bold',
     marginBottom: 4,
   },
   bmiCategory: {
     color: '#888',
     fontSize: 16,
     fontWeight: 'bold',
   },
});

export default ProfileScreen; 