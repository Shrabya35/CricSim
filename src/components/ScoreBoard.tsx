/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import React, { useState, useMemo } from 'react';
import { GameState } from '../types/match';
import { inningInterface } from '../screens/MatchScreen';
import { teamLogos } from '../database/assets';
import { Yak } from '../assets';

type Props = {
  state: GameState;
  bothTeam: inningInterface | null;
};

type TabInterface = 'First' | 'Second';

const ScoreBoard = ({ state, bothTeam }: Props) => {
  const [currentTab, setCurrentTab] = useState<TabInterface>('First');

  const innings = useMemo(() => {
    return currentTab === 'First' ? state.inning1 : state.inning2 ?? null;
  }, [currentTab, state]);

  const team = useMemo(() => {
    return currentTab === 'First' ? bothTeam?.team1 : bothTeam?.team2;
  }, [currentTab, bothTeam]);

  const { activeOutBatsmen, inactiveBatsmen, bowlers } = useMemo(() => {
    if (!innings) {
      return { activeOutBatsmen: [], inactiveBatsmen: [], bowlers: [] };
    }

    const activeOut = innings.batsmen.filter(
      b => b.status === 'active' || b.status === 'out',
    );

    const inactive = innings.batsmen.filter(b => b.status === 'inactive');

    const bowlersArr = Object.values(innings.bowlers).filter(
      b => b.overs * 6 + b.balls > 0,
    );

    return {
      activeOutBatsmen: activeOut,
      inactiveBatsmen: inactive,
      bowlers: bowlersArr,
    };
  }, [innings]);

  return (
    <View style={{ flex: 1, width: '100%' }}>
      <View style={styles.tabSection}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            {
              backgroundColor:
                currentTab === 'First' ? '#1b1b1bff' : '#292929ff',
            },
          ]}
          activeOpacity={0.8}
          onPress={() => setCurrentTab('First')}
        >
          <Text style={styles.tabBtnText}>First Innings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            {
              backgroundColor:
                currentTab === 'First' ? '#292929ff' : '#1b1b1bff',
            },
          ]}
          activeOpacity={0.8}
          onPress={() => setCurrentTab('Second')}
        >
          <Text style={styles.tabBtnText}>Second Innings</Text>
        </TouchableOpacity>
      </View>
      {!innings ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: '#fff' }}>Innings not started</Text>
        </View>
      ) : (
        <View style={{ paddingTop: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Image
                source={team?.logo ? teamLogos[team.logo] : Yak}
                style={{
                  width: 50,
                  height: 50,
                }}
              />
              <Text style={{ color: '#fff', fontSize: 18 }}>{team?.name}</Text>
            </View>
            <Text style={{ textAlign: 'center', color: '#fff', fontSize: 20 }}>
              {innings.runs}/{innings.wickets} ({(innings.balls / 6).toFixed(0)}
              .{innings.balls % 6})
            </Text>
          </View>
          <FlatList
            data={activeOutBatsmen}
            keyExtractor={item => item.player.position.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: 90,
              paddingHorizontal: 0,
            }}
            ListHeaderComponent={() => (
              <View style={styles.tableContainer}>
                <View style={styles.tableHeaderRow}>
                  <Text
                    style={[styles.headerCell, { flex: 3, textAlign: 'left' }]}
                  >
                    Batting
                  </Text>
                  <Text style={[styles.headerCell, { flex: 0.7 }]}>R</Text>
                  <Text style={[styles.headerCell, { flex: 0.7 }]}>B</Text>
                  <Text style={[styles.headerCell, { flex: 0.9 }]}>S/R</Text>
                </View>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <View
                  style={{
                    flex: 3,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignContent: 'center',
                  }}
                >
                  <Text style={styles.teamName}>{item.player.name}</Text>
                  <Text style={{ color: '#fff' }}>
                    {item.status === 'out' ? item.outType : 'Not Out'}
                  </Text>
                </View>

                <Text style={[styles.bodyCell, { flex: 0.7 }]}>
                  {item.runs}
                </Text>
                <Text style={[styles.bodyCell, { flex: 0.7 }]}>
                  {item.balls}
                </Text>
                <Text style={[styles.bodyCell, { flex: 0.9 }]}>
                  {item.balls > 0
                    ? ((item.runs / item.balls) * 100).toFixed(0)
                    : '0.0'}
                </Text>
              </View>
            )}
            ListFooterComponent={() => (
              <View>
                {inactiveBatsmen.length > 0 && (
                  <View style={styles.yetToBatContainer}>
                    <Text style={styles.yetToBatTitle}>Yet to Bat</Text>
                    <Text style={styles.yetToBatText}>
                      {inactiveBatsmen.map(b => b.player.name).join(', ')}
                    </Text>
                  </View>
                )}

                {bowlers.length > 0 && (
                  <View style={{ marginTop: 25, paddingHorizontal: 10 }}>
                    <Text style={styles.yetToBatTitle}>Bowlers</Text>
                    <View style={[styles.tableHeaderRow, { marginTop: 5 }]}>
                      <Text
                        style={[
                          styles.headerCell,
                          { flex: 3, textAlign: 'left' },
                        ]}
                      >
                        Name
                      </Text>
                      <Text style={[styles.headerCell, { flex: 0.7 }]}>O</Text>
                      <Text style={[styles.headerCell, { flex: 0.7 }]}>R</Text>
                      <Text style={[styles.headerCell, { flex: 0.7 }]}>W</Text>
                      <Text style={[styles.headerCell, { flex: 0.9 }]}>
                        Econ
                      </Text>
                    </View>

                    {bowlers.map(b => {
                      const oversDecimal = `${b.overs}.${b.balls}`;
                      const totalBalls = b.overs * 6 + b.balls;
                      const econ =
                        totalBalls > 0
                          ? (b.runs / (totalBalls / 6)).toFixed(2)
                          : '0.00';

                      return (
                        <View key={b.player.position} style={styles.tableRow}>
                          <View style={{ flex: 3 }}>
                            <Text style={styles.teamName}>{b.player.name}</Text>
                          </View>
                          <Text style={[styles.bodyCell, { flex: 0.7 }]}>
                            {oversDecimal}
                          </Text>
                          <Text style={[styles.bodyCell, { flex: 0.7 }]}>
                            {b.runs}
                          </Text>
                          <Text style={[styles.bodyCell, { flex: 0.7 }]}>
                            {b.wickets}
                          </Text>
                          <Text style={[styles.bodyCell, { flex: 0.9 }]}>
                            {econ}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabSection: {
    width: '70%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  tabBtn: {
    width: '49%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },

  tabBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  tableContainer: {
    width: '100%',
    marginTop: 10,
  },

  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },

  headerCell: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'right',
    fontWeight: '600',
  },

  tableRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#333333ff',
    marginTop: 5,
  },

  teamName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  bodyCell: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },

  yetToBatContainer: {
    paddingHorizontal: 10,
    marginTop: 25,
  },

  yetToBatTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 6,
    fontWeight: 'bold',
  },

  yetToBatText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ScoreBoard;
