import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboard from '../screens/admin/AdminDashboard';
import ManageMembersScreen from '../screens/admin/ManageMembersScreen';
import ManageExercisesScreen from '../screens/admin/ManageExercisesScreen';
import ManageRoutinesScreen from '../screens/admin/ManageRoutinesScreen';
import ProfileScreen from '../screens/member/ProfileScreen'; // Los admins también tienen perfil
import AdminManagementScreen from '../screens/admin/AdminManagementScreen';
import { COLORS } from '../utils/theme';

export type AdminTabParamList = {
  DashboardTab: undefined;
  GestionTab: undefined;
  PerfilTab: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator();

// Stack Navigator para la sección de Gestión
const GestionStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      headerStyle: {
        backgroundColor: '#E31C1F',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen name="ManagementHome" component={AdminManagementScreen} />
    <Stack.Screen 
      name="ManageMembers" 
      component={ManageMembersScreen}
      options={{ 
        headerShown: true,
        title: 'Gestionar Miembros',
        headerBackTitle: 'Atrás'
      }}
    />
    <Stack.Screen 
      name="ManageExercises" 
      component={ManageExercisesScreen}
      options={{ 
        headerShown: true,
        title: 'Gestionar Ejercicios',
        headerBackTitle: 'Atrás'
      }}
    />
    <Stack.Screen 
      name="ManageRoutines" 
      component={ManageRoutinesScreen}
      options={{ 
        headerShown: true,
        title: 'Gestionar Rutinas',
        headerBackTitle: 'Atrás'
      }}
    />
  </Stack.Navigator>
);

const AdminNavigator: React.FC = () => (
  <Tab.Navigator 
    screenOptions={{ 
      headerShown: false, 
      tabBarActiveTintColor: COLORS.primary || '#ff4444',
      tabBarInactiveTintColor: '#888888',
      tabBarStyle: {
        backgroundColor: '#000000',
        borderTopWidth: 0,
        height: 70,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
      tabBarIconStyle: {
        marginTop: 5,
      },
    }}
  >
    <Tab.Screen
      name="DashboardTab"
      component={AdminDashboard}
      options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="speedometer" color={color} size={28} />,
        tabBarLabel: "Dashboard",
      }}
    />
    <Tab.Screen 
      name="GestionTab" 
      component={GestionStack}
      options={{ 
        tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={28} />,
        tabBarLabel: "Gestión",
      }}
    />
  </Tab.Navigator>
);

export default AdminNavigator; 