import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {adminAPI} from '../../services/adminService';

// ── Async thunks ────────────────────────────────────────────────────────
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, {rejectWithValue}) => {
    try {
      const res = await adminAPI.getStats();
      return res.data.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Failed to load stats');
    }
  },
);

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params, {rejectWithValue}) => {
    try {
      const res = await adminAPI.getAllUsers(params);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Failed to load users');
    }
  },
);

export const createUserThunk = createAsyncThunk(
  'admin/createUser',
  async (data, {rejectWithValue}) => {
    try {
      const res = await adminAPI.createUser(data);
      return res.data.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Failed to create user');
    }
  },
);

export const updateUserThunk = createAsyncThunk(
  'admin/updateUser',
  async ({id, data}, {rejectWithValue}) => {
    try {
      const res = await adminAPI.updateUser(id, data);
      return res.data.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Failed to update user');
    }
  },
);

export const deleteUserThunk = createAsyncThunk(
  'admin/deleteUser',
  async (id, {rejectWithValue}) => {
    try {
      await adminAPI.deleteUser(id);
      return id;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Failed to delete user');
    }
  },
);

export const toggleStatusThunk = createAsyncThunk(
  'admin/toggleStatus',
  async (userId, {rejectWithValue}) => {
    try {
      const res = await adminAPI.toggleUserStatus(userId);
      return res.data.data.user;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Failed to toggle status');
    }
  },
);

export const assignRoleThunk = createAsyncThunk(
  'admin/assignRole',
  async ({userId, role}, {rejectWithValue}) => {
    try {
      const res = await adminAPI.assignRole(userId, role);
      return res.data.data.user;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Failed to assign role');
    }
  },
);

// ── Slice ────────────────────────────────────────────────────────────────
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    statsLoading: false,
    users: [],
    usersTotal: 0,
    usersPage: 1,
    usersLoading: false,
    selectedUser: null,
    error: null,
    actionLoading: false,
  },
  reducers: {
    setSelectedUser: (state, action) => {state.selectedUser = action.payload;},
    clearAdminError: state => {state.error = null;},
    clearSelectedUser: state => {state.selectedUser = null;},
  },
  extraReducers: builder => {
    // Stats
    builder
      .addCase(fetchDashboardStats.pending, s => {s.statsLoading = true; s.error = null;})
      .addCase(fetchDashboardStats.fulfilled, (s, a) => {s.statsLoading = false; s.stats = a.payload;})
      .addCase(fetchDashboardStats.rejected, (s, a) => {s.statsLoading = false; s.error = a.payload;});

    // Users list
    builder
      .addCase(fetchAllUsers.pending, s => {s.usersLoading = true; s.error = null;})
      .addCase(fetchAllUsers.fulfilled, (s, a) => {
        s.usersLoading = false;
        s.users = a.payload.data;
        s.usersTotal = a.payload.pagination?.total ?? 0;
        s.usersPage = a.payload.pagination?.page ?? 1;
      })
      .addCase(fetchAllUsers.rejected, (s, a) => {s.usersLoading = false; s.error = a.payload;});

    // Create
    builder
      .addCase(createUserThunk.pending, s => {s.actionLoading = true;})
      .addCase(createUserThunk.fulfilled, (s, a) => {
        s.actionLoading = false;
        if (a.payload?.user) s.users.unshift(a.payload.user);
      })
      .addCase(createUserThunk.rejected, (s, a) => {s.actionLoading = false; s.error = a.payload;});

    // Update
    builder
      .addCase(updateUserThunk.pending, s => {s.actionLoading = true;})
      .addCase(updateUserThunk.fulfilled, (s, a) => {
        s.actionLoading = false;
        const idx = s.users.findIndex(u => u.id === a.payload?.user?.id);
        if (idx !== -1) s.users[idx] = a.payload.user;
      })
      .addCase(updateUserThunk.rejected, (s, a) => {s.actionLoading = false; s.error = a.payload;});

    // Delete
    builder
      .addCase(deleteUserThunk.pending, s => {s.actionLoading = true;})
      .addCase(deleteUserThunk.fulfilled, (s, a) => {
        s.actionLoading = false;
        s.users = s.users.filter(u => u.id !== a.payload);
      })
      .addCase(deleteUserThunk.rejected, (s, a) => {s.actionLoading = false; s.error = a.payload;});

    // Toggle status
    builder
      .addCase(toggleStatusThunk.fulfilled, (s, a) => {
        const idx = s.users.findIndex(u => u.id === a.payload?.id);
        if (idx !== -1) s.users[idx] = a.payload;
      });

    // Assign role
    builder
      .addCase(assignRoleThunk.fulfilled, (s, a) => {
        const idx = s.users.findIndex(u => u.id === a.payload?.id);
        if (idx !== -1) s.users[idx] = a.payload;
      });
  },
});

export const {setSelectedUser, clearAdminError, clearSelectedUser} = adminSlice.actions;
export default adminSlice.reducer;
