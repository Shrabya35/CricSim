import Sound from 'react-native-sound';
import { Platform } from 'react-native';
import { Settings } from '../database/settings';

class MusicManager {
  private static instance: MusicManager;
  private sound: Sound | null = null;

  private constructor() {
    if (Platform.OS === 'android') {
      Sound.setCategory('Playback');
    }

    Settings.onChange(settings => {
      this.sound?.setVolume(settings.volume);
    });
  }

  static getInstance() {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

  play(track: string) {
    if (Platform.OS !== 'android') return;

    this.stop();

    Settings.load().then(settings => {
      const sound = new Sound(track, Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.log('Music load failed', error);
          return;
        }

        sound.setNumberOfLoops(-1);
        sound.setVolume(settings.volume);
        sound.play();
      });

      this.sound = sound;
    });
  }

  stop() {
    this.sound?.stop(() => {
      this.sound?.release();
      this.sound = null;
    });
  }
}

export default MusicManager.getInstance();
