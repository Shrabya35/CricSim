import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserSettings = {
  volume: number;
};

const SETTINGS_KEY = 'USER_SETTINGS';

export const defaultSettings: UserSettings = {
  volume: 1,
};

type Listener = (s: UserSettings) => void;
const listeners: Listener[] = [];

export const Settings = {
  async load(): Promise<UserSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (!data) return defaultSettings;
      return JSON.parse(data);
    } catch {
      return defaultSettings;
    }
  },

  async save(settings: UserSettings) {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    listeners.forEach(fn => fn(settings));
  },

  onChange(callback: Listener) {
    listeners.push(callback);

    return () => {
      const index = listeners.indexOf(callback);
      if (index !== -1) listeners.splice(index, 1);
    };
  },
};
