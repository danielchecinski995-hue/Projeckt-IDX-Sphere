import axios from 'axios';
import { Tournament, Match, Standing, Team, TeamWithPlayers, MatchStatistics, Substitution } from '../types';
import { API_BASE_URL } from '../config';

// API base URL - automatically switches between dev (local IP) and production
const API_URL = API_BASE_URL;

// Create axios instance with timeout for localtunnel
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds - localtunnel can be slower
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true', // Localtunnel bypass header
  },
});

// Tournament API
export const tournamentApi = {
  // Get all public tournaments
  getPublicTournaments: async (): Promise<Tournament[]> => {
    const response = await api.get('/tournaments', {
      params: { is_public: true },
    });
    // Backend returns {success, count, data}, we need just data array
    return response.data.data || response.data;
  },

  // Get all tournaments (for referee mode)
  getAllTournaments: async (): Promise<Tournament[]> => {
    const response = await api.get('/tournaments');
    return response.data.data || response.data;
  },

  // Get tournament by share code
  getTournamentByShareCode: async (shareCode: string): Promise<Tournament> => {
    const response = await api.get(`/tournaments/share/${shareCode}`);
    return response.data.data || response.data;
  },

  // Get tournament teams
  getTournamentTeams: async (tournamentId: string): Promise<Team[]> => {
    const response = await api.get(`/tournaments/${tournamentId}/teams`);
    return response.data.data || response.data;
  },

  // Get tournament matches
  getTournamentMatches: async (tournamentId: string): Promise<Match[]> => {
    const response = await api.get(`/tournaments/${tournamentId}/matches`);
    return response.data.data || response.data;
  },

  // Get tournament standings
  getTournamentStandings: async (tournamentId: string): Promise<Standing[]> => {
    const response = await api.get(`/tournaments/${tournamentId}/standings`);
    return response.data.data || response.data;
  },

  // Get team with players
  getTeamWithPlayers: async (teamId: string): Promise<TeamWithPlayers> => {
    const response = await api.get(`/teams/${teamId}`, {
      params: { include_players: true },
    });
    return response.data.data || response.data;
  },
};

// Match API
export const matchApi = {
  // Get match details
  getMatch: async (matchId: string): Promise<Match> => {
    const response = await api.get(`/matches/${matchId}`);
    return response.data.data || response.data;
  },

  // Get both teams' rosters for referee mode
  getMatchTeams: async (matchId: string) => {
    const response = await api.get(`/matches/${matchId}/teams`);
    return response.data.data || response.data;
  },

  // Update match result with goal scorer
  updateMatchResult: async (matchId: string, homeScore: number, awayScore: number, goalScorers?: any[]) => {
    const response = await api.put(`/matches/${matchId}/result`, {
      homeScore,
      awayScore,
      goalScorers,
    });
    return response.data.data || response.data;
  },

  // Get goal scorers for a match
  getGoalScorers: async (matchId: string) => {
    const response = await api.get(`/matches/${matchId}/goal-scorers`);
    return response.data.data || response.data;
  },

  // Add a goal scorer (regular or own goal)
  addGoalScorer: async (matchId: string, playerId: string, teamId: string, isOwnGoal: boolean = false) => {
    const response = await api.post(`/matches/${matchId}/goal-scorers`, {
      player_id: playerId,
      team_id: teamId,
      is_own_goal: isOwnGoal,
    });
    return response.data.data || response.data;
  },

  // Get cards for a match
  getMatchCards: async (matchId: string) => {
    const response = await api.get(`/matches/${matchId}/cards`);
    return response.data.data || response.data;
  },

  // Add a card to a match
  addCard: async (matchId: string, playerId: string, teamId: string, cardType: 'yellow' | 'red', minute?: number) => {
    const response = await api.post(`/matches/${matchId}/cards`, {
      player_id: playerId,
      team_id: teamId,
      card_type: cardType,
      minute,
    });
    return response.data.data || response.data;
  },

  // Get substitutions for a match
  getSubstitutions: async (matchId: string): Promise<Substitution[]> => {
    const response = await api.get(`/matches/${matchId}/substitutions`);
    return response.data.data || response.data;
  },

  // Add a substitution
  addSubstitution: async (matchId: string, teamId: string, playerOutId: string, playerInId: string, minute?: number) => {
    const response = await api.post(`/matches/${matchId}/substitutions`, {
      teamId,
      playerOutId,
      playerInId,
      minute,
    });
    return response.data.data || response.data;
  },

  // Update match status (for referee mode)
  updateMatchStatus: async (matchId: string, status: 'scheduled' | 'live' | 'completed') => {
    const response = await api.put(`/matches/${matchId}/status`, {
      status,
    });
    return response.data.data || response.data;
  },
};

export default api;
