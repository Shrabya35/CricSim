/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  BackHandler,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { commonStyles } from '../styles/commonStyles';
import { teamLogos } from '../database/assets';
import { Team } from '../types/team';
import { gameService } from '../services/gameService';
import WinMeter from '../components/WinMeter';
import { Stadium, Clear } from '../assets';
import { UserPlayers } from '../database/userPlayersDB';
import { Head, Tail, Coin } from '../assets';

type TossScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Toss'
>;

export type TossState = {
  winner: 'user' | 'opp';
  choice: 'bat' | 'ball' | null;
};

const TossScreen = () => {
  const navigation = useNavigation<TossScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [tossModalVisible, setTossModalVisible] = useState(false);
  const [userCall, setUserCall] = useState<'HEAD' | 'TAIL' | null>(null);
  const [tossOutcome, setTossOutcome] = useState<'HEAD' | 'TAIL' | null>(null);
  const [tossDone, setTossDone] = useState(false);

  const [tossState, setTossState] = useState<TossState | null>(null);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const [yourTeam, setYourTeam] = useState<Team | null>(null);
  const [oppTeam, setOppTeam] = useState<Team | null>(null);
  const [yourPlayers, setYourPlayers] = useState<UserPlayers[]>([]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '7200deg'],
  });

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('MatchCenter');
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    if (!tossModalVisible || !userCall) return;

    setTossDone(false);
    setTossOutcome(null);
    spinAnim.setValue(0);

    const result: 'HEAD' | 'TAIL' = Math.random() < 0.5 ? 'HEAD' : 'TAIL';
    setTossOutcome(result);

    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setTossDone(true);
      const won = userCall === result;

      if (won) {
        setTossState({ winner: 'user', choice: null });
      } else {
        const oppChoice: 'bat' | 'ball' = Math.random() < 0.5 ? 'bat' : 'ball';
        setTossState({
          winner: 'opp',
          choice: oppChoice,
        });
      }
    });
  }, [tossModalVisible, userCall, spinAnim]);

  const getMatchDetail = async () => {
    try {
      const nextMatch = await gameService.getNextMatch();
      if (nextMatch) {
        const {
          yourTeam: team1,
          yourPlayers: players,
          oppTeam: team2,
        } = nextMatch;
        setYourTeam(team1);
        setOppTeam(team2);
        setYourPlayers(players);
      }
    } catch (error) {
      console.log('error getting history', error);
    }
  };

  useEffect(() => {
    getMatchDetail();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getMatchDetail();
    }, []),
  );

  const getOverallRating = (player: UserPlayers): number => {
    return (player.batting + player.bowling) / 2;
  };

  const getWinPercentage = (
    players1: UserPlayers[],
    players2?: any[],
  ): number => {
    const yourTeamRating = players1.reduce(
      (acc, p) => acc + getOverallRating(p),
      0,
    );
    const oppTeamRating =
      players2?.reduce((acc, p) => acc + (p.batting + p.bowling) / 2, 0) ?? 0;

    if (yourTeamRating + oppTeamRating === 0) return 50;

    return Math.floor(
      (yourTeamRating / (yourTeamRating + oppTeamRating)) * 100,
    );
  };

  const handleStartMatch = () => {
    if (!tossState) return;
    console.log('Final Toss State:', tossState);
    setTossModalVisible(false);
    navigation.navigate('Match', { tossState });
  };

  const handleBatBallChoice = (choice: 'bat' | 'ball') => {
    if (!tossState) return;
    const updated = { ...tossState, choice };
    setTossState(updated);
    setTossModalVisible(false);
    navigation.navigate('Match', { tossState: updated });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { height: insets.top }]} />
      <View style={commonStyles.titleContainer}>
        <Text style={commonStyles.titleText}>Preview</Text>
      </View>
      <View style={styles.matchCard}>
        <View style={styles.cardBottom}>
          <View style={styles.teamSection}>
            <Image
              source={teamLogos[yourTeam?.logo || 'yak.png']}
              style={{ width: 120, height: 120 }}
            />
            <Text style={styles.teamName}>{yourTeam?.name}</Text>
          </View>
          <Text
            style={{
              padding: 15,
              borderRadius: 50,
              color: '#fff',
              backgroundColor: '#272727ff',
            }}
          >
            VS
          </Text>
          <View style={styles.teamSection}>
            <Image
              source={teamLogos[oppTeam?.logo || 'yak.png']}
              style={{ width: 120, height: 120 }}
            />
            <Text style={styles.teamName}>{oppTeam?.name}</Text>
          </View>
        </View>
      </View>

      <Image source={Stadium} style={{ width: 300, height: 200 }} />

      <View style={styles.detailSection}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingRight: 10,
          }}
        >
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <WinMeter
              percent={getWinPercentage(yourPlayers, oppTeam?.players)}
              size={80}
            />
            <Text style={{ textAlign: 'center', color: '#fff', fontSize: 16 }}>
              Win Predictor: {getWinPercentage(yourPlayers, oppTeam?.players)}%
            </Text>
          </View>
          <View style={styles.weatherBox}>
            <Image source={Clear} style={{ width: 50, height: 50 }} />
            <Text style={{ textAlign: 'center', color: '#fff', fontSize: 16 }}>
              14°C
            </Text>
          </View>
        </View>
        <View style={styles.bottomDetails}>
          <Text style={styles.bottomDetailText}>Pitch</Text>
          <Text style={styles.bottomDetailText}>Dry</Text>
        </View>
        <View style={styles.bottomDetails}>
          <Text style={styles.bottomDetailText}>Outfield Speed</Text>
          <Text style={styles.bottomDetailText}>Medium</Text>
        </View>
      </View>

      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('MatchCenter')}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mainButton}
          activeOpacity={0.8}
          onPress={() => setTossModalVisible(true)}
        >
          <Text style={styles.mainButtonText}>Toss</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={tossModalVisible} statusBarTranslucent>
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalBox}>
            {!userCall && (
              <View style={{ alignItems: 'center', gap: 30 }}>
                <Text
                  style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}
                >
                  Call the Toss
                </Text>
                <View style={{ flexDirection: 'row', gap: 40 }}>
                  <TouchableOpacity onPress={() => setUserCall('HEAD')}>
                    <Image source={Head} style={{ width: 100, height: 100 }} />
                    <Text
                      style={{
                        textAlign: 'center',
                        color: '#fff',
                        marginTop: 8,
                      }}
                    >
                      Head
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setUserCall('TAIL')}>
                    <Image source={Tail} style={{ width: 100, height: 100 }} />
                    <Text
                      style={{
                        textAlign: 'center',
                        color: '#fff',
                        marginTop: 8,
                      }}
                    >
                      Tail
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {userCall && !tossDone && (
              <Animated.Image
                source={Coin}
                style={{
                  width: 120,
                  height: 120,
                  transform: [{ rotateY: spin }],
                }}
              />
            )}

            {userCall && tossDone && (
              <>
                <Image
                  source={tossOutcome === 'HEAD' ? Head : Tail}
                  style={{ width: 120, height: 120 }}
                />

                {tossState?.winner === 'user' && (
                  <>
                    <Text
                      style={{
                        color: '#2ecc71',
                        fontSize: 24,
                        fontWeight: 'bold',
                        marginVertical: 20,
                      }}
                    >
                      You Won the Toss!
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 30 }}>
                      <TouchableOpacity
                        style={styles.choiceButton}
                        onPress={() => handleBatBallChoice('bat')}
                      >
                        <Text style={styles.choiceText}>Bat</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.choiceButton}
                        onPress={() => handleBatBallChoice('ball')}
                      >
                        <Text style={styles.choiceText}>Ball</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {tossState?.winner === 'opp' && (
                  <>
                    <Text
                      style={{
                        color: '#e74c3c',
                        fontSize: 24,
                        fontWeight: 'bold',
                        marginVertical: 20,
                      }}
                    >
                      {oppTeam?.name} Won the Toss
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 20 }}>
                      They chose to{' '}
                      {tossState.choice === 'bat' ? 'Bat' : 'Ball'} first
                    </Text>
                    <TouchableOpacity
                      style={styles.startButton}
                      onPress={handleStartMatch}
                    >
                      <Text style={styles.startButtonText}>Start Match</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
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
  matchCard: {
    width: '100%',
    margin: 30,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  cardBottom: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamSection: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  teamName: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#272727ff',
    color: '#fff',
    fontSize: 20,
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
  backButton: {
    width: '35%',
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainButton: {
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
  mainButtonText: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '900',
  },
  weatherBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333ff',
    paddingVertical: 5,
    paddingHorizontal: 20,
    gap: 10,
  },
  detailSection: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 80,
  },
  bottomDetails: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#333333ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  bottomDetailText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 500,
  },
  choiceButton: {
    backgroundColor: '#ff0766cb',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  choiceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startButton: {
    marginTop: 30,
    paddingVertical: 14,
    paddingHorizontal: 40,
    backgroundColor: '#ff0766cb',
    borderRadius: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default TossScreen;
