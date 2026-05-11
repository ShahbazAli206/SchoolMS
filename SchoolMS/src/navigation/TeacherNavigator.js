import React, {useEffect, useRef} from 'react';
import {Animated, Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../themes/ThemeContext';
import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';
import AttendanceScreen       from '../screens/teacher/AttendanceScreen';
import AssignmentsScreen      from '../screens/teacher/AssignmentsScreen';
import MarksScreen            from '../screens/teacher/MarksScreen';
import UploadMaterialScreen   from '../screens/teacher/UploadMaterialScreen';
import TeacherComplaintsScreen     from '../screens/teacher/TeacherComplaintsScreen';
import TeacherSubmitComplaintScreen from '../screens/teacher/TeacherSubmitComplaintScreen';
import NotificationsScreen    from '../screens/common/NotificationsScreen';
import ConversationsScreen    from '../screens/common/ConversationsScreen';
import ChatScreen             from '../screens/common/ChatScreen';
import NewConversationScreen  from '../screens/common/NewConversationScreen';
import ProfileScreen          from '../screens/common/ProfileScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const TeacherHomeStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
    <Stack.Screen name="UploadMaterial"   component={UploadMaterialScreen} />
  </Stack.Navigator>
);

const TeacherAssignmentStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Assignments" component={AssignmentsScreen} />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Conversations"   component={ConversationsScreen} />
    <Stack.Screen name="Chat"            component={ChatScreen} />
    <Stack.Screen name="NewConversation" component={NewConversationScreen} />
  </Stack.Navigator>
);

const ComplaintsStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="TeacherComplaints"        component={TeacherComplaintsScreen} />
    <Stack.Screen name="TeacherSubmitComplaint"   component={TeacherSubmitComplaintScreen} />
  </Stack.Navigator>
);

const ICON_MAP = {
  Home: '🏠',
  Assignments: '📝',
  Attendance: '✅',
  Marks: '📊',
  Complaints: '📋',
  Chat: '💬',
  Notifications: '🔔',
};

const TabIcon = ({label, color, focused}) => {
  const scale = useRef(new Animated.Value(focused ? 1.2 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.2 : 1,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.Text style={{color, fontSize: 22, transform: [{scale}]}}>{label}</Animated.Text>
  );
};

const TeacherNavigator = () => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const unreadCount = useSelector(s => s.notifications.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: 10,
          right: 10,
          bottom: insets.bottom + (Platform.OS === 'ios' ? 8 : 6),
          height: 52,
          borderRadius: 20,
          backgroundColor: '#1A1535',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 6},
          shadowOpacity: 0.22,
          shadowRadius: 12,
          elevation: 10,
          paddingTop: 0,
          paddingBottom: 0,
          paddingHorizontal: 4,
        },
        tabBarActiveTintColor: '#81ECEC',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.38)',
        tabBarLabelStyle: {fontSize: 9, fontWeight: '700', marginTop: 0},
        tabBarItemStyle: {paddingTop: 3, paddingBottom: 3},
        tabBarIcon: ({focused, color}) => (
          <TabIcon label={ICON_MAP[route.name] || '•'} color={color} focused={focused} />
        ),
      })}>
      <Tab.Screen name="Home"        component={TeacherHomeStack}       options={{title: 'Dashboard'}} />
      <Tab.Screen name="Assignments" component={TeacherAssignmentStack} options={{title: 'Assignments'}} />
      <Tab.Screen name="Attendance"  component={AttendanceScreen}       options={{title: 'Attendance'}} />
      <Tab.Screen name="Marks"       component={MarksScreen}            options={{title: 'Marks'}} />
      <Tab.Screen name="Complaints"  component={ComplaintsStack}        options={{title: 'Complaints'}} />
      <Tab.Screen name="Chat"        component={ChatStack}              options={{title: 'Chat'}} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Alerts',
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
        }}
      />
    </Tab.Navigator>
  );
};

export default TeacherNavigator;
