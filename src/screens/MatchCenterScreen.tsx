/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  BackHandler,
  ScrollView,
  Alert,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { commonStyles } from '../styles/commonStyles';
import { teamLogos } from '../database/assets';
import { Team } from '../types/team';
import { gameService } from '../services/gameService';
import { Batsman, Bowler, Allrounder, Keeper } from '../assets';
import { UserPlayers } from '../database/userPlayersDB';

type MatchCenterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MatchCenter'
>;

const MatchCenterScreen = () => {
  const navigation = useNavigation<MatchCenterScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [yourTeam, setYourTeam] = useState<Team | null>(null);
  const [yourPlayers, setYourPlayers] = useState<UserPlayers[]>([]);
  const [oppTeam, setOppTeam] = useState<Team | null>(null);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation]);

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

  const gotoTossScreen = () => {
    const playingXI = yourPlayers.filter(
      p => p.position >= 1 && p.position <= 11,
    );

    console.log(
      'Players:',
      playingXI.map(p => p.role),
    );

    const bowlers = playingXI.filter(p => p.role === 'BOWL' || p.role === 'AR');

    const wk = playingXI.filter(p => p.role === 'WK');

    console.log('Bowlers:', bowlers.length);
    console.log('WK:', wk.length);

    if (playingXI.length !== 11) {
      Alert.alert('Invalid Team', 'You must select exactly 11 players.');
      return;
    }

    if (bowlers.length < 5) {
      Alert.alert('Invalid Team', 'You need at least 5 bowlers (BOWL or AR).');
      return;
    }

    if (wk.length < 1) {
      Alert.alert('Invalid Team', 'You need at least 1 wicket keeper.');
      return;
    }

    navigation.navigate('Toss');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { height: insets.top }]} />
      <View style={commonStyles.titleContainer}>
        <Text style={commonStyles.titleText}>Match Center</Text>
      </View>
      <View style={styles.matchCard}>
        <Text style={{ color: '#ff0766cb', fontSize: 22, fontWeight: 600 }}>
          League Stage
        </Text>
        <View style={styles.cardBottom}>
          <View style={styles.teamSection}>
            <Image
              source={teamLogos[yourTeam?.logo ? yourTeam.logo : 'yak.png']}
              style={{
                width: 80,
                height: 80,
              }}
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
              source={teamLogos[oppTeam?.logo ? oppTeam.logo : 'yak.png']}
              style={{
                width: 80,
                height: 80,
              }}
            />
            <Text style={styles.teamName}>{oppTeam?.name}</Text>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Squad')}
          style={{
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              paddingVertical: 5,
              paddingHorizontal: 15,
              color: '#fff',
              backgroundColor: '#ff0766cb',
            }}
          >
            Manage Team
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.playerCard}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 10 }}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 22,
            fontWeight: 700,
            paddingBottom: 30,
          }}
        >
          Players
        </Text>
        <View style={styles.playerSection}>
          <View style={styles.teamColumn}>
            {yourPlayers?.slice(0, 11).map((player, index) => (
              <View
                key={index}
                style={[styles.playerRow, { flexDirection: 'row' }]}
              >
                <Image
                  source={
                    player.role === 'BAT'
                      ? Batsman
                      : player.role === 'AR'
                      ? Allrounder
                      : player.role === 'BOWL'
                      ? Bowler
                      : Keeper
                  }
                  style={[
                    styles.playerIcon,
                    {
                      marginRight: 8,
                    },
                  ]}
                />
                <Text style={styles.playerName}>
                  {player.name} {player.isCaptain ? '(C)' : ''}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.teamColumn}>
            {oppTeam?.players?.slice(0, 11).map((player, index) => (
              <View
                key={index}
                style={[styles.playerRow, { flexDirection: 'row-reverse' }]}
              >
                <Image
                  source={
                    player.role === 'BAT'
                      ? Batsman
                      : player.role === 'AR'
                      ? Allrounder
                      : player.role === 'BOWL'
                      ? Bowler
                      : Keeper
                  }
                  style={[
                    styles.playerIcon,
                    {
                      marginLeft: 8,
                    },
                  ]}
                />
                <Text style={styles.playerName}>
                  {player.name} {player.isCaptain ? '(C)' : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Dashboard')}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mainButton}
          activeOpacity={0.8}
          onPress={gotoTossScreen}
        >
          <Text style={styles.mainButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
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
    margin: 20,
    padding: 20,
    backgroundColor: '#2f2f2fff',
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
    fontSize: 16,
  },
  playerCard: {
    backgroundColor: '#2f2f2fff',
    flex: 1,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  playerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  teamColumn: {
    flex: 1,
    paddingHorizontal: 5,
    flexShrink: 1,
  },
  playerRow: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  playerIcon: {
    width: 20,
    height: 20,
  },
  playerName: {
    color: '#fff',
    fontSize: 15,
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
});
export default MatchCenterScreen;
