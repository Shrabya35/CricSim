import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  BackHandler,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { commonStyles } from '../styles/commonStyles';
import { teamLogos } from '../database/assets';
import FixturesDB, { fixtures } from '../database/fixturesDB';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Inter } from '../constants/fonts';

const { width } = Dimensions.get('window');

type FixturesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Fixtures'
>;

const FixturesScreen = () => {
  const navigation = useNavigation<FixturesScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [fixture, setFixture] = useState<fixtures[]>([]);

  useEffect(() => {
    const backAction = () => {
      navigation.replace('Dashboard');
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const getFixtures = async () => {
      try {
        const fullFixture = await FixturesDB.getFixtures();
        setFixture(fullFixture);
      } catch (error) {
        console.log('error getting fixtures', error);
      }
    };
    getFixtures();
  }, []);

  const renderCompletedMatch = (item: fixtures, index: number) => {
    const isWin = item.winText?.toLowerCase().includes('won');
    const resultColor = isWin ? '#4caf50' : '#f44336';
    const shouldSwap = index % 2 === 1;

    const leftTeam = shouldSwap ? item.oppTeam : item.yourTeam;
    const leftLogo = shouldSwap ? item.oppLogo : item.yourLogo;
    const leftRun = shouldSwap ? item.oppRun : item.yourRun;
    const leftWicket = shouldSwap ? item.oppWicket : item.yourWicket;

    const rightTeam = shouldSwap ? item.yourTeam : item.oppTeam;
    const rightLogo = shouldSwap ? item.yourLogo : item.oppLogo;
    const rightRun = shouldSwap ? item.yourRun : item.oppRun;
    const rightWicket = shouldSwap ? item.yourWicket : item.oppWicket;

    return (
      <View style={styles.matchCard}>
        <View style={styles.teamsRow}>
          <View style={styles.teamBlock}>
            <Image source={teamLogos[leftLogo]} style={styles.teamLogoLarge} />
            <Text style={styles.teamNameLarge}>{leftTeam}</Text>
          </View>

          <View style={styles.scoresWrapper}>
            <View style={styles.scoreChipLarge}>
              <Text style={styles.scoreTextLarge}>
                {leftRun}/{leftWicket}
              </Text>
              <Text style={styles.scoreSeparator}>-</Text>
              <Text style={styles.scoreTextLarge}>
                {rightRun}/{rightWicket}
              </Text>
            </View>
          </View>

          <View style={styles.teamBlock}>
            <Image source={teamLogos[rightLogo]} style={styles.teamLogoLarge} />
            <Text style={styles.teamNameLarge}>{rightTeam}</Text>
          </View>
        </View>

        <View
          style={[styles.resultBadge, { backgroundColor: resultColor + '20' }]}
        >
          <Icons
            name={isWin ? 'trophy' : 'emoticon-sad'}
            size={18}
            color={resultColor}
          />
          <Text style={[styles.resultText, { color: resultColor }]}>
            {item.winText}
          </Text>
        </View>
      </View>
    );
  };

  const renderUpcomingMatch = (item: fixtures, index: number) => {
    const shouldSwap = index % 2 === 1;

    const leftTeam = shouldSwap ? item.oppTeam : item.yourTeam;
    const leftLogo = shouldSwap ? item.oppLogo : item.yourLogo;
    const rightTeam = shouldSwap ? item.yourTeam : item.oppTeam;
    const rightLogo = shouldSwap ? item.yourLogo : item.oppLogo;

    return (
      <View style={styles.matchCard}>
        <View style={styles.teamsRow}>
          <View style={styles.teamBlock}>
            <Image source={teamLogos[leftLogo]} style={styles.teamLogoLarge} />
            <Text style={styles.teamNameLarge}>{leftTeam}</Text>
          </View>

          <View style={styles.vsCircleLarge}>
            <Text style={styles.vsTextLarge}>VS</Text>
          </View>

          <View style={styles.teamBlock}>
            <Image source={teamLogos[rightLogo]} style={styles.teamLogoLarge} />
            <Text style={styles.teamNameLarge}>{rightTeam}</Text>
          </View>
        </View>

        <View style={styles.upcomingMeta}>
          <Icons name="calendar-clock" size={16} color="#aaa" />
          <Text style={styles.upcomingText}>Upcoming Match</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={commonStyles.titleContainer}>
        <Text style={commonStyles.titleText}>Fixtures</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {fixture.map((item, index) => (
          <View key={index}>
            {item.completed
              ? renderCompletedMatch(item, index)
              : renderUpcomingMatch(item, index)}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={commonStyles.backButton}
        onPress={() => navigation.replace('Dashboard')}
        activeOpacity={0.8}
      >
        <Text style={commonStyles.backButoonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242424ff',
    alignItems: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 100,
    paddingTop: 20,
    width: '100%',
  },
  matchCard: {
    width: width * 0.8,
    backgroundColor: '#333333ff',
    borderRadius: 24,
    marginBottom: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#2c2c2c',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  teamBlock: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  teamLogoLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ff0766cb',
  },
  teamNameLarge: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Inter.semiBold,
    textAlign: 'center',
  },
  scoresWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  scoreChipLarge: {
    backgroundColor: '#2c2c2c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreTextLarge: {
    color: '#ffd966',
    fontSize: 16,
    fontFamily: Inter.semiBold,
  },
  scoreSeparator: {
    color: '#aaa',
    fontSize: 16,
    fontFamily: Inter.bold,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    paddingVertical: 6,
    borderRadius: 40,
  },
  resultText: {
    fontSize: 13,
    fontFamily: Inter.semiBold,
  },
  vsCircleLarge: {
    backgroundColor: '#ff0766cb',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff0766',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  vsTextLarge: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  upcomingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2c2c2c',
  },
  upcomingText: {
    color: '#aaa',
    fontSize: 12,
    fontFamily: Inter.semiBold,
  },
});

export default FixturesScreen;
