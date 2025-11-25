import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, BackHandler } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from '@react-navigation/native';
import { tournamentApi } from '../../services/api';
import { Tournament, Match } from '../../types';
import RefereeMode from '../../components/RefereeMode';
import TeamLogo from '../../components/TeamLogo';

export default function RefereeDashboardScreen() {
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [refereeModeVisible, setRefereeModeVisible] = useState(false);

    // Obsługa przycisku wstecz w telefonie
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (selectedTournament) {
                    // Jeśli jest wybrany turniej, wróć do listy turniejów
                    setSelectedTournament(null);
                    return true; // Przechwytujemy event
                }
                return false; // Pozwalamy na domyślne zachowanie (wyjście z ekranu)
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => backHandler.remove();
        }, [selectedTournament])
    );

    // Pobierz turnieje
    const { data: tournaments, isLoading: tournamentsLoading } = useQuery({
        queryKey: ['allTournaments'],
        queryFn: async () => tournamentApi.getAllTournaments(),
        refetchInterval: 5000, // Auto-refresh tournament list
    });

    // Pobierz mecze dla wybranego turnieju
    const { data: matches, isLoading: matchesLoading } = useQuery({
        queryKey: ['tournamentMatches', selectedTournament?.id],
        queryFn: async () => {
            if (!selectedTournament) return [];
            return tournamentApi.getTournamentMatches(selectedTournament.id);
        },
        enabled: !!selectedTournament,
        refetchInterval: 5000, // Auto-refresh match scores
    });

    // Kliknięcie na mecz - otwórz tryb sędziowski
    const handleMatchPress = (match: Match) => {
        setSelectedMatch(match);
        setRefereeModeVisible(true);
    };

    // Wróć do listy turniejów
    const handleBackToTournaments = () => {
        setSelectedTournament(null);
    };

    // Zamknij tryb sędziowski
    const handleCloseRefereeMode = () => {
        setRefereeModeVisible(false);
        setSelectedMatch(null);
    };

    // Loading state
    if (tournamentsLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    // Widok listy meczów
    if (selectedTournament) {
        return (
            <View style={styles.container}>
                {/* Header z przyciskiem wstecz */}
                <TouchableOpacity style={styles.backButton} onPress={handleBackToTournaments}>
                    <Text style={styles.backButtonText}>← Wróć do turniejów</Text>
                </TouchableOpacity>

                <Text style={styles.tournamentTitle}>{selectedTournament.name}</Text>
                <Text style={styles.subtitle}>Wybierz mecz do sędziowania</Text>

                {matchesLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#2563eb" />
                    </View>
                ) : (
                    <FlatList
                        data={matches}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.matchCard}
                                onPress={() => handleMatchPress(item)}
                            >
                                <View style={styles.matchTeams}>
                                    <View style={styles.teamSection}>
                                        <TeamLogo logoUrl={item.homeTeamLogo} teamName={item.homeTeamName || 'TBD'} size={32} />
                                        <Text style={styles.teamName}>{item.homeTeamName}</Text>
                                    </View>
                                    <View style={styles.scoreContainer}>
                                        <Text style={styles.score}>
                                            {item.homeScore ?? 0} : {item.awayScore ?? 0}
                                        </Text>
                                    </View>
                                    <View style={styles.teamSection}>
                                        <TeamLogo logoUrl={item.awayTeamLogo} teamName={item.awayTeamName || 'TBD'} size={32} />
                                        <Text style={styles.teamName}>{item.awayTeamName}</Text>
                                    </View>
                                </View>
                                <View style={styles.matchFooter}>
                                    <Text style={styles.tapHint}>Dotknij, aby sędziować →</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>Brak meczów w tym turnieju</Text>
                        }
                    />
                )}

                {/* Referee Mode Modal */}
                {selectedMatch && (
                    <RefereeMode
                        visible={refereeModeVisible}
                        onClose={handleCloseRefereeMode}
                        match={selectedMatch}
                    />
                )}
            </View>
        );
    }

    // Widok listy turniejów
    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Wybierz turniej</Text>
            <FlatList
                data={tournaments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.tournamentCard}
                        onPress={() => setSelectedTournament(item)}
                    >
                        <Text style={styles.tournamentName}>{item.name}</Text>
                        <Text style={styles.tapHint}>Dotknij, aby wybrać →</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    list: {
        padding: 16
    },
    headerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
        padding: 16,
        paddingBottom: 0,
    },
    // Tournament card
    tournamentCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tournamentName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    // Back button
    backButton: {
        padding: 16,
        paddingBottom: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#2563eb',
        fontWeight: '600',
    },
    tournamentTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        paddingHorizontal: 16,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    // Match card
    matchCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
    },
    matchTeams: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    teamSection: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    teamName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        textAlign: 'center',
    },
    scoreContainer: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginHorizontal: 8,
    },
    score: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2563eb',
    },
    matchFooter: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        alignItems: 'center',
    },
    tapHint: {
        fontSize: 12,
        color: '#10b981',
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        color: '#64748b',
        fontSize: 16,
        marginTop: 40,
    },
    error: {
        color: '#ef4444',
        fontSize: 16
    },
});
