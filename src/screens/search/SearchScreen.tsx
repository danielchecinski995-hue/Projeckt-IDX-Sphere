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
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

// Professional Referee Jersey Icon with Vertical Stripes
const RefereeJerseyIcon = ({ size = 32 }: { size?: number }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {/* Left sleeve - angular/square style */}
      <Path
        d="M 10 12 L 4 12 L 4 22 L 10 22 L 12 18 L 12 12 Z"
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth="1.2"
        strokeLinejoin="miter"
      />

      {/* Right sleeve - angular/square style */}
      <Path
        d="M 38 12 L 44 12 L 44 22 L 38 22 L 36 18 L 36 12 Z"
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth="1.2"
        strokeLinejoin="miter"
      />

      {/* Main jersey body */}
      <Path
        d="M 12 12 L 12 40 C 12 42 13 44 15 44 L 33 44 C 35 44 36 42 36 40 L 36 12 Z"
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth="1.5"
        strokeLinejoin="miter"
      />

      {/* Black vertical stripes - 7 stripes for classic referee look */}
      <Path d="M 15 12 L 15 44" stroke="#000000" strokeWidth="2.5" strokeLinecap="butt" />
      <Path d="M 19 12 L 19 44" stroke="#000000" strokeWidth="2.5" strokeLinecap="butt" />
      <Path d="M 24 12 L 24 44" stroke="#000000" strokeWidth="2.5" strokeLinecap="butt" />
      <Path d="M 29 12 L 29 44" stroke="#000000" strokeWidth="2.5" strokeLinecap="butt" />
      <Path d="M 33 12 L 33 44" stroke="#000000" strokeWidth="2.5" strokeLinecap="butt" />

      {/* Collar - V-neck style */}
      <Path
        d="M 18 12 L 24 16 L 30 12"
        fill="none"
        stroke="#000000"
        strokeWidth="1.2"
      />

      {/* Collar fill */}
      <Circle cx="24" cy="12" r="3" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
    </Svg>
  );
};

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
        <Text style={styles.emptyText}>Brak dostępnych turniejów</Text>
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
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('RefereeDashboard')}
      >
        <RefereeJerseyIcon size={32} />
      </TouchableOpacity>
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
  // FAB styles
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#FFFFFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#000000',
  },
  fabIcon: { fontSize: 28, color: '#fff' },
});
