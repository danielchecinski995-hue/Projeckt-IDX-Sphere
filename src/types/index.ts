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
