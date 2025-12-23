/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Image,
  BackHandler,
} from 'react-native';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { commonStyles } from '../styles/commonStyles';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import CircularProgress from '../components/CircularProgress';
import { Batsman, Allrounder, Bowler, Keeper } from '../assets';
import userPlayersDB, { UserPlayers } from '../database/userPlayersDB';

type SquadScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Squad'
>;

const SquadScreen = () => {
  const navigation = useNavigation<SquadScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quickAction, setQuickAction] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Overall');
  const [squad, setSquad] = useState<UserPlayers[]>([]);

  const [swapTarget, setSwapTarget] = useState<{
    name: string;
    position: number;
  } | null>(null);

  const [changedPositions, setChangedPositions] = useState<Map<string, number>>(
    new Map(),
  );

  const buttonRef = useRef<any>(null);
  const [buttonWidth, setButtonWidth] = useState(0);

  const OPTIONS = ['Overall', 'Bat', 'Ball'];

  useEffect(() => {
    const loadPlayers = async () => {
      const players = await userPlayersDB.getPlayers();
      setSquad(players);
    };
    loadPlayers();
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleSelect = (item: string) => {
    setSelectedOption(item);
    setDropdownOpen(false);
  };

  const handleSwapPress = (player: UserPlayers) => {
    if (!swapTarget) {
      setSwapTarget({ name: player.name, position: player.position });
      return;
    }

    if (swapTarget.name === player.name) {
      setSwapTarget(null);
      return;
    }

    const updatedSquad = squad.map(p => {
      if (p.name === swapTarget.name) {
        return { ...p, position: player.position };
      }
      if (p.name === player.name) {
        return { ...p, position: swapTarget.position };
      }
      return p;
    });

    setSquad(updatedSquad);

    const newMap = new Map(changedPositions);
    newMap.set(swapTarget.name, player.position);
    newMap.set(player.name, swapTarget.position);

    setChangedPositions(newMap);

    setSwapTarget(null);
  };

  const handleBack = useCallback(async () => {
    for (let [playerName, newPos] of changedPositions.entries()) {
      await userPlayersDB.updatePlayerPosition(playerName, newPos);
    }

    navigation.goBack();
  }, [changedPositions, navigation]);

  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation, handleBack]);

  const renderPlayer = (player: UserPlayers, index: number) => {
    let avg: number;

    if (player.role === 'BAT' || player.role === 'WK') {
      avg = player.batting;
    } else if (player.role === 'BOWL') {
      avg = player.bowling;
    } else {
      avg = Math.floor((player.batting + player.bowling) / 2);
    }

    let displayRating: number = avg;

    if (selectedOption === 'Bat') displayRating = player.batting;
    if (selectedOption === 'Ball') displayRating = player.bowling;

    const orderType =
      player.orderType.charAt(0).toUpperCase() +
      player.orderType.slice(1).toLowerCase();

    let playerDesc: string;

    if (player.role === 'BAT') playerDesc = `${orderType} order Batsman`;
    else if (player.role === 'BOWL')
      playerDesc = player.bowlingType ?? 'Bowler';
    else if (player.role === 'WK') playerDesc = 'Wicket Keeper';
    else if (player.role === 'AR') playerDesc = 'All Rounder';
    else playerDesc = 'Player';

    const isSelected = swapTarget?.name === player.name;

    return (
      <View
        key={index}
        style={{
          justifyContent: 'flex-end',
          paddingHorizontal: 10,
        }}
      >
        <TouchableOpacity
          style={[
            styles.playerContainer,
            isSelected && { borderColor: '#ff0766cb', borderWidth: 2 },
            !quickAction && { marginBottom: 10 },
          ]}
          activeOpacity={0.8}
        >
          <View>
            <Text style={styles.playerName}>{player.name}</Text>
            <View style={{ flexDirection: 'row', gap: 3, marginTop: 5 }}>
              <Image
                source={
                  player.role === 'BAT'
                    ? Batsman
                    : player.role === 'WK'
                    ? Keeper
                    : player.role === 'AR'
                    ? Allrounder
                    : Bowler
                }
                style={{ width: 20, height: 20, borderRadius: 50 }}
              />
              <Text style={{ color: '#fff', fontSize: 12 }}>{playerDesc}</Text>
            </View>
          </View>

          <View style={styles.ratingContainer}>
            <CircularProgress
              rating={Math.round(displayRating)}
              size={52}
              strokeWidth={5}
            />
            <Icons name="chevron-right" size={25} color="#fff" />
          </View>
        </TouchableOpacity>

        {quickAction && (
          <View style={styles.quickActionContainer}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('PlayerStats', { player })}
            >
              <Icons name="chart-line" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionBtn,
                isSelected && { backgroundColor: '#7a0018' },
              ]}
              activeOpacity={0.8}
              onPress={() => handleSwapPress(player)}
            >
              <Icons name="repeat" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { height: insets.top }]} />

      <View style={commonStyles.titleContainer}>
        <Text style={commonStyles.titleText}>Squad</Text>
      </View>

      <View style={styles.quickAction}>
        <View>
          <TouchableOpacity
            ref={buttonRef}
            onLayout={e => setButtonWidth(e.nativeEvent.layout.width)}
            style={styles.quickActionButton}
            onPress={toggleDropdown}
            activeOpacity={0.8}
          >
            <Text style={styles.quickActionButtonText}>{selectedOption}</Text>
            <Icons
              name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>

          {dropdownOpen && (
            <View
              style={[
                styles.dropdownContainer,
                { width: buttonWidth, top: 48, zIndex: 10 },
              ]}
            >
              <ScrollView style={{ maxHeight: 150 }}>
                {OPTIONS.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.dropdownItemText}>{item}</Text>
                    {selectedOption === item && (
                      <Icons name="check" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.quickActionButton} activeOpacity={0.8}>
          <Text style={styles.quickActionButtonText}>Quick Action</Text>
          <Switch
            value={quickAction}
            onValueChange={() => {
              setQuickAction(!quickAction);
              setSwapTarget(null);
            }}
            trackColor={{ false: '#444', true: '#ff0766cb' }}
            thumbColor={quickAction ? '#ffffff' : '#bbbbbb'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{ marginTop: 10, paddingBottom: 100 }}
      >
        {squad.length > 0 && (
          <>
            {squad
              .sort((a, b) => a.position - b.position)
              .slice(0, 11)
              .map(renderPlayer)}

            {squad.length > 11 && (
              <>
                <Text style={styles.sectionTitle}>On The Bench</Text>
                {squad
                  .sort((a, b) => a.position - b.position)
                  .slice(11)
                  .map(renderPlayer)}
              </>
            )}
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={commonStyles.backButton}
        onPress={handleBack}
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

export default SquadScreen;
