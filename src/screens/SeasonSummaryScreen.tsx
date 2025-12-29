/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/types';
import { GameEndResult } from '../database/standings';
import DBConfig from '../database/dbconfig';
import StandingsDB from '../database/standings';
import userPlayersDB, { UserPlayerStat } from '../database/userPlayersDB';
import { teamLogos } from '../database/assets';
import { Yak } from '../assets';
import { commonStyles } from '../styles/commonStyles';
import HistoryDB from '../database/historyDB';
import FixturesDB from '../database/fixturesDB';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SeasonSummary'
>;

const SeasonSummaryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const route = useRoute();

  const { result } = route.params as { result: GameEndResult };

  const [yourTeam, setYourTeam] = useState<string | null>(null);
  const [teamStanding, setTeamStanding] = useState<any | null>(null);
  const [topRun, setTopRun] = useState<UserPlayerStat | null>(null);
  const [topWicket, setTopWicket] = useState<UserPlayerStat | null>(null);

  const loadUserTeam = async () => {
    const team = await DBConfig.getSelectedUserTeam();
    if (team) setYourTeam(team);
  };

  useEffect(() => {
    const endSeason = async () => {
      try {
        const year = new Date().getFullYear().toString();
        const nextYear = (new Date().getFullYear() + 1).toString();
        const team = await StandingsDB.getTeamByPosition(1);
        if (!team) {
          console.error('No team found for position 1');
          return;
        }

        await HistoryDB.updateWinner(
          year,
          team.name,
          team.logo,
          team.themeColor,
        );

        await HistoryDB.setOngoing(nextYear, true);

        await StandingsDB.resetStandingsStats();
        await userPlayersDB.resetSeasonStats();
        await FixturesDB.resetFixturesStats();
      } catch (error) {
        console.log('error ending season', error);
      }
    };

    endSeason();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserTeam();
    }, []),
  );

  useEffect(() => {
    if (!yourTeam || !result.gameEnded) return;

    const teamResult = result.teams.find(t => t.name === yourTeam);
    const won = teamResult?.position === 1;

    if (won) {
      Alert.alert('🏆 Congratulations!', 'You won the season!', [
        { text: 'OK' },
      ]);
    }
  }, [yourTeam, result]);

  /* -------------------- STANDINGS -------------------- */
  useEffect(() => {
    const loadStanding = async () => {
      if (!yourTeam) return;
      const standings = await StandingsDB.getStandings();
      const myTeam = standings.find(t => t.name === yourTeam);
      setTeamStanding(myTeam);
    };

    loadStanding();
  }, [yourTeam]);

  /* -------------------- STATS -------------------- */
  useEffect(() => {
    const loadStats = async () => {
      const bats = await userPlayersDB.getStatistics('Season', 'Bat');
      const bowls = await userPlayersDB.getStatistics('Season', 'Ball');

      if (bats.length > 0) {
        setTopRun(bats.reduce((a, b) => (b.stat > a.stat ? b : a)));
      }

      if (bowls.length > 0) {
        setTopWicket(bowls.reduce((a, b) => (b.stat > a.stat ? b : a)));
      }
    };

    loadStats();
  }, []);

  /* -------------------- UI -------------------- */
  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { height: insets.top }]} />

      <View style={commonStyles.titleContainer}>
        <Text style={commonStyles.titleText}>Season Summary</Text>
      </View>

      {/* -------- USER TEAM STANDING -------- */}
      {teamStanding && (
        <View
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#333333ff',
            padding: 10,
            marginTop: 30,
            gap: 20,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>Your Standings</Text>

          <View
            style={[
              styles.tableRow,
              { backgroundColor: teamStanding.themeColor || '#444' },
            ]}
          >
            <View style={styles.teamInfo}>
              {/* POSITION */}
              <Text style={styles.positionText}>{teamStanding.position}.</Text>

              {/* LOGO */}
              <Image
                source={teamStanding.logo ? teamLogos[teamStanding.logo] : Yak}
                style={styles.logo}
              />

              {/* TEAM NAME */}
              <Text style={styles.teamName}>{teamStanding.name}</Text>
            </View>

            <Text style={styles.cell}>
              {teamStanding.win + teamStanding.lose + teamStanding.tie}
            </Text>
            <Text style={styles.cell}>{teamStanding.win}</Text>
            <Text style={styles.cell}>{teamStanding.lose}</Text>
            <Text style={styles.cell}>{teamStanding.tie}</Text>
            <Text style={styles.cell}>{teamStanding.points}</Text>
            <Text style={styles.cell}>{teamStanding.nrr.toFixed(2)}</Text>
          </View>
        </View>
      )}

      {/* -------- STATS -------- */}
      <View
        style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#333333ff',
          padding: 10,
          marginTop: 50,
          gap: 20,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>Your Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>Top Run Scorer</Text>
            <Text style={styles.statName}>{topRun?.name}</Text>
            <Text style={styles.statValue}>{topRun?.stat} Runs</Text>
          </View>

          <View
            style={[
              styles.statBox,
              { borderLeftWidth: 1, borderLeftColor: '#80808062' },
            ]}
          >
            <Text style={styles.statTitle}>Top Wicket Taker</Text>
            <Text style={styles.statName}>{topWicket?.name}</Text>
            <Text style={styles.statValue}>{topWicket?.stat} Wickets</Text>
          </View>
        </View>
        <TouchableOpacity
          style={{
            paddingHorizontal: 15,
            paddingVertical: 8,
            marginTop: 10,
            backgroundColor: '#ff0766cb',
          }}
          onPress={() => navigation.navigate('Statistics')}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>Statistics</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={commonStyles.backButton}
        onPress={() => navigation.navigate('Dashboard')}
        activeOpacity={0.8}
      >
        <Text style={commonStyles.backButoonText}>End Season</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SeasonSummaryScreen;

const styles = StyleSheet.create({
  statusBar: {
    backgroundColor: 'black',
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#242424ff',
    paddingBottom: 50,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    width: '100%',
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 3,
  },
  positionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  },

  logo: {
    width: 40,
    height: 40,
  },
  teamName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cell: {
    flex: 0.7,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#333',
    padding: 15,
    alignItems: 'center',
  },
  statTitle: {
    color: '#aaa',
    fontSize: 14,
  },
  statName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
  statValue: {
    color: '#1faa59',
    fontSize: 16,
    marginTop: 5,
  },
  primaryBtn: {
    marginTop: 25,
    backgroundColor: '#1faa59',
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: '90%',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff0766cb',
    padding: 15,
    zIndex: 10,
  },
});
