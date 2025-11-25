import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { tournamentApi, matchApi } from '../../services/api';
import { Match, Standing } from '../../types';
import TeamLogo from '../../components/TeamLogo';

type TournamentDetailRouteProp = RouteProp<RootStackParamList, 'TournamentDetail'>;
type TournamentDetailNavigationProp = StackNavigationProp<
  RootStackParamList,
  'TournamentDetail'
>;

type TabType = 'matches' | 'standings' | 'teams';

export default function TournamentDetailScreen() {
  const route = useRoute<TournamentDetailRouteProp>();
  const navigation = useNavigation<TournamentDetailNavigationProp>();
  const { tournamentId, shareCode } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>('matches');

  // Load tournament info first
  const { data: tournament, isLoading: tournamentLoading } = useQuery({
    queryKey: ['tournament', shareCode],
    queryFn: () => tournamentApi.getTournamentByShareCode(shareCode),
  });

  // Update navigation header title with tournament name
  useLayoutEffect(() => {
    if (tournament?.name) {
      navigation.setOptions({
        headerTitle: tournament.name,
      });
    }
  }, [navigation, tournament]);

  // Prefetch all data in parallel for instant tab switching
  // All queries will be cached and reused when switching tabs
  const { data: matches, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches', tournamentId],
    queryFn: () => tournamentApi.getTournamentMatches(tournamentId),
  });

  const { data: standings, isLoading: standingsLoading } = useQuery({
    queryKey: ['standings', tournamentId],
    queryFn: () => tournamentApi.getTournamentStandings(tournamentId),
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => tournamentApi.getTournamentTeams(tournamentId),
  });

  if (tournamentLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const renderMatchItem = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => navigation.navigate('MatchDetail', { matchId: item.id })}
    >
      <View style={styles.matchHeader}>
        <View style={styles.matchTeamContainer}>
          <TeamLogo logoUrl={item.homeTeamLogo} teamName={item.homeTeamName || 'TBD'} size={24} />
          <Text style={styles.matchTeam}>{item.homeTeamName || 'TBD'}</Text>
        </View>
        <View style={styles.matchScore}>
          <Text style={styles.scoreText}>
            {item.homeScore ?? '-'} : {item.awayScore ?? '-'}
          </Text>
        </View>
        <View style={styles.matchTeamContainer}>
          <TeamLogo logoUrl={item.awayTeamLogo} teamName={item.awayTeamName || 'TBD'} size={24} />
          <Text style={styles.matchTeam}>{item.awayTeamName || 'TBD'}</Text>
        </View>
      </View>
      {item.matchDate && (
        <Text style={styles.matchDate}>
          {new Date(item.matchDate).toLocaleString('pl-PL')}
        </Text>
      )}
      <View style={[styles.matchStatus, getMatchStatusStyle(item.status)]}>
        <Text style={styles.matchStatusText}>{getMatchStatusText(item.status)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderStandingItem = ({ item }: { item: Standing }) => {
    const played = item.wins + item.draws + item.losses;
    return (
      <View style={styles.standingRow}>
        <Text style={styles.standingPosition}>{item.position}</Text>
        <View style={styles.standingTeamContainer}>
          <TeamLogo logoUrl={item.team_logo_url} teamName={item.team_name} size={20} />
          <Text style={styles.standingTeam}>{item.team_name}</Text>
        </View>
        <View style={styles.standingStats}>
          <Text style={styles.standingStat}>{played}</Text>
          <Text style={styles.standingStat}>{item.wins}</Text>
          <Text style={styles.standingStat}>{item.draws}</Text>
          <Text style={styles.standingStat}>{item.losses}</Text>
          <Text style={[styles.standingStat, styles.standingPoints]}>{item.points}</Text>
        </View>
      </View>
    );
  };

  const renderTeamItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={() => navigation.navigate('TeamDetail', { teamId: item.id, teamName: item.name })}
    >
      <View style={styles.teamCardContent}>
        <TeamLogo logoUrl={item.logo_url} teamName={item.name} size={32} />
        <Text style={styles.teamName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
          onPress={() => setActiveTab('matches')}
        >
          <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>
            Mecze
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'standings' && styles.activeTab]}
          onPress={() => setActiveTab('standings')}
        >
          <Text style={[styles.tabText, activeTab === 'standings' && styles.activeTabText]}>
            Tabela
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'teams' && styles.activeTab]}
          onPress={() => setActiveTab('teams')}
        >
          <Text style={[styles.tabText, activeTab === 'teams' && styles.activeTabText]}>
            Drużyny
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'matches' && (
          matchesLoading ? (
            <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
          ) : (
            <FlatList
              data={matches}
              renderItem={renderMatchItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={<Text style={styles.emptyText}>Brak meczy</Text>}
            />
          )
        )}

        {activeTab === 'standings' && (
          standingsLoading ? (
            <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
          ) : (
            <View>
              <View style={styles.standingHeader}>
                <Text style={styles.standingHeaderText}>Poz</Text>
                <Text style={[styles.standingHeaderText, { flex: 1 }]}>Drużyna</Text>
                <View style={styles.standingStats}>
                  <Text style={styles.standingHeaderStat}>M</Text>
                  <Text style={styles.standingHeaderStat}>W</Text>
                  <Text style={styles.standingHeaderStat}>R</Text>
                  <Text style={styles.standingHeaderStat}>P</Text>
                  <Text style={[styles.standingHeaderStat, styles.standingPoints]}>Pkt</Text>
                </View>
              </View>
              <FlatList
                data={standings}
                renderItem={renderStandingItem}
                keyExtractor={(item) => item.team_id}
                ListEmptyComponent={<Text style={styles.emptyText}>Brak tabeli</Text>}
              />
            </View>
          )
        )}

        {activeTab === 'teams' && (
          teamsLoading ? (
            <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
          ) : (
            <FlatList
              data={teams}
              renderItem={renderTeamItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={<Text style={styles.emptyText}>Brak drużyn</Text>}
            />
          )
        )}
      </View>
    </View>
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
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tournamentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  tournamentDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  loader: {
    marginTop: 20,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  matchTeamContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchTeam: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  matchScore: {
    paddingHorizontal: 16,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  matchDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
  },
  matchStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  standingHeader: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  standingHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    width: 40,
  },
  standingHeaderStat: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    width: 32,
    textAlign: 'center',
  },
  standingRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  standingPosition: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    width: 40,
  },
  standingTeamContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  standingTeam: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  standingStats: {
    flexDirection: 'row',
  },
  standingStat: {
    fontSize: 13,
    color: '#64748b',
    width: 32,
    textAlign: 'center',
  },
  standingPoints: {
    fontWeight: 'bold',
    color: '#2563eb',
  },
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  teamCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 20,
    fontSize: 14,
  },
});
