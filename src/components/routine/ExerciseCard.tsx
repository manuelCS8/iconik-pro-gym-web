import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserRoutineExercise } from '../../redux/slices/userRoutinesSlice';
import { COLORS } from '../../utils/theme';

interface ExerciseCardProps {
  exercise: UserRoutineExercise;
  index: number;
  onEdit: (index: number, exercise: UserRoutineExercise) => void;
  onRemove: (index: number) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  index,
  onEdit,
  onRemove
}) => {
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return remainingSecs > 0 ? `${mins}m ${remainingSecs}s` : `${mins}m`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.exerciseInfo}>
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseNumber}>#{index + 1}</Text>
          <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
        </View>
        
        <View style={styles.exerciseDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="repeat" size={16} color="#4ECDC4" />
            <Text style={styles.detailText}>
              {exercise.sets} series × {exercise.reps} repeticiones
            </Text>
          </View>
          
          {exercise.weight > 0 && (
            <View style={styles.detailRow}>
              <Ionicons name="fitness" size={16} color="#FF6B6B" />
              <Text style={styles.detailText}>
                {exercise.weight} kg
              </Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color="#96CEB4" />
            <Text style={styles.detailText}>
              {formatTime(exercise.restTime)} descanso
            </Text>
          </View>
        </View>
        
        {exercise.notes && (
          <View style={styles.notesContainer}>
            <Ionicons name="document-text" size={14} color="#999" />
            <Text style={styles.notesText}>{exercise.notes}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(index, exercise)}
        >
          <Ionicons name="pencil" size={18} color="#4ECDC4" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onRemove(index)}
        >
          <Ionicons name="trash" size={18} color="#E31C1F" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 8,
    backgroundColor: 'rgba(227, 28, 31, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  exerciseDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#ccc',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  notesText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#222',
  },
});

export default ExerciseCard; 