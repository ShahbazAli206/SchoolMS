import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {studentAPI} from '../../services/studentService';

export const fetchStudentDashboard  = createAsyncThunk('student/dashboard',    async (_, {rejectWithValue}) => {
  try { return (await studentAPI.getDashboard()).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchStudentAssignments = createAsyncThunk('student/assignments', async (params, {rejectWithValue}) => {
  try { return (await studentAPI.getAssignments(params)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchStudentMarks = createAsyncThunk('student/marks', async (params, {rejectWithValue}) => {
  try { return (await studentAPI.getMarks(params)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchStudentAttendance = createAsyncThunk('student/attendance', async (params, {rejectWithValue}) => {
  try { return (await studentAPI.getAttendance(params)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchStudentMaterials = createAsyncThunk('student/materials', async (params, {rejectWithValue}) => {
  try { return (await studentAPI.getMaterials(params)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const studentSlice = createSlice({
  name: 'student',
  initialState: {
    dashboard: null,
    assignments: [],
    assignmentsTotal: 0,
    marks: [],
    marksSummary: [],
    attendance: [],
    attendanceSummary: null,
    materials: [],
    materialsTotal: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearStudentError: s => { s.error = null; },
  },
  extraReducers: b => {
    const pending  = () => s => { s.loading = true; s.error = null; };
    const rejected = () => (s, a) => { s.loading = false; s.error = a.payload; };

    b.addCase(fetchStudentDashboard.pending,   pending())
     .addCase(fetchStudentDashboard.fulfilled, (s, a) => { s.loading = false; s.dashboard = a.payload; })
     .addCase(fetchStudentDashboard.rejected,  rejected());

    b.addCase(fetchStudentAssignments.pending,   pending())
     .addCase(fetchStudentAssignments.fulfilled, (s, a) => {
       s.loading = false;
       s.assignments      = a.payload?.data || [];
       s.assignmentsTotal = a.payload?.pagination?.total || 0;
     })
     .addCase(fetchStudentAssignments.rejected,  rejected());

    b.addCase(fetchStudentMarks.pending,   pending())
     .addCase(fetchStudentMarks.fulfilled, (s, a) => {
       s.loading = false;
       s.marks        = a.payload?.marks    || [];
       s.marksSummary = a.payload?.summary  || [];
     })
     .addCase(fetchStudentMarks.rejected,  rejected());

    b.addCase(fetchStudentAttendance.pending,   pending())
     .addCase(fetchStudentAttendance.fulfilled, (s, a) => {
       s.loading = false;
       s.attendance        = a.payload?.records || [];
       s.attendanceSummary = a.payload?.summary || null;
     })
     .addCase(fetchStudentAttendance.rejected,  rejected());

    b.addCase(fetchStudentMaterials.pending,   pending())
     .addCase(fetchStudentMaterials.fulfilled, (s, a) => {
       s.loading = false;
       s.materials      = a.payload?.data || [];
       s.materialsTotal = a.payload?.pagination?.total || 0;
     })
     .addCase(fetchStudentMaterials.rejected,  rejected());
  },
});

export const {clearStudentError} = studentSlice.actions;
export default studentSlice.reducer;
