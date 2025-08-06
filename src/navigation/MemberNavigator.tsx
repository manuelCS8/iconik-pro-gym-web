import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import EntrenarStack from './EntrenarStackNavigator';
import HomeScreen from '../screens/member/HomeScreen';
import ProfileScreen from '../screens/member/ProfileScreen';
import NutritionStackNavigator from './NutritionStackNavigator';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';
import { useTraining } from '../contexts/TrainingContext';

export type MemberTabParamList = {
  InicioTab: undefined;
  EntrenarTab: undefined;
  NutricionTab: undefined;
  PerfilTab: undefined;
};

const Tab = createBottomTabNavigator<MemberTabParamList>();

// Componente personalizado para el tab de Entrenar
const EntrenarTabComponent: React.FC = () => {
  return <EntrenarStack />;
};

// Componente personalizado para el tab de Nutrición
const NutritionTabComponent: React.FC = () => {
  return <NutritionStackNavigator />;
};

const MemberNavigator: React.FC = () => {
  const { isTrainingInProgress, showTrainingModal } = useTraining();

  // Mostrar el modal cuando hay entrenamiento en progreso y el usuario navega
  React.useEffect(() => {
    if (isTrainingInProgress) {
      // Pequeño delay para asegurar que la navegación se complete
      const timer = setTimeout(() => {
        showTrainingModal();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTrainingInProgress, showTrainingModal]);

  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false, 
        tabBarActiveTintColor: COLORS.primary || '#ff4444',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)', // Transparente como Spotify
          borderTopWidth: 0,
          height: 54,
          paddingBottom: 8,
          paddingTop: 2,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute', // Para que se pueda ocultar
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0, // Android
          shadowOpacity: 0, // iOS
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tab.Screen
        name="InicioTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={28} />,
          tabBarLabel: "Inicio",
        }}
      />
      <Tab.Screen
        name="EntrenarTab"
        component={EntrenarTabComponent}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="barbell" color={color} size={28} />,
          tabBarLabel: "Entrenar",
          tabBarButton: (props) => {
            const { isTrainingInProgress, showTrainingModal } = useTraining();
            
            return (
              <TouchableOpacity
                {...props}
                onPress={() => {
                  if (isTrainingInProgress) {
                    // Si hay entrenamiento en progreso, mostrar el modal
                    showTrainingModal();
                  } else {
                    // Si no hay entrenamiento en progreso, navegar normalmente
                    props.onPress?.();
                  }
                }}
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="NutricionTab"
        component={NutritionTabComponent}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="nutrition" color={color} size={28} />,
          tabBarLabel: "Nutrición",
        }}
      />
      <Tab.Screen
        name="PerfilTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={28} />,
          tabBarLabel: "Perfil",
        }}
      />
    </Tab.Navigator>
  );
};

export default MemberNavigator; 