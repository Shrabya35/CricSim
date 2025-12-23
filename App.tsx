import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import MusicManager from './src/audio/MusicManager';

const App = () => {
  useEffect(() => {
    MusicManager.play('bgm.mp3');

    return () => {
      MusicManager.stop();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
