import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {teacherAPI} from '../../services/teacherService';

// ── Thunks ────────────────────────────────────────────────────────────────
export const fetchTeacherStats = createAsyncThunk('teacher/fetchStats', async (_, {rejectWithValue}) => {
  try { return (await teacherAPI.getStats()).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchMyClasses = createAsyncThunk('teacher/fetchClasses', async (_, {rejectWithValue}) => {
  try { return (await teacherAPI.getMyClasses()).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchClassStudents = createAsyncThunk('teacher/fetchStudents', async (classId, {rejectWithValue}) => {
  try { return (await teacherAPI.getClassStudents(classId)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchSubjects = createAsyncThunk('teacher/fetchSubjects', async (params, {rejectWithValue}) => {
  try { return (await teacherAPI.getSubjects(params)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchAssignments = createAsyncThunk('teacher/fetchAssignments', async (params, {rejectWithValue}) => {
  try { return (await teacherAPI.getAssignments(params)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const createAssignmentThunk = createAsyncThunk('teacher/createAssignment', async (formData, {rejectWithValue}) => {
  try { return (await teacherAPI.createAssignment(formData)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const deleteAssignmentThunk = createAsyncThunk('teacher/deleteAssignment', async (id, {rejectWithValue}) => {
  try { await teacherAPI.deleteAssignment(id); return id; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchMaterials = createAsyncThunk('teacher/fetchMaterials', async (params, {rejectWithValue}) => {
  try { return (await teacherAPI.getMaterials(params)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchMarks = createAsyncThunk('teacher/fetchMarks', async (params, {rejectWithValue}) => {
  try { return (await teacherAPI.getMarks(params)).data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const bulkUpsertMarksThunk = createAsyncThunk('teacher/bulkMarks', async (marks, {rejectWithValue}) => {
  try { return (await teacherAPI.bulkUpsertMarks(marks)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const fetchAttendance = createAsyncThunk('teacher/fetchAttendance', async (params, {rejectWithValue}) => {
  try { return (await teacherAPI.getAttendance(params)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

export const bulkMarkAttendanceThunk = createAsyncThunk('teacher/bulkAttendance', async (data, {rejectWithValue}) => {
  try { return (await teacherAPI.bulkMarkAttendance(data)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

// ── Slice ─────────────────────────────────────────────────────────────────
const teacherSlice = createSlice({
  name: 'teacher',
  initialState: {
    stats: null,
    classes: [],
    classStudents: [],       // students for selected class
    subjects: [],
    assignments: [],
    assignmentsTotal: 0,
    materials: [],
    materialsTotal: 0,
    marks: [],
    attendance: [],
    loading: false,
    actionLoading: false,
    error: null,
  },
  reducers: {
    clearTeacherError: s => { s.error = null; },
    clearClassStudents: s => { s.classStudents = []; },
  },
  extraReducers: b => {
    const pending  = key => s => { s.loading = true; s.error = null; };
    const rejected = key => (s, a) => { s.loading = false; s.error = a.payload; };

    b.addCase(fetchTeacherStats.pending,   pending())
     .addCase(fetchTeacherStats.fulfilled, (s, a) => { s.loading = false; s.stats = a.payload; })
     .addCase(fetchTeacherStats.rejected,  rejected());

    b.addCase(fetchMyClasses.pending,   pending())
     .addCase(fetchMyClasses.fulfilled, (s, a) => { s.loading = false; s.classes = a.payload?.classes || []; })
     .addCase(fetchMyClasses.rejected,  rejected());

    b.addCase(fetchClassStudents.pending,   pending())
     .addCase(fetchClassStudents.fulfilled, (s, a) => { s.loading = false; s.classStudents = a.payload?.students || []; })
     .addCase(fetchClassStudents.rejected,  rejected());

    b.addCase(fetchSubjects.pending,   pending())
     .addCase(fetchSubjects.fulfilled, (s, a) => { s.loading = false; s.subjects = a.payload?.subjects || []; })
     .addCase(fetchSubjects.rejected,  rejected());

    b.addCase(fetchAssignments.pending,   pending())
     .addCase(fetchAssignments.fulfilled, (s, a) => {
       s.loading = false;
       s.assignments = a.payload?.data || [];
       s.assignmentsTotal = a.payload?.pagination?.total || 0;
     })
     .addCase(fetchAssignments.rejected,  rejected());

    b.addCase(createAssignmentThunk.pending,   s => { s.actionLoading = true; })
     .addCase(createAssignmentThunk.fulfilled, (s, a) => {
       s.actionLoading = false;
       if (a.payload?.assignment) s.assignments.unshift(a.payload.assignment);
     })
     .addCase(createAssignmentThunk.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; });

    b.addCase(deleteAssignmentThunk.fulfilled, (s, a) => {
      s.assignments = s.assignments.filter(x => x.id !== a.payload);
    });

    b.addCase(fetchMaterials.pending,   pending())
     .addCase(fetchMaterials.fulfilled, (s, a) => {
       s.loading = false;
       s.materials = a.payload?.data || [];
       s.materialsTotal = a.payload?.pagination?.total || 0;
     })
     .addCase(fetchMaterials.rejected,  rejected());

    b.addCase(fetchMarks.pending,   pending())
     .addCase(fetchMarks.fulfilled, (s, a) => { s.loading = false; s.marks = a.payload?.data || []; })
     .addCase(fetchMarks.rejected,  rejected());

    b.addCase(bulkUpsertMarksThunk.pending,   s => { s.actionLoading = true; })
     .addCase(bulkUpsertMarksThunk.fulfilled, s => { s.actionLoading = false; })
     .addCase(bulkUpsertMarksThunk.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; });

    b.addCase(fetchAttendance.pending,   pending())
     .addCase(fetchAttendance.fulfilled, (s, a) => { s.loading = false; s.attendance = a.payload?.attendance || []; })
     .addCase(fetchAttendance.rejected,  rejected());

    b.addCase(bulkMarkAttendanceThunk.pending,   s => { s.actionLoading = true; })
     .addCase(bulkMarkAttendanceThunk.fulfilled, s => { s.actionLoading = false; })
     .addCase(bulkMarkAttendanceThunk.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; });
  },
});

export const {clearTeacherError, clearClassStudents} = teacherSlice.actions;
export default teacherSlice.reducer;
