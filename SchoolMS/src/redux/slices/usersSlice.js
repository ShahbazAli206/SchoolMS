import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {usersAPI} from '../../services/usersService';

export const fetchUsers = createAsyncThunk('users/fetchAll', async (params, {rejectWithValue}) => {
  try {
    const response = await usersAPI.getAll(params);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
  }
});

export const createUser = createAsyncThunk('users/create', async (userData, {rejectWithValue}) => {
  try {
    const response = await usersAPI.create(userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create user');
  }
});

export const updateUser = createAsyncThunk('users/update', async ({id, data}, {rejectWithValue}) => {
  try {
    const response = await usersAPI.update(id, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update user');
  }
});

export const deleteUser = createAsyncThunk('users/delete', async (id, {rejectWithValue}) => {
  try {
    await usersAPI.remove(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    total: 0,
    page: 1,
    isLoading: false,
    error: null,
    selectedUser: null,
  },
  reducers: {
    setSelectedUser: (state, action) => {state.selectedUser = action.payload;},
    clearError: state => {state.error = null;},
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUsers.pending, state => {state.isLoading = true; state.error = null;})
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.users;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchUsers.rejected, (state, action) => {state.isLoading = false; state.error = action.payload;})
      .addCase(createUser.fulfilled, (state, action) => {state.list.unshift(action.payload.user);})
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.list.findIndex(u => u.id === action.payload.user.id);
        if (idx !== -1) state.list[idx] = action.payload.user;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter(u => u.id !== action.payload);
      });
  },
});

export const {setSelectedUser, clearError} = usersSlice.actions;
export default usersSlice.reducer;
