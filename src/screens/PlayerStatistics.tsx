/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import React, { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation, useRoute } from '@react-navigation/native';
import { commonStyles } from '../styles/commonStyles';
import { UserPlayers } from '../database/userPlayersDB';

type PlayerStatsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PlayerStats'
>;

const PlayerStatistics = () => {
  const navigation = useNavigation<PlayerStatsScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { player } = route.params as { player: UserPlayers };

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

  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { height: insets.top }]} />
      <View style={commonStyles.titleContainer}>
        <Text style={commonStyles.titleText}>Statistics</Text>
      </View>
      <View style={styles.statsContainer}>
        <Text
          style={{
            color: '#fff',
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {player.name}
        </Text>
        <View style={{ width: '100%', gap: 5 }}>
          <View style={styles.topStats}>
            <Text style={styles.statText}>Matches Played</Text>
            <Text style={styles.statText}>{player.totalPlayed}</Text>
          </View>
          <View style={styles.topStats}>
            <Text style={styles.statText}>Runs Scored</Text>
            <Text style={styles.statText}>{player.totalRuns}</Text>
          </View>
          {(player.role === 'Bowl' || player.role === 'AR') && (
            <View style={styles.topStats}>
              <Text style={styles.statText}>Wickets Taken</Text>
              <Text style={styles.statText}>{player.totalWickets}</Text>
            </View>
          )}
        </View>
        <View style={{ width: '100%', marginTop: 10 }}>
          <Text style={{ color: '#fff', fontSize: 18, marginBottom: 10 }}>
            This Season
          </Text>
          <View style={{ width: '100%', gap: 5 }}>
            <View style={styles.topStats}>
              <Text style={styles.statText}>Matches</Text>
              <Text style={styles.statText}>{player.totalPlayed}</Text>
            </View>
            <View style={styles.topStats}>
              <Text style={styles.statText}>Runs</Text>
              <Text style={styles.statText}>{player.totalRuns}</Text>
            </View>
            {(player.role === 'Bowl' || player.role === 'AR') && (
              <View style={styles.topStats}>
                <Text style={styles.statText}>Wickets</Text>
                <Text style={styles.statText}>{player.totalWickets}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={commonStyles.backButton}
        onPress={() => navigation.goBack()}
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
  statsContainer: {
    padding: 40,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  topStats: {
    backgroundColor: '#333333ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  statText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PlayerStatistics;
