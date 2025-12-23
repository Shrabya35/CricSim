/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { commonStyles } from '../styles/commonStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Avenger,
  Bolts,
  Gurkhas,
  Kings,
  Lion,
  Rhino,
  Royals,
  Yak,
} from '../assets';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import DBConfig from '../database/dbconfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
import StandingsDB from '../database/standings';
import userPlayersDB from '../database/userPlayersDB';
import HistoryDB from '../database/historyDB';
import FixturesDB from '../database/fixturesDB';

const Teams = [
  { name: 'Avengers', theme: '#4f0021', logo: Avenger },
  { name: 'Bolts', theme: '#da327c', logo: Bolts },
  { name: 'Gurkhas', theme: '#762485ff', logo: Gurkhas },
  { name: 'Kings', theme: '#002a6f', logo: Kings },
  { name: 'Lions', theme: '#f20d0dff', logo: Lion },
  { name: 'Rhinos', theme: '#cc682d', logo: Rhino },
  { name: 'Royals', theme: '#ffd147ff', logo: Royals },
  { name: 'Yaks', theme: '#22ccffff', logo: Yak },
];

type TeamSelectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TeamSelection'
>;

const TeamSelectionScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TeamSelectionScreenNavigationProp>();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const backAction = () => {
      navigation.replace('Home');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const initTeamTable = async () => {
      try {
        await DBConfig.initMasterTeamsTable();
        await StandingsDB.initStandingsTable();
        await userPlayersDB.initUserPlayersTable();
        await FixturesDB.initFixturesTable();
      } catch (error) {
        console.log('Error initializing master_teams table:', error);
      }
    };

    initTeamTable();
  }, []);

  const startGame = async () => {
    try {
      setLoading(true);

      const MIN_LOADING_TIME = 1200;

      const start = Date.now();

      const teamsSeeded = await DBConfig.seedTeams();
      await StandingsDB.seedTeams(teamsSeeded);
      if (selectedTeam) {
        const teams = await DBConfig.getTeamByName(selectedTeam);
        console.log('Full team object:', teams);

        if (teams) {
          const { players } = teams;

          const userPlayers = players.map((player, index) => ({
            ...player,
            position: index + 1,
            played: 0,
            totalPlayed: 0,
            runs: 0,
            wickets: 0,
            totalRuns: 0,
            totalWickets: 0,
          }));

          await userPlayersDB.seedPlayers(userPlayers);
        }
        await HistoryDB.initHistoryTable();

        await DBConfig.startGame(selectedTeam);
        await FixturesDB.setFixtures(selectedTeam);
      }

      const elapsed = Date.now() - start;
      const remaining = MIN_LOADING_TIME - elapsed;

      if (remaining > 0) {
        await new Promise(resolve =>
          setTimeout(() => resolve(null), remaining),
        );
      }

      setLoading(false);
      navigation.replace('Dashboard');
    } catch (error) {
      console.error('Error starting game:', error);
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.titleContainer}>
        <Text style={commonStyles.titleText}>Select Your Team</Text>
      </View>

      <View style={styles.middleContent}>
        <View style={styles.grid}>
          {Teams.map((team, index) => {
            const isSelected = selectedTeam === team.name;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.teamCard,
                  { backgroundColor: isSelected ? team.theme : '#333' },
                ]}
                onPress={() => setSelectedTeam(team.name)}
                activeOpacity={0.8}
              >
                <Image source={team.logo} style={styles.logo} />
                <Text style={{ color: 'white', marginTop: 6 }}>
                  {team.name}
                </Text>
                {isSelected && (
                  <Icons
                    name="check-circle"
                    size={26}
                    color="#fff"
                    style={styles.tick}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {selectedTeam && (
        <View style={styles.okButtonContainer}>
          <TouchableOpacity
            style={styles.okButton}
            onPress={startGame}
            activeOpacity={0.8}
          >
            <Text style={{ color: 'white', fontSize: 18 }}>OK</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Starting New Game...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242424',
    paddingHorizontal: 30,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  middleContent: {
    flex: 1,
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  teamCard: {
    width: '48%',
    height: 140,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    position: 'relative',
  },
  logo: {
    width: 60,
    height: 60,
  },
  tick: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  okButtonContainer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  okButton: {
    backgroundColor: '#ff0766cb',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 12,
  },
});

export default TeamSelectionScreen;
