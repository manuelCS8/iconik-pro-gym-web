import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { COLORS, SIZES, GLOBAL_STYLES } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { 
  firestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from '../../config/firebase';
import RoleGuard from '../../components/RoleGuard';

interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  totalRoutines: number;
  totalExercises: number;
  totalVolume: number;
  todayWorkouts: number;
}

interface RecentActivity {
  id: string;
  type: 'registration' | 'workout' | 'routine_created';
  description: string;
  timestamp: Date;
  userName: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalRoutines: 0,
    totalExercises: 0,
    totalVolume: 0,
    todayWorkouts: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadStats(),
        loadRecentActivity()
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Usar datos mock en caso de error
      setStats({
        totalMembers: 156,
        activeMembers: 142,
        totalRoutines: 24,
        totalExercises: 89,
        totalVolume: 2847500,
        todayWorkouts: 38,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Fecha de hoy para filtrar membresías activas
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // En modo mock, usar datos simulados
      console.log("Cargando estadísticas admin (modo mock)");
      
      setStats({
        totalMembers: Math.floor(Math.random() * 50) + 120,
        activeMembers: Math.floor(Math.random() * 40) + 100,
        totalRoutines: Math.floor(Math.random() * 10) + 15,
        totalExercises: Math.floor(Math.random() * 20) + 60,
        totalVolume: Math.floor(Math.random() * 500000) + 2500000,
        todayWorkouts: Math.floor(Math.random() * 20) + 25,
      });

    } catch (error) {
      console.log("Error loading stats (using fallback mock):", error);
      // Datos mock de fallback
      setStats({
        totalMembers: 156,
        activeMembers: 142,
        totalRoutines: 24,
        totalExercises: 89,
        totalVolume: 2847500,
        todayWorkouts: 38,
      });
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Simular actividad reciente (en producción vendría de múltiples colecciones)
      const mockActivity: RecentActivity[] = [
        {
          id: "1",
          type: "registration",
          description: "Nuevo miembro registrado",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // hace 2 horas
          userName: "María González"
        },
        {
          id: "2", 
          type: "workout",
          description: "Completó rutina de Pecho y Tríceps",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // hace 4 horas
          userName: "Carlos Ruiz"
        },
        {
          id: "3",
          type: "routine_created",
          description: "Nueva rutina oficial creada",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // hace 6 horas
          userName: "Admin"
        },
        {
          id: "4",
          type: "workout",
          description: "Completó rutina de Piernas",
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // hace 8 horas
          userName: "Ana Silva"
        },
      ];
      
      setRecentActivity(mockActivity);
    } catch (error) {
      console.log("Error loading recent activity:", error);
      setRecentActivity([]);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) { // menos de 24 horas
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Hace ${days}d`;
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'registration': return 'person-add';
      case 'workout': return 'fitness';
      case 'routine_created': return 'add-circle';
      default: return 'information-circle';
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'registration': return COLORS.success;
      case 'workout': return COLORS.primary;
      case 'routine_created': return COLORS.secondary;
      default: return COLORS.gray;
    }
  };

  return (
    <RoleGuard 
      requiredRole="ADMIN" 
      fallbackMessage="Solo los administradores pueden acceder al panel de control."
    >
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Administración</Text>
        <Text style={styles.subtitle}>Iconik Pro Gym</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Estadísticas Generales</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeMembers}</Text>
            <Text style={styles.statLabel}>Miembros Activos</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalMembers}</Text>
            <Text style={styles.statLabel}>Total Miembros</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalExercises}</Text>
            <Text style={styles.statLabel}>Ejercicios</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalRoutines}</Text>
            <Text style={styles.statLabel}>Rutinas Oficiales</Text>
          </View>
        </View>

        {/* Estadísticas adicionales */}
        <View style={styles.extraStatsContainer}>
          <View style={styles.extraStatCard}>
            <Ionicons name="fitness" size={24} color={COLORS.primary} />
            <Text style={styles.extraStatNumber}>{stats.todayWorkouts}</Text>
            <Text style={styles.extraStatLabel}>Entrenamientos Hoy</Text>
          </View>
          
          <View style={styles.extraStatCard}>
            <Ionicons name="barbell" size={24} color={COLORS.secondary} />
            <Text style={styles.extraStatNumber}>{formatNumber(stats.totalVolume)} kg</Text>
            <Text style={styles.extraStatLabel}>Volumen Total</Text>
          </View>
        </View>

        {/* Acciones rápidas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acciones Rápidas</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="person-add" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Agregar Nuevo Miembro</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Crear Nueva Rutina</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="fitness" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Agregar Ejercicio</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.info }]}>
            <Ionicons name="stats-chart" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Ver Reportes</Text>
          </TouchableOpacity>
        </View>

        {/* Actividad reciente */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Actividad Reciente</Text>
          
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) }]}>
                <Ionicons 
                  name={getActivityIcon(activity.type) as any} 
                  size={16} 
                  color={COLORS.white} 
                />
              </View>
              
              <View style={styles.activityContent}>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityUser}>{activity.userName} • {formatTimeAgo(activity.timestamp)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
    </RoleGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    ...GLOBAL_STYLES.container,
  },
  header: {
    padding: SIZES.paddingLarge,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: SIZES.fontLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.fontRegular,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    marginBottom: SIZES.margin,
    color: COLORS.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin,
  },
  statCard: {
    ...GLOBAL_STYLES.card,
    width: '48%',
    marginBottom: SIZES.margin / 2,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.fontLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    textAlign: 'center',
  },
  extraStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.margin,
  },
  extraStatCard: {
    ...GLOBAL_STYLES.card,
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 0,
    alignItems: 'center',
  },
  extraStatNumber: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginTop: 8,
    marginBottom: 4,
  },
  extraStatLabel: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    textAlign: 'center',
  },
  card: {
    ...GLOBAL_STYLES.card,
  },
  cardTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    marginBottom: SIZES.margin,
    color: COLORS.secondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.margin / 2,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontRegular,
    fontWeight: 'bold',
    marginLeft: SIZES.padding / 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.margin,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: SIZES.fontRegular,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 2,
  },
  activityUser: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
  },
});

export default AdminDashboard; 