/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { commonStyles } from '../styles/commonStyles';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import userPlayersDB, { UserPlayerStat } from '../database/userPlayersDB';

type StatisticsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Statistics'
>;

const StatisticsScreen = () => {
  const navigation = useNavigation<StatisticsScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [seasonSselectedOption, setSeasonSelectedOption] = useState('Season');
  const [typeSelectedOption, setTypeSelectedOption] = useState('Bat');

  const seasonButtonRef = useRef<any>(null);
  const typeButtonRef = useRef<any>(null);

  const [seasonButtonWidth, setSeasonButtonWidth] = useState(0);
  const [typeButtonWidth, setTypeButtonWidth] = useState(0);

  const [players, setPlayers] = useState<UserPlayerStat[]>([]);

  const SEASON_OPTIONS = ['Season', 'Career'];
  const TYPE_OPTIONS = ['Bat', 'Ball'];

  const toggleSeasonDropdown = () => {
    setSeasonDropdownOpen(prev => !prev);
    setTypeDropdownOpen(false);
  };

  const toggleTypeDropdown = () => {
    setTypeDropdownOpen(prev => !prev);
    setSeasonDropdownOpen(false);
  };

  const handleSeasonSelect = (item: string) => {
    setSeasonSelectedOption(item);
    setSeasonDropdownOpen(false);
  };

  const handleTypeSelect = (item: string) => {
    setTypeSelectedOption(item);
    setTypeDropdownOpen(false);
  };

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

  useEffect(() => {
    const loadStats = async () => {
      const data = await userPlayersDB.getStatistics(
        seasonSselectedOption as 'Season' | 'Career',
        typeSelectedOption as 'Bat' | 'Ball',
      );
      setPlayers(data);
    };

    loadStats();
  }, [seasonSselectedOption, typeSelectedOption]);

  const renderStatPlayer = (player: UserPlayerStat, index: number) => {
    let playerDesc: string;

    if (player.role === 'BAT') playerDesc = 'Batsman';
    else if (player.role === 'BOWL') playerDesc = 'Bowler';
    else if (player.role === 'WK') playerDesc = 'Wicket Keeper';
    else if (player.role === 'AR') playerDesc = 'All Rounder';
    else playerDesc = 'Player';

    return (
      <View key={index} style={{ paddingHorizontal: 10 }}>
        <View style={styles.playerContainer}>
          <View>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={{ color: '#bbb', fontSize: 12 }}>{playerDesc}</Text>
          </View>

          <View style={styles.ratingContainer}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
              {player.stat}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { height: insets.top }]} />

      <View style={commonStyles.titleContainer}>
        <Text style={commonStyles.titleText}>Statistics</Text>
      </View>

      <View style={styles.quickAction}>
        <View>
          <TouchableOpacity
            ref={seasonButtonRef}
            onLayout={e => setSeasonButtonWidth(e.nativeEvent.layout.width)}
            style={styles.quickActionButton}
            onPress={toggleSeasonDropdown}
            activeOpacity={0.8}
          >
            <Text style={styles.quickActionButtonText}>
              {seasonSselectedOption}
            </Text>
            <Icons
              name={seasonDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>

          {seasonDropdownOpen && (
            <View
              style={[
                styles.dropdownContainer,
                { width: seasonButtonWidth, top: 48, zIndex: 10 },
              ]}
            >
              <ScrollView style={{ maxHeight: 150 }}>
                {SEASON_OPTIONS.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => handleSeasonSelect(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.dropdownItemText}>{item}</Text>
                    {seasonSselectedOption === item && (
                      <Icons name="check" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View>
          <TouchableOpacity
            ref={typeButtonRef}
            onLayout={e => setTypeButtonWidth(e.nativeEvent.layout.width)}
            style={styles.quickActionButton}
            onPress={toggleTypeDropdown}
            activeOpacity={0.8}
          >
            <Text style={styles.quickActionButtonText}>
              {typeSelectedOption}
            </Text>
            <Icons
              name={typeDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>

          {typeDropdownOpen && (
            <View
              style={[
                styles.dropdownContainer,
                { width: typeButtonWidth, top: 48, zIndex: 10 },
              ]}
            >
              <ScrollView style={{ maxHeight: 150 }}>
                {TYPE_OPTIONS.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => handleTypeSelect(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.dropdownItemText}>{item}</Text>
                    {typeSelectedOption === item && (
                      <Icons name="check" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{ marginTop: 10, paddingBottom: 100 }}
      >
        {players
          .sort((a, b) => (b.stat ?? 0) - (a.stat ?? 0))
          .map(renderStatPlayer)}
      </ScrollView>

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
  quickAction: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickActionButton: {
    backgroundColor: '#333333ff',
    width: 160,
    paddingVertical: 10,
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 6,
  },
  quickActionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownContainer: {
    backgroundColor: '#333333ff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#444',
    position: 'absolute',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 15,
  },
  sectionTitle: {
    width: '100%',
    backgroundColor: '#ff0766cb',
    marginVertical: 10,
    paddingVertical: 10,
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  playerContainer: {
    backgroundColor: '#333333ff',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 3,
  },
  playerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 10,
  },
  quickActionBtn: {
    padding: 8,
    backgroundColor: '#ff0766cb',
  },
});

export default StatisticsScreen;
