// Tournament types
export interface Tournament {
  id: string;
  name: string;
  description?: string;
  format: 'league' | 'knockout';
  status: 'draft' | 'active' | 'completed';
  share_code: string;
  is_public: boolean;
  created_at: string;
}

// Team types
export interface Team {
  id: string;
  name: string;
  logo_url?: string;
}

// Match types
export interface Match {
  id: string;
  tournamentId?: string;
  phaseId: string;
  groupId?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'completed';
  matchDate?: string;
  matchOrder: number;
  sportsFieldId?: string;
  sportsFieldName?: string;
  metadata?: {
    round?: number;
    match_number?: number;
  };
  goalScorers?: GoalScorer[];
}

// Goal scorer types
export interface GoalScorer {
  player_id: string;
  player_name?: string;
  first_name?: string;
  last_name?: string;
  team_id: string;
  goals_count: number;
  is_own_goal?: boolean;
}

// Standing types
export interface Standing {
  position: number;
  team_id: string;
  team_name: string;
  team_logo_url?: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
}

// Match statistics types
export interface MatchStatistics {
  home_possession?: number;
  away_possession?: number;
  home_shots?: number;
  away_shots?: number;
  home_shots_on_target?: number;
  away_shots_on_target?: number;
  home_fouls?: number;
  away_fouls?: number;
  home_big_chances_missed?: number;
  away_big_chances_missed?: number;
  home_corners?: number;
  away_corners?: number;
  home_offsides?: number;
  away_offsides?: number;
}

// Player types
export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number?: number;
}

// Match card types
export interface MatchCard {
  id: string;
  player_id: string;
  team_id: string;
  card_type: 'yellow' | 'red';
  minute?: number;
  reason?: string;
  first_name?: string;
  last_name?: string;
}

// Team with players
export interface TeamWithPlayers extends Team {
  players: Player[];
}
