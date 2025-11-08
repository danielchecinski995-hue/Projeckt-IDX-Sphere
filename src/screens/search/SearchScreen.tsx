import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { tournamentApi } from '../../services/api';
import { Tournament } from '../../types';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Search'>;

export default function SearchScreen() {
  const navigation = useNavigation<SearchScreenNavigationProp>();

  const { data: tournaments, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['tournaments', 'public'],
    queryFn: () => tournamentApi.getPublicTournaments(),
  });

  const renderTournamentCard = ({ item }: { item: Tournament }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('TournamentDetail', {
          tournamentId: item.id,
          shareCode: item.share_code,
        })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.tournamentName}>{item.name}</Text>
        <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View style={styles.cardFooter}>
        <Text style={styles.format}>{getFormatText(item.format)}</Text>
        <Text style={styles.shareCode}>Kod: {item.share_code}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Ładowanie turniejów...</Text>
      </View>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Brak publicznych turniejów</Text>
        <Text style={styles.emptySubtext}>Sprawdź ponownie później</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tournaments}
        renderItem={renderTournamentCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      />
    </View>
  );
}

function getStatusText(status: string): string {
  switch (status) {
    case 'draft':
      return 'Projekt';
    case 'active':
      return 'Aktywny';
    case 'completed':
      return 'Zakończony';
    default:
      return status;
  }
}

function getStatusBadgeStyle(status: string) {
  switch (status) {
    case 'draft':
      return { backgroundColor: '#94a3b8' };
    case 'active':
      return { backgroundColor: '#22c55e' };
    case 'completed':
      return { backgroundColor: '#3b82f6' };
    default:
      return { backgroundColor: '#64748b' };
  }
}

function getFormatText(format: string): string {
  switch (format) {
    case 'league':
      return 'Liga';
    case 'knockout':
      return 'Puchar';
    default:
      return format;
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
    padding: 20,
  },
  listContent: {
    padding: 16,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  format: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  shareCode: {
    fontSize: 12,
    color: '#94a3b8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
  },
});
