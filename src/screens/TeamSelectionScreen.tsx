/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
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
  Nepal,
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

const TeamCoordinates: Record<string, { x: number; y: number }> = {
  Avengers: { x: 0.48, y: 0.5 },
  Bolts: { x: 0.67, y: 0.84 },
  Gurkhas: { x: 0.68, y: 0.67 },
  Kings: { x: 0.9, y: 0.9 },
  Lions: { x: 0.33, y: 0.55 },
  Rhinos: { x: 0.56, y: 0.68 },
  Royals: { x: 0.12, y: 0.3 },
  Yaks: { x: 0.28, y: 0.3 },
};

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
  const [selectedTeam, setSelectedTeam] = useState<string | null>(
    Teams[0].name,
  );
  const [loading, setLoading] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [markerPosition, setMarkerPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);

  const updateMarkerPosition = useCallback(() => {
    if (
      !selectedTeam ||
      imageDimensions.width === 0 ||
      imageDimensions.height === 0
    ) {
      setMarkerPosition(null);
      return;
    }
    const coords = TeamCoordinates[selectedTeam];
    if (!coords) {
      setMarkerPosition(null);
      return;
    }
    const left = coords.x * imageDimensions.width;
    const top = coords.y * imageDimensions.height;
    setMarkerPosition({ left, top });
  }, [selectedTeam, imageDimensions]);

  useEffect(() => {
    updateMarkerPosition();
  }, [selectedTeam, imageDimensions, updateMarkerPosition]);

  const onImageLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setImageDimensions({ width, height });
  };

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
    let teamToUse = selectedTeam;
    if (!teamToUse) {
      teamToUse = Teams[0].name;
      setSelectedTeam(teamToUse);
    }
    try {
      setLoading(true);
      const MIN_LOADING_TIME = 1200;
      const start = Date.now();

      const teamsSeeded = await DBConfig.seedTeams();
      await StandingsDB.seedTeams(teamsSeeded);

      const teams = await DBConfig.getTeamByName(teamToUse);
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
      await DBConfig.startGame(teamToUse);
      await FixturesDB.setFixtures(teamToUse);

      const elapsed = Date.now() - start;
      const remaining = MIN_LOADING_TIME - elapsed;
      if (remaining > 0) {
        await new Promise<void>(resolve => setTimeout(resolve, remaining));
      }
      setLoading(false);
      navigation.replace('Dashboard');
    } catch (error) {
      console.error('Error starting game:', error);
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.replace('Home');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Choose Your Team</Text>
      </View>

      <View style={styles.mapWrapper}>
        <View style={styles.mapInner} onLayout={onImageLayout}>
          <Image source={Nepal} style={styles.mapImage} resizeMode="contain" />
          {markerPosition && (
            <View
              style={[
                styles.marker,
                {
                  left: markerPosition.left - 12,
                  top: markerPosition.top - 20,
                },
              ]}
            >
              <Icons name="map-marker" size={24} color="#ff0766cb" />
            </View>
          )}
        </View>
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {Teams.map((team, index) => {
            const isSelected = selectedTeam === team.name;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.teamCard,
                  { backgroundColor: isSelected ? team.theme : '#2a2a2a' },
                  isSelected && styles.selectedTeamCard,
                ]}
                onPress={() => setSelectedTeam(team.name)}
                activeOpacity={0.8}
              >
                <Image source={team.logo} style={styles.logo} />
                <Text style={styles.teamName}>{team.name}</Text>
                {isSelected && (
                  <Icons
                    name="check-circle"
                    size={24}
                    color="#fff"
                    style={styles.tick}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={startGame}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ff0766cb" />
          <Text style={styles.loadingText}>Starting New Game...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  titleContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ff0766cb',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  mapWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  mapInner: {
    flex: 1,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  marker: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  teamCard: {
    width: (Dimensions.get('window').width - 48) / 2 - 8,
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  selectedTeamCard: {
    borderWidth: 2,
    borderColor: '#ffcc00',
    transform: [{ scale: 1.02 }],
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  teamName: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  tick: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    height: 70,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  backButton: {
    width: '35%',
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    width: '65%',
    backgroundColor: '#ff0766cb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '900',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 12,
    fontWeight: '600',
  },
});

export default TeamSelectionScreen;
