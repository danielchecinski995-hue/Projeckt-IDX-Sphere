import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  StatusBar,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useQuery } from '@tanstack/react-query';
import { tournamentApi } from '../../services/api';
import { Player } from '../../types';

type Props = StackScreenProps<RootStackParamList, 'TeamDetail'>;

export default function TeamDetailScreen({ route }: Props) {
  const { teamId, teamName } = route.params;

  const { data: team, isLoading, error } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => tournamentApi.getTeamWithPlayers(teamId),
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Ładowanie zawodników...</Text>
      </View>
    );
  }

  if (error || !team) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          Błąd ładowania drużyny
        </Text>
      </View>
    );
  }

  const renderPlayer = ({ item, index }: { item: Player; index: number }) => (
    <View style={styles.playerCard}>
      <View style={styles.playerNumber}>
        <Text style={styles.playerNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>
          {item.first_name} {item.last_name}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />

      {/* Team Header */}
      <View style={styles.header}>
        <Text style={styles.teamName}>{teamName}</Text>
        <Text style={styles.playerCount}>
          {team.players?.length || 0} zawodników
        </Text>
      </View>

      {/* Players List */}
      <FlatList
        data={team.players || []}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Brak zawodników w drużynie</Text>
          </View>
        }
      />
    </View>
  );
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  playerCount: {
    fontSize: 14,
    color: '#64748b',
  },
  listContainer: {
    padding: 16,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  playerNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});
