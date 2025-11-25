import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { matchApi } from '../../services/api';
import TeamLogo from '../../components/TeamLogo';

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number?: number;
  is_starter?: boolean;
}

interface GoalScorer {
  player_id: string;
  goals_count: number;
  is_own_goal?: boolean;
}

interface Card {
  id: string;
  player_id: string;
  card_type: 'yellow' | 'red';
}

type MatchDetailRouteProp = RouteProp<RootStackParamList, 'MatchDetail'>;

// Football Jersey Component
const JerseyIcon = ({ color, number, size = 40 }: { color: string; number: string; size?: number }) => {
  const scale = size / 40;
  const borderColor = color === '#3b82f6' ? '#1e40af' : '#991b1b';

  return (
    <View style={{ width: size * 1.2, height: size, position: 'relative' }}>
      {/* Left sleeve */}
      <View style={{
        position: 'absolute',
        top: 4 * scale,
        left: 0,
        width: 14 * scale,
        height: 10 * scale,
        backgroundColor: color,
        borderWidth: 1.5 * scale,
        borderColor: borderColor,
        borderTopLeftRadius: 3 * scale,
        borderBottomLeftRadius: 3 * scale,
        transform: [{ rotate: '-25deg' }],
      }} />

      {/* Right sleeve */}
      <View style={{
        position: 'absolute',
        top: 4 * scale,
        right: 0,
        width: 14 * scale,
        height: 10 * scale,
        backgroundColor: color,
        borderWidth: 1.5 * scale,
        borderColor: borderColor,
        borderTopRightRadius: 3 * scale,
        borderBottomRightRadius: 3 * scale,
        transform: [{ rotate: '25deg' }],
      }} />

      {/* Main body */}
      <View style={{
        position: 'absolute',
        top: 8 * scale,
        left: 9 * scale,
        width: 30 * scale,
        height: 30 * scale,
        backgroundColor: color,
        borderWidth: 1.5 * scale,
        borderColor: borderColor,
        borderTopWidth: 0,
        borderBottomLeftRadius: 3 * scale,
        borderBottomRightRadius: 3 * scale,
      }} />

      {/* Shoulder/neck area */}
      <View style={{
        position: 'absolute',
        top: 2 * scale,
        left: 12 * scale,
        width: 24 * scale,
        height: 12 * scale,
        backgroundColor: color,
        borderWidth: 1.5 * scale,
        borderColor: borderColor,
        borderBottomWidth: 0,
        borderTopLeftRadius: 4 * scale,
        borderTopRightRadius: 4 * scale,
      }} />

      {/* Neck hole */}
      <View style={{
        position: 'absolute',
        top: 4 * scale,
        left: 17 * scale,
        width: 14 * scale,
        height: 8 * scale,
        backgroundColor: '#f5f5f5',
        borderRadius: 7 * scale,
        borderWidth: 1.5 * scale,
        borderColor: borderColor,
      }} />

      {/* Number */}
      <View style={{
        position: 'absolute',
        top: 18 * scale,
        left: 9 * scale,
        width: 30 * scale,
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: 13 * scale,
          fontWeight: 'bold',
          color: '#fff',
          textAlign: 'center',
          textShadowColor: borderColor,
          textShadowOffset: { width: 0.5, height: 0.5 },
          textShadowRadius: 1,
        }}>{number}</Text>
      </View>
    </View>
  );
};

export default function MatchDetailScreen() {
  const route = useRoute<MatchDetailRouteProp>();
  const { matchId } = route.params;

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
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  // Load both teams with players
  const { data: teamsData } = useQuery({
    queryKey: ['match-teams', matchId],
    queryFn: () => matchApi.getMatchTeams(matchId),
    enabled: !!matchId,
    refetchInterval: 5000, // Real-time updates
  });

  // Load goal scorers
  const { data: goalScorersData } = useQuery({
    queryKey: ['goal-scorers', matchId],
    queryFn: () => matchApi.getGoalScorers(matchId),
    enabled: !!matchId,
    refetchInterval: 5000, // Real-time updates
  });

  // Load cards
  const { data: cardsData } = useQuery({
    queryKey: ['cards', matchId],
    queryFn: () => matchApi.getMatchCards(matchId),
    enabled: !!matchId,
    refetchInterval: 5000, // Real-time updates
  });

  const goalScorers: GoalScorer[] = Array.isArray(goalScorersData) ? goalScorersData : [];
  const cards: Card[] = Array.isArray(cardsData) ? cardsData : [];

  // Get player stats
  const getPlayerStats = (playerId: string) => {
    try {
      const playerGoalScorers = goalScorers.filter(gs => gs?.player_id === playerId);
      const goals = playerGoalScorers.filter(gs => !gs?.is_own_goal).reduce((sum, gs) => sum + (gs?.goals_count || 0), 0);
      const ownGoals = playerGoalScorers.filter(gs => gs?.is_own_goal).reduce((sum, gs) => sum + (gs?.goals_count || 0), 0);
      const playerCards = cards.filter(c => c?.player_id === playerId);
      const yellowCards = playerCards.filter(c => c?.card_type === 'yellow').length;
      const redCards = playerCards.filter(c => c?.card_type === 'red').length;

      return { goals, ownGoals, yellowCards, redCards };
    } catch (error) {
      console.error('Error calculating player stats:', error);
      return { goals: 0, ownGoals: 0, yellowCards: 0, redCards: 0 };
    }
  };

  const renderPlayer = (player: Player, teamType: 'home' | 'away') => {
    const stats = getPlayerStats(player.id);
    const shirtColor = teamType === 'home' ? '#3b82f6' : '#ef4444';
    const hasStats = stats.goals > 0 || stats.yellowCards > 0 || stats.redCards > 0;
    const hasGoal = stats.goals > 0;

    return (
      <View
        key={player.id}
        style={[styles.playerCard, hasGoal && styles.playerCardHighlight]}
      >
        {/* Stats icons at top right */}
        {hasStats && (
          <View style={styles.statsTopRight}>
            {stats.goals > 0 && (
              <View style={styles.statBadge}>
                <Text style={styles.statIcon}>⚽</Text>
                {stats.goals > 1 && <Text style={styles.statCount}>{stats.goals}</Text>}
              </View>
            )}
            {stats.yellowCards > 0 && (
              <View style={styles.statBadge}>
                <Text style={styles.statIcon}>🟨</Text>
                {stats.yellowCards > 1 && <Text style={styles.statCount}>{stats.yellowCards}</Text>}
              </View>
            )}
            {stats.redCards > 0 && (
              <View style={styles.statBadge}>
                <Text style={styles.statIcon}>🟥</Text>
              </View>
            )}
          </View>
        )}

        {/* Jersey + Name */}
        <View style={styles.playerRow}>
          <JerseyIcon
            color={shirtColor}
            number={player.jersey_number?.toString() || '?'}
            size={36}
          />
          <Text style={styles.playerName} numberOfLines={2}>
            {player.first_name} {player.last_name}
          </Text>
        </View>
      </View>
    );
  };

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
          <TeamLogo logoUrl={match.homeTeamLogo} teamName={match.homeTeamName || 'TBD'} size={64} />
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
          <TeamLogo logoUrl={match.awayTeamLogo} teamName={match.awayTeamName || 'TBD'} size={64} />
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

      {/* Team Lineups */}
      {teamsData && (
        <View style={styles.lineupsSection}>
          <Text style={styles.sectionTitle}>Składy drużyn</Text>

          <View style={styles.twoColumnContainer}>
            {/* Left Column - Home Team */}
            <View style={styles.columnLeft}>
              <View style={styles.teamHeaderCompact}>
                <Text style={styles.teamHeaderTextCompact}>{match.homeTeamName}</Text>
              </View>

              {teamsData.homeTeam?.players && teamsData.homeTeam.players.length > 0 ? (
                <>
                  {/* Starters Section */}
                  <View style={styles.sectionHeaderCompact}>
                    <Text style={styles.sectionHeaderTextCompact}>Podstawowy skład</Text>
                  </View>
                  {teamsData.homeTeam.players
                    .filter(player => player.is_starter)
                    .map((player) => renderPlayer(player, 'home'))}

                  {/* Separator */}
                  <View style={styles.separatorCompact} />

                  {/* Substitutes Section */}
                  <View style={styles.sectionHeaderCompact}>
                    <Text style={styles.sectionHeaderTextCompact}>Rezerwowi</Text>
                  </View>
                  {teamsData.homeTeam.players
                    .filter(player => !player.is_starter)
                    .map((player) => renderPlayer(player, 'home'))}
                </>
              ) : (
                <Text style={styles.emptyText}>Brak zawodników</Text>
              )}
            </View>

            {/* Right Column - Away Team */}
            <View style={styles.columnRight}>
              <View style={styles.teamHeaderCompact}>
                <Text style={styles.teamHeaderTextCompact}>{match.awayTeamName}</Text>
              </View>

              {teamsData.awayTeam?.players && teamsData.awayTeam.players.length > 0 ? (
                <>
                  {/* Starters Section */}
                  <View style={styles.sectionHeaderCompact}>
                    <Text style={styles.sectionHeaderTextCompact}>Podstawowy skład</Text>
                  </View>
                  {teamsData.awayTeam.players
                    .filter(player => player.is_starter)
                    .map((player) => renderPlayer(player, 'away'))}

                  {/* Separator */}
                  <View style={styles.separatorCompact} />

                  {/* Substitutes Section */}
                  <View style={styles.sectionHeaderCompact}>
                    <Text style={styles.sectionHeaderTextCompact}>Rezerwowi</Text>
                  </View>
                  {teamsData.awayTeam.players
                    .filter(player => !player.is_starter)
                    .map((player) => renderPlayer(player, 'away'))}
                </>
              ) : (
                <Text style={styles.emptyText}>Brak zawodników</Text>
              )}
            </View>
          </View>
        </View>
      )}

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
  // Lineup Section Styles
  lineupsSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  columnLeft: {
    flex: 1,
    paddingRight: 4,
  },
  columnRight: {
    flex: 1,
    paddingLeft: 4,
  },
  teamHeaderCompact: {
    marginBottom: 8,
    alignItems: 'center',
  },
  teamHeaderTextCompact: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
  },
  sectionHeaderCompact: {
    marginTop: 6,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  sectionHeaderTextCompact: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  separatorCompact: {
    height: 2,
    backgroundColor: '#e2e8f0',
    marginVertical: 8,
    borderRadius: 1,
  },
  playerCard: {
    position: 'relative',
    backgroundColor: '#f8fafc',
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 6,
    marginBottom: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  playerCardHighlight: {
    backgroundColor: '#fef3c7',
    borderColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  playerName: {
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 4,
    lineHeight: 12,
  },
  statsTopRight: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    zIndex: 1,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 11,
  },
  statCount: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 12,
  },
});
