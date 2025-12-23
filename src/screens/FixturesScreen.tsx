/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  BackHandler,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { commonStyles } from '../styles/commonStyles';
import { teamLogos } from '../database/assets';
import FixturesDB, { fixtures } from '../database/fixturesDB';

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

  const renderFixtures = (item: fixtures, index: number) => {
    const isCompleted = item.completed;

    return (
      <View key={index}>
        {isCompleted ? (
          <View style={styles.fixtureItem}>
            <View
              style={{
                flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={styles.teamRow}>
                <Image
                  source={teamLogos[item.yourLogo]}
                  style={styles.teamLogo}
                />
                <Text style={styles.teamName}>{item.yourTeam}</Text>
              </View>

              <View style={styles.scoreContainer}>
                <View
                  style={[
                    styles.scoreBox,
                    { flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' },
                  ]}
                >
                  <Text style={styles.scoreValue}>
                    {item.yourRun}-{item.yourWicket}
                  </Text>
                  <View style={styles.divider} />
                  <Text style={styles.scoreValue}>
                    {item.oppRun}-{item.oppWicket}
                  </Text>
                </View>
              </View>

              <View style={styles.teamRow}>
                <Image
                  source={teamLogos[item.oppLogo]}
                  style={styles.teamLogo}
                />
                <Text style={styles.teamName}>{item.oppTeam}</Text>
              </View>
            </View>

            {item.winText && <Text style={styles.winText}>{item.winText}</Text>}
          </View>
        ) : (
          <View
            style={[
              styles.upcomingRow,
              { flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' },
            ]}
          >
            <View style={styles.teamRow}>
              <Image
                source={teamLogos[item.yourLogo]}
                style={styles.teamLogo}
              />
              <Text style={styles.teamName}>{item.yourTeam}</Text>
            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.teamRow}>
              <Text style={styles.teamName}>{item.oppTeam}</Text>
              <Image source={teamLogos[item.oppLogo]} style={styles.teamLogo} />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { height: insets.top }]} />
      <View style={commonStyles.titleContainer}>
        <Text style={commonStyles.titleText}>Fixtures</Text>
      </View>
      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{ marginTop: 30, paddingBottom: 100 }}
      >
        {fixture.map(renderFixtures)}
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
  fixtureItem: {
    backgroundColor: '#333333ff',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
  },

  scoreBox: {
    backgroundColor: '#444',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#777',
  },

  scoreValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },

  winText: {
    paddingVertical: 10,
    color: '#ddd',
    fontSize: 13,
    textAlign: 'center',
  },
  upcomingRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333333ff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
  },

  vsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  vsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  teamLogo: {
    width: 30,
    height: 30,
  },

  teamName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
export default FixturesScreen;
