/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Trophy, Overlay } from '../assets';
import DBConfig from '../database/dbconfig';
import { Team } from '../types/team';
import { teamLogos } from '../database/assets';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
import Marquee from '../components/MarqueeText';
import CustomAlert from '../components/CustomAlert';
import InfoModal from '../components/InfoModal';
import StandingsDB from '../database/standings';
import HistoryDB from '../database/historyDB';
import FixturesDB from '../database/fixturesDB';

type DashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Dashboard'
>;
interface leagueDataInterface {
  position: number | null;
  season: string;
  nextOpp: string | null;
}

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [team, setTeam] = React.useState<Team | null>(null);
  const [backAlertVisible, setBackAlertVisible] = useState(false);
  const [infoModaltVisible, setInfoModalVisible] = useState(false);
  const [leagueData, setLeagueData] = useState<leagueDataInterface>({
    position: 0,
    season: '-',
    nextOpp: '-',
  });

  useEffect(() => {
    const backAction = () => {
      setBackAlertVisible(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const getTeamData = async () => {
      try {
        const userTeam = await DBConfig.getUserTeam();
        setTeam(userTeam);
        const position = await StandingsDB.getUserPosition();
        const season = await HistoryDB.getCurrentSeason();
        const nextOpponent = await FixturesDB.GetNextOpponent();
        setLeagueData({
          position: position,
          season: season,
          nextOpp: nextOpponent,
        });
      } catch (error) {
        console.log('Error fetching user team data:', error);
      }
    };

    getTeamData();
  }, []);

  const returnUserPosition = (position: number | null) => {
    let positionText: string = '-';
    if (position) {
      if (position === 1) {
        positionText = '1ST';
      } else if (position === 2) {
        positionText = '2ND';
      } else if (position === 3) {
        positionText = '3RD';
      } else {
        positionText = `${position}th`;
      }
    }
    return positionText;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { height: insets.top }]} />
      <ImageBackground source={Overlay} style={styles.bg}>
        <View style={styles.overlay} />

        <View style={styles.topBar}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setInfoModalVisible(true)}
              style={{ borderRadius: 50, backgroundColor: team?.themeColor }}
            >
              <Image
                source={
                  team?.logo
                    ? teamLogos[team.logo]
                    : require('../assets/yak.png')
                }
                style={{
                  width: 50,
                  height: 50,
                }}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={[styles.topBarItem, { padding: 15, borderRadius: 50 }]}
            activeOpacity={0.8}
          >
            <Icons name="cog" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.topTextBar}>
          <Marquee
            text="Welcome to Cricsim! Enjoy the game and follow your team!"
            speed={80}
          />
        </View>

        <View style={styles.topButtonSection}>
          <TouchableOpacity
            style={styles.topSectionButton}
            activeOpacity={0.8}
            onPress={() => team && navigation.navigate('Club', { team: team })}
          >
            <Text style={styles.topButoonTetx}>Club</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topSectionButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Fixtures')}
          >
            <Text style={styles.topButoonTetx}>Fixtures</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topSectionButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={styles.topButoonTetx}>History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.middleContainer}>
          <View style={styles.centerContent}>
            <View style={styles.trophySection}>
              <Image
                source={Trophy}
                style={styles.trophyImage}
                resizeMode="contain"
              />
              <Text style={styles.LeagueText}>NEPAL CRICKET LEAGUE</Text>
            </View>

            <View style={styles.circleRow}>
              <MenuCircle
                icon="podium"
                label="STANDINGS"
                onPress={() => {
                  navigation.navigate('Standings');
                }}
              />
              <MenuCircle
                icon="account-group"
                label="SQUAD"
                onPress={() => {
                  navigation.navigate('Squad');
                }}
              />
              <MenuCircle
                icon="chart-line"
                label="STATISTICS"
                onPress={() => {
                  navigation.navigate('Statistics');
                }}
              />
            </View>
          </View>

          <View style={styles.standingsRow}>
            <ActionBox
              title={returnUserPosition(leagueData.position)}
              subtitle="POSITION"
            />
            <ActionBox title={leagueData.season} subtitle="SEASON" />
            <ActionBox
              title={leagueData.nextOpp ?? '-'}
              subtitle="NEXT MATCH"
            />
          </View>
        </View>

        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setBackAlertVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mainButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MatchCenter')}
          >
            <Text style={styles.mainButtonText}>Match Center</Text>
          </TouchableOpacity>
        </View>
        <CustomAlert
          visible={backAlertVisible}
          title="Back to Main Menu"
          message="Do you want to save and exit back to the main menu?"
          onYes={() => {
            setBackAlertVisible(false);
            navigation.replace('Home');
          }}
          onNo={() => setBackAlertVisible(false)}
        />
        <InfoModal
          visible={infoModaltVisible}
          image={
            team?.logo ? teamLogos[team.logo] : require('../assets/yak.png')
          }
          theme={team?.themeColor || '#ff0766cb'}
          name={team?.name ? team.name : 'Kings'}
          onOk={() => setInfoModalVisible(false)}
        />
      </ImageBackground>
    </View>
  );
};

const MenuCircle = ({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={styles.menuCircle}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Icons name={icon} size={32} color="#fff" />
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

const ActionBox = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <View style={styles.actionBox}>
    <Text style={styles.actionTitle}>{title}</Text>
    <Text style={styles.actionSubtitle}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242424',
  },
  statusBar: {
    backgroundColor: 'black',
  },
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  topBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 8,
  },
  topBarText: {
    color: 'lightgreen',
    fontWeight: '600',
  },
  topTextBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 10,
    backgroundColor: '#2f2e2eff',
  },
  topText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  topButtonSection: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  topSectionButton: {
    backgroundColor: '#ff0766cb',
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: '30%',
    alignItems: 'center',
  },
  topButoonTetx: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
  },
  middleContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  circleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  menuCircle: {
    width: 86,
    height: 86,
    backgroundColor: '#ff0766cb',
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    color: '#fff',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 8,
  },

  trophySection: {
    alignItems: 'center',
    marginVertical: 34,
  },
  trophyImage: {
    width: 140,
    height: 180,
  },
  LeagueText: {
    backgroundColor: '#042577',
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },

  standingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  actionBox: {
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    width: '30%',
    paddingVertical: 10,
  },
  actionTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '400',
  },
  actionSubtitle: {
    color: '#fff',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
    backgroundColor: '#ff0766cb',
    paddingHorizontal: 10,
    paddingVertical: 2,
  },

  bottomButtonsContainer: {
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

export default DashboardScreen;
