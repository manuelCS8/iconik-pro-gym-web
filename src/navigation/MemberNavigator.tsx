import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EntrenarStack from './EntrenarStackNavigator';
import HomeScreen from '../screens/member/HomeScreen';
import ProfileScreen from '../screens/member/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

export type MemberTabParamList = {
  InicioTab: undefined;
  EntrenarTab: undefined;
  PerfilTab: undefined;
};

const Tab = createBottomTabNavigator<MemberTabParamList>();

const MemberNavigator: React.FC = () => (
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
      name="InicioTab"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={28} />,
        tabBarLabel: "Inicio",
      }}
    />
    <Tab.Screen
      name="EntrenarTab"
      component={EntrenarStack}
      options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="barbell" color={color} size={28} />,
        tabBarLabel: "Entrenar",
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

export default MemberNavigator; 