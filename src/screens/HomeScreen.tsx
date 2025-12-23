import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  BackHandler,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import TipsBar from '../components/TipsBar';
import DBConfig from '../database/dbconfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { commonStyles } from '../styles/commonStyles';
import CustomAlert from '../components/CustomAlert';
import { gameService } from '../services/gameService';
import RNExitApp from 'react-native-exit-app';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [reset, setReset] = useState(false);
  const [newGame, setNewGame] = useState(false);
  const [newAlertVisible, setNewAlertVisible] = useState(false);
  const [backAlertVisible, setBackAlertVisible] = useState(false);

  useEffect(() => {
    const backAction = () => {
      setBackAlertVisible(true);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        await DBConfig.initUserDatabase();
        const started = await DBConfig.hasGameStarted();
        setNewGame(!started);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing database:', error);
        setLoading(false);
      }
    };

    initDatabase();
  }, []);

  const resetGame = async () => {
    try {
      setReset(true);
      const MIN_LOADING_TIME = 1200;

      const start = Date.now();

      await gameService.resetGame();
      setNewAlertVisible(false);

      const elapsed = Date.now() - start;
      const remaining = MIN_LOADING_TIME - elapsed;

      if (remaining > 0) {
        await new Promise(resolve =>
          setTimeout(() => resolve(null), remaining),
        );
      }
      setReset(false);
      navigation.navigate('TeamSelection');
    } catch (error) {
      console.log('error occured', error);
      setReset(false);
    }
  };

  return (
    <View style={[styles.container, commonStyles.container]}>
      {loading && <ActivityIndicator size={60} color="#ffffff" />}
      {newGame ? (
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => {
            navigation.navigate('TeamSelection');
          }}
        >
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.continueContainer}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => {
              navigation.navigate('Dashboard');
            }}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => setNewAlertVisible(true)}
          >
            <Text style={styles.buttonText}>New Game</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('Settings');
        }}
      >
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>

      {reset && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      <TipsBar />
      <CustomAlert
        visible={newAlertVisible}
        title="Start New Game"
        message="Do you want to lose all current progress and start a new game ?"
        onYes={resetGame}
        onNo={() => setNewAlertVisible(false)}
      />
      <CustomAlert
        visible={backAlertVisible}
        title="Exit Game"
        message="Are you sure you want to Exit Game ?"
        onYes={() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
          setBackAlertVisible(false);
          RNExitApp.exitApp();
        }}
        onNo={() => setBackAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  continueContainer: {
    width: '100%',
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#333333ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    width: '45%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 12,
  },
});

export default HomeScreen;
