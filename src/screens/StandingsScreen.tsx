/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  BackHandler,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import StandingsDB from '../database/standings';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { commonStyles } from '../styles/commonStyles';
import { teamLogos } from '../database/assets';

interface TeamStanding {
  id: number;
  name: string;
  logo: string;
  themeColor: string;
  win: number;
  lose: number;
  tie: number;
  points: number;
  nrr: number;
  position: number;
}

type StandingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Standings'
>;

const StandingsScreen = () => {
  const navigation = useNavigation<StandingsScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [standings, setStandings] = useState<TeamStanding[]>([]);

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
    const fetchStandings = async () => {
      try {
        const teams = await StandingsDB.getStandings();
        setStandings(teams);
      } catch (error) {
        console.error('Error fetching standings:', error);
      }
    };

    fetchStandings();
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { height: insets.top }]} />

      <View style={commonStyles.titleContainer}>
        <Text style={commonStyles.titleText}>Standings</Text>
      </View>

      <View style={styles.subTitleContainer}>
        <Text style={styles.subTitleText}>2023: Nepal Cricket League</Text>
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.headerCell, { flex: 3 }]} />
          <Text style={[styles.headerCell, { flex: 0.7 }]}>P</Text>
          <Text style={[styles.headerCell, { flex: 0.7 }]}>W</Text>
          <Text style={[styles.headerCell, { flex: 0.7 }]}>L</Text>
          <Text style={[styles.headerCell, { flex: 0.7 }]}>T</Text>
          <Text style={[styles.headerCell, { flex: 0.7 }]}>PTS</Text>
          <Text style={[styles.headerCell, { flex: 0.9 }]}>NRR</Text>
        </View>

        <FlatList
          data={standings}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              style={[
                styles.tableRow,
                {
                  backgroundColor: item.themeColor
                    ? item.themeColor
                    : '#444444cc',
                },
              ]}
            >
              <View style={[styles.teamInfo, { flex: 3 }]}>
                <Image
                  source={
                    item.logo
                      ? teamLogos[item.logo]
                      : require('../assets/yak.png')
                  }
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 22,
                    backgroundColor: item.themeColor || '#555',
                  }}
                />
                <Text style={styles.teamName}>{item.name}</Text>
              </View>

              <Text style={[styles.bodyCell, { flex: 0.7 }]}>
                {item.win + item.lose + item.tie}
              </Text>
              <Text style={[styles.bodyCell, { flex: 0.7 }]}>{item.win}</Text>
              <Text style={[styles.bodyCell, { flex: 0.7 }]}>{item.lose}</Text>
              <Text style={[styles.bodyCell, { flex: 0.7 }]}>{item.tie}</Text>
              <Text style={[styles.bodyCell, { flex: 0.7 }]}>
                {item.points}
              </Text>
              <Text style={[styles.bodyCell, { flex: 0.9 }]}>
                {item.nrr.toFixed(2)}
              </Text>
            </View>
          )}
        />
      </View>

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
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginTop: 20,
  },
  subTitleText: {
    color: '#fff',
    fontSize: 16,
  },
  tableContainer: {
    width: '100%',
    marginTop: 25,
  },

  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  headerCell: {
    textAlign: 'center',
    color: '#a3a3a3ff',
    fontWeight: 'bold',
    fontSize: 13,
  },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
  },

  teamInfo: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  teamName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  bodyCell: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default StandingsScreen;
