import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../utils/theme';

const UsageLimitIndicator: React.FC = () => {
  const { colors } = useTheme();
  const appColors = COLORS;
  const { dailyUsage, dailyLimit, tier } = useSelector(
    (state: RootState) => state.nutrition.usageLimits
  );

  const remaining = dailyLimit - dailyUsage;
  const progress = dailyUsage / dailyLimit;
  
  const getTierColor = () => {
    switch (tier) {
      case 'basic': return '#FF6B6B';
      case 'premium': return '#4ECDC4';
      case 'vip': return '#45B7D1';
      default: return '#FF6B6B';
    }
  };

  const getTierLabel = () => {
    switch (tier) {
      case 'basic': return 'BÁSICO';
      case 'premium': return 'PREMIUM';
      case 'vip': return 'VIP';
      default: return 'BÁSICO';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: appColors.white }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: appColors.secondary }]}>
          Análisis Restantes
        </Text>
        <View style={[styles.tierBadge, { backgroundColor: getTierColor() }]}>
          <Text style={styles.tierText}>{getTierLabel()}</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: appColors.grayLight }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: getTierColor(),
                width: `${Math.min(progress * 100, 100)}%`
              }
            ]} 
          />
        </View>
        <Text style={[styles.remainingText, { color: appColors.secondary }]}>
          {remaining} restantes hoy
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: appColors.secondary }]}>
            {dailyUsage}
          </Text>
          <Text style={[styles.statLabel, { color: appColors.gray }]}>
            Usados
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: appColors.secondary }]}>
            {dailyLimit}
          </Text>
          <Text style={[styles.statLabel, { color: appColors.gray }]}>
            Límite
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: getTierColor() }]}>
            {Math.round(progress * 100)}%
          </Text>
          <Text style={[styles.statLabel, { color: appColors.gray }]}>
            Progreso
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default UsageLimitIndicator; 