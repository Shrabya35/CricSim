import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import MusicManager from '../audio/MusicManager';

const MatchMusic = () => {
  useFocusEffect(
    useCallback(() => {
      MusicManager.play('match_bgm.mp3');

      return () => {
        MusicManager.play('bgm.mp3');
      };
    }, []),
  );

  return null;
};

export default MatchMusic;
