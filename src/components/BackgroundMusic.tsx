import { useEffect } from 'react';
import { AppState } from 'react-native';
import MusicManager from '../audio/MusicManager';

const BackgroundMusic = () => {
  useEffect(() => {
    MusicManager.play('bgm.mp3');

    const sub = AppState.addEventListener('change', state => {
      if (state === 'background' || state === 'inactive') {
        MusicManager.stop();
      }

      if (state === 'active') {
        MusicManager.play('bgm.mp3');
      }
    });

    return () => {
      sub.remove();
      MusicManager.stop();
    };
  }, []);

  return null;
};

export default BackgroundMusic;
