# SchoolMS — Claude Code Conventions

## Project Structure
- **Mobile app:** `SchoolMS/` — React Native CLI 0.85.1
- **Backend:** `SchoolMS-Backend/` — Node.js + Express + MySQL (Sequelize ORM)

---

## Backend Conventions

### Model pattern (Sequelize)
```js
const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/database');
const OtherModel  = require('./OtherModel');

const MyModel = sequelize.define('MyModel', {
  id:         {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
  field_name: {type: DataTypes.STRING(100), allowNull: false},
  // ...
}, {tableName: 'my_models'});  // always snake_case table name

MyModel.belongsTo(OtherModel, {foreignKey: 'other_id', as: 'other'});
module.exports = MyModel;
```

### Controller pattern
```js
const ApiResponse = require('../utils/ApiResponse');

exports.myAction = async (req, res) => {
  try {
    // ... logic
    return ApiResponse.success(res, data);
    // or: ApiResponse.created(res, data)
    // or: ApiResponse.paginated(res, rows, count, page, limit)
    // or: ApiResponse.notFound(res, 'message')
    // or: ApiResponse.error(res, e.message)
  } catch (e) {
    return ApiResponse.error(res, e.message);
  }
};
```

### Route pattern
```js
const router = require('express').Router();
const {protect, authorize} = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/myController');

router.use(protect, authorize('admin'));  // or 'teacher', 'student', 'parent'
router.get('/',    ctrl.getAll);
router.post('/',   ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
module.exports = router;
```

### Wiring routes (src/routes/index.js)
```js
router.use('/my-feature', require('./myFeatureRoutes'));
```

### ApiResponse methods
| Method | Status |
|--------|--------|
| `success(res, data, message?)` | 200 |
| `created(res, data)` | 201 |
| `paginated(res, rows, count, page, limit)` | 200 + pagination |
| `notFound(res, msg)` | 404 |
| `forbidden(res, msg)` | 403 |
| `unauthorized(res, msg)` | 401 |
| `error(res, msg)` | 500 |

---

## Frontend (React Native) Conventions

### Theme — always use useTheme(), never hardcode colors
```js
const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
// colors.primary, colors.surface, colors.textPrimary, etc.
// spacing.sm / .md / .base / .lg / .xl
// borderRadius.sm / .md / .lg / .xl / .full
// shadow.sm / .md
```

### Redux slice pattern
```js
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {myAPI} from '../../services/myService';

export const fetchMyData = createAsyncThunk('mySlice/fetch', async (params, {rejectWithValue}) => {
  try { return (await myAPI.getAll(params)).data.data; }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed'); }
});

const mySlice = createSlice({
  name: 'mySlice',
  initialState: {items: [], loading: false, actionLoading: false, error: null},
  reducers: { clearError: s => { s.error = null; } },
  extraReducers: b => {
    b.addCase(fetchMyData.pending,   s => { s.loading = true; s.error = null; })
     .addCase(fetchMyData.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
     .addCase(fetchMyData.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });
  },
});
export default mySlice.reducer;
```

### Service pattern
```js
import apiClient from './apiClient';
export const myAPI = {
  getAll:   params => apiClient.get('/my-route', {params}),
  create:   data   => apiClient.post('/my-route', data),
  update:   (id, data) => apiClient.put(`/my-route/${id}`, data),
  remove:   id     => apiClient.delete(`/my-route/${id}`),
};
```

### Screen skeleton
```js
import React, {useEffect, useCallback} from 'react';
import {View, Text, SafeAreaView, ScrollView, StyleSheet, RefreshControl} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchMyData} from '../../redux/slices/mySlice';

const MyScreen = () => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const {items, loading} = useSelector(s => s.mySlice);

  const load = useCallback(() => dispatch(fetchMyData({})), [dispatch]);
  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <Text style={[textStyles.h5, {color: colors.white}]}>Screen Title</Text>
      </View>
      <ScrollView
        contentContainerStyle={{padding: spacing.base, paddingBottom: 40}}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}>
        {/* content */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center'},
});
export default MyScreen;
```

### Common components (src/components/common/)
- `AppInput` — labeled text input with error prop
- `AppButton` — themed button with loading prop
- `AppCard` — surface card with shadow
- `AppHeader` — screen header bar

---

## Phase Build Rules
1. **Never mix backend + frontend in one phase.** Do backend first, then frontend next session.
2. **No comments** unless the WHY is non-obvious.
3. **No new abstractions** beyond what the task requires.
4. Register every new Redux slice in `src/redux/store/index.js`.
5. Wire every new route in `src/routes/index.js`.
6. New Sequelize models need: `tableName`, associations, and `module.exports`.

---

## Phase Progress
| Phase | Name | Status |
|-------|------|--------|
| 1  | Project Setup + Core Architecture | ✅ |
| 2  | Auth + OTP + Session | ✅ |
| 3  | Admin Module + RBAC | ✅ |
| 4  | Teacher Module | ✅ |
| 5  | Student + Parent Module | ✅ |
| 6A | Fees — Backend | ✅ |
| 6B | Fees — Frontend | ✅ |
| 7A | Notifications — Backend (FCM) | ✅ |
| 7B | Notifications — Frontend | ✅ |
| 8A | Chat — Backend | ✅ |
| 8B | Chat — Frontend | ✅ |
| 9  | UI/UX Polish + Permissions | ✅ |
| 10 | Security + Performance + Final | ✅ |
| 11A | Complaints — Backend | ✅ |
| 11B | Complaints — Frontend | ✅ |
| 12  | Remaining PDF Gaps (chat image, permissions, WhatsApp deep link, student profile update) | ⏳ next |
