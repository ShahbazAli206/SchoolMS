import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {chatAPI} from '../../services/chatService';

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, {rejectWithValue}) => {
    try { return (await chatAPI.getConversations()).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

export const createConversationThunk = createAsyncThunk(
  'chat/createConversation',
  async (data, {rejectWithValue}) => {
    try { return (await chatAPI.createConversation(data)).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({id, params}, {rejectWithValue}) => {
    try { return (await chatAPI.getMessages(id, params)).data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

export const sendMessageThunk = createAsyncThunk(
  'chat/sendMessage',
  async ({id, data}, {rejectWithValue}) => {
    try { return (await chatAPI.sendMessage(id, data)).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

export const markReadThunk = createAsyncThunk(
  'chat/markRead',
  async (id, {rejectWithValue}) => {
    try { await chatAPI.markRead(id); return id; }
    catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations:  [],
    activeMessages: [],
    activeTotal:    0,
    activeConvId:   null,
    loading:        false,
    msgLoading:     false,
    actionLoading:  false,
    error:          null,
  },
  reducers: {
    clearChatError: s => { s.error = null; },
    setActiveConv:  (s, a) => { s.activeConvId = a.payload; s.activeMessages = []; s.activeTotal = 0; },
    // Called from push notification handler to prepend incoming message in real-time
    appendMessage:  (s, a) => {
      if (s.activeConvId === a.payload.conversation_id) {
        s.activeMessages.push(a.payload);
      }
      // Bump last message on conversation list
      const conv = s.conversations.find(c => c.id === a.payload.conversation_id);
      if (conv) conv.lastMessage = a.payload;
    },
  },
  extraReducers: b => {
    b.addCase(fetchConversations.pending,   s => { s.loading = true; s.error = null; })
     .addCase(fetchConversations.fulfilled, (s, a) => { s.loading = false; s.conversations = a.payload || []; })
     .addCase(fetchConversations.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    b.addCase(createConversationThunk.fulfilled, (s, a) => {
      const exists = s.conversations.find(c => c.id === a.payload.id);
      if (!exists) s.conversations.unshift(a.payload);
    });

    b.addCase(fetchMessages.pending,   s => { s.msgLoading = true; })
     .addCase(fetchMessages.fulfilled, (s, a) => {
       s.msgLoading    = false;
       s.activeTotal   = a.payload?.pagination?.total || 0;
       // Prepend older messages (for load-more) or replace on first page
       const incoming  = a.payload?.data || [];
       if (a.payload?.pagination?.page === 1) {
         s.activeMessages = incoming;
       } else {
         s.activeMessages = [...incoming, ...s.activeMessages];
       }
     })
     .addCase(fetchMessages.rejected,  (s, a) => { s.msgLoading = false; s.error = a.payload; });

    b.addCase(sendMessageThunk.pending,   s => { s.actionLoading = true; })
     .addCase(sendMessageThunk.fulfilled, (s, a) => {
       s.actionLoading = false;
       s.activeMessages.push(a.payload);
       const conv = s.conversations.find(c => c.id === a.payload.conversation_id);
       if (conv) conv.lastMessage = a.payload;
     })
     .addCase(sendMessageThunk.rejected,  (s, a) => { s.actionLoading = false; s.error = a.payload; });
  },
});

export const {clearChatError, setActiveConv, appendMessage} = chatSlice.actions;
export default chatSlice.reducer;
