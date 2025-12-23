/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import React from 'react';
import { inningInterface } from '../screens/MatchScreen';
import { Yak } from '../assets';
import { teamLogos } from '../database/assets';

export interface partialInning {
  run: number;
  wicket: number;
  ball: number;
}

type inningsProps = {
  visible: boolean;
  gameEnd: boolean;
  bothTeam: inningInterface | null;
  inning1: partialInning;
  inning2?: partialInning;
  onOk: () => void;
};
const InningsAlert = ({
  visible,
  onOk,
  gameEnd,
  bothTeam,
  inning1,
  inning2,
}: inningsProps) => {
  const difference = inning1.run - (inning2?.run ?? 0);
  const wicketDiff = 10 - (inning2?.wicket ?? 0);
  const winner: string =
    difference > 0
      ? bothTeam?.team1.name ?? 'Team 1'
      : bothTeam?.team2.name ?? 'Team 2';
  const winBy: string =
    difference > 0 ? `${difference} run` : `${wicketDiff} wickets`;
  const winText: string = `${winner} won by ${winBy}`;

  return (
    <Modal transparent visible={visible} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>
            {gameEnd ? 'Match Summary' : 'End of first Innings'}
          </Text>

          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 40,
              paddingVertical: 50,
            }}
          >
            <View style={styles.teamSection}>
              <Image
                source={
                  bothTeam?.team1?.logo ? teamLogos[bothTeam.team1.logo] : Yak
                }
                style={{ width: 90, height: 100 }}
              />
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={[styles.teamText, { fontSize: 28 }]}>
                  {inning1.run} / {inning1.wicket}
                </Text>
                <Text style={styles.teamText}>
                  ({(inning1.ball / 6).toFixed(0)}.
                  {(inning1.ball % 6).toFixed(0)})
                </Text>
              </View>
            </View>
            {gameEnd && inning2 && (
              <>
                <View style={styles.teamSection}>
                  <Image
                    source={
                      bothTeam?.team2?.logo
                        ? teamLogos[bothTeam.team2.logo]
                        : Yak
                    }
                    style={{ width: 90, height: 100 }}
                  />
                  <View
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Text style={[styles.teamText, { fontSize: 28 }]}>
                      {inning2.run} / {inning2.wicket}
                    </Text>
                    <Text style={styles.teamText}>
                      ({(inning2.ball / 6).toFixed(0)}.
                      {(inning2.ball % 6).toFixed(0)})
                    </Text>
                  </View>
                </View>
                <Text
                  style={{ color: '#fff', fontSize: 22, textAlign: 'center' }}
                >
                  {winText}
                </Text>
              </>
            )}
          </View>

          <TouchableOpacity
            style={styles.Btn}
            onPress={onOk}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  box: {
    width: '100%',
    backgroundColor: '#1d1d1dff',
    padding: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  title: {
    fontSize: 24,
    color: '#1faa59',
    fontWeight: 600,
    textAlign: 'center',
  },
  teamSection: {
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'row',
  },
  teamText: {
    color: '#fff',
    fontSize: 20,
  },
  Btn: {
    backgroundColor: '#ff0766cb',
    paddingVertical: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default InningsAlert;
