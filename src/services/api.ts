import axios from 'axios';
import { Tournament, Match, Standing, Team } from '../types';

// API base URL - using computer's IP address (not localhost!)
// Change this to your computer's IP address when testing on real device
const API_URL = 'http://192.168.1.72:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
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
};

// Match API
export const matchApi = {
  // Get match details
  getMatch: async (matchId: string): Promise<Match> => {
    const response = await api.get(`/matches/${matchId}`);
    return response.data.data || response.data;
  },
};

export default api;
