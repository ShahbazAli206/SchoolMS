import React, {useEffect, useRef} from 'react';
import {Animated, Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../themes/ThemeContext';
import AdminDashboardScreen        from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen        from '../screens/admin/UserManagementScreen';
import AddUserScreen               from '../screens/admin/AddUserScreen';
import EditUserScreen              from '../screens/admin/EditUserScreen';
import AdminFeesDashboardScreen    from '../screens/admin/AdminFeesDashboardScreen';
import AdminCreateFeeScreen        from '../screens/admin/AdminCreateFeeScreen';
import AdminRecordPaymentScreen    from '../screens/admin/AdminRecordPaymentScreen';
import NotificationsScreen         from '../screens/common/NotificationsScreen';
import AdminSendNotificationScreen from '../screens/admin/AdminSendNotificationScreen';
import ConversationsScreen         from '../screens/common/ConversationsScreen';
import ChatScreen                  from '../screens/common/ChatScreen';
import NewConversationScreen       from '../screens/common/NewConversationScreen';
import AdminComplaintsScreen       from '../screens/admin/AdminComplaintsScreen';
import AdminComplaintDetailScreen  from '../screens/admin/AdminComplaintDetailScreen';
import ProfileScreen               from '../screens/common/ProfileScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const AdminHomeStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
  </Stack.Navigator>
);

const AdminUsersStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="UserManagement" component={UserManagementScreen} />
    <Stack.Screen name="AddUser"        component={AddUserScreen} />
    <Stack.Screen name="EditUser"       component={EditUserScreen} />
  </Stack.Navigator>
);

const AdminFeesStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="AdminFeesDashboard" component={AdminFeesDashboardScreen} />
    <Stack.Screen name="AdminCreateFee"     component={AdminCreateFeeScreen} />
    <Stack.Screen name="AdminRecordPayment" component={AdminRecordPaymentScreen} />
  </Stack.Navigator>
);

const AdminNotifStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="NotificationsList"     component={NotificationsScreen} />
    <Stack.Screen name="AdminSendNotification" component={AdminSendNotificationScreen} />
  </Stack.Navigator>
);

const AdminComplaintsStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="AdminComplaints"      component={AdminComplaintsScreen} />
    <Stack.Screen name="AdminComplaintDetail" component={AdminComplaintDetailScreen} />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Conversations"   component={ConversationsScreen} />
    <Stack.Screen name="Chat"            component={ChatScreen} />
    <Stack.Screen name="NewConversation" component={NewConversationScreen} />
  </Stack.Navigator>
);

const ICON_MAP = {
  Home: '🏠',
  Users: '👥',
  Fees: '💰',
  Complaints: '📋',
  Chat: '💬',
  Notifications: '🔔',
  Profile: '👤',
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

const AdminNavigator = () => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const unreadCount = useSelector(s => s.notifications.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: insets.bottom + (Platform.OS === 'ios' ? 10 : 8),
          height: 40 + insets.bottom,
          borderRadius: 24,
          backgroundColor: colors.headerBg,
          borderTopWidth: 0,
          shadowColor: colors.shadowColor,
          shadowOffset: {width: 0, height: 8},
          shadowOpacity: 0.12,
          shadowRadius: 20,
          elevation: 10,
          paddingTop: 4,
          paddingBottom: insets.bottom,
          paddingHorizontal: 10,
        },
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.whiteAlpha40,
        tabBarLabelStyle: {fontSize: 11, fontWeight: '700', marginTop: 2},
        tabBarItemStyle: {paddingTop: 6},
        tabBarIcon: ({focused, color}) => (
          <TabIcon label={ICON_MAP[route.name] || '•'} color={color} focused={focused} />
        ),
      })}>
      <Tab.Screen name="Home"  component={AdminHomeStack}  options={{title: 'Dashboard'}} />
      <Tab.Screen name="Users" component={AdminUsersStack} options={{title: 'Users'}} />
      <Tab.Screen name="Fees"  component={AdminFeesStack}  options={{title: 'Fees'}} />
      <Tab.Screen name="Complaints" component={AdminComplaintsStack} options={{title: 'Complaints'}} />
      <Tab.Screen name="Chat"  component={ChatStack}       options={{title: 'Chat'}} />
      <Tab.Screen
        name="Notifications"
        component={AdminNotifStack}
        options={{
          title: 'Alerts',
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{title: 'Profile'}} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
