import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer         from '../slices/authSlice';
import appReducer          from '../slices/appSlice';
import usersReducer        from '../slices/usersSlice';
import adminReducer        from '../slices/adminSlice';
import teacherReducer      from '../slices/teacherSlice';
import studentReducer      from '../slices/studentSlice';
import parentReducer       from '../slices/parentSlice';
import feeReducer          from '../slices/feeSlice';
import notificationReducer from '../slices/notificationSlice';
import chatReducer         from '../slices/chatSlice';
import complaintReducer    from '../slices/complaintSlice';

const persistConfig = {
  key: 'schoolms-root',
  storage: AsyncStorage,
  whitelist: ['auth', 'app'],
};

const rootReducer = combineReducers({
  auth:          authReducer,
  app:           appReducer,
  users:         usersReducer,
  admin:         adminReducer,
  teacher:       teacherReducer,
  student:       studentReducer,
  parent:        parentReducer,
  fees:          feeReducer,
  notifications: notificationReducer,
  chat:          chatReducer,
  complaints:    complaintReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
