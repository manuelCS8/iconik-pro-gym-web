import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../utils/theme';
import { findExercisesWithLocalImages, migrateAllLocalImages } from '../../services/migrateImagesService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ExerciseWithLocalImage {
  id: string;
  name: string;
  mediaURL?: string;
  mediaType?: string;
}

const MigrateImagesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [exercises, setExercises] = useState<ExerciseWithLocalImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migratedCount, setMigratedCount] = useState(0);

  useEffect(() => {
    loadExercisesWithLocalImages();
  }, []);

  const loadExercisesWithLocalImages = async () => {
    try {
      setLoading(true);
      const exercisesWithLocalImages = await findExercisesWithLocalImages();
      setExercises(exercisesWithLocalImages);
    } catch (error) {
      console.error('Error cargando ejercicios:', error);
      Alert.alert('Error', 'No se pudieron cargar los ejercicios');
    } finally {
      setLoading(false);
    }
  };

  const migrateAllImages = async () => {
    if (exercises.length === 0) {
      Alert.alert('Info', 'No hay imágenes para migrar');
      return;
    }
    
    Alert.alert(
      'Migrar Todas las Imágenes',
      `¿Estás seguro de que quieres migrar ${exercises.length} imágenes? Esto puede tomar varios minutos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Migrar',
          style: 'destructive',
          onPress: async () => {
            try {
              setMigrating(true);
              
              const result = await migrateAllLocalImages();
              
              setMigratedCount(result.success);
              
              Alert.alert(
                'Migración Completada',
                `Se migraron ${result.success} de ${result.total} imágenes exitosamente.\n\nFallidas: ${result.failed}`
              );
              
              // Recargar lista
              await loadExercisesWithLocalImages();
              
            } catch (error) {
              console.error('Error en migración masiva:', error);
              Alert.alert('Error', 'Hubo un error durante la migración masiva');
            } finally {
              setMigrating(false);
            }
          },
        },
      ]
    );
  };

  const renderExerciseItem = (exercise: ExerciseWithLocalImage) => {
    return (
      <View key={exercise.id} style={styles.exerciseItem}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseUrl} numberOfLines={1}>
            {exercise.mediaURL}
          </Text>
        </View>
        
        <View style={styles.statusContainer}>
          <Ionicons name="image" size={20} color={COLORS.primary} />
          <Text style={styles.statusText}>Imagen local</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando ejercicios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Migrar Imágenes Locales</Text>
        <Text style={styles.subtitle}>
          {exercises.length} imágenes locales encontradas
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{exercises.length}</Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{migratedCount}</Text>
          <Text style={styles.statLabel}>Migradas</Text>
        </View>
      </View>

      {/* Migrate All Button */}
      {exercises.length > 0 && (
        <TouchableOpacity
          style={[styles.migrateAllButton, migrating && styles.migratingButton]}
          onPress={migrateAllImages}
          disabled={migrating}
        >
          {migrating ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons name="cloud-upload-outline" size={24} color={COLORS.white} />
          )}
          <Text style={styles.migrateAllButtonText}>
            {migrating ? 'Migrando Imágenes...' : 'Migrar Todas las Imágenes'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>📋 Instrucciones:</Text>
        <Text style={styles.instructionsText}>
          1. Las imágenes locales se subirán a Firebase Storage{'\n'}
          2. Se creará un nuevo campo 'imageURL' en cada ejercicio{'\n'}
          3. Las URLs públicas serán accesibles desde cualquier dispositivo{'\n'}
          4. El proceso puede tomar varios minutos
        </Text>
      </View>

      {/* Exercises List */}
      <ScrollView style={styles.exercisesList} showsVerticalScrollIndicator={false}>
        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>¡No hay imágenes locales para migrar!</Text>
            <Text style={styles.emptySubtext}>
              Todas las imágenes ya están en Firebase Storage
            </Text>
          </View>
        ) : (
          exercises.map(renderExerciseItem)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: SIZES.largeTitle,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.white,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: SIZES.largeTitle,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 5,
  },
  migrateAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    margin: 20,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  migratingButton: {
    backgroundColor: COLORS.gray,
  },
  migrateAllButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  instructionsContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    lineHeight: 20,
  },
  exercisesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 15,
  },
  exerciseName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 5,
  },
  exerciseUrl: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    fontFamily: 'monospace',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    marginTop: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default MigrateImagesScreen; 