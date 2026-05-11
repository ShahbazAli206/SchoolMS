import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {notificationAPI} from '../../services/notificationService';

export const fetchMyNotifications = createAsyncThunk(
  'notifications/fetchMy',
  async (params, {rejectWithValue}) => {
    try { return (await notificationAPI.getMyNotifications(params)).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/unreadCount',
  async (_, {rejectWithValue}) => {
    try { return (await notificationAPI.getUnreadCount()).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

export const markReadThunk = createAsyncThunk(
  'notifications/markRead',
  async (id, {rejectWithValue}) => {
    try { return (await notificationAPI.markRead(id)).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

export const markAllReadThunk = createAsyncThunk(
  'notifications/markAllRead',
  async (_, {rejectWithValue}) => {
    try { await notificationAPI.markAllRead(); return true; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

export const deleteNotifThunk = createAsyncThunk(
  'notifications/delete',
  async (id, {rejectWithValue}) => {
    try { await notificationAPI.deleteOne(id); return id; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

export const adminSendThunk = createAsyncThunk(
  'notifications/adminSend',
  async (data, {rejectWithValue}) => {
    try { return (await notificationAPI.adminSend(data)).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    total: 0,
    unreadCount: 0,
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearNotifError: s => { s.error = null; },
    // Called from push notification handler to bump badge in real-time
    incrementUnread: s => { s.unreadCount += 1; },
  },
  extraReducers: b => {
    const pending  = () => s => { s.loading = true; s.error = null; };
    const rejected = () => (s, a) => { s.loading = false; s.error = a.payload; };

    b.addCase(fetchMyNotifications.pending,   pending())
     .addCase(fetchMyNotifications.fulfilled, (s, a) => {
       s.loading = false;
       s.items   = a.payload?.data || [];
       s.total   = a.payload?.pagination?.total || 0;
     })
     .addCase(fetchMyNotifications.rejected,  rejected());

    b.addCase(fetchUnreadCount.fulfilled, (s, a) => {
      s.unreadCount = a.payload?.count ?? 0;
    });

    b.addCase(markReadThunk.fulfilled, (s, a) => {
      const id = a.payload?.notification?.id;
      const item = s.items.find(n => n.id === id);
      if (item && !item.is_read) {
        item.is_read = true;
        s.unreadCount = Math.max(0, s.unreadCount - 1);
      }
    });

    b.addCase(markAllReadThunk.fulfilled, s => {
      s.items.forEach(n => { n.is_read = true; });
      s.unreadCount = 0;
    });

    b.addCase(deleteNotifThunk.fulfilled, (s, a) => {
      const removed = s.items.find(n => n.id === a.payload);
      if (removed && !removed.is_read) s.unreadCount = Math.max(0, s.unreadCount - 1);
      s.items = s.items.filter(n => n.id !== a.payload);
    });

    b.addCase(adminSendThunk.pending,   s => { s.actionLoading = true; })
     .addCase(adminSendThunk.fulfilled, s => { s.actionLoading = false; })
     .addCase(adminSendThunk.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; });
  },
});

export const {clearNotifError, incrementUnread} = notificationSlice.actions;
export default notificationSlice.reducer;
