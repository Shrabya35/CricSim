/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  BackHandler,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import React, { useEffect } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Team } from '../types/team';
import { commonStyles } from '../styles/commonStyles';
import { teamLogos } from '../database/assets';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Stadium } from '../assets';

type ClubScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Club'
>;
type Mode = 'ovr' | 'bat' | 'ball';

const ClubScreen = () => {
  const navigation = useNavigation<ClubScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { team } = route.params as { team: Team };

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

  const returnAverageRating = (item: Team, mode: Mode) => {
    const ratings = item.players.map(p => {
      switch (mode) {
        case 'ovr':
          return (p.batting + p.bowling) / 2;
        case 'bat':
          return p.batting;
        case 'ball':
          return p.bowling;
      }
    });

    const teamAverage = ratings.reduce((acc, r) => acc + r, 0) / ratings.length;

    return {
      individual: ratings,
      teamAverage: Math.floor(teamAverage),
    };
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { height: insets.top }]} />
      <View style={commonStyles.titleContainer}>
        <Text style={commonStyles.titleText}>Your Club</Text>
      </View>
      <View style={styles.topContainer}>
        <Image
          source={teamLogos[team.logo]}
          style={{
            width: 100,
            height: 100,
          }}
        />
        <View style={{ gap: 20 }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: 600 }}>
            {team.name}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons name="tshirt-crew" size={32} color={team.themeColor} />
            <Text style={{ color: '#fff', fontSize: 16 }}>Club Colour</Text>
          </View>
        </View>
      </View>
      <View style={{ width: '70%', gap: 12 }}>
        {(['ovr', 'bat', 'ball'] as Mode[]).map(mode => {
          const rating = returnAverageRating(team, mode).teamAverage;
          const barColor =
            mode === 'ovr' ? 'red' : mode === 'bat' ? 'blue' : 'yellow';

          return (
            <View key={mode} style={styles.ovrContainer}>
              <View style={{ width: '50%', justifyContent: 'center' }}>
                <View
                  style={{
                    width: `${rating}%`,
                    backgroundColor: barColor,
                    height: 20,
                  }}
                />
              </View>

              <View
                style={{
                  width: '50%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: 'white' }}>{rating}</Text>
                <Text style={{ color: 'white' }}>
                  {mode === 'ovr' ? 'Ovr' : mode === 'bat' ? 'Bat' : 'Ball'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{
          paddingVertical: 70,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={Stadium}
          style={{
            width: 300,
            height: 220,
          }}
          resizeMode="cover"
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10,
          }}
        >
          <Icons name="map-marker" size={32} color="#ff0766cb" />
          <Text
            style={{
              color: '#fff',
              fontSize: 16,
              marginLeft: 8,
            }}
          >
            TU International Cricket Stadium
          </Text>
        </View>
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
  topContainer: {
    paddingVertical: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  ovrContainer: {
    width: '100%',
    backgroundColor: '#333333ff',
    flexDirection: 'row',
    padding: 4,
  },
});

export default ClubScreen;
