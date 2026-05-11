import React, {useState, useRef, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Easing} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator, CardStyleInterpolators, TransitionPresets} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import {useNavigation, useNavigationState} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';
import AttendanceScreen       from '../screens/teacher/AttendanceScreen';
import AssignmentsScreen      from '../screens/teacher/AssignmentsScreen';
import MarksScreen            from '../screens/teacher/MarksScreen';
import UploadMaterialScreen   from '../screens/teacher/UploadMaterialScreen';
import TeacherComplaintsScreen      from '../screens/teacher/TeacherComplaintsScreen';
import TeacherSubmitComplaintScreen from '../screens/teacher/TeacherSubmitComplaintScreen';
import TeacherClassesScreen   from '../screens/teacher/TeacherClassesScreen';
import TeacherStudentsScreen  from '../screens/teacher/TeacherStudentsScreen';
import NotificationsScreen    from '../screens/common/NotificationsScreen';
import ConversationsScreen    from '../screens/common/ConversationsScreen';
import ChatScreen             from '../screens/common/ChatScreen';
import NewConversationScreen  from '../screens/common/NewConversationScreen';
import ProfileScreen          from '../screens/common/ProfileScreen';

import TeacherActionSheet from '../components/common/TeacherActionSheet';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Slide-from-right transition for nested stacks ────────────────────────────
const slideRight = {
  ...TransitionPresets.SlideFromRightIOS,
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
};

// ── Home stack: dashboard + all internally-navigated screens ─────────────────
const HomeStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false, ...slideRight}}>
    <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
    <Stack.Screen name="Attendance"               component={AttendanceScreen} />
    <Stack.Screen name="Marks"                    component={MarksScreen} />
    <Stack.Screen name="UploadMaterial"           component={UploadMaterialScreen} />
    <Stack.Screen name="TeacherComplaints"        component={TeacherComplaintsScreen} />
    <Stack.Screen name="TeacherSubmitComplaint"   component={TeacherSubmitComplaintScreen} />
    <Stack.Screen name="Notifications"            component={NotificationsScreen} />
    <Stack.Screen name="Profile"                  component={ProfileScreen} />
  </Stack.Navigator>
);

const AssignmentsStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false, ...slideRight}}>
    <Stack.Screen name="Assignments" component={AssignmentsScreen} />
  </Stack.Navigator>
);

const ClassesStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false, ...slideRight}}>
    <Stack.Screen name="TeacherClasses" component={TeacherClassesScreen} />
    <Stack.Screen name="Attendance"     component={AttendanceScreen} />
  </Stack.Navigator>
);

const StudentsStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false, ...slideRight}}>
    <Stack.Screen name="TeacherStudents" component={TeacherStudentsScreen} />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false, ...slideRight}}>
    <Stack.Screen name="Conversations"   component={ConversationsScreen} />
    <Stack.Screen name="Chat"            component={ChatScreen} />
    <Stack.Screen name="NewConversation" component={NewConversationScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false, ...slideRight}}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

// ── Tab icon (emoji with scale-on-focus) ─────────────────────────────────────
const ICONS = {
  HomeTab:        '🏠',
  ClassesTab:     '👥',
  StudentsTab:    '🎓',
  ProfileTab:     '👤',
};

const TabIcon = ({routeName, focused, color}) => {
  const scale = useRef(new Animated.Value(focused ? 1.15 : 1)).current;
  useEffect(() => {
    Animated.spring(scale, {toValue: focused ? 1.15 : 1, friction: 6, useNativeDriver: true}).start();
  }, [focused, scale]);
  return (
    <Animated.Text style={{fontSize: 22, color, transform: [{scale}]}}>{ICONS[routeName] || '•'}</Animated.Text>
  );
};

// ── Custom tab bar with center FAB ───────────────────────────────────────────
const CustomTabBar = ({state, descriptors, navigation, onPressFab}) => {
  const insets = useSafeAreaInsets();
  const VISIBLE_TABS = ['HomeTab', 'ClassesTab', '__FAB__', 'StudentsTab', 'ProfileTab'];

  // FAB rotation animation
  const fabRotate = useRef(new Animated.Value(0)).current;
  const fabPress = () => {
    Animated.sequence([
      Animated.timing(fabRotate, {toValue: 0.5, duration: 200, useNativeDriver: true}),
      Animated.spring(fabRotate, {toValue: 0, friction: 4, useNativeDriver: true}),
    ]).start();
    onPressFab();
  };

  return (
    <View style={[barStyles.wrap, {paddingBottom: insets.bottom + 6}]}>
      {/* Floating Chat Button (left, green) */}
      <TouchableOpacity
        onPress={() => navigation.navigate('ChatTab', {screen: 'Conversations'})}
        activeOpacity={0.85}
        style={[barStyles.chatFab, {bottom: insets.bottom + 6}]}>
        <Text style={{fontSize: 20, color: '#fff'}}>💬</Text>
      </TouchableOpacity>

      <View style={barStyles.bar}>
        {VISIBLE_TABS.map(name => {
          if (name === '__FAB__') {
            const rotate = fabRotate.interpolate({inputRange: [0, 0.5, 1], outputRange: ['0deg', '45deg', '0deg']});
            return (
              <TouchableOpacity
                key="fab"
                onPress={fabPress}
                activeOpacity={0.85}
                style={barStyles.centerFabWrap}>
                <Animated.View style={[barStyles.centerFab, {transform: [{rotate}]}]}>
                  <Text style={{color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2}}>+</Text>
                </Animated.View>
              </TouchableOpacity>
            );
          }
          const route  = state.routes.find(r => r.name === name);
          if (!route) return null;
          const focused = state.routes[state.index]?.name === name;
          const label = descriptors[route.key]?.options?.title || name;
          const onPress = () => {
            if (!focused) navigation.navigate(name);
          };
          const color = focused ? '#6C5CE7' : '#9CA3AF';
          return (
            <TouchableOpacity
              key={name}
              accessibilityRole="button"
              onPress={onPress}
              activeOpacity={0.7}
              style={barStyles.tabBtn}>
              <TabIcon routeName={name} focused={focused} color={color} />
              <Text style={[barStyles.tabLabel, {color}]}>{label}</Text>
              {focused && <View style={barStyles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const barStyles = StyleSheet.create({
  wrap: {position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14},
  bar: {flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 26, height: 64, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: {width: 0, height: 6}, elevation: 12},
  tabBtn: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 4},
  tabLabel: {fontSize: 10, fontWeight: '700', marginTop: 2},
  activeDot: {width: 4, height: 4, borderRadius: 2, backgroundColor: '#6C5CE7', marginTop: 2},
  centerFabWrap: {width: 64, alignItems: 'center', justifyContent: 'center'},
  centerFab: {width: 56, height: 56, borderRadius: 28, backgroundColor: '#6C5CE7', alignItems: 'center', justifyContent: 'center', marginTop: -24, shadowColor: '#6C5CE7', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, elevation: 12, borderWidth: 4, borderColor: '#FFFFFF'},
  chatFab: {position: 'absolute', left: 16, width: 48, height: 48, borderRadius: 24, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', shadowColor: '#10B981', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: {width: 0, height: 4}, elevation: 10, zIndex: 20},
});

// ── Root navigator ───────────────────────────────────────────────────────────
const TeacherNavigator = () => {
  const [actionVisible, setActionVisible] = useState(false);
  const navRef = useRef(null);

  return (
    <View style={{flex: 1, backgroundColor: '#F5F6FB'}}>
      <Tab.Navigator
        screenOptions={{headerShown: false}}
        tabBar={(props) => (
          <CustomTabBar
            {...props}
            onPressFab={() => setActionVisible(true)}
          />
        )}>
        <Tab.Screen name="HomeTab"        component={HomeStack}        options={{title: 'Dashboard'}} />
        <Tab.Screen name="ClassesTab"     component={ClassesStack}     options={{title: 'Classes'}} />
        {/* AssignmentsTab and ChatTab are hidden tabs (not in VISIBLE_TABS) — accessible via Quick Actions / FAB / Chat button */}
        <Tab.Screen name="AssignmentsTab" component={AssignmentsStack} options={{title: 'Assignments'}} />
        <Tab.Screen name="ChatTab"        component={ChatStack}        options={{title: 'Chat'}} />
        <Tab.Screen name="StudentsTab"    component={StudentsStack}    options={{title: 'Students'}} />
        <Tab.Screen name="ProfileTab"     component={ProfileStack}     options={{title: 'Profile'}} />
      </Tab.Navigator>

      <TeacherActionSheetWrapper visible={actionVisible} onClose={() => setActionVisible(false)} />
    </View>
  );
};

// Hook the action sheet's navigation to the *current* tab's stack so screens
// land on top of whatever tab the user is on.
const TeacherActionSheetWrapper = ({visible, onClose}) => {
  const navigation = useNavigation();
  return <TeacherActionSheet visible={visible} onClose={onClose} navigation={navigation} />;
};

export default TeacherNavigator;
