/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from 'react-native';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { commonStyles } from '../styles/commonStyles';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Settings } from '../database/settings';

type SettingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

const SettingScreen = () => {
  const navigation = useNavigation<SettingScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [volume, setVolume] = useState(1);

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

  useEffect(() => {
    Settings.load().then(s => setVolume(s.volume));
  }, []);

  const updateVolume = (v: number) => {
    setVolume(v);
    Settings.save({ volume: v });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusBar, { height: insets.top }]} />
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Settings</Text>
      </View>
      <ScrollView style={styles.settingContainer}>
        <View style={styles.settingSection}>
          <Text style={styles.settingSectionText}>Volume</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Slider
              style={{ width: 180, height: 40 }}
              value={volume}
              onValueChange={updateVolume}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#ff0766cb"
              maximumTrackTintColor="#555"
              thumbTintColor="#ff0766cb"
            />
          </View>
        </View>
        <View style={styles.settingSection}>
          <View style={styles.settingSubSection}>
            <Text style={styles.settingSectionText}>Get In Touch </Text>
            <Text style={styles.settingSectionDesc}>
              got feedback or a bug report?{'\n'}Get in touch with us
            </Text>
          </View>
          <TouchableOpacity style={styles.sectionButton} activeOpacity={0.8}>
            <Text style={styles.sectionButtonText}>Contact</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.settingSectionBig}>
          <Text style={styles.settingSectionText}>
            Follow us on social media for the latest updates & rewards
          </Text>
          <View style={styles.settingSocialButtons}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#fc026a' }]}
              activeOpacity={0.8}
            >
              <Icons name="instagram" size={28} color="#fff" />
              <Text style={styles.sectionButtonText}>Follow on Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#24abea' }]}
              activeOpacity={0.8}
            >
              <Icons name="twitter" size={28} color="#fff" />
              <Text style={styles.sectionButtonText}>Follow on Twitter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#0167fe' }]}
              activeOpacity={0.8}
            >
              <Icons name="facebook" size={28} color="#fff" />
              <Text style={styles.sectionButtonText}>Follow on Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.settingSection}>
          <Text style={styles.settingSectionText}>App Version</Text>
          <Text style={styles.settingSectionText}>0.0.1</Text>
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
  titleContainer: {
    width: '40%',
    alignItems: 'center',
    backgroundColor: '#333333ff',
    justifyContent: 'center',
    padding: 10,
  },
  titleText: {
    color: '#fff',
    fontSize: 20,
  },
  settingContainer: {
    marginTop: 30,
    flex: 1,
  },
  settingSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333333ff',
    paddingHorizontal: 15,
    paddingVertical: 20,
    marginBottom: 10,
  },
  settingSectionText: {
    color: '#fff',
    fontSize: 18,
  },
  settingSubSection: {
    gap: 10,
  },
  settingSectionDesc: {
    fontSize: 12,
    color: '#828282ff',
  },
  sectionButton: {
    backgroundColor: '#ff0766cb',
    padding: 10,
  },
  sectionButtonText: {
    color: '#fff',
  },
  settingSectionBig: {
    width: '100%',
    flexDirection: 'column',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333ff',
    paddingHorizontal: 50,
    paddingVertical: 20,
    marginBottom: 10,
  },
  settingSocialButtons: {
    gap: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '70%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
});
export default SettingScreen;
