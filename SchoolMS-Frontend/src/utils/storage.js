import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  set: async (key, value) => {
    try {
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch {}
  },

  get: async key => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch {
      return null;
    }
  },

  remove: async key => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {}
  },

  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch {}
  },
};
