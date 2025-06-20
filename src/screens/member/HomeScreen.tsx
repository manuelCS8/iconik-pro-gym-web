import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity, SafeAreaView } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { SIZES } from "../../utils/theme";
import { useTheme } from "../../contexts/ThemeContext";
import { firestore, collection, query, where, getDocs, doc, getDoc } from "../../config/firebase";
import syncService from "../../services/syncService";
import ConnectionStatus from "../../components/ConnectionStatus";
import ArtisticBackground from "../../components/ArtisticBackground";
import SparklineTraining from "../../components/SparklineTraining";

const windowWidth = Dimensions.get("window").width;

interface TrainingStats {
  todayWorkouts: number;
  todayVolume: number;
  totalWorkouts: number;
  totalVolume: number;
  streak: number;
}

const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const { uid, name: userNameFromRedux } = useSelector((state: RootState) => state.auth);
  const [userName, setUserName] = useState<string>("");
  const [membershipEnd, setMembershipEnd] = useState<string>("");
  const [stats, setStats] = useState<TrainingStats>({
    todayWorkouts: 0,
    todayVolume: 0,
    totalWorkouts: 0,
    totalVolume: 0,
    streak: 0
  });
  const [motivationalText, setMotivationalText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Array de frases motivacionales
  const motivationalQuotes = [
    "\"La fuerza no viene de lo que puedes hacer. Viene de superar lo que alguna vez creíste que no podías.\"",
    "\"El único entrenamiento malo es el que no haces.\"",
    "\"Tu cuerpo puede resistirlo. Tu mente es la que tienes que convencer.\"",
    "\"No se trata de ser perfecto, se trata de ser mejor que ayer.\"",
    "\"El éxito comienza con la voluntad de intentarlo.\"",
    "\"Cada repetición te acerca más a tu objetivo.\"",
    "\"No encuentres excusas, encuentra una manera.\"",
    "\"Los resultados se logran fuera de la zona de confort.\"",
  ];

  useEffect(() => {
    const loadUserInfo = async () => {
      if (!uid) return;
      
      setIsLoading(true);
      try {
        // Inicializar servicio de sincronización
        syncService.initialize();
        
        // 1. Cargar información del usuario
        setUserName(userNameFromRedux || "Usuario Demo");
        
        try {
          const userDocRef = doc(firestore, "users", uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserName(data.name || userNameFromRedux || "Usuario Demo");
            setMembershipEnd(data.membershipEnd);
          }
        } catch (error) {
          console.log("Usuario en modo mock:", error);
          // Usar datos demo para mock
          setMembershipEnd(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
        }

        // 2. Calcular estadísticas de entrenamiento
        await calculateTrainingStats();

        // 3. Seleccionar frase motivacional aleatoria
        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        setMotivationalText(randomQuote);

      } catch (error) {
        console.error("Error loading user info:", error);
        // Fallback para modo demo
        setUserName(userNameFromRedux || "Usuario Demo");
        setMembershipEnd(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
        setStats({
          todayWorkouts: 1,
          todayVolume: 5500,
          totalWorkouts: 12,
          totalVolume: 48000,
          streak: 3
        });
        setMotivationalText(motivationalQuotes[0]);
      } finally {
        setIsLoading(false);
      }
    };

    const calculateTrainingStats = async () => {
      try {
        // Fechas para filtrar
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Query para records del usuario
        const recordsRef = collection(firestore, "records");
        const userRecordsQuery = query(recordsRef, where("userId", "==", uid));
        const recordsSnapshot = await getDocs(userRecordsQuery);
        
        let todayWorkouts = 0;
        let todayVolume = 0;
        let totalWorkouts = 0;
        let totalVolume = 0;
        const workoutDates = new Set<string>();

        recordsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
          const weight = data.weight || 0;
          const reps = data.reps || 0;
          const volume = weight * reps;

          // Total acumulado
          totalVolume += volume;
          
          // Contar días únicos de entrenamiento
          const dateKey = timestamp.toDateString();
          workoutDates.add(dateKey);

          // Estadísticas de hoy
          if (timestamp >= today && timestamp < tomorrow) {
            todayVolume += volume;
          }
        });

        // Contar entrenamientos únicos de hoy
        const todayKey = today.toDateString();
        if (workoutDates.has(todayKey)) {
          todayWorkouts = 1; // Simplificado: 1 entrenamiento por día
        }

        totalWorkouts = workoutDates.size;

        // Calcular racha (días consecutivos)
        const streak = calculateStreak(Array.from(workoutDates).sort());

        setStats({
          todayWorkouts,
          todayVolume,
          totalWorkouts,
          totalVolume,
          streak
        });

      } catch (error) {
        console.log("Error calculating stats (using mock):", error);
        // Usar datos demo si no hay conexión a Firestore
        setStats({
          todayWorkouts: Math.random() > 0.5 ? 1 : 0,
          todayVolume: Math.floor(Math.random() * 8000) + 2000,
          totalWorkouts: Math.floor(Math.random() * 20) + 5,
          totalVolume: Math.floor(Math.random() * 50000) + 20000,
          streak: Math.floor(Math.random() * 7) + 1
        });
      }
    };

    const calculateStreak = (sortedDates: string[]): number => {
      if (sortedDates.length === 0) return 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let streak = 0;
      let currentDate = new Date(today);

      // Verificar desde hoy hacia atrás
      for (let i = 0; i < 30; i++) { // Máximo 30 días
        const dateKey = currentDate.toDateString();
        if (sortedDates.includes(dateKey)) {
          streak++;
        } else if (streak > 0) {
          break; // Si ya había racha y se rompe, parar
        }
        currentDate.setDate(currentDate.getDate() - 1);
      }

      return streak;
    };

    loadUserInfo();
  }, [uid, userNameFromRedux]);

  // Formatear la fecha de membresía (ISO → DD/MM/YYYY)
  const formatDate = (isoDate: string) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth()+1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  // Formatear volumen (ej: 5500 → "5.5K")
  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return `${volume}`;
  };

  // Determinar el color del recordatorio según proximidad
  const getMembershipReminderColor = () => {
    if (!membershipEnd) return colors.success;
    
    const endDate = new Date(membershipEnd);
    const today = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 7) return colors.danger;
    if (daysLeft <= 15) return colors.warning;
    return colors.success;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ArtisticBackground />
      
      {/* Margen superior negro con texto */}
      <View style={styles.topMargin}>
        <Text style={styles.welcomeHeader}>Bienvenido</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Logo centrado en la mancha gris */}
        <View style={styles.logoSection}>
          <Image 
            source={require("../../assets/logo.png")} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </View>

        {/* Estado de conexión (oculto visualmente pero funcional) */}
        <View style={styles.hiddenConnection}>
          <ConnectionStatus showDetails={false} />
        </View>

        {/* Contenido principal */}
        <View style={styles.contentContainer}>
          {/* Bienvenida en cuadro */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeText}>¡Bienvenido a</Text>
            <Text style={styles.welcomeBold}>ICONIK PRO GYM</Text>
            {userName ? <Text style={styles.userName}>{userName}!</Text> : null}
          </View>

          {/* Recordatorio de membresía */}
          {membershipEnd ? (
            <TouchableOpacity 
              style={[styles.reminderBox, { 
                borderLeftColor: getMembershipReminderColor() 
              }]}
              activeOpacity={0.8}
            >
              <Text style={styles.reminderText}>
                Recordatorio: Próximo pago de
              </Text>
              <Text style={[styles.reminderDate, { color: getMembershipReminderColor() }]}>
                Membresía es {formatDate(membershipEnd)}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Cards de estadísticas principales (2 cards como en el diseño) */}
          <View style={styles.mainStatsContainer}>
            <View style={styles.mainStatCard}>
              <Text style={styles.largeNumber}>{stats.totalWorkouts}</Text>
              <Text style={styles.cardLabel}>Entrenamientos</Text>
            </View>
            <View style={styles.mainStatCard}>
              <Text style={styles.largeNumber}>{formatVolume(stats.totalVolume)}</Text>
              <Text style={styles.cardLabel}>Kg Volumen</Text>
            </View>
          </View>

          {/* Estadísticas adicionales */}
          <View style={styles.additionalStatsContainer}>
            <View style={styles.additionalStatCard}>
              <Text style={styles.additionalStatValue}>{stats.todayWorkouts}</Text>
              <Text style={styles.additionalStatLabel}>Hoy</Text>
            </View>
            <View style={styles.additionalStatCard}>
              <Text style={styles.additionalStatValue}>{formatVolume(stats.todayVolume)}</Text>
              <Text style={styles.additionalStatLabel}>Volumen Hoy</Text>
            </View>
            <View style={styles.additionalStatCard}>
              <Text style={styles.additionalStatValue}>{stats.streak}</Text>
              <Text style={styles.additionalStatLabel}>Racha (días)</Text>
            </View>
          </View>

          {/* Gráfico de actividad semanal */}
          <SparklineTraining userId={uid!} />

          {/* Texto motivacional */}
          {motivationalText ? (
            <View style={styles.quoteBox}>
              <Text style={styles.quoteText}>{motivationalText}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
      
      {/* Margen inferior negro */}
      <View style={styles.bottomMargin} />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topMargin: {
    height: 100,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  welcomeHeader: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  bottomMargin: {
    height: 30,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding,
  },
  logoSection: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: 250,
    height: 250,
    marginLeft: -30,
  },
  hiddenConnection: {
    position: 'absolute',
    top: -100,
    opacity: 0,
  },
  contentContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: SIZES.margin,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 24,
    textAlign: "center",
    color: '#333',
    fontWeight: '500',
  },
  welcomeBold: {
    fontSize: 24,
    textAlign: "center",
    color: '#333',
    fontWeight: "bold",
  },
  userName: {
    fontSize: 18,
    marginTop: 4,
    marginBottom: SIZES.margin,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  reminderBox: {
    borderRadius: 10,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
    borderLeftWidth: 4,
    width: "100%",
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderText: {
    fontSize: SIZES.fontRegular,
    textAlign: "center",
    color: '#666',
  },
  reminderDate: {
    fontSize: SIZES.fontRegular,
    textAlign: "center",
    fontWeight: 'bold',
  },
  mainStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: SIZES.margin,
  },
  mainStatCard: {
    borderRadius: 12,
    padding: 20,
    flex: 1,
    marginHorizontal: 8,
    alignItems: "center",
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  largeNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: '#ff4444',
  },
  cardLabel: {
    fontSize: SIZES.fontSmall,
    marginTop: 6,
    textAlign: "center",
    color: '#666',
  },
  additionalStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: SIZES.margin,
  },
  additionalStatCard: {
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  additionalStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: '#333',
  },
  additionalStatLabel: {
    fontSize: SIZES.fontSmall - 1,
    marginTop: 4,
    textAlign: "center",
    color: '#666',
  },
  quoteBox: {
    borderRadius: 12,
    padding: SIZES.padding,
    marginTop: SIZES.margin,
    width: "100%",
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteText: {
    fontSize: SIZES.fontSmall,
    fontStyle: "italic",
    textAlign: "center",
    color: '#666',
  },
}); 