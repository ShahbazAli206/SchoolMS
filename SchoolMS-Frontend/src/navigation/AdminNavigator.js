import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
import AssignTeacherScreen         from '../screens/admin/AssignTeacherScreen';
import AdminEventsScreen           from '../screens/admin/AdminEventsScreen';
import AdminMaterialsScreen        from '../screens/admin/AdminMaterialsScreen';
import ProfileScreen               from '../screens/common/ProfileScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const AdminHomeStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="AdminDashboard"         component={AdminDashboardScreen} />
    <Stack.Screen name="UserManagement"         component={UserManagementScreen} />
    <Stack.Screen name="AddUser"                component={AddUserScreen} />
    <Stack.Screen name="EditUser"               component={EditUserScreen} />
    <Stack.Screen name="AdminComplaints"        component={AdminComplaintsScreen} />
    <Stack.Screen name="AdminComplaintDetail"   component={AdminComplaintDetailScreen} />
    <Stack.Screen name="NotificationsList"      component={NotificationsScreen} />
    <Stack.Screen name="AdminSendNotification"  component={AdminSendNotificationScreen} />
    <Stack.Screen name="Conversations"          component={ConversationsScreen} />
    <Stack.Screen name="Chat"                   component={ChatScreen} />
    <Stack.Screen name="NewConversation"        component={NewConversationScreen} />
    <Stack.Screen name="AssignTeacher"          component={AssignTeacherScreen} />
    <Stack.Screen name="AdminEvents"            component={AdminEventsScreen} />
    <Stack.Screen name="AdminMaterials"         component={AdminMaterialsScreen} />
  </Stack.Navigator>
);

const DashboardStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="UserManagementMain" component={UserManagementScreen} />
    <Stack.Screen name="AddUser"            component={AddUserScreen} />
    <Stack.Screen name="EditUser"           component={EditUserScreen} />
  </Stack.Navigator>
);

const ReportsStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="AdminFeesDashboard" component={AdminFeesDashboardScreen} />
    <Stack.Screen name="AdminCreateFee"     component={AdminCreateFeeScreen} />
    <Stack.Screen name="AdminRecordPayment" component={AdminRecordPaymentScreen} />
  </Stack.Navigator>
);

const ComplaintsStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="AdminComplaintsMain"  component={AdminComplaintsScreen} />
    <Stack.Screen name="AdminComplaintDetail" component={AdminComplaintDetailScreen} />
  </Stack.Navigator>
);

const Empty = () => null;

/* ── ICONS (emoji glyphs to match reference) ── */
const ICONS = {
  Home:      '🏠',
  Dashboard: '📊',
  Reports:   '📈',
  Settings:  '⚙️',
};

const TabButton = ({label, icon, focused, onPress}) => (
  <TouchableOpacity style={styles.tabBtn} onPress={onPress} activeOpacity={0.7}>
    <Text style={[styles.tabIcon, {color: focused ? '#6C5CE7' : '#9CA3AF'}]}>{icon}</Text>
    <Text style={[styles.tabLabel, {color: focused ? '#6C5CE7' : '#9CA3AF', fontWeight: focused ? '800' : '600'}]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const CenterFab = ({onPress}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.centerWrap}>
    <View style={styles.centerFab}>
      <Text style={styles.centerFabPlus}>+</Text>
    </View>
  </TouchableOpacity>
);

const CustomTabBar = ({state, navigation}) => {
  const insets = useSafeAreaInsets();
  const findIndex = name => state.routes.findIndex(r => r.name === name);
  const focusedRoute = state.routes[state.index]?.name;

  const go = name => {
    const idx = findIndex(name);
    if (idx < 0) return;
    const isFocused = state.index === idx;
    const event = navigation.emit({type: 'tabPress', target: state.routes[idx].key, canPreventDefault: true});
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(name);
    }
  };

  const onPlusPress = () => {
    navigation.navigate('Home', {screen: 'AddUser', params: {defaultRole: 'student'}});
  };

  return (
    <View style={[styles.tabBarOuter, {paddingBottom: insets.bottom > 0 ? insets.bottom : 8}]}>
      <View style={styles.tabBar}>
        <TabButton label="Home"      icon={ICONS.Home}      focused={focusedRoute === 'Home'}      onPress={() => go('Home')} />
        <TabButton label="Dashboard" icon={ICONS.Dashboard} focused={focusedRoute === 'Dashboard'} onPress={() => go('Dashboard')} />
        <CenterFab onPress={onPlusPress} />
        <TabButton label="Reports"   icon={ICONS.Reports}   focused={focusedRoute === 'Reports'}   onPress={() => go('Reports')} />
        <TabButton label="Settings"  icon={ICONS.Settings}  focused={focusedRoute === 'Settings'}  onPress={() => go('Settings')} />
      </View>
    </View>
  );
};

const AdminNavigator = () => (
  <Tab.Navigator
    screenOptions={{headerShown: false}}
    tabBar={props => <CustomTabBar {...props} />}>
    <Tab.Screen
      name="Home"
      component={AdminHomeStack}
      listeners={({navigation}) => ({
        tabPress: e => {
          e.preventDefault();
          navigation.navigate('Home', {screen: 'AdminDashboard'});
        },
      })}
    />
    <Tab.Screen
      name="Dashboard"
      component={DashboardStack}
      listeners={({navigation}) => ({
        tabPress: e => {
          e.preventDefault();
          navigation.navigate('Dashboard', {screen: 'UserManagementMain'});
        },
      })}
    />
    <Tab.Screen name="QuickAdd"  component={Empty} options={{tabBarButton: () => null}} />
    <Tab.Screen name="Reports"   component={ReportsStack} />
    <Tab.Screen name="Settings"  component={ProfileScreen} />
    {/* hidden tabs for module navigation */}
    <Tab.Screen
      name="Complaints"
      component={ComplaintsStack}
      options={{tabBarButton: () => null}}
    />
    <Tab.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{tabBarButton: () => null}}
    />
    <Tab.Screen
      name="Chat"
      component={ConversationsScreen}
      options={{tabBarButton: () => null}}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBarOuter: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFF4',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 62,
    paddingHorizontal: 6,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabIcon: {fontSize: 22, marginBottom: 2},
  tabLabel: {fontSize: 10},

  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerFab: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#6C5CE7',
    alignItems: 'center', justifyContent: 'center',
    marginTop: -22,
    shadowColor: '#6C5CE7',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  centerFabPlus: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: Platform.OS === 'ios' ? 30 : 32,
    marginTop: -2,
  },
});

export default AdminNavigator;
