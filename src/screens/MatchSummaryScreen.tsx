/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { commonStyles } from '../styles/commonStyles';
import { GameState } from '../types/match';
import { inningInterface } from './MatchScreen';
import { teamLogos } from '../database/assets';
import { Yak } from '../assets';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import ScoreBoard from '../components/ScoreBoard';
import userPlayersDB, { UpdatePlayerStats } from '../database/userPlayersDB';
import StandingsDB from '../database/standings';
import FixturesDB from '../database/fixturesDB';

type MatchSummaryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MatchSummary'
>;

interface MOTM {
  name: string;
  run: number;
  wicket: number;
  points: number;
}

type TabInterface = 'Summary' | 'Score';

const MatchSummaryScreen = () => {
  const navigation = useNavigation<MatchSummaryScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { state, bothTeam } = route.params as {
    state: GameState;
    bothTeam: inningInterface;
  };
  const [currentTab, setCurrentTab] = useState<TabInterface>('Summary');
  const [playersStats, setPlayersStats] = useState<UpdatePlayerStats[]>([]);
  const [standing, setStanding] = useState<{ winner: string; nrr: number }>({
    winner: '',
    nrr: 0,
  });

  const runDiff = state.inning1.runs - (state.inning2?.runs ?? 0);
  const themeColour: string | undefined =
    runDiff > 0 ? bothTeam.team1.theme : bothTeam.team2.theme;
  const wicketDiff = 10 - (state.inning2?.wickets ?? 0);
  const winner: string =
    runDiff > 0
      ? bothTeam?.team1.name ?? 'Team 1'
      : bothTeam?.team2.name ?? 'Team 2';
  const winBy: string =
    runDiff > 0 ? `${runDiff} run` : `${wicketDiff} wickets`;
  const winText: string = `${winner} won by ${winBy}`;

  const oversFaced1 = (state.inning1.balls ?? 0) / 6;
  const oversFaced2 = (state.inning2?.balls ?? 0) / 6;

  const team1NRR = oversFaced1
    ? state.inning1.runs / oversFaced1 -
      (state.inning2?.runs ?? 0) / (oversFaced2 || 1)
    : 0;

  const team2NRR = oversFaced2
    ? (state.inning2?.runs ?? 0) / oversFaced2 -
      state.inning1.runs / (oversFaced1 || 1)
    : 0;

  const winnerNRR = runDiff > 0 ? team1NRR : team2NRR;

  useEffect(() => {
    const backAction = () => true;
    const sub = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    let battingTeam = state.battingTeam;
    let batsmen: any[] = [];
    let bowlers: any[] = [];

    if (battingTeam === 'opp') {
      batsmen = state.inning1.batsmen;
      bowlers = Object.values(state.inning2?.bowlers ?? {});
    } else {
      batsmen = state.inning2?.batsmen ?? [];
      bowlers = Object.values(state.inning1.bowlers);
    }

    console.log('Batsmen:', batsmen);
    console.log('Bowlers:', bowlers);

    const statsMap = new Map<string, UpdatePlayerStats>();

    batsmen.forEach(b => {
      const name = b.player.name;
      const existing = statsMap.get(name);

      if (existing) {
        existing.runs += b.runs ?? 0;
      } else {
        statsMap.set(name, {
          name,
          runs: b.runs ?? 0,
          wickets: 0,
        });
      }
    });

    bowlers.forEach(b => {
      const name = b.player.name;
      const existing = statsMap.get(name);

      if (existing) {
        existing.wickets += b.wickets ?? 0;
      } else {
        statsMap.set(name, {
          name,
          runs: 0,
          wickets: b.wickets ?? 0,
        });
      }
    });

    const mergedStats = Array.from(statsMap.values());

    console.log('Merged Player Stats:', mergedStats);
    setPlayersStats(mergedStats);

    setStanding({
      winner,
      nrr: winnerNRR,
    });
  }, [
    state.battingTeam,
    state.inning1.batsmen,
    state.inning1.bowlers,
    state.inning2?.batsmen,
    state.inning2?.bowlers,
    winner,
    winnerNRR,
  ]);

  const calculateMOTM = (state2: GameState): MOTM | null => {
    if (!state2.inning1 || !state2.inning2) return null;

    const difference = state2.inning1.runs - (state2.inning2.runs ?? 0);

    const winningInning = difference > 0 ? state2.inning1 : state2.inning2;
    const losingInning = difference > 0 ? state2.inning2 : state2.inning1;

    const losingBowlerPoints = new Map<string, number>();
    Object.values(losingInning.bowlers).forEach(bowler => {
      if (bowler.player.role === 'BOWL' || bowler.player.role === 'AR') {
        losingBowlerPoints.set(bowler.player.name, bowler.wickets * 10);
      }
    });

    const playersPoints = winningInning.batsmen
      .filter(
        player => player.player.role === 'AR' || player.player.role === 'BOWL',
      )
      .map(player => {
        const runPoints = player.runs || 0;

        const bowlerInWinning = losingInning.bowlers[player.player.name];
        const wicketsPointsFromWinning = bowlerInWinning?.wickets
          ? bowlerInWinning.wickets * 10
          : 0;

        const bowlerPointsFromOpp =
          losingBowlerPoints.get(player.player.name) || 0;

        const totalPoints =
          runPoints + wicketsPointsFromWinning + bowlerPointsFromOpp;

        return {
          name: player.player.name,
          run: runPoints,
          wicket: bowlerInWinning?.wickets || 0,
          points: totalPoints,
        };
      });

    if (playersPoints.length === 0) return null;

    const motm = playersPoints.reduce((prev, curr) =>
      curr.points > prev.points ? curr : prev,
    );

    return motm;
  };

  const teams = [
    { team: bothTeam?.team1, inning: state.inning1 },
    { team: bothTeam?.team2, inning: state.inning2 },
  ];

  useEffect(() => {
    console.log(playersStats);
    console.log(standing);
  }, [playersStats, standing]);

  const endGame = async () => {
    try {
      const yourRun =
        state.battingTeam === 'user' ? state.inning2?.runs : state.inning1.runs;
      const oppRun =
        state.battingTeam === 'user' ? state.inning1.runs : state.inning2?.runs;
      const yourWicket =
        state.battingTeam === 'user'
          ? state.inning2?.wickets
          : state.inning1.wickets;
      const oppWicket =
        state.battingTeam === 'user'
          ? state.inning1.wickets
          : state.inning2?.wickets;

      await userPlayersDB.updateUserPlayers(playersStats);

      const result = await StandingsDB.updateStanding(
        bothTeam.team1.name ?? 'Team 1',
        bothTeam.team2.name ?? 'Team 2',
        standing.winner,
        standing.nrr,
      );

      await FixturesDB.markFirstIncompleteFixtureCompleted(
        yourRun ?? 0,
        yourWicket ?? 0,
        oppRun ?? 0,
        oppWicket ?? 0,
        winText,
      );

      if (result.gameEnded) {
        console.log(result.teams);
        navigation.navigate('SeasonSummary', { result });
      } else {
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      console.error('❌ Error ending game:', error);
    }
  };

  const motm = calculateMOTM(state);

  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { height: insets.top }]} />

      {currentTab === 'Summary' && (
        <>
          <View style={commonStyles.titleContainer}>
            <Text style={commonStyles.titleText}>Summary</Text>
          </View>
          <View
            style={{
              marginVertical: 30,
              width: '100%',
              padding: 10,
              gap: 10,
            }}
          >
            {teams.map(({ team, inning }, index) => (
              <View key={index} style={styles.teamSection}>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    source={team?.logo ? teamLogos[team.logo] : Yak}
                    style={{ width: 60, height: 70 }}
                  />
                  <Text style={[styles.teamText, { fontSize: 20 }]}>
                    {team?.name}
                  </Text>
                </View>
                <View
                  style={{ justifyContent: 'center', alignItems: 'center' }}
                >
                  <Text style={[styles.teamText, { fontSize: 20 }]}>
                    {inning?.runs ?? 0} / {inning?.wickets ?? 0}
                  </Text>
                  <Text style={styles.teamText}>
                    ({Math.floor((inning?.balls ?? 0) / 6)}.
                    {(inning?.balls ?? 0) % 6})
                  </Text>
                </View>
              </View>
            ))}
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                paddingTop: 10,
              }}
            >
              {winText}
            </Text>
          </View>
          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#333333ff',
              padding: 10,
            }}
          >
            <Text style={[styles.teamText, { fontSize: 22 }]}>
              Man of the Match
            </Text>
            <View
              style={{
                marginTop: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icons name="tshirt-crew" size={100} color={themeColour} />

              <Text
                style={{ color: '#fff', fontSize: 18, textAlign: 'center' }}
              >
                {motm?.name}
              </Text>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  marginBottom: 10,
                  textAlign: 'center',
                }}
              >
                Runs: {motm?.run ?? 0}
                {(motm?.wicket ?? 0) > 0 &&
                  ` ${'      '}Wickets: ${motm?.wicket ?? 0}`}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                paddingHorizontal: 15,
                paddingVertical: 8,
                marginTop: 10,
                backgroundColor: '#ff0766cb',
              }}
              onPress={() => setCurrentTab('Score')}
            >
              <Text style={styles.teamText}>ScoreCard</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={commonStyles.backButton}
            onPress={endGame}
            activeOpacity={0.8}
          >
            <Text style={commonStyles.backButoonText}>End Game</Text>
          </TouchableOpacity>
        </>
      )}
      {currentTab === 'Score' && (
        <View
          style={{
            flex: 1,
            width: '100%',
            paddingTop: 100,
            position: 'relative',
          }}
        >
          <ScoreBoard state={state} bothTeam={bothTeam} />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentTab('Summary')}
            activeOpacity={0.8}
          >
            <Text style={commonStyles.backButoonText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    backgroundColor: 'black',
    width: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#242424ff',
    paddingBottom: 50,
  },
  teamSection: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  teamText: {
    color: '#fff',
    fontSize: 16,
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

export default MatchSummaryScreen;
