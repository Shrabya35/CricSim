/* eslint-disable react/no-unstable-nested-components */

import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BowlerState } from '../types/match';
import CircularProgress from './CircularProgress';

type BowlerSelectionProps = {
  visible: boolean;
  bowlers: BowlerState[];
  maxOvers: number;
  currentBowlerId?: string;
  theme: string | undefined;
  onSelect: (bowlerId: string) => void;
};

const BowlerSelection = ({
  visible,
  bowlers,
  maxOvers,
  theme,
  currentBowlerId,
  onSelect,
}: BowlerSelectionProps) => {
  return (
    <Modal transparent visible={visible} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Pick a Bowler</Text>

          <FlatList
            data={bowlers}
            keyExtractor={item => item.player.name}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => {
              const oversLeft = maxOvers - item.overs;

              const isDisabled =
                oversLeft <= 0 || item.player.name === currentBowlerId;

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={isDisabled}
                  style={[styles.row, isDisabled && styles.rowDisabled]}
                  onPress={() => onSelect(item.player.name)}
                >
                  <View style={styles.iconContainer}>
                    <Icons
                      name="tshirt-crew"
                      size={40}
                      color={theme ?? 'red'}
                    />
                  </View>

                  <View style={styles.details}>
                    <Text
                      numberOfLines={1}
                      style={[styles.name, isDisabled && styles.disabledText]}
                    >
                      {item.player.name}
                    </Text>

                    <Text
                      style={[styles.info, isDisabled && styles.disabledText]}
                    >
                      {item.player.name === currentBowlerId
                        ? 'Bowled previous over'
                        : `Overs Left : ${oversLeft}`}
                    </Text>

                    <Text
                      style={[styles.info, isDisabled && styles.disabledText]}
                    >
                      Figures : {item.runs}/{item.wickets}
                    </Text>
                  </View>

                  <CircularProgress
                    rating={Math.round(item.player.bowling)}
                    size={48}
                    strokeWidth={5}
                  />
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  box: {
    width: '95%',
    maxHeight: '75%',
    backgroundColor: '#1d1d1d',
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },

  title: {
    color: '#ff0766cb',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 18,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  rowDisabled: {
    opacity: 0.35,
  },

  iconContainer: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    fontSize: 28,
  },

  details: {
    flex: 1,
    marginHorizontal: 12,
  },

  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  info: {
    color: '#a5a5a5',
    fontSize: 12,
    marginTop: 4,
  },

  disabledText: {
    color: '#555',
  },

  separator: {
    height: 1,
    backgroundColor: '#353535',
  },
});

export default BowlerSelection;
