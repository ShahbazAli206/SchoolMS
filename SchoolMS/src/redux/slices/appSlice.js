import {createSlice} from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    isDarkMode: false,
    isOnline: true,
    fcmToken: null,
    lastSyncedAt: null,
    pendingSync: [],
    notifications: [],
    unreadCount: 0,
  },
  reducers: {
    toggleDarkMode: state => {
      state.isDarkMode = !state.isDarkMode;
    },
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    setFcmToken: (state, action) => {
      state.fcmToken = action.payload;
    },
    setLastSynced: (state, action) => {
      state.lastSyncedAt = action.payload;
    },
    addPendingSync: (state, action) => {
      state.pendingSync.push(action.payload);
    },
    clearPendingSync: state => {
      state.pendingSync = [];
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAllRead: state => {
      state.unreadCount = 0;
      state.notifications = state.notifications.map(n => ({...n, read: true}));
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },
  },
});

export const {
  toggleDarkMode,
  setOnlineStatus,
  setFcmToken,
  setLastSynced,
  addPendingSync,
  clearPendingSync,
  addNotification,
  markAllRead,
  setNotifications,
} = appSlice.actions;

export default appSlice.reducer;
