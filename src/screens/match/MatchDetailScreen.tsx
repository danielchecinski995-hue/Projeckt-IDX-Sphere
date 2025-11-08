import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { matchApi } from '../../services/api';

type MatchDetailRouteProp = RouteProp<RootStackParamList, 'MatchDetail'>;

export default function MatchDetailScreen() {
  const route = useRoute<MatchDetailRouteProp>();
  const { matchId } = route.params;

  const { data: match, isLoading } = useQuery({
    queryKey: ['match', matchId],
    queryFn: () => matchApi.getMatch(matchId),
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Nie znaleziono meczu</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Match Header */}
      <View style={styles.matchHeader}>
        <View style={[styles.statusBadge, getMatchStatusStyle(match.status)]}>
          <Text style={styles.statusText}>{getMatchStatusText(match.status)}</Text>
        </View>
        {match.matchDate && (
          <Text style={styles.matchDate}>
            {new Date(match.matchDate).toLocaleString('pl-PL', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
      </View>

      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <View style={styles.teamContainer}>
          {match.homeTeamLogo && (
            <Image
              source={{ uri: match.homeTeamLogo }}
              style={styles.teamLogo}
              contentFit="contain"
            />
          )}
          <Text style={styles.teamName}>{match.homeTeamName || 'TBD'}</Text>
        </View>

        <View style={styles.scoreDisplay}>
          <Text style={styles.score}>
            {match.homeScore !== null && match.homeScore !== undefined
              ? match.homeScore
              : '-'}
          </Text>
          <Text style={styles.scoreSeparator}>:</Text>
          <Text style={styles.score}>
            {match.awayScore !== null && match.awayScore !== undefined
              ? match.awayScore
              : '-'}
          </Text>
        </View>

        <View style={styles.teamContainer}>
          {match.awayTeamLogo && (
            <Image
              source={{ uri: match.awayTeamLogo }}
              style={styles.teamLogo}
              contentFit="contain"
            />
          )}
          <Text style={styles.teamName}>{match.awayTeamName || 'TBD'}</Text>
        </View>
      </View>

      {/* Match Info */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informacje o meczu</Text>

        {match.metadata?.round && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Runda:</Text>
            <Text style={styles.infoValue}>{match.metadata.round}</Text>
          </View>
        )}

        {match.metadata?.match_number && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Numer meczu:</Text>
            <Text style={styles.infoValue}>{match.metadata.match_number}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={styles.infoValue}>{getMatchStatusText(match.status)}</Text>
        </View>
      </View>

      {/* Statistics */}
      {match.status === 'completed' && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statystyki</Text>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Gole gospodarzy</Text>
              <Text style={styles.statValue}>{match.homeScore || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Gole gości</Text>
              <Text style={styles.statValue}>{match.awayScore || 0}</Text>
            </View>
          </View>

          {match.homeScore !== null && match.awayScore !== null && (
            <View style={styles.resultCard}>
              <Text style={styles.resultText}>
                {match.homeScore > match.awayScore
                  ? `Zwycięstwo: ${match.homeTeamName}`
                  : match.homeScore < match.awayScore
                  ? `Zwycięstwo: ${match.awayTeamName}`
                  : 'Remis'}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function getMatchStatusText(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'Zaplanowany';
    case 'live':
      return 'Na żywo';
    case 'completed':
      return 'Zakończony';
    default:
      return status;
  }
}

function getMatchStatusStyle(status: string) {
  switch (status) {
    case 'scheduled':
      return { backgroundColor: '#94a3b8' };
    case 'live':
      return { backgroundColor: '#ef4444' };
    case 'completed':
      return { backgroundColor: '#3b82f6' };
    default:
      return { backgroundColor: '#64748b' };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  matchHeader: {
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  matchDate: {
    fontSize: 14,
    color: '#64748b',
  },
  scoreContainer: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
  },
  teamContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamLogo: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2563eb',
    width: 80,
    textAlign: 'center',
  },
  scoreSeparator: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#cbd5e1',
    marginHorizontal: 8,
  },
  infoSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  statsSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  resultCard: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
});
