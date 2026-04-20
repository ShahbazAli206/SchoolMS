import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {complaintAPI} from '../../services/complaintService';

export const submitComplaintThunk = createAsyncThunk(
  'complaints/submit',
  async (formData, {rejectWithValue}) => {
    try { return (await complaintAPI.submit(formData)).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

export const fetchMyComplaints = createAsyncThunk(
  'complaints/fetchMy',
  async (params, {rejectWithValue}) => {
    try { return (await complaintAPI.getMyList(params)).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

export const deleteComplaintThunk = createAsyncThunk(
  'complaints/delete',
  async (id, {rejectWithValue}) => {
    try { await complaintAPI.deleteOne(id); return id; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

export const fetchAdminComplaints = createAsyncThunk(
  'complaints/adminFetch',
  async (params, {rejectWithValue}) => {
    try { return (await complaintAPI.adminGetAll(params)).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

export const fetchAdminStats = createAsyncThunk(
  'complaints/adminStats',
  async (_, {rejectWithValue}) => {
    try { return (await complaintAPI.adminGetStats()).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

export const adminUpdateComplaintThunk = createAsyncThunk(
  'complaints/adminUpdate',
  async ({id, data}, {rejectWithValue}) => {
    try { return (await complaintAPI.adminUpdate(id, data)).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

const complaintSlice = createSlice({
  name: 'complaints',
  initialState: {
    myList:       [],
    myTotal:      0,
    adminList:    [],
    adminTotal:   0,
    stats:        null,
    loading:      false,
    actionLoading: false,
    error:        null,
  },
  reducers: {
    clearComplaintError: s => { s.error = null; },
  },
  extraReducers: b => {
    // submit
    b.addCase(submitComplaintThunk.pending,   s => { s.actionLoading = true; s.error = null; })
     .addCase(submitComplaintThunk.fulfilled, (s, a) => {
       s.actionLoading = false;
       s.myList.unshift(a.payload);
       s.myTotal += 1;
     })
     .addCase(submitComplaintThunk.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; });

    // fetch my list
    b.addCase(fetchMyComplaints.pending,   s => { s.loading = true; s.error = null; })
     .addCase(fetchMyComplaints.fulfilled, (s, a) => {
       s.loading  = false;
       s.myList   = a.payload?.data || [];
       s.myTotal  = a.payload?.pagination?.total || 0;
     })
     .addCase(fetchMyComplaints.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // delete
    b.addCase(deleteComplaintThunk.fulfilled, (s, a) => {
      s.myList  = s.myList.filter(c => c.id !== a.payload);
      s.myTotal = Math.max(0, s.myTotal - 1);
    });

    // admin fetch
    b.addCase(fetchAdminComplaints.pending,   s => { s.loading = true; s.error = null; })
     .addCase(fetchAdminComplaints.fulfilled, (s, a) => {
       s.loading    = false;
       s.adminList  = a.payload?.data || [];
       s.adminTotal = a.payload?.pagination?.total || 0;
     })
     .addCase(fetchAdminComplaints.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // admin stats
    b.addCase(fetchAdminStats.fulfilled, (s, a) => { s.stats = a.payload; });

    // admin update
    b.addCase(adminUpdateComplaintThunk.pending,   s => { s.actionLoading = true; })
     .addCase(adminUpdateComplaintThunk.fulfilled, (s, a) => {
       s.actionLoading = false;
       const idx = s.adminList.findIndex(c => c.id === a.payload.id);
       if (idx !== -1) s.adminList[idx] = a.payload;
     })
     .addCase(adminUpdateComplaintThunk.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; });
  },
});

export const {clearComplaintError} = complaintSlice.actions;
export default complaintSlice.reducer;
