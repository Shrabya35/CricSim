/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  BackHandler,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HistoryDB, { History } from '../database/historyDB';
import { commonStyles } from '../styles/commonStyles';
import { teamLogos } from '../database/assets';

type HisotryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'History'
>;

const HistoryScreen = () => {
  const navigation = useNavigation<HisotryScreenNavigationProp>();
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

  const renderHistory = (item: History, index: number) => {
    return (
      <View key={index} style={styles.historyItem}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 18 }}>{item.year}</Text>
          <Text style={styles.winnerText}>Winner</Text>
        </View>
        {item.ongoing ? (
          <Text style={{ color: 'white', fontSize: 18 }}>Ongoing</Text>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              gap: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              source={teamLogos[item.logo]}
              style={{
                width: 40,
                height: 40,
              }}
            />
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>
              {item.winner}
            </Text>
          </View>
        )}
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { height: insets.top }]} />
      <View style={commonStyles.titleContainer}>
        <Text style={commonStyles.titleText}>History</Text>
      </View>
      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{ marginTop: 30, paddingBottom: 100 }}
      >
        {history.map(renderHistory)}
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
  historyItem: {
    backgroundColor: '#333333ff',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  winnerText: {
    color: '#fff',
    paddingVertical: 1,
    padding: 10,
    backgroundColor: '#ff0766cb',
    marginTop: 5,
  },
});
export default HistoryScreen;
