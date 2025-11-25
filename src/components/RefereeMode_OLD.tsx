import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchApi } from '../services/api';

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number?: number;
}

interface TeamData {
  id: string;
  name: string;
  logo?: string;
  players: Player[];
}

interface Match {
  id: string;
  tournamentId?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  status: string;
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

interface ReferenceModeProps {
  visible: boolean;
  onClose: () => void;
  match: Match;
}

type ActionType = 'goal' | 'yellow_card' | 'red_card' | 'own_goal';

interface ActionPopup {
  visible: boolean;
  player: Player | null;
  team: 'home' | 'away' | null;
}

export default function RefereeMode({ visible, onClose, match }: ReferenceModeProps) {
  const queryClient = useQueryClient();
  const [actionPopup, setActionPopup] = useState<ActionPopup>({
    visible: false,
    player: null,
    team: null,
  });

  // Load both teams with players
  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ['match-teams', match.id],
    queryFn: () => matchApi.getMatchTeams(match.id),
    enabled: visible,
  });

  // Load goal scorers
  const { data: goalScorersData } = useQuery({
    queryKey: ['goal-scorers', match.id],
    queryFn: () => matchApi.getGoalScorers(match.id),
    enabled: visible,
  });

  // Load cards
  const { data: cardsData } = useQuery({
    queryKey: ['cards', match.id],
    queryFn: () => matchApi.getMatchCards(match.id),
    enabled: visible,
  });

  // Safely extract arrays from API responses
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

  // Mutation to add a goal
  const addGoal = useMutation({
    mutationFn: ({ playerId, teamId, isOwnGoal }: any) =>
      matchApi.addGoalScorer(match.id, playerId, teamId, isOwnGoal),
    onSuccess: () => {
      // Invalidate queries to refresh match data
      queryClient.invalidateQueries({ queryKey: ['match', match.id] });
      if (match.tournamentId) {
        queryClient.invalidateQueries({ queryKey: ['matches', match.tournamentId] });
        queryClient.invalidateQueries({ queryKey: ['standings', match.tournamentId] });
      }
      queryClient.invalidateQueries({ queryKey: ['goal-scorers', match.id] });
    },
    onError: (error) => {
      Alert.alert('Błąd', 'Nie udało się dodać gola');
      console.error('Error adding goal:', error);
    },
  });

  // Mutation to add card
  const addCard = useMutation({
    mutationFn: ({ playerId, teamId, cardType }: any) =>
      matchApi.addCard(match.id, playerId, teamId, cardType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', match.id] });
    },
    onError: (error) => {
      Alert.alert('Błąd', 'Nie udało się dodać kartki');
      console.error('Error adding card:', error);
    },
  });

  const handlePlayerPress = (player: Player, team: 'home' | 'away') => {
    setActionPopup({
      visible: true,
      player,
      team,
    });
  };

  const handleAction = (action: ActionType) => {
    if (!actionPopup.player || !actionPopup.team) return;

    const isHomeTeam = actionPopup.team === 'home';
    const teamId = isHomeTeam ? match.homeTeamId : match.awayTeamId;

    // Close popup first
    setActionPopup({ visible: false, player: null, team: null });

    // Call API based on action
    if (action === 'goal') {
      addGoal.mutate({
        playerId: actionPopup.player.id,
        teamId: teamId,
        isOwnGoal: false,
      });
    } else if (action === 'own_goal') {
      addGoal.mutate({
        playerId: actionPopup.player.id,
        teamId: teamId,
        isOwnGoal: true,
      });
    } else if (action === 'yellow_card' || action === 'red_card') {
      addCard.mutate({
        playerId: actionPopup.player.id,
        teamId: teamId,
        cardType: action === 'yellow_card' ? 'yellow' : 'red',
      });
    }
  };

  const renderPlayer = (player: Player, teamType: 'home' | 'away') => {
    const stats = getPlayerStats(player.id);
    const gradientColors = teamType === 'home' ? ['#3b82f6', '#2563eb'] : ['#ef4444', '#dc2626'];

    return (
      <TouchableOpacity
        key={player.id}
        style={styles.playerRow}
        onPress={() => handlePlayerPress(player, teamType)}
        disabled={addGoal.isPending || addCard.isPending}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.jerseyNumber}
        >
          <Text style={styles.jerseyNumberText}>
            {player.jersey_number || '?'}
          </Text>
        </LinearGradient>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName} numberOfLines={1}>
            {player.first_name} {player.last_name}
          </Text>
          <View style={styles.statsRow}>
            {stats.goals > 0 && (
              <Text style={styles.statIcon}>
                ⚽{stats.goals > 1 ? `×${stats.goals}` : ''}
              </Text>
            )}
            {stats.ownGoals > 0 && (
              <Text style={[styles.statIcon, styles.ownGoalIcon]}>
                ⚽{stats.ownGoals > 1 ? `×${stats.ownGoals}` : ''}
              </Text>
            )}
            {stats.yellowCards > 0 && (
              <Text style={styles.statIcon}>
                🟨{stats.yellowCards > 1 ? `×${stats.yellowCards}` : ''}
              </Text>
            )}
            {stats.redCards > 0 && (
              <Text style={styles.statIcon}>
                🟥{stats.redCards > 1 ? `×${stats.redCards}` : ''}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Wróć</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚽ Tryb Sędziowski</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Score and Team Logos */}
        <View style={styles.scoreHeader}>
          <View style={styles.teamScoreContainer}>
            {teamsData?.homeTeam?.logo && (
              <Image
                source={{ uri: teamsData.homeTeam.logo }}
                style={styles.teamLogo}
                contentFit="contain"
              />
            )}
            <Text style={styles.teamScoreName} numberOfLines={1}>
              {match.homeTeamName}
            </Text>
          </View>

          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>
              {match.homeScore ?? 0} : {match.awayScore ?? 0}
            </Text>
            <Text style={styles.scoreLabel}>Aktualny wynik</Text>
          </View>

          <View style={styles.teamScoreContainer}>
            {teamsData?.awayTeam?.logo && (
              <Image
                source={{ uri: teamsData.awayTeam.logo }}
                style={styles.teamLogo}
                contentFit="contain"
              />
            )}
            <Text style={styles.teamScoreName} numberOfLines={1}>
              {match.awayTeamName}
            </Text>
          </View>
        </View>

        {/* Content */}
        {teamsLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : addGoal.isPending || addCard.isPending ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Zapisywanie...</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollContent}>
            <View style={styles.teamsContainer}>
              {/* Home Team Column */}
              <View style={styles.teamColumn}>
                <View style={[styles.teamColumnHeader, { backgroundColor: '#3b82f6' }]}>
                  <Text style={styles.teamColumnTitle}>Gospodarze</Text>
                </View>
                {!teamsData?.homeTeam?.players || teamsData.homeTeam.players.length === 0 ? (
                  <Text style={styles.emptyText}>Brak</Text>
                ) : (
                  teamsData.homeTeam.players.map((player) => renderPlayer(player, 'home'))
                )}
              </View>

              {/* Away Team Column */}
              <View style={styles.teamColumn}>
                <View style={[styles.teamColumnHeader, { backgroundColor: '#ef4444' }]}>
                  <Text style={styles.teamColumnTitle}>Goście</Text>
                </View>
                {!teamsData?.awayTeam?.players || teamsData.awayTeam.players.length === 0 ? (
                  <Text style={styles.emptyText}>Brak</Text>
                ) : (
                  teamsData.awayTeam.players.map((player) => renderPlayer(player, 'away'))
                )}
              </View>
            </View>
          </ScrollView>
        )}

        {/* Action Popup - WhatsApp style */}
        {actionPopup.visible && actionPopup.player && (
          <Modal
            transparent
            visible={actionPopup.visible}
            animationType="fade"
            onRequestClose={() =>
              setActionPopup({ visible: false, player: null, team: null })
            }
          >
            <TouchableOpacity
              style={styles.popupOverlay}
              activeOpacity={1}
              onPress={() =>
                setActionPopup({ visible: false, player: null, team: null })
              }
            >
              <View style={styles.popupContainer}>
                <View style={styles.popupHeader}>
                  <Text style={styles.popupPlayerName}>
                    #{actionPopup.player.jersey_number || '?'}{' '}
                    {actionPopup.player.first_name} {actionPopup.player.last_name}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonGoal]}
                  onPress={() => handleAction('goal')}
                >
                  <Text style={styles.actionButtonIcon}>⚽</Text>
                  <Text style={styles.actionButtonText}>Gol</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonYellow]}
                  onPress={() => handleAction('yellow_card')}
                >
                  <Text style={styles.actionButtonIcon}>🟨</Text>
                  <Text style={styles.actionButtonText}>Żółta kartka</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonRed]}
                  onPress={() => handleAction('red_card')}
                >
                  <Text style={styles.actionButtonIcon}>🟥</Text>
                  <Text style={styles.actionButtonText}>Czerwona kartka</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonOwnGoal]}
                  onPress={() => handleAction('own_goal')}
                >
                  <Text style={styles.actionButtonIcon}>🔄</Text>
                  <Text style={styles.actionButtonText}>Samobój</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreHeader: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  teamScoreContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  teamLogo: {
    width: 32,
    height: 32,
  },
  teamScoreName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  scoreBox: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  scrollContent: {
    flex: 1,
  },
  teamsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  teamColumn: {
    flex: 1,
    borderRightWidth: 0.5,
    borderRightColor: '#e2e8f0',
  },
  teamColumnHeader: {
    padding: 8,
    alignItems: 'center',
  },
  teamColumnTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  jerseyNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jerseyNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
    gap: 2,
  },
  playerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  statIcon: {
    fontSize: 14,
  },
  ownGoalIcon: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 20,
    fontSize: 14,
  },
  // Action Popup Styles
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  popupHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  popupPlayerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  actionButtonGoal: {
    backgroundColor: '#10b981',
  },
  actionButtonYellow: {
    backgroundColor: '#fbbf24',
  },
  actionButtonRed: {
    backgroundColor: '#ef4444',
  },
  actionButtonOwnGoal: {
    backgroundColor: '#8b5cf6',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
