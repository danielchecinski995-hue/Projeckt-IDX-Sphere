import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SearchScreen from '../screens/search/SearchScreen';
import TournamentDetailScreen from '../screens/tournament/TournamentDetailScreen';
import MatchDetailScreen from '../screens/match/MatchDetailScreen';
import TeamDetailScreen from '../screens/team/TeamDetailScreen';
import RefereeDashboardScreen from '../screens/referee/RefereeDashboardScreen';

export type RootStackParamList = {
  Search: undefined;
  TournamentDetail: { tournamentId: string; shareCode: string };
  MatchDetail: { matchId: string };
  TeamDetail: { teamId: string; teamName: string };
  RefereeDashboard: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Search"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563eb',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ title: 'Publiczne Turnieje' }}
        />
        <Stack.Screen
          name="TournamentDetail"
          component={TournamentDetailScreen}
          options={{ title: 'Szczegóły Turnieju' }}
        />
        <Stack.Screen
          name="MatchDetail"
          component={MatchDetailScreen}
          options={{ title: 'Szczegóły Meczu' }}
        />
        <Stack.Screen
          name="TeamDetail"
          component={TeamDetailScreen}
          options={{ title: 'Szczegóły Drużyny' }}
        />
        <Stack.Screen
          name="RefereeDashboard"
          component={RefereeDashboardScreen}
          options={{ title: 'Tryb Sędziego' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
