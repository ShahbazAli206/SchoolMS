import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {feeAPI} from '../../services/feeService';

// ── Admin thunks ──────────────────────────────────────────────────────────
export const fetchFeeDashboard = createAsyncThunk('fees/dashboard', async (_, {rejectWithValue}) => {
  try { return (await feeAPI.getDashboard()).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchAllFees = createAsyncThunk('fees/fetchAll', async (params, {rejectWithValue}) => {
  try { return (await feeAPI.getAllFees(params)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const createFeeThunk = createAsyncThunk('fees/create', async (data, {rejectWithValue}) => {
  try { return (await feeAPI.createFee(data)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const deleteFeeThunk = createAsyncThunk('fees/delete', async (id, {rejectWithValue}) => {
  try { await feeAPI.deleteFee(id); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchStudentFeeLedger = createAsyncThunk('fees/studentLedger', async (studentId, {rejectWithValue}) => {
  try { return (await feeAPI.getStudentFees(studentId)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const recordPaymentThunk = createAsyncThunk('fees/recordPayment', async ({feeId, data}, {rejectWithValue}) => {
  try { return (await feeAPI.recordPayment(feeId, data)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

// ── Student thunks ────────────────────────────────────────────────────────
export const fetchMyFees = createAsyncThunk('fees/myFees', async (_, {rejectWithValue}) => {
  try { return (await feeAPI.getMyFees()).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

// ── Parent thunks ─────────────────────────────────────────────────────────
export const fetchChildFees = createAsyncThunk('fees/childFees', async (studentId, {rejectWithValue}) => {
  try { return (await feeAPI.getChildFees(studentId)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

// ── Slice ─────────────────────────────────────────────────────────────────
const feeSlice = createSlice({
  name: 'fees',
  initialState: {
    dashboard: null,
    fees: [],
    feesTotal: 0,
    // Student / parent ledger
    myLedger: [],
    mySummary: null,
    // Admin: per-student ledger
    studentLedger: [],
    studentLedgerSummary: null,
    studentLedgerName: null,
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearFeeError: s => { s.error = null; },
    clearStudentLedger: s => { s.studentLedger = []; s.studentLedgerSummary = null; s.studentLedgerName = null; },
  },
  extraReducers: b => {
    const pending  = () => s => { s.loading = true; s.error = null; };
    const rejected = () => (s, a) => { s.loading = false; s.error = a.payload; };

    b.addCase(fetchFeeDashboard.pending,   pending())
     .addCase(fetchFeeDashboard.fulfilled, (s, a) => { s.loading = false; s.dashboard = a.payload; })
     .addCase(fetchFeeDashboard.rejected,  rejected());

    b.addCase(fetchAllFees.pending,   pending())
     .addCase(fetchAllFees.fulfilled, (s, a) => {
       s.loading = false;
       s.fees      = a.payload?.data || [];
       s.feesTotal = a.payload?.pagination?.total || 0;
     })
     .addCase(fetchAllFees.rejected,  rejected());

    b.addCase(createFeeThunk.pending,   s => { s.actionLoading = true; })
     .addCase(createFeeThunk.fulfilled, (s, a) => {
       s.actionLoading = false;
       if (a.payload?.fee) s.fees.unshift(a.payload.fee);
     })
     .addCase(createFeeThunk.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; });

    b.addCase(deleteFeeThunk.fulfilled, (s, a) => {
      s.fees = s.fees.filter(f => f.id !== a.payload);
    });

    b.addCase(fetchStudentFeeLedger.pending,   pending())
     .addCase(fetchStudentFeeLedger.fulfilled, (s, a) => {
       s.loading = false;
       s.studentLedger        = a.payload?.ledger  || [];
       s.studentLedgerSummary = a.payload?.summary || null;
       s.studentLedgerName    = a.payload?.student?.name || null;
     })
     .addCase(fetchStudentFeeLedger.rejected,  rejected());

    b.addCase(recordPaymentThunk.pending,   s => { s.actionLoading = true; })
     .addCase(recordPaymentThunk.fulfilled, s => { s.actionLoading = false; })
     .addCase(recordPaymentThunk.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; });

    b.addCase(fetchMyFees.pending,   pending())
     .addCase(fetchMyFees.fulfilled, (s, a) => {
       s.loading    = false;
       s.myLedger   = a.payload?.ledger  || [];
       s.mySummary  = a.payload?.summary || null;
     })
     .addCase(fetchMyFees.rejected,  rejected());

    b.addCase(fetchChildFees.pending,   pending())
     .addCase(fetchChildFees.fulfilled, (s, a) => {
       s.loading    = false;
       s.myLedger   = a.payload?.ledger  || [];
       s.mySummary  = a.payload?.summary || null;
     })
     .addCase(fetchChildFees.rejected,  rejected());
  },
});

export const {clearFeeError, clearStudentLedger} = feeSlice.actions;
export default feeSlice.reducer;
