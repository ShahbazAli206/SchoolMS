import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {parentAPI} from '../../services/parentService';

export const fetchParentDashboard = createAsyncThunk('parent/dashboard', async (_, {rejectWithValue}) => {
  try { return (await parentAPI.getDashboard()).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchChildren = createAsyncThunk('parent/children', async (_, {rejectWithValue}) => {
  try { return (await parentAPI.getChildren()).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchChildMarks = createAsyncThunk('parent/childMarks', async ({id, params}, {rejectWithValue}) => {
  try { return (await parentAPI.getChildMarks(id, params)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchChildAttendance = createAsyncThunk('parent/childAttendance', async ({id, params}, {rejectWithValue}) => {
  try { return (await parentAPI.getChildAttendance(id, params)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchChildAssignments = createAsyncThunk('parent/childAssignments', async ({id, params}, {rejectWithValue}) => {
  try { return (await parentAPI.getChildAssignments(id, params)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const parentSlice = createSlice({
  name: 'parent',
  initialState: {
    dashboard: null,
    children: [],
    selectedChildId: null,
    childMarks: [],
    childMarksSummary: [],
    childAttendance: [],
    childAttendanceSummary: null,
    childAssignments: [],
    loading: false,
    error: null,
  },
  reducers: {
    selectChild: (s, a) => { s.selectedChildId = a.payload; },
    clearParentError: s => { s.error = null; },
  },
  extraReducers: b => {
    const pending  = () => s => { s.loading = true; s.error = null; };
    const rejected = () => (s, a) => { s.loading = false; s.error = a.payload; };

    b.addCase(fetchParentDashboard.pending,   pending())
     .addCase(fetchParentDashboard.fulfilled, (s, a) => { s.loading = false; s.dashboard = a.payload; })
     .addCase(fetchParentDashboard.rejected,  rejected());

    b.addCase(fetchChildren.pending,   pending())
     .addCase(fetchChildren.fulfilled, (s, a) => { s.loading = false; s.children = a.payload?.children || []; })
     .addCase(fetchChildren.rejected,  rejected());

    b.addCase(fetchChildMarks.pending,   pending())
     .addCase(fetchChildMarks.fulfilled, (s, a) => {
       s.loading = false;
       s.childMarks        = a.payload?.marks   || [];
       s.childMarksSummary = a.payload?.summary || [];
     })
     .addCase(fetchChildMarks.rejected,  rejected());

    b.addCase(fetchChildAttendance.pending,   pending())
     .addCase(fetchChildAttendance.fulfilled, (s, a) => {
       s.loading = false;
       s.childAttendance        = a.payload?.records || [];
       s.childAttendanceSummary = a.payload?.summary || null;
     })
     .addCase(fetchChildAttendance.rejected,  rejected());

    b.addCase(fetchChildAssignments.pending,   pending())
     .addCase(fetchChildAssignments.fulfilled, (s, a) => {
       s.loading = false;
       s.childAssignments = a.payload?.assignments || [];
     })
     .addCase(fetchChildAssignments.rejected,  rejected());
  },
});

export const {selectChild, clearParentError} = parentSlice.actions;
export default parentSlice.reducer;
