import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  BackHandler,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HistoryDB, { History } from '../database/historyDB';
import { commonStyles } from '../styles/commonStyles';
import { teamLogos } from '../database/assets';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Inter } from '../constants/fonts';

const { width } = Dimensions.get('window');

type HistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'History'
>;

const HistoryScreen = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<History[]>([]);

  useEffect(() => {
    const backAction = () => {
      navigation.replace('Dashboard');
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const getHistory = async () => {
      try {
        const fullHistory = await HistoryDB.getHistory();
        setHistory(fullHistory);
      } catch (error) {
        console.log('error getting history', error);
      }
    };
    getHistory();
  }, []);

  const renderHistoryItem = (item: History, index: number) => {
    return (
      <View key={index} style={styles.historyCard}>
        <View style={styles.yearSection}>
          <Text style={styles.yearText}>{item.year}</Text>
          {!item.ongoing && (
            <View style={styles.winnerBadge}>
              <Icons name="trophy" size={14} color="#ffd966" />
              <Text style={styles.winnerBadgeText}>Winner</Text>
            </View>
          )}
        </View>

        {item.ongoing ? (
          <View style={styles.ongoingContainer}>
            <Icons name="progress-clock" size={20} color="#ff0766cb" />
            <Text style={styles.ongoingText}>Ongoing Season</Text>
          </View>
        ) : (
          <View style={styles.winnerContainer}>
            <Image source={teamLogos[item.logo]} style={styles.winnerLogo} />
            <Text style={styles.winnerName}>{item.winner}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={commonStyles.titleContainer}>
        <Text style={commonStyles.titleText}>History</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {history.map(renderHistoryItem)}
      </ScrollView>

      <TouchableOpacity
        style={commonStyles.backButton}
        onPress={() => navigation.replace('Dashboard')}
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
    backgroundColor: '#242424ff',
    alignItems: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 100,
    paddingTop: 20,
    width: '100%',
  },
  historyCard: {
    width: width * 0.8,
    backgroundColor: '#333333ff',
    borderRadius: 24,
    marginBottom: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#2c2c2c',
    alignItems: 'center',
  },
  yearSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  yearText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: Inter.bold,
    marginBottom: 6,
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ff0766cb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  winnerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Inter.semiBold,
  },
  winnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  winnerLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ff0766cb',
    backgroundColor: '#fff',
  },
  winnerName: {
    color: '#ffd966',
    fontSize: 18,
    fontFamily: Inter.semiBold,
  },
  ongoingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: 'rgba(255, 7, 102, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 40,
  },
  ongoingText: {
    color: '#ff0766cb',
    fontSize: 14,
    fontFamily: Inter.semiBold,
  },
});

export default HistoryScreen;
