/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Team } from '../types/team';
import { gameService } from '../services/gameService';
import { TossState } from './TossScreen';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import ActivePlayerSection from '../components/ActivePlayerSection';
import {
  ballsToOver,
  generateBowlingLineup,
  getBallCommentaryFromOutcome,
  getFieldingType,
  getOutType,
  mapToPlayers,
} from '../helper/matchHelper';
import {
  Player,
  ActivePlayersState,
  GameState,
  InningState,
  BowlerState,
  BatsmanState,
  commentaryString,
} from '../types/match';
import BallingSection from '../components/BallingSection';
import { simulateBall } from '../services/matchService';
import ScoreBoard from '../components/ScoreBoard';
import CommentaryBox from '../components/CommentaryBox';
import MatchMusic from '../components/MatchMusic';
import WicketAlert from '../components/WicketAlert';
import InningsAlert, { partialInning } from '../components/InningsAlert';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import FieldingSelection from '../components/FieldingSelection';

type MatchScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Match'
>;

type BowlersById = { [key: string]: BowlerState };

type TabInterface = 'Match' | 'Score';

type LastBallToken = string | null;

type TeamInterface = {
  name: string | undefined;
  logo: string | undefined;
  theme?: string | undefined;
};

export interface inningInterface {
  team1: TeamInterface;
  team2: TeamInterface;
}

type inningsProps = {
  gameEnd: boolean;
  bothTeam: inningInterface | null;
  inning1: partialInning;
  inning2?: partialInning;
};

const MatchScreen = () => {
  const navigation = useNavigation<MatchScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { tossState } = route.params as { tossState: TossState };

  const tabs: TabInterface[] = ['Match', 'Score'];
  const [currentTab, setCurrentTab] = useState<TabInterface>('Match');
  const currentTabIndex = tabs.indexOf(currentTab);

  const [simulateDisable, setsimulateDisable] = useState(false);
  const [wicketAlert, setWicketAlert] = useState(false);
  const [inningsAlert, setInningsAlert] = useState(false);
  const [fieldingModalVisible, setFieldingVisible] = useState(false);

  const [subTitle, setSubtitle] = useState('0.00');

  const [inningProps, setInningProps] = useState<inningsProps | null>(null);
  const [outBatsman, setOutBatsman] = useState<BatsmanState | null>(null);

  const [yourTeam, setYourTeam] = useState<Team | null>(null);
  const [oppTeam, setOppTeam] = useState<Team | null>(null);
  const [yourPlayers, setYourPlayers] = useState<Player[]>([]);
  const [oppPlayers, setOppPlayers] = useState<Player[]>([]);

  const [bothTeam, setBothTeam] = useState<inningInterface | null>(null);

  const [outComeString, setOutcomeString] = useState<commentaryString>({
    result: null,
    commentary: 'Lets get Started',
  });

  const pendingActivePlayers = React.useRef<ActivePlayersState | null>(null);

  const [lastSixBalls, setLastSixBalls] = useState<LastBallToken[]>(
    Array(6).fill(null),
  );

  const [battingOrder, setBattingOrder] = useState<Player[]>([]);
  const [nextBatsmanIndex, setNextBatsmanIndex] = useState(2);
  const [bowlingLineup, setBowlingLineup] = useState<Player[]>([]);
  const [currentBowlerIndex, setCurrentBowlerIndex] = useState(0);

  const [fielding, setFielding] = useState<string>('Attacking 1');
  const [battingTeam, setBattingTeam] = useState<'user' | 'opp' | null>(null);

  const [activePlayers, setActivePlayers] = useState<ActivePlayersState>({
    left: null,
    right: null,
  });

  const initialInning: InningState = {
    runs: 0,
    wickets: 0,
    balls: 0,
    batsmen: [],
    bowlers: {},
    currentBowlerId: '',
  };

  const [gameState, setGameState] = useState<GameState>({
    inning1: initialInning,
    battingTeam: 'user',
    bowlingTeam: 'opp',
    over: 0,
    ballInOver: 0,
    currentInnings: 1,
  });

  const currentInning =
    gameState.currentInnings === 1
      ? gameState.inning1
      : gameState.inning2 ?? initialInning;

  const over = Math.floor(currentInning.balls / 6);
  const currentBowler =
    currentInning.currentBowlerId &&
    currentInning.bowlers[currentInning.currentBowlerId]
      ? currentInning.bowlers[currentInning.currentBowlerId]
      : null;

  useEffect(() => {
    const backAction = () => true;
    const sub = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => sub.remove();
  }, []);

  const getMatchDetail = useCallback(async () => {
    const match = await gameService.getNextMatch();
    if (!match || !match.oppTeam) return;

    console.log(match);
    console.log(tossState);

    setYourTeam(match.yourTeam);
    setOppTeam(match.oppTeam);
    setYourPlayers(mapToPlayers(match.yourPlayers).slice(0, 11));
    setOppPlayers(mapToPlayers(match.oppTeam.players, true).slice(0, 11));
  }, [tossState]);

  useFocusEffect(
    useCallback(() => {
      getMatchDetail();
    }, [getMatchDetail]),
  );

  useEffect(() => {
    if (!tossState || yourPlayers.length === 0 || oppPlayers.length === 0)
      return;

    const userBats =
      (tossState.winner === 'user' && tossState.choice === 'bat') ||
      (tossState.winner === 'opp' && tossState.choice !== 'bat');

    const battingTeam2: 'user' | 'opp' = userBats ? 'user' : 'opp';
    const bowlingTeam: 'user' | 'opp' = userBats ? 'opp' : 'user';

    const localUserTeam = {
      name: yourTeam?.name,
      logo: yourTeam?.logo,
      theme: yourTeam?.themeColor,
    };

    const localOppTeam = {
      name: oppTeam?.name,
      logo: oppTeam?.logo,
      theme: oppTeam?.themeColor,
    };

    setBothTeam({
      team1: userBats ? localUserTeam : localOppTeam,
      team2: userBats ? localOppTeam : localUserTeam,
    });

    const battingLineup = userBats ? yourPlayers : oppPlayers;
    setBattingOrder(battingLineup);

    const initialBatsmen = battingLineup.map((p, index) => ({
      player: p,
      runs: 0,
      balls: 0,
      status: index < 2 ? 'active' : 'inactive',
    }));

    setActivePlayers({
      left: { player: battingLineup[0], aggression: 3, run: 0, ball: 0 },
      right: { player: battingLineup[1], aggression: 3, run: 0, ball: 0 },
    });

    setNextBatsmanIndex(2);

    const bowlingPlayers = generateBowlingLineup(
      userBats ? oppPlayers : yourPlayers,
    );
    setBowlingLineup(bowlingPlayers);
    setCurrentBowlerIndex(0);

    const initialBowlers: BowlersById = {};
    bowlingPlayers.forEach(p => {
      initialBowlers[p.name] = {
        player: p,
        overs: 0,
        balls: 0,
        runs: 0,
        wickets: 0,
      };
    });

    setGameState(prev => ({
      ...prev,
      battingTeam2,
      bowlingTeam,
      inning1: {
        ...prev.inning1,
        runs: 0,
        wickets: 0,
        balls: 0,
        batsmen: initialBatsmen,
        bowlers: initialBowlers,
        currentBowlerId: bowlingPlayers[0]?.name || '',
      },
    }));
  }, [
    tossState,
    yourPlayers,
    oppPlayers,
    yourTeam?.name,
    yourTeam?.logo,
    yourTeam?.themeColor,
    oppTeam?.name,
    oppTeam?.logo,
    oppTeam?.themeColor,
  ]);

  useEffect(() => {
    console.log(gameState.bowlingTeam, over);
    if (gameState.bowlingTeam !== 'opp') return;

    const o = over + 1;

    if (o <= 3) setFielding('Attacking 1');
    else if (o <= 6) setFielding('Attacking 2');
    else if (o <= 10) setFielding('Neutral 1');
    else if (o <= 16) setFielding('Neutral 2');
    else setFielding('Defensive 1');
  }, [over, gameState.bowlingTeam]);

  useEffect(() => {
    if (gameState.bowlingTeam === 'user') {
      console.log('Fielding set to Attacking 1 for user bowling');
      setFielding('Attacking 1');
    }
  }, [gameState.bowlingTeam]);

  const getBallToken = (outcome: any): string => {
    switch (outcome.type) {
      case 'dot':
        return '0';
      case 'run':
        return String(outcome.runs);
      case 'four':
        return '4';
      case 'six':
        return '6';
      case 'wide':
        return 'Wide';
      case 'noBall':
        return 'NB';
      case 'wicket':
        return 'WK';
      case 'legBye':
        return `${outcome.runs}LB`;
      default:
        return '';
    }
  };

  const startSecondInnings = () => {
    const battingIsUser =
      (tossState.winner === 'user' && tossState.choice === 'bat') ||
      (tossState.winner === 'opp' && tossState.choice !== 'bat');

    const newBattingTeam = battingIsUser ? 'opp' : 'user';
    const newBowlingTeam = battingIsUser ? 'user' : 'opp';

    const battingPlayers = newBattingTeam === 'user' ? yourPlayers : oppPlayers;
    const bowlingPlayers = newBowlingTeam === 'user' ? yourPlayers : oppPlayers;

    const initialBatsmen = battingPlayers.map((p, index) => ({
      player: p,
      runs: 0,
      balls: 0,
      status: index < 2 ? 'active' : 'inactive',
    }));

    const bowlingLineup2 = generateBowlingLineup(bowlingPlayers);

    const initialBowlers: BowlersById = {};
    bowlingLineup2.forEach(p => {
      initialBowlers[p.name] = {
        player: p,
        overs: 0,
        balls: 0,
        runs: 0,
        wickets: 0,
      };
    });

    setBattingTeam(newBattingTeam);
    setBattingOrder(battingPlayers);
    setBowlingLineup(bowlingLineup2);
    setCurrentBowlerIndex(0);
    setNextBatsmanIndex(2);
    setLastSixBalls(Array(6).fill(null));
    setOutcomeString({
      result: null,
      commentary: `${bothTeam?.team2.name} needs ${
        gameState.inning1.runs + 1
      } to win`,
    });

    setActivePlayers({
      left: { player: battingPlayers[0], aggression: 3, run: 0, ball: 0 },
      right: { player: battingPlayers[1], aggression: 3, run: 0, ball: 0 },
    });

    setGameState(prev => ({
      ...prev,
      inning2: {
        runs: 0,
        wickets: 0,
        balls: 0,
        batsmen: initialBatsmen,
        bowlers: initialBowlers,
        currentBowlerId: bowlingLineup2[0]?.name || '',
      },
      battingTeam: newBattingTeam,
      bowlingTeam: newBowlingTeam,
      currentInnings: 2,
    }));
    setInningsAlert(false);
  };

  const simulateOneBall = () => {
    if (simulateDisable) return;
    setGameState(prev => {
      const inningKey = prev.currentInnings === 1 ? 'inning1' : 'inning2';

      const baseInning = prev[inningKey] ?? {
        runs: 0,
        wickets: 0,
        balls: 0,
        batsmen: [],
        bowlers: {},
        currentBowlerId: '',
      };

      const inning: InningState = {
        runs: baseInning.runs,
        wickets: baseInning.wickets,
        balls: baseInning.balls,
        batsmen: [...baseInning.batsmen],
        bowlers: { ...baseInning.bowlers },
        currentBowlerId: baseInning.currentBowlerId,
      };
      const maxOvers = 20;
      const maxWickets = 10;
      const isFirstInnings = prev.currentInnings === 1;
      const isSecondInnings = prev.currentInnings === 2;
      const target = prev.inning1.runs + 1;

      if (isSecondInnings && inning.runs >= target) {
        const inning1 = {
          run: gameState.inning1.runs,
          wicket: gameState.inning1.wickets,
          ball: gameState.inning1.balls,
        };

        const inning2 = {
          run: gameState.inning2?.runs ?? 0,
          wicket: gameState.inning2?.wickets ?? 0,
          ball: gameState.inning2?.balls ?? 0,
        };

        setInningProps({
          gameEnd: true,
          bothTeam,
          inning1,
          inning2,
        });
        setInningsAlert(true);
        return prev;
      }

      if (inning.wickets >= maxWickets || inning.balls >= maxOvers * 6) {
        if (isFirstInnings) {
          const inning1 = {
            run: gameState.inning1.runs,
            wicket: gameState.inning1.wickets,
            ball: gameState.inning1.balls,
          };

          setInningProps({
            gameEnd: false,
            bothTeam,
            inning1,
          });
          setInningsAlert(true);
        } else {
          const inning1 = {
            run: gameState.inning1.runs,
            wicket: gameState.inning1.wickets,
            ball: gameState.inning1.balls,
          };

          const inning2 = {
            run: gameState.inning2?.runs ?? 0,
            wicket: gameState.inning2?.wickets ?? 0,
            ball: gameState.inning2?.balls ?? 0,
          };

          setInningProps({
            gameEnd: true,
            bothTeam,
            inning1,
            inning2,
          });
          setInningsAlert(true);
        }

        return prev;
      }

      const bowlerId = inning.currentBowlerId;
      if (!bowlerId || !inning.bowlers[bowlerId]) return prev;

      let left = activePlayers.left;
      let right = activePlayers.right;
      if (!left || !right) return prev;

      const bowler = { ...inning.bowlers[bowlerId] };

      const updateBatsman = (
        batsmen: BatsmanState[],
        playerName: string,
        updater: (b: BatsmanState) => BatsmanState,
      ) => batsmen.map(b => (b.player.name === playerName ? updater(b) : b));

      const outcome = simulateBall(
        {
          battingSkill: left.player.batting,
          aggression: left.aggression as 1 | 2 | 3 | 4 | 5,
          order: 'top',
        },
        { bowlingSkill: bowler.player.bowling, type: 'fast' },
        getFieldingType(fielding),
        {
          phase: over < 6 ? 'powerplay' : over < 16 ? 'middle' : 'death',
          chasing: false,
          wicketsLost: inning.wickets,
        },
      );
      // console.log(outcome);

      const { commentary, outcome: result } =
        getBallCommentaryFromOutcome(outcome);
      setOutcomeString({
        result,
        commentary,
      });

      const token = getBallToken(outcome);

      setLastSixBalls(prev1 => {
        const updated = [...prev1, token];
        return updated.slice(-6);
      });

      const legal = outcome.type !== 'wide' && outcome.type !== 'noBall';
      if (legal) {
        inning.balls += 1;
        bowler.balls += 1;
        if (bowler.balls >= 6) {
          bowler.overs += 1;
          bowler.balls = 0;
        }
      }

      switch (outcome.type) {
        case 'run': {
          inning.runs += outcome.runs;

          left = {
            ...left,
            ball: left.ball + 1,
          };

          if (outcome.legBye) {
            inning.batsmen = updateBatsman(
              inning.batsmen,
              left.player.name,
              b => ({
                ...b,
                balls: b.balls + 1,
              }),
            );
          } else {
            bowler.runs += outcome.runs;

            left = {
              ...left,
              run: left.run + outcome.runs,
            };

            inning.batsmen = updateBatsman(
              inning.batsmen,
              left.player.name,
              b => ({
                ...b,
                runs: b.runs + outcome.runs,
                balls: b.balls + 1,
              }),
            );
          }

          if (outcome.runs % 2 === 1) {
            [left, right] = [right, left];
          }

          break;
        }
        case 'four':
          inning.runs += 4;
          bowler.runs += 4;

          left = {
            ...left,
            run: left.run + 4,
            ball: left.ball + 1,
          };

          inning.batsmen = updateBatsman(
            inning.batsmen,
            left.player.name,
            b => ({
              ...b,
              runs: b.runs + 4,
              balls: b.balls + 1,
            }),
          );
          break;

        case 'six':
          inning.runs += 6;
          bowler.runs += 6;

          left = {
            ...left,
            run: left.run + 6,
            ball: left.ball + 1,
          };

          inning.batsmen = updateBatsman(
            inning.batsmen,
            left.player.name,
            b => ({
              ...b,
              runs: b.runs + 6,
              balls: b.balls + 1,
            }),
          );
          break;

        case 'dot':
          left = {
            ...left,
            ball: left.ball + 1,
          };

          inning.batsmen = updateBatsman(
            inning.batsmen,
            left.player.name,
            b => ({
              ...b,
              balls: b.balls + 1,
            }),
          );
          break;

        case 'wicket': {
          inning.wickets += 1;

          const { text, bowlerGetsWicket } = getOutType({
            wicketType: outcome.wicketType,
            bowler: bowler.player,
            fieldingTeam: bowlingLineup,
          });

          if (bowlerGetsWicket) {
            bowler.wickets += 1;
          }

          left = {
            ...left,
            ball: left.ball + 1,
          };

          setOutBatsman({
            player: left.player,
            runs: left.run,
            balls: left.ball,
            status: 'out',
            outType: text,
          });

          inning.batsmen = updateBatsman(
            inning.batsmen,
            left.player.name,
            b => ({
              ...b,
              balls: b.balls + 1,
              status: 'out',
              outType: text,
            }),
          );

          if (nextBatsmanIndex < battingOrder.length) {
            const nextPlayer = battingOrder[nextBatsmanIndex];

            const nextBatsmanInInning = inning.batsmen.find(
              b => b.player.name === nextPlayer.name,
            );

            if (nextBatsmanInInning) {
              inning.batsmen = updateBatsman(
                inning.batsmen,
                nextPlayer.name,
                b => ({
                  ...b,
                  status: 'active',
                }),
              );

              const newLeft = {
                player: nextPlayer,
                aggression: 3,
                run: nextBatsmanInInning.runs,
                ball: nextBatsmanInInning.balls,
              };

              pendingActivePlayers.current = {
                left: newLeft,
                right,
              };

              left = newLeft;
              setNextBatsmanIndex(p => p + 1);
            }
          }

          setsimulateDisable(true);
          setWicketAlert(true);
          break;
        }
        case 'wide':
          inning.runs += 1;
          bowler.runs += 1;
          break;
        case 'noBall':
          inning.runs += 1;
          bowler.runs += 1;
          break;
      }

      if (legal && inning.balls % 6 === 0) {
        [left, right] = [right, left];

        const nextIndex = (currentBowlerIndex + 1) % bowlingLineup.length;
        inning.currentBowlerId =
          bowlingLineup[nextIndex]?.name || inning.currentBowlerId;
        setCurrentBowlerIndex(nextIndex);
      }

      inning.bowlers[bowlerId] = bowler;
      setActivePlayers({ left, right });

      return {
        ...prev,
        [inningKey]: inning,
      };
    });
  };

  const goLeftTab = () => {
    const nextIndex = (currentTabIndex - 1 + tabs.length) % tabs.length;
    setCurrentTab(tabs[nextIndex]);
  };

  const goRightTab = () => {
    const nextIndex = (currentTabIndex + 1) % tabs.length;
    setCurrentTab(tabs[nextIndex]);
  };

  const closeInningAlert = () => {
    if (gameState.currentInnings === 1) {
      startSecondInnings();
    } else {
      setInningsAlert(false);
      navigation.navigate('MatchSummary', { state: gameState, bothTeam });
    }
  };

  const totalOvers = 20;
  const totalBalls = totalOvers * 6;
  const targetRuns = gameState.inning1.runs + 1;
  const remaining = targetRuns - currentInning.runs;

  const currentRunRate: string = `Run Rate ${
    currentInning.balls > 0
      ? ((currentInning.runs / currentInning.balls) * 6).toFixed(2)
      : '0.00'
  }`;

  const requiredRunRate: string = `Required Run Rate ${
    currentInning.balls > 0 && totalBalls - currentInning.balls > 0
      ? (
          ((targetRuns - currentInning.runs) /
            (totalBalls - currentInning.balls)) *
          6
        ).toFixed(2)
      : '0.00'
  }`;

  const targettRun: string = `${remaining} runs to win`;

  useEffect(() => {
    const subtitles = [currentRunRate, requiredRunRate, targettRun];

    let index = 0;
    setSubtitle(subtitles[index]);

    const interval = setInterval(() => {
      index = (index + 1) % subtitles.length;
      setSubtitle(subtitles[index]);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentRunRate, requiredRunRate, targettRun]);

  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { height: insets.top }]} />
      <View
        style={{
          alignItems: 'center',
          backgroundColor: '#333333ff',
          justifyContent: 'center',
          paddingVertical: 5,
          paddingHorizontal: 10,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 24 }}>
          {currentInning &&
            `${currentInning.runs}/${currentInning.wickets} (${ballsToOver(
              currentInning.balls,
            )})`}
        </Text>
      </View>
      <View style={styles.subTitleContainer}>
        <Text style={{ color: '#fff', fontSize: 18 }}>
          {gameState.currentInnings === 1 ? currentRunRate : subTitle}
        </Text>
      </View>
      <CommentaryBox outcomeString={outComeString} />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 15,
          marginVertical: 10,
        }}
      >
        <TouchableOpacity onPress={goLeftTab}>
          <Icons name="menu-left" size={40} color="#fff" />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setCurrentTab(tab)}
              activeOpacity={0.8}
            >
              <View
                style={{
                  width: currentTabIndex === index ? 10 : 8,
                  height: currentTabIndex === index ? 10 : 8,
                  borderRadius: 10,
                  backgroundColor: currentTabIndex === index ? '#fff' : '#777',
                }}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={goRightTab}>
          <Icons name="menu-right" size={40} color="#fff" />
        </TouchableOpacity>
      </View>

      {currentTab === 'Match' && (
        <>
          <ActivePlayerSection
            activePlayers={activePlayers}
            batting={battingTeam}
            theme={
              battingTeam === 'user'
                ? yourTeam?.themeColor
                : oppTeam?.themeColor
            }
            onChangeAggression={(side, newLevel) => {
              setActivePlayers(prev => {
                const currentPlayer = prev[side];
                if (!currentPlayer) return prev;
                return {
                  ...prev,
                  [side]: {
                    ...currentPlayer,
                    aggression: newLevel,
                  },
                };
              });
            }}
          />

          <View style={styles.ballingWrapper}>
            {currentBowler && (
              <BallingSection
                bowler={currentBowler}
                batting={battingTeam}
                fielding={fielding}
                theme={
                  battingTeam === 'user'
                    ? oppTeam?.themeColor
                    : yourTeam?.themeColor
                }
                onOk={() => {
                  setsimulateDisable(true);
                  setFieldingVisible(true);
                }}
              />
            )}

            <View
              style={{
                paddingLeft: 15,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginBottom: 10,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16 }}>LAST 6 BALLS</Text>
              <View style={{ paddingHorizontal: 5 }}>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  {lastSixBalls.map((ball, index) => (
                    <View
                      key={index}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor:
                          ball === 'WK'
                            ? '#ff0766cb'
                            : ball === '4' || ball === '6'
                            ? '#1faa59'
                            : '#2f2e2eff',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: 12,
                        }}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {ball ?? '-'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
          <View style={styles.bottomButtonsContainer}>
            <TouchableOpacity
              style={styles.mainButton}
              activeOpacity={0.8}
              onPress={simulateOneBall}
            >
              <Text style={{ color: '#fff', fontSize: 21, fontWeight: '900' }}>
                Simulate
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {currentTab === 'Score' && (
        <ScoreBoard state={gameState} bothTeam={bothTeam} />
      )}
      <WicketAlert
        visible={wicketAlert}
        batsman={outBatsman}
        theme={
          battingTeam === 'opp' ? oppTeam?.themeColor : yourTeam?.themeColor
        }
        onOk={() => {
          if (pendingActivePlayers.current) {
            setActivePlayers(pendingActivePlayers.current);
            pendingActivePlayers.current = null;
          }
          setWicketAlert(false);
          setsimulateDisable(false);
          setOutBatsman(null);
        }}
      />
      <InningsAlert
        visible={inningsAlert}
        gameEnd={inningProps?.gameEnd ?? false}
        bothTeam={bothTeam}
        inning1={inningProps?.inning1 ?? { run: 0, wicket: 0, ball: 0 }}
        inning2={inningProps?.inning2 ?? { run: 0, wicket: 0, ball: 0 }}
        onOk={closeInningAlert}
      />
      <FieldingSelection
        visible={fieldingModalVisible}
        onOk={(selectedFielding: string) => {
          setFielding(selectedFielding);
          setFieldingVisible(false);
          setsimulateDisable(false);
        }}
        over={over}
      />
      <MatchMusic />
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
  subTitleContainer: {
    alignItems: 'center',
    backgroundColor: '#333333ff',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 15,
    marginTop: 5,
  },
  ballingWrapper: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    gap: 20,
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    height: 80,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  mainButton: {
    width: '100%',
    backgroundColor: '#ff0766cb',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MatchScreen;
