import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import HomeScreen from '../screens/HomeScreen';
import SettingScreen from '../screens/SettingScreen';
import TeamSelectionScreen from '../screens/TeamSelectionScreen';
import DashboardScreen from '../screens/DashboardScreen';
import StandingsScreen from '../screens/StandingsScreen';
import SquadScreen from '../screens/SquadScreen';
import PlayerStatistics from '../screens/PlayerStatistics';
import HistoryScreen from '../screens/HistoryScreen';
import FixturesScreen from '../screens/FixturesScreen';
import ClubScreen from '../screens/ClubScreen';
import MatchCenterScreen from '../screens/MatchCenterScreen';
import TossScreen from '../screens/TossScreen';
import MatchScreen from '../screens/MatchScreen';
import MatchSummaryScreen from '../screens/MatchSummaryScreen';
import StatisticsScreen from '../screens/StatisticsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={'Home'}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Settings" component={SettingScreen} />
      <Stack.Screen name="TeamSelection" component={TeamSelectionScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Standings" component={StandingsScreen} />
      <Stack.Screen name="Squad" component={SquadScreen} />
      <Stack.Screen name="PlayerStats" component={PlayerStatistics} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Fixtures" component={FixturesScreen} />
      <Stack.Screen name="Club" component={ClubScreen} />
      <Stack.Screen name="MatchCenter" component={MatchCenterScreen} />
      <Stack.Screen name="Toss" component={TossScreen} />
      <Stack.Screen name="Match" component={MatchScreen} />
      <Stack.Screen name="MatchSummary" component={MatchSummaryScreen} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
