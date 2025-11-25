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
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchApi } from '../services/api';
import Svg, { Path, Rect } from 'react-native-svg';
import TeamLogo from './TeamLogo';

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number?: number;
  is_starter?: boolean;
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

type ActionType = 'goal' | 'yellow_card' | 'red_card' | 'own_goal' | 'substitution';

interface ActionPopup {
  visible: boolean;
  player: Player | null;
  team: 'home' | 'away' | null;
}

interface SubstitutionModal {
  visible: boolean;
  playerOut: Player | null;
  team: 'home' | 'away' | null;
}

// Football Jersey Component - T-shirt with sleeves pointing outward
const JerseyIcon = ({ color, number, size = 40 }: { color: string; number: string; size?: number }) => {
  const scale = size / 40;
  const borderColor = color === '#3b82f6' ? '#1e40af' : '#991b1b';

  return (
    <View style={{ width: size * 1.2, height: size, position: 'relative' }}>
      {/* Left sleeve - angled outward */}
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

      {/* Right sleeve - angled outward */}
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

      {/* Neck hole (oval) */}
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

export default function RefereeMode({ visible, onClose, match }: ReferenceModeProps) {
  const queryClient = useQueryClient();
  const [actionPopup, setActionPopup] = useState<ActionPopup>({
    visible: false,
    player: null,
    team: null,
  });
  const [substitutionModal, setSubstitutionModal] = useState<SubstitutionModal>({
    visible: false,
    playerOut: null,
    team: null,
  });

  // Load current match data to get updated scores
  const { data: currentMatch } = useQuery({
    queryKey: ['match', match.id],
    queryFn: () => matchApi.getMatch(match.id),
    enabled: visible,
    initialData: match,
  });

  // Use current match data if available, otherwise fall back to prop
  const matchData = currentMatch || match;

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

  // Mutation to add substitution
  const addSubstitution = useMutation({
    mutationFn: ({ teamId, playerOutId, playerInId }: any) =>
      matchApi.addSubstitution(match.id, teamId, playerOutId, playerInId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-teams', match.id] });
      queryClient.invalidateQueries({ queryKey: ['substitutions', match.id] });
    },
    onError: (error) => {
      Alert.alert('Błąd', 'Nie udało się dokonać zmiany');
      console.error('Error adding substitution:', error);
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
    const teamId = isHomeTeam ? matchData.homeTeamId : matchData.awayTeamId;

    if (action === 'substitution') {
      // Open substitution modal
      setSubstitutionModal({
        visible: true,
        playerOut: actionPopup.player,
        team: actionPopup.team,
      });
      setActionPopup({ visible: false, player: null, team: null });
      return;
    }

    setActionPopup({ visible: false, player: null, team: null });

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

  const handleSubstitution = (playerInId: string) => {
    if (!substitutionModal.playerOut || !substitutionModal.team) return;

    const isHomeTeam = substitutionModal.team === 'home';
    const teamId = isHomeTeam ? matchData.homeTeamId : matchData.awayTeamId;

    setSubstitutionModal({ visible: false, playerOut: null, team: null });

    addSubstitution.mutate({
      teamId: teamId,
      playerOutId: substitutionModal.playerOut.id,
      playerInId: playerInId,
    });
  };

  const renderPlayer = (player: Player, teamType: 'home' | 'away') => {
    const stats = getPlayerStats(player.id);
    const shirtColor = teamType === 'home' ? '#3b82f6' : '#ef4444'; // Blue for home, Red for away
    const hasStats = stats.goals > 0 || stats.yellowCards > 0 || stats.redCards > 0;

    return (
      <TouchableOpacity
        key={player.id}
        style={styles.playerCard}
        onPress={() => handlePlayerPress(player, teamType)}
        disabled={addGoal.isPending || addCard.isPending || addSubstitution.isPending}
      >
        {/* Stats icons at top right - absolute positioned */}
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

        {/* Jersey + Name in row, aligned to bottom */}
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
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backText}>← Wróć</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚽ Tryb Sędziowski</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Content */}
        {teamsLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : addGoal.isPending || addCard.isPending || addSubstitution.isPending ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Zapisywanie...</Text>
          </View>
        ) : (
          <ScrollView style={styles.mainScroll}>
            {/* Score Header */}
            <View style={styles.scoreSection}>
              <View style={styles.teamSection}>
                <TeamLogo logoUrl={matchData.homeTeamLogo} teamName={matchData.homeTeamName} size={40} />
                <Text style={styles.teamName}>{matchData.homeTeamName}</Text>
              </View>
              <View style={styles.scoreboard}>
                <Text style={styles.score}>
                  {matchData.homeScore ?? 0} : {matchData.awayScore ?? 0}
                </Text>
                <Text style={styles.scoreLabel}>Aktualny wynik</Text>
              </View>
              <View style={styles.teamSection}>
                <TeamLogo logoUrl={matchData.awayTeamLogo} teamName={matchData.awayTeamName} size={40} />
                <Text style={styles.teamName}>{matchData.awayTeamName}</Text>
              </View>
            </View>

            <View style={styles.twoColumnContainer}>
              {/* Left Column - Home Team */}
              <View style={styles.columnLeft}>
                <View style={styles.teamHeader}>
                  <Text style={styles.teamHeaderText}>Gospodarze</Text>
                </View>
                {teamsData?.homeTeam?.players && teamsData.homeTeam.players.length > 0 ? (
                  <>
                    {/* Starters Section */}
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionHeaderText}>Podstawowy skład</Text>
                    </View>
                    {teamsData.homeTeam.players
                      .filter(player => player.is_starter)
                      .map((player) => renderPlayer(player, 'home'))}

                    {/* Separator */}
                    <View style={styles.separator} />

                    {/* Substitutes Section */}
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionHeaderText}>Rezerwowi</Text>
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
                <View style={styles.teamHeader}>
                  <Text style={styles.teamHeaderText}>Goście</Text>
                </View>
                {teamsData?.awayTeam?.players && teamsData.awayTeam.players.length > 0 ? (
                  <>
                    {/* Starters Section */}
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionHeaderText}>Podstawowy skład</Text>
                    </View>
                    {teamsData.awayTeam.players
                      .filter(player => player.is_starter)
                      .map((player) => renderPlayer(player, 'away'))}

                    {/* Separator */}
                    <View style={styles.separator} />

                    {/* Substitutes Section */}
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionHeaderText}>Rezerwowi</Text>
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
          </ScrollView>
        )}

        {/* Action Popup */}
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

                {/* Zmiana - tylko dla zawodników z podstawowego składu */}
                {actionPopup.player?.is_starter && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonSubstitution]}
                    onPress={() => handleAction('substitution')}
                  >
                    <Text style={styles.actionButtonIcon}>🔁</Text>
                    <Text style={styles.actionButtonText}>Zmiana</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          </Modal>
        )}

        {/* Substitution Modal */}
        {substitutionModal.visible && substitutionModal.playerOut && (
          <Modal
            transparent
            visible={substitutionModal.visible}
            animationType="slide"
            onRequestClose={() =>
              setSubstitutionModal({ visible: false, playerOut: null, team: null })
            }
          >
            <View style={styles.substitutionOverlay}>
              <View style={styles.substitutionContainer}>
                <View style={styles.substitutionHeader}>
                  <Text style={styles.substitutionTitle}>Wybierz rezerwowego</Text>
                  <Text style={styles.substitutionSubtitle}>
                    Schodzi: #{substitutionModal.playerOut.jersey_number || '?'}{' '}
                    {substitutionModal.playerOut.first_name} {substitutionModal.playerOut.last_name}
                  </Text>
                </View>

                <ScrollView style={styles.substitutionScroll}>
                  {teamsData && substitutionModal.team && (
                    substitutionModal.team === 'home'
                      ? teamsData.homeTeam?.players.filter(p => !p.is_starter)
                      : teamsData.awayTeam?.players.filter(p => !p.is_starter)
                  )?.map((player) => (
                    <TouchableOpacity
                      key={player.id}
                      style={styles.substitutionPlayerCard}
                      onPress={() => handleSubstitution(player.id)}
                    >
                      <JerseyIcon
                        color={substitutionModal.team === 'home' ? '#3b82f6' : '#ef4444'}
                        number={player.jersey_number?.toString() || '?'}
                        size={32}
                      />
                      <Text style={styles.substitutionPlayerName}>
                        {player.first_name} {player.last_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={styles.substitutionCancelButton}
                  onPress={() =>
                    setSubstitutionModal({ visible: false, playerOut: null, team: null })
                  }
                >
                  <Text style={styles.substitutionCancelText}>Anuluj</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2563eb',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreSection: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  teamName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  scoreboard: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  mainScroll: {
    flex: 1,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    paddingBottom: 20,
  },
  columnLeft: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 4,
    paddingTop: 16,
  },
  columnRight: {
    flex: 1,
    paddingLeft: 4,
    paddingRight: 8,
    paddingTop: 16,
  },
  teamHeader: {
    marginBottom: 12,
    alignItems: 'center',
  },
  teamHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  separator: {
    height: 3,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
    borderRadius: 2,
  },
  playerCard: {
    position: 'relative',
    backgroundColor: '#fff',
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 6,
    marginBottom: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
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
    color: '#333',
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
    color: '#333',
    marginLeft: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
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
  actionButtonSubstitution: {
    backgroundColor: '#0ea5e9',
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
  // Substitution Modal Styles
  substitutionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  substitutionContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  substitutionHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  substitutionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  substitutionSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  substitutionScroll: {
    maxHeight: 400,
  },
  substitutionPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  substitutionPlayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 12,
  },
  substitutionCancelButton: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    alignItems: 'center',
  },
  substitutionCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
});
