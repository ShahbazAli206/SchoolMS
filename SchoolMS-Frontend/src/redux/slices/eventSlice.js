import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {eventAPI} from '../../services/eventService';

export const fetchEvents = createAsyncThunk('events/fetch', async (params, {rejectWithValue}) => {
  try { return (await eventAPI.list(params)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const createEventThunk = createAsyncThunk('events/create', async (data, {rejectWithValue}) => {
  try { return (await eventAPI.create(data)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const updateEventThunk = createAsyncThunk('events/update', async ({id, data}, {rejectWithValue}) => {
  try { return (await eventAPI.update(id, data)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const deleteEventThunk = createAsyncThunk('events/delete', async (id, {rejectWithValue}) => {
  try { await eventAPI.remove(id); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const eventSlice = createSlice({
  name: 'events',
  initialState: {list: [], total: 0, loading: false, actionLoading: false, error: null},
  reducers: {
    clearEventError: s => { s.error = null; },
  },
  extraReducers: b => {
    b.addCase(fetchEvents.pending,   s => { s.loading = true; s.error = null; })
     .addCase(fetchEvents.fulfilled, (s, a) => {
       s.loading = false;
       s.list  = a.payload?.data || [];
       s.total = a.payload?.pagination?.total || 0;
     })
     .addCase(fetchEvents.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    b.addCase(createEventThunk.pending,   s => { s.actionLoading = true; })
     .addCase(createEventThunk.fulfilled, (s, a) => {
       s.actionLoading = false;
       s.list.unshift(a.payload);
       s.total += 1;
     })
     .addCase(createEventThunk.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; });

    b.addCase(updateEventThunk.fulfilled, (s, a) => {
      const idx = s.list.findIndex(e => e.id === a.payload.id);
      if (idx !== -1) s.list[idx] = a.payload;
    });

    b.addCase(deleteEventThunk.fulfilled, (s, a) => {
      s.list  = s.list.filter(e => e.id !== a.payload);
      s.total = Math.max(0, s.total - 1);
    });
  },
});

export const {clearEventError} = eventSlice.actions;
export default eventSlice.reducer;
