import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity,
  Alert 
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { Video } from "expo-av";
import { COLORS, SIZES } from "../../utils/theme";

type RouteParams = {
  ExerciseDetail: {
    exerciseId: string;
  };
};

interface Exercise {
  id: string;
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  videoUri: string;
  descriptionSteps: string[];
  equipment: string;
  difficulty: string;
  tips: string[];
}

const windowWidth = Dimensions.get("window").width;

// Mock data para ejercicios detallados
const MOCK_EXERCISES: Record<string, Exercise> = {
  exercise1: {
    id: "exercise1",
    name: "Press Pecho Vertical (Máquina)",
    primaryMuscle: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros"],
    videoUri: require("../../assets/press_bench.mp4"),
    equipment: "Máquina",
    difficulty: "Principiante",
    descriptionSteps: [
      "Ajusta el asiento de la máquina para que las manijas estén a la altura del pecho.",
      "Siéntate con la espalda completamente apoyada en el respaldo.",
      "Agarra las manijas con un agarre firme, manteniendo las muñecas rectas.",
      "Empuja las manijas hacia adelante de manera controlada hasta extender completamente los brazos.",
      "Mantén la tensión por un segundo en la posición extendida.",
      "Regresa lentamente a la posición inicial, controlando el peso en todo momento.",
      "Repite el movimiento manteniendo la respiración constante."
    ],
    tips: [
      "Mantén los hombros hacia atrás durante todo el movimiento",
      "No arquees la espalda excesivamente",
      "Controla la velocidad tanto en la fase positiva como negativa"
    ]
  },
  exercise2: {
    id: "exercise2",
    name: "Sentadilla Profunda",
    primaryMuscle: "Cuádriceps",
    secondaryMuscles: ["Glúteos", "Femorales", "Pantorrillas"],
    videoUri: require("../../assets/ejercicio_sentadilla.mp4"),
    equipment: "Sin Equipo",
    difficulty: "Intermedio",
    descriptionSteps: [
      "Colócate de pie con los pies separados al ancho de los hombros.",
      "Mantén el pecho erguido y la mirada hacia adelante.",
      "Inicia el movimiento llevando las caderas hacia atrás como si te fueras a sentar.",
      "Baja lentamente flexionando las rodillas hasta que los muslos estén paralelos al suelo.",
      "Asegúrate de que las rodillas no sobrepasen la punta de los pies.",
      "Empuja con los talones para regresar a la posición inicial.",
      "Mantén el core contraído durante todo el movimiento."
    ],
    tips: [
      "La profundidad debe ser cómoda para tu flexibilidad",
      "Mantén el peso distribuido en toda la planta del pie",
      "No permitas que las rodillas se junten hacia adentro"
    ]
  },
  exercise3: {
    id: "exercise3",
    name: "Press Inclinado (Mancuernas)",
    primaryMuscle: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros Anteriores"],
    videoUri: require("../../assets/press_bench.mp4"), // Usando el mismo video por ahora
    equipment: "Mancuernas",
    difficulty: "Intermedio",
    descriptionSteps: [
      "Ajusta el banco a un ángulo de 30-45 grados.",
      "Siéntate en el banco con una mancuerna en cada mano.",
      "Coloca las mancuernas sobre tus muslos y acuéstate lentamente.",
      "Posiciona las mancuernas a los lados del pecho con los codos a 45 grados.",
      "Empuja las mancuernas hacia arriba hasta extender completamente los brazos.",
      "Haz una pausa breve en la parte superior del movimiento.",
      "Baja las mancuernas lentamente hasta la posición inicial."
    ],
    tips: [
      "Mantén las muñecas firmes y alineadas",
      "No choques las mancuernas en la parte superior",
      "Controla el descenso para maximizar la activación muscular"
    ]
  },
  exercise4: {
    id: "exercise4",
    name: "Extensión de Tríceps",
    primaryMuscle: "Tríceps",
    secondaryMuscles: ["Hombros Posteriores"],
    videoUri: require("../../assets/press_bench.mp4"), // Placeholder
    equipment: "Poleas",
    difficulty: "Principiante",
    descriptionSteps: [
      "Colócate frente a la máquina de poleas con el cable en posición alta.",
      "Agarra la barra con las palmas hacia abajo, manos separadas al ancho de los hombros.",
      "Mantén los codos pegados a los costados del cuerpo.",
      "Empuja la barra hacia abajo hasta extender completamente los brazos.",
      "Contrae los tríceps en la posición inferior por un segundo.",
      "Regresa lentamente a la posición inicial, sintiendo el estiramiento en los tríceps.",
      "Mantén el core activado durante todo el ejercicio."
    ],
    tips: [
      "Los codos no deben moverse durante el ejercicio",
      "Evita usar impulso del cuerpo",
      "Concéntrate en sentir el trabajo en los tríceps"
    ]
  },
  exercise5: {
    id: "exercise5",
    name: "Elevaciones Laterales",
    primaryMuscle: "Hombros",
    secondaryMuscles: ["Trapecios"],
    videoUri: require("../../assets/press_bench.mp4"), // Placeholder
    equipment: "Mancuernas",
    difficulty: "Principiante",
    descriptionSteps: [
      "Colócate de pie con una mancuerna en cada mano a los costados.",
      "Mantén una ligera flexión en los codos durante todo el movimiento.",
      "Eleva las mancuernas hacia los lados hasta que los brazos estén paralelos al suelo.",
      "Pausa brevemente en la posición superior.",
      "Baja las mancuernas lentamente hasta la posición inicial.",
      "Mantén el torso estable y evita balancearte.",
      "Respira de manera controlada durante todo el ejercicio."
    ],
    tips: [
      "No subas las mancuernas más arriba de los hombros",
      "Usa un peso que te permita controlar el movimiento",
      "Imagina que estás vertiendo agua de las mancuernas"
    ]
  }
};

const ExerciseDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, "ExerciseDetail">>();
  const navigation = useNavigation();
  const { exerciseId } = route.params;
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExercise = async () => {
      try {
        // Simular carga desde "base de datos"
        const exerciseData = MOCK_EXERCISES[exerciseId];
        if (exerciseData) {
          setExercise(exerciseData);
        }
      } catch (error) {
        console.error("Error loading exercise:", error);
        Alert.alert("Error", "No se pudo cargar el ejercicio");
      } finally {
        setLoading(false);
      }
    };

    loadExercise();
  }, [exerciseId]);

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Cargando ejercicio...</Text>
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Ejercicio no encontrado</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Título del ejercicio */}
      <Text style={styles.title}>{exercise.name}</Text>

      {/* Información básica */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Equipo</Text>
          <Text style={styles.infoValue}>{exercise.equipment}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Dificultad</Text>
          <Text style={[styles.infoValue, { color: getDifficultyColor(exercise.difficulty) }]}>
            {exercise.difficulty}
          </Text>
        </View>
      </View>

      {/* Video del ejercicio */}
      <Video
        source={exercise.videoUri}
        style={styles.video}
        resizeMode="cover"
        useNativeControls
        isLooping
      />

      {/* Grupos musculares */}
      <View style={styles.musclesContainer}>
        <Text style={styles.sectionTitle}>Músculos Trabajados</Text>
        
        <View style={styles.muscleRow}>
          <Text style={styles.muscleLabel}>Primarios:</Text>
          <View style={styles.primaryMuscleTag}>
            <Text style={styles.primaryMuscleText}>{exercise.primaryMuscle}</Text>
          </View>
        </View>
        
        <View style={styles.muscleRow}>
          <Text style={styles.muscleLabel}>Secundarios:</Text>
          <View style={styles.secondaryMusclesContainer}>
            {exercise.secondaryMuscles.map((muscle, index) => (
              <View key={index} style={styles.secondaryMuscleTag}>
                <Text style={styles.secondaryMuscleText}>{muscle}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Instrucciones paso a paso */}
      <View style={styles.stepsContainer}>
        <Text style={styles.sectionTitle}>Instrucciones</Text>
        {exercise.descriptionSteps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Consejos y tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.sectionTitle}>💡 Consejos</Text>
        {exercise.tips.map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
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

export default ExerciseDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
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
  title: {
    fontSize: SIZES.fontLarge,
    fontWeight: "bold",
    color: COLORS.secondary,
    marginBottom: SIZES.padding,
    textAlign: "center",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: SIZES.fontRegular,
    fontWeight: "bold",
    color: COLORS.secondary,
  },
  video: {
    width: windowWidth - SIZES.padding * 2,
    height: (windowWidth - SIZES.padding * 2) * 0.6,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.grayLight,
    marginBottom: SIZES.padding,
  },
  musclesContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: "bold",
    color: COLORS.secondary,
    marginBottom: SIZES.padding,
  },
  muscleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.padding / 2,
    flexWrap: "wrap",
  },
  muscleLabel: {
    fontSize: SIZES.fontRegular,
    fontWeight: "bold",
    color: COLORS.secondary,
    marginRight: 8,
    minWidth: 80,
  },
  primaryMuscleTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radius,
  },
  primaryMuscleText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.white,
    fontWeight: "bold",
  },
  secondaryMusclesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  secondaryMuscleTag: {
    backgroundColor: COLORS.grayLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radius / 2,
    marginRight: 6,
    marginBottom: 4,
  },
  secondaryMuscleText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.grayDark,
  },
  stepsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: SIZES.padding,
    alignItems: "flex-start",
  },
  stepNumber: {
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.white,
    fontWeight: "bold",
  },
  stepText: {
    flex: 1,
    fontSize: SIZES.fontRegular,
    color: COLORS.grayDark,
    lineHeight: 22,
  },
  tipsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding * 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tipRow: {
    flexDirection: "row",
    marginBottom: SIZES.padding / 2,
    alignItems: "flex-start",
  },
  tipBullet: {
    fontSize: SIZES.fontMedium,
    color: COLORS.primary,
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: SIZES.fontRegular,
    color: COLORS.grayDark,
    lineHeight: 20,
  },
}); 