import Sound from 'react-native-sound';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { Settings } from '../database/settings';

Sound.setCategory('Playback');

class MusicManager {
  private static instance: MusicManager;

  private sound: Sound | null = null;
  private currentTrack: string | null = null;
  private isPausedByAppState = false;

  private constructor() {
    Settings.onChange(settings => {
      this.sound?.setVolume(settings.volume);
    });

    AppState.addEventListener('change', this.handleAppStateChange);
  }

  static getInstance() {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

  private handleAppStateChange = (state: AppStateStatus) => {
    if (!this.sound) return;

    if (state !== 'active') {
      this.isPausedByAppState = true;
      this.sound.pause();
    } else {
      if (this.isPausedByAppState) {
        this.sound.play();
        this.isPausedByAppState = false;
      }
    }
  };

  play(track: string) {
    if (Platform.OS !== 'android') return;

    if (this.currentTrack === track && this.sound !== null) {
      return;
    }

    this.stop();

    this.currentTrack = track;

    Settings.load().then(settings => {
      const newSound = new Sound(track, Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.log('Music load failed', error);
          return;
        }

        newSound.setNumberOfLoops(-1);
        newSound.setVolume(settings.volume);
        newSound.play();
      });

      this.sound = newSound;
    });
  }

  stop() {
    if (this.sound) {
      this.sound.stop(() => {
        this.sound?.release();
        this.sound = null;
      });
    }

    this.currentTrack = null;
  }

  pause() {
    this.sound?.pause();
  }

  resume() {
    if (this.sound && this.currentTrack) {
      this.sound.play();
    }
  }

  getCurrentTrack() {
    return this.currentTrack;
  }
}

export default MusicManager.getInstance();
