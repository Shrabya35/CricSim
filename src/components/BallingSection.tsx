/* eslint-disable react-native/no-inline-styles */
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BowlerState } from '../types/match';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import CircularProgress from './CircularProgress';

type Props = {
  bowler: BowlerState | null;
  batting: 'user' | 'opp' | null;
  theme: string | undefined;
  fielding: string;
  onOk: () => void;
};

const fieldingImages: { [key: string]: any } = {
  'Attacking 1': require('../assets/attacking1.png'),
  'Attacking 2': require('../assets/attacking2.png'),
  'Neutral 1': require('../assets/neutral1.png'),
  'Neutral 2': require('../assets/neutral2.png'),
  'Defensive 1': require('../assets/deffensive1.png'),
  'Defensive 2': require('../assets/deffensive2.png'),
  defaultFielding: require('../assets/attacking1.png'),
};

const BallingSection = ({ bowler, batting, theme, fielding, onOk }: Props) => {
  if (!bowler) return null;
  const fieldingType = fielding || 'defaultFielding';
  const displayField = fielding?.split(' ')[0] || 'Attacking';
  const imageSource = fieldingImages[fieldingType];
  const formatOvers = (overs: number, balls: number) => `${overs}.${balls}`;
  return (
    <View style={styles.container}>
      <View>
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
                rating={bowler?.player.bowling}
                size={32}
                strokeWidth={5}
              />
            </View>
          </View>
          <Text style={[styles.textStyle, { fontSize: 18 }]}>
            {bowler?.player.name}
          </Text>
          <Text style={[styles.textStyle, { fontSize: 16 }]}>
            {bowler?.player.bowlingType}
          </Text>
          <View style={{ paddingTop: 10, gap: 5 }}>
            <Text style={[styles.textStyle, { fontSize: 16 }]}>
              Overs: {formatOvers(bowler.overs, bowler.balls)}
            </Text>
            <Text style={[styles.textStyle, { fontSize: 16 }]}>
              R: {bowler.runs} {'   '} W: {bowler.wickets}
            </Text>
          </View>
        </View>
      </View>
      <View style={{ justifyContent: 'center', alignItems: 'center', gap: 5 }}>
        <Image
          source={imageSource}
          style={{
            width: 180,
            height: 180,
          }}
        />
        {batting === 'user' ? (
          <Text style={[styles.textStyle, { fontSize: 16 }]}>
            Fielding: {displayField}
          </Text>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: '#ff0766cb',
              paddingVertical: 3,
              paddingHorizontal: 8,
            }}
            onPress={onOk}
          >
            <Text style={{ color: '#fff' }}>Change Field</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
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

export default BallingSection;
