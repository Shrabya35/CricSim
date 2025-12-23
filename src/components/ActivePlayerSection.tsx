/* eslint-disable react-native/no-inline-styles */
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ActivePlayersState } from '../types/match';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import CircularProgress from './CircularProgress';

type Props = {
  activePlayers: ActivePlayersState;
  batting: 'user' | 'opp' | null;
  theme: string | undefined;
  onChangeAggression: (side: 'left' | 'right', newLevel: number) => void;
};

const AggressionBar = ({ level }: { level: number }) => {
  const totalLevels = 5;
  const levelsArray = Array.from({ length: totalLevels }, (_, i) => i + 1);
  return (
    <View style={styles.aggressionContainer}>
      {levelsArray.reverse().map(l => (
        <View
          key={l}
          style={[
            styles.aggressionLevel,
            { backgroundColor: l <= level ? '#13e42cff' : '#555' },
          ]}
        />
      ))}
    </View>
  );
};

const ActivePlayerSection = ({
  activePlayers,
  batting,
  theme,
  onChangeAggression,
}: Props) => {
  const handleIncrease = (side: 'left' | 'right') => {
    const current = activePlayers[side]?.aggression || 0;
    if (current < 5) onChangeAggression(side, current + 1);
  };

  const handleDecrease = (side: 'left' | 'right') => {
    const current = activePlayers[side]?.aggression || 0;
    if (current > 0) onChangeAggression(side, current - 1);
  };

  const getAgressioText = (agression: number | undefined): string => {
    let agressionText: string = 'neutral';

    if (!agression) return '';
    if (agression === 1) {
      agressionText = 'Very Deffensive';
    } else if (agression === 2) {
      agressionText = 'Deffensive';
    } else if (agression === 3) {
      agressionText = 'Neutral';
    } else if (agression === 4) {
      agressionText = 'Agressive';
    } else if (agression === 5) {
      agressionText = 'Very Agressive';
    }
    return agressionText;
  };

  const renderPlayer = (side: 'left' | 'right') => (
    <View>
      <View style={styles.subContainer}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ position: 'relative' }}>
            <Icons name="tshirt-crew" size={100} color={theme} />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
              }}
            >
              <CircularProgress
                rating={activePlayers[side]?.player.batting ?? 0}
                size={32}
                strokeWidth={5}
              />
            </View>
          </View>
          <Text style={[styles.textStyle, { fontSize: 18 }]}>
            {activePlayers[side]?.player.name}
          </Text>
          <Text style={[styles.textStyle, { fontSize: 14 }]}>
            {activePlayers[side]?.run}({activePlayers[side]?.ball})
          </Text>
        </View>

        {batting === 'user' && (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity
              onPress={() => handleIncrease(side)}
              disabled={activePlayers[side]?.aggression === 5}
            >
              <Icons name="plus" size={30} color="#fff" />
            </TouchableOpacity>
            <AggressionBar level={activePlayers[side]?.aggression || 1} />
            <TouchableOpacity
              onPress={() => handleDecrease(side)}
              disabled={activePlayers[side]?.aggression === 1}
            >
              <Icons name="minus" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {batting === 'user' && (
        <Text style={{ fontSize: 14, color: '#fff', textAlign: 'right' }}>
          {getAgressioText(activePlayers[side]?.aggression)}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderPlayer('left')}
      {renderPlayer('right')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  subContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  textStyle: {
    color: '#fff',
    textAlign: 'center',
  },
  aggressionContainer: {
    width: 10,
    height: 100,
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  aggressionLevel: {
    flex: 1,
    marginVertical: 2,
    borderRadius: 2,
  },
});

export default ActivePlayerSection;
