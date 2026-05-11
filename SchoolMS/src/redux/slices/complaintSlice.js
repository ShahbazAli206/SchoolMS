import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {complaintAPI} from '../../services/complaintService';

// ── Parent ──────────────────────────────────────────────────────────────────
export const submitComplaintThunk = createAsyncThunk(
  'complaints/submit',
  async (formData, {rejectWithValue}) => {
    try { return (await complaintAPI.submit(formData)).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  },
);

export const fetchMyComplaints = createAsyncThunk(
  'complaints/fetchMy',
  async (params, {rejectWithValue}) => {
    try { return (await complaintAPI.getMyList(params)).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  },
);

export const fetchReceivedComplaints = createAsyncThunk(
  'complaints/fetchReceived',
  async (params, {rejectWithValue}) => {
    try { return (await complaintAPI.getReceivedList(params)).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  },
);

export const deleteComplaintThunk = createAsyncThunk(
  'complaints/delete',
  async (id, {rejectWithValue}) => {
    try { await complaintAPI.deleteOne(id); return id; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  },
);

// ── Teacher ─────────────────────────────────────────────────────────────────
export const teacherSubmitComplaintThunk = createAsyncThunk(
  'complaints/teacherSubmit',
  async (formData, {rejectWithValue}) => {
    try { return (await complaintAPI.teacherSubmit(formData)).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  },
);

export const fetchTeacherInbox = createAsyncThunk(
  'complaints/teacherInbox',
  async (params, {rejectWithValue}) => {
    try { return (await complaintAPI.teacherInbox(params)).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  },
);

// ── Staff ───────────────────────────────────────────────────────────────────
export const fetchStaffComplaints = createAsyncThunk(
  'complaints/staffList',
  async (params, {rejectWithValue}) => {
    try { return (await complaintAPI.staffList(params)).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  },
);

export const fetchStaffStats = createAsyncThunk(
  'complaints/staffStats',
  async (_, {rejectWithValue}) => {
    try { return (await complaintAPI.staffStats()).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  },
);

// ── Principal ───────────────────────────────────────────────────────────────
export const fetchPrincipalComplaints = createAsyncThunk(
  'complaints/principalList',
  async (params, {rejectWithValue}) => {
    try { return (await complaintAPI.principalList(params)).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  },
);

export const fetchPrincipalStats = createAsyncThunk(
  'complaints/principalStats',
  async (_, {rejectWithValue}) => {
    try { return (await complaintAPI.principalStats()).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  },
);

// ── Admin ───────────────────────────────────────────────────────────────────
export const fetchAdminComplaints = createAsyncThunk(
  'complaints/adminFetch',
  async (params, {rejectWithValue}) => {
    try { return (await complaintAPI.adminGetAll(params)).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  },
);

export const fetchAdminStats = createAsyncThunk(
  'complaints/adminStats',
  async (_, {rejectWithValue}) => {
    try { return (await complaintAPI.adminGetStats()).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  },
);

export const adminUpdateComplaintThunk = createAsyncThunk(
  'complaints/adminUpdate',
  async ({id, data}, {rejectWithValue}) => {
    try { return (await complaintAPI.adminUpdate(id, data)).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  },
);

// ── Shared reply (visible to caller via role rules) ─────────────────────────
export const replyComplaintThunk = createAsyncThunk(
  'complaints/reply',
  async ({id, data}, {rejectWithValue}) => {
    try { return (await complaintAPI.reply(id, data)).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  },
);

const initialState = {
  myList:        [],
  myTotal:       0,
  receivedList:  [],
  receivedTotal: 0,
  inboxList:     [],
  inboxTotal:    0,
  staffList:     [],
  staffTotal:    0,
  principalList: [],
  principalTotal:0,
  adminList:     [],
  adminTotal:    0,
  stats:         null,
  adminStats:    null,
  loading:       false,
  actionLoading: false,
  error:         null,
};

const replaceItem = (list, item) => {
  const idx = list.findIndex(c => c.id === item.id);
  if (idx !== -1) list[idx] = item;
};

const complaintSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    clearComplaintError: s => { s.error = null; },
  },
  extraReducers: b => {
    // ── parent submit ──
    b.addCase(submitComplaintThunk.pending,   s => { s.actionLoading = true; s.error = null; })
     .addCase(submitComplaintThunk.fulfilled, (s, a) => {
       s.actionLoading = false;
       s.myList.unshift(a.payload);
       s.myTotal += 1;
     })
     .addCase(submitComplaintThunk.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; });

    // ── parent my ──
    b.addCase(fetchMyComplaints.pending,   s => { s.loading = true; s.error = null; })
     .addCase(fetchMyComplaints.fulfilled, (s, a) => {
       s.loading = false;
       s.myList  = a.payload?.data || [];
       s.myTotal = a.payload?.pagination?.total || 0;
     })
     .addCase(fetchMyComplaints.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // ── parent received ──
    b.addCase(fetchReceivedComplaints.pending,   s => { s.loading = true; s.error = null; })
     .addCase(fetchReceivedComplaints.fulfilled, (s, a) => {
       s.loading = false;
       s.receivedList  = a.payload?.data || [];
       s.receivedTotal = a.payload?.pagination?.total || 0;
     })
     .addCase(fetchReceivedComplaints.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // ── parent delete ──
    b.addCase(deleteComplaintThunk.fulfilled, (s, a) => {
      s.myList  = s.myList.filter(c => c.id !== a.payload);
      s.myTotal = Math.max(0, s.myTotal - 1);
    });

    // ── teacher submit ──
    b.addCase(teacherSubmitComplaintThunk.pending,   s => { s.actionLoading = true; s.error = null; })
     .addCase(teacherSubmitComplaintThunk.fulfilled, (s, a) => {
       s.actionLoading = false;
       s.inboxList.unshift(a.payload);
       s.inboxTotal += 1;
     })
     .addCase(teacherSubmitComplaintThunk.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; });

    // ── teacher inbox ──
    b.addCase(fetchTeacherInbox.pending,   s => { s.loading = true; s.error = null; })
     .addCase(fetchTeacherInbox.fulfilled, (s, a) => {
       s.loading    = false;
       s.inboxList  = a.payload?.data || [];
       s.inboxTotal = a.payload?.pagination?.total || 0;
     })
     .addCase(fetchTeacherInbox.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // ── staff ──
    b.addCase(fetchStaffComplaints.pending,   s => { s.loading = true; s.error = null; })
     .addCase(fetchStaffComplaints.fulfilled, (s, a) => {
       s.loading    = false;
       s.staffList  = a.payload?.data || [];
       s.staffTotal = a.payload?.pagination?.total || 0;
     })
     .addCase(fetchStaffComplaints.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });
    b.addCase(fetchStaffStats.fulfilled, (s, a) => { s.stats = a.payload; });

    // ── principal ──
    b.addCase(fetchPrincipalComplaints.pending,   s => { s.loading = true; s.error = null; })
     .addCase(fetchPrincipalComplaints.fulfilled, (s, a) => {
       s.loading        = false;
       s.principalList  = a.payload?.data || [];
       s.principalTotal = a.payload?.pagination?.total || 0;
     })
     .addCase(fetchPrincipalComplaints.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });
    b.addCase(fetchPrincipalStats.fulfilled, (s, a) => { s.stats = a.payload; });

    // ── admin ──
    b.addCase(fetchAdminComplaints.pending,   s => { s.loading = true; s.error = null; })
     .addCase(fetchAdminComplaints.fulfilled, (s, a) => {
       s.loading    = false;
       s.adminList  = a.payload?.data || [];
       s.adminTotal = a.payload?.pagination?.total || 0;
     })
     .addCase(fetchAdminComplaints.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });
    b.addCase(fetchAdminStats.fulfilled, (s, a) => { s.adminStats = a.payload; s.stats = a.payload; });

    b.addCase(adminUpdateComplaintThunk.pending,   s => { s.actionLoading = true; })
     .addCase(adminUpdateComplaintThunk.fulfilled, (s, a) => {
       s.actionLoading = false;
       replaceItem(s.adminList,     a.payload);
       replaceItem(s.staffList,     a.payload);
       replaceItem(s.principalList, a.payload);
       replaceItem(s.inboxList,     a.payload);
     })
     .addCase(adminUpdateComplaintThunk.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; });

    // ── shared reply ──
    b.addCase(replyComplaintThunk.pending,   s => { s.actionLoading = true; })
     .addCase(replyComplaintThunk.fulfilled, (s, a) => {
       s.actionLoading = false;
       replaceItem(s.adminList,     a.payload);
       replaceItem(s.staffList,     a.payload);
       replaceItem(s.principalList, a.payload);
       replaceItem(s.inboxList,     a.payload);
     })
     .addCase(replyComplaintThunk.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; });
  },
});

export const {clearComplaintError} = complaintSlice.actions;
export default complaintSlice.reducer;
