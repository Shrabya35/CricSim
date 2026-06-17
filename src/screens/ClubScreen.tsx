import {
  View,
  Text,
  BackHandler,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
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
import { Inter } from '../constants/fonts';

const { width } = Dimensions.get('window');

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

  const ratingConfig = {
    ovr: {
      label: 'OVERALL',
      icon: 'star-four-points',
      color: '#ff3b6f',
      barColor: '#ff3b6f',
    },
    bat: {
      label: 'BATTING',
      icon: 'bat',
      color: '#3b82f6',
      barColor: '#3b82f6',
    },
    ball: {
      label: 'BOWLING',
      icon: 'bowling',
      color: '#fbbf24',
      barColor: '#fbbf24',
    },
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={commonStyles.titleContainer}>
        <Text style={commonStyles.titleText}>Your Club</Text>
      </View>

      <View style={styles.teamInfoCard}>
        <View style={styles.teamLogoWrapper}>
          <Image
            source={teamLogos[team.logo]}
            style={[styles.teamLogo, { borderColor: team.themeColor }]}
          />
          <View
            style={[styles.teamBadge, { backgroundColor: team.themeColor }]}
          >
            <Text style={styles.teamBadgeText}>{team.name}</Text>
          </View>
        </View>
      </View>

      <View style={styles.ratingsContainer}>
        {(['ovr', 'bat', 'ball'] as Mode[]).map(mode => {
          const rating = returnAverageRating(team, mode).teamAverage;
          const config = ratingConfig[mode];
          const barWidth = (rating / 100) * (width - 100);
          return (
            <View key={mode} style={styles.ratingRow}>
              <View style={styles.ratingLabel}>
                <Icons name={config.icon} size={20} color={config.color} />
                <Text style={styles.ratingLabelText}>{config.label}</Text>
              </View>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.ratingBar,
                    { width: barWidth, backgroundColor: config.barColor },
                  ]}
                />
                <Text style={styles.ratingValue}>{rating}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stadiumCard}>
          <Image
            source={Stadium}
            style={styles.stadiumImage}
            resizeMode="cover"
          />
          <View style={styles.stadiumInfo}>
            <Icons name="map-marker" size={24} color="#ff0766cb" />
            <Text style={styles.stadiumText}>
              TU International Cricket Stadium
            </Text>
          </View>
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
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#242424ff',
  },
  teamInfoCard: {
    width: '90%',
    borderRadius: 28,
    marginTop: 20,
    padding: 20,
  },
  teamLogoWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  teamLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    backgroundColor: '#fff',
  },
  teamBadge: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 40,
  },
  teamBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: Inter.semiBold,
    letterSpacing: 1,
  },
  ratingsContainer: {
    width: '90%',
    marginVertical: 10,
    gap: 16,
  },
  ratingRow: {
    gap: 6,
  },
  ratingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 4,
  },
  ratingLabelText: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: Inter.semiBold,
    letterSpacing: 0.5,
  },
  barWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    height: 25,
    overflow: 'hidden',
    position: 'relative',
  },
  ratingBar: {
    height: '100%',
    borderRadius: 12,
  },
  ratingValue: {
    position: 'absolute',
    right: 12,
    color: '#fff',
    fontFamily: Inter.medium,
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scrollArea: {
    width: '100%',
    marginTop: 10,
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 100,
  },
  stadiumCard: {
    width: width * 0.9,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,
    gap: 5,
  },
  stadiumImage: {
    width: '100%',
    height: 250,
  },
  stadiumInfo: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stadiumText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Inter.medium,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ClubScreen;
