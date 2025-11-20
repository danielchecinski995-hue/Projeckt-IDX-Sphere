import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { matchApi } from '../../services/api';
import RefereeMode from '../../components/RefereeMode';

type MatchDetailRouteProp = RouteProp<RootStackParamList, 'MatchDetail'>;

export default function MatchDetailScreen() {
  const route = useRoute<MatchDetailRouteProp>();
  const { matchId } = route.params;
  const [refereeModeVisible, setRefereeModeVisible] = useState(false);

  console.log('MatchDetailScreen - matchId:', matchId);

  const { data: match, isLoading, error } = useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      try {
        console.log('Fetching match:', matchId);
        const result = await matchApi.getMatch(matchId);
        console.log('Match fetched:', result);
        return result;
      } catch (err) {
        console.error('Error fetching match:', err);
        throw err;
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Błąd ładowania meczu</Text>
        <Text style={styles.errorText}>{String(error)}</Text>
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

      {/* Referee Mode Button - Always visible */}
      <View style={styles.refereeButtonContainer}>
        <TouchableOpacity
          style={styles.refereeButton}
          onPress={() => setRefereeModeVisible(true)}
        >
          <Text style={styles.refereeButtonIcon}>⚽</Text>
          <Text style={styles.refereeButtonText}>Tryb Sędziowski</Text>
          <Text style={styles.refereeButtonSubtext}>Szybka aktualizacja wyniku</Text>
        </TouchableOpacity>
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
      {match.status === 'completed' && (match as any).statistics && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statystyki meczu</Text>

          {/* Possession */}
          {(match as any).statistics.home_possession !== undefined && (
            <View style={styles.statContainer}>
              <Text style={styles.statName}>Posiadanie piłki</Text>
              <View style={styles.statBarContainer}>
                <Text style={styles.statNumber}>
                  {(match as any).statistics.home_possession}%
                </Text>
                <View style={styles.statBar}>
                  <View
                    style={[
                      styles.statBarFill,
                      styles.statBarHome,
                      { width: `${(match as any).statistics.home_possession}%` },
                    ]}
                  />
                  <View
                    style={[
                      styles.statBarFill,
                      styles.statBarAway,
                      { width: `${(match as any).statistics.away_possession}%` },
                    ]}
                  />
                </View>
                <Text style={styles.statNumber}>
                  {(match as any).statistics.away_possession}%
                </Text>
              </View>
            </View>
          )}

          {/* Shots */}
          {(match as any).statistics.home_shots !== undefined && (
            <View style={styles.statContainer}>
              <Text style={styles.statName}>Strzały</Text>
              <View style={styles.statNumbers}>
                <Text style={styles.statNumberValue}>
                  {(match as any).statistics.home_shots}
                </Text>
                <Text style={styles.statNumberValue}>
                  {(match as any).statistics.away_shots}
                </Text>
              </View>
            </View>
          )}

          {/* Shots on Target */}
          {(match as any).statistics.home_shots_on_target !== undefined && (
            <View style={styles.statContainer}>
              <Text style={styles.statName}>Strzały celne</Text>
              <View style={styles.statNumbers}>
                <Text style={styles.statNumberValue}>
                  {(match as any).statistics.home_shots_on_target}
                </Text>
                <Text style={styles.statNumberValue}>
                  {(match as any).statistics.away_shots_on_target}
                </Text>
              </View>
            </View>
          )}

          {/* Corners */}
          {(match as any).statistics.home_corners !== undefined && (
            <View style={styles.statContainer}>
              <Text style={styles.statName}>Rzuty rożne</Text>
              <View style={styles.statNumbers}>
                <Text style={styles.statNumberValue}>
                  {(match as any).statistics.home_corners}
                </Text>
                <Text style={styles.statNumberValue}>
                  {(match as any).statistics.away_corners}
                </Text>
              </View>
            </View>
          )}

          {/* Fouls */}
          {(match as any).statistics.home_fouls !== undefined && (
            <View style={styles.statContainer}>
              <Text style={styles.statName}>Faule</Text>
              <View style={styles.statNumbers}>
                <Text style={styles.statNumberValue}>
                  {(match as any).statistics.home_fouls}
                </Text>
                <Text style={styles.statNumberValue}>
                  {(match as any).statistics.away_fouls}
                </Text>
              </View>
            </View>
          )}

          {/* Offsides */}
          {(match as any).statistics.home_offsides !== undefined && (
            <View style={styles.statContainer}>
              <Text style={styles.statName}>Spalone</Text>
              <View style={styles.statNumbers}>
                <Text style={styles.statNumberValue}>
                  {(match as any).statistics.home_offsides}
                </Text>
                <Text style={styles.statNumberValue}>
                  {(match as any).statistics.away_offsides}
                </Text>
              </View>
            </View>
          )}

          {/* Big Chances Missed */}
          {(match as any).statistics.home_big_chances_missed !== undefined && (
            <View style={styles.statContainer}>
              <Text style={styles.statName}>Niewykorzystane okazje</Text>
              <View style={styles.statNumbers}>
                <Text style={styles.statNumberValue}>
                  {(match as any).statistics.home_big_chances_missed}
                </Text>
                <Text style={styles.statNumberValue}>
                  {(match as any).statistics.away_big_chances_missed}
                </Text>
              </View>
            </View>
          )}

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

      {/* Referee Mode Modal */}
      {match && (
        <RefereeMode
          visible={refereeModeVisible}
          onClose={() => setRefereeModeVisible(false)}
          match={match}
        />
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
  statContainer: {
    marginBottom: 20,
  },
  statName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  statBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    minWidth: 40,
    textAlign: 'center',
  },
  statBar: {
    flex: 1,
    height: 24,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  statBarFill: {
    height: '100%',
  },
  statBarHome: {
    backgroundColor: '#2563eb',
  },
  statBarAway: {
    backgroundColor: '#ef4444',
  },
  statNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  statNumberValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
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
  refereeButtonContainer: {
    padding: 16,
  },
  refereeButton: {
    backgroundColor: '#10b981',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  refereeButtonIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  refereeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  refereeButtonSubtext: {
    fontSize: 14,
    color: '#d1fae5',
  },
});
