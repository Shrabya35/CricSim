import { useEffect } from 'react';
import MusicManager from '../audio/MusicManager';

const BackgroundMusic = () => {
  useEffect(() => {
    MusicManager.play('bgm.mp3');

    return () => {
      MusicManager.stop();
    };
  }, []);

  return null;
};

export default BackgroundMusic;
