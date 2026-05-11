import React, {useEffect, useRef} from 'react';
import {Animated, Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../themes/ThemeContext';
import ParentDashboardScreen     from '../screens/parent/ParentDashboardScreen';
import ParentChildProgressScreen from '../screens/parent/ParentChildProgressScreen';
import ParentFeesScreen          from '../screens/parent/ParentFeesScreen';
import ParentComplaintsScreen    from '../screens/parent/ParentComplaintsScreen';
import SubmitComplaintScreen     from '../screens/parent/SubmitComplaintScreen';
import NotificationsScreen       from '../screens/common/NotificationsScreen';
import ConversationsScreen       from '../screens/common/ConversationsScreen';
import ChatScreen                from '../screens/common/ChatScreen';
import NewConversationScreen     from '../screens/common/NewConversationScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const ComplaintsStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="ParentComplaints"  component={ParentComplaintsScreen} />
    <Stack.Screen name="SubmitComplaint"   component={SubmitComplaintScreen} />
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
  Progress: '📈',
  Fees: '💰',
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

const ParentNavigator = () => {
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
        tabBarActiveTintColor: '#FDCB6E',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.38)',
        tabBarLabelStyle: {fontSize: 9, fontWeight: '700', marginTop: 0},
        tabBarItemStyle: {paddingTop: 3, paddingBottom: 3},
        tabBarIcon: ({focused, color}) => (
          <TabIcon label={ICON_MAP[route.name] || '•'} color={color} focused={focused} />
        ),
      })}>
      <Tab.Screen name="Home"       component={ParentDashboardScreen}     options={{title: 'Dashboard'}} />
      <Tab.Screen name="Progress"   component={ParentChildProgressScreen} options={{title: 'Progress'}} />
      <Tab.Screen name="Fees"       component={ParentFeesScreen}          options={{title: 'Fees'}} />
      <Tab.Screen name="Complaints" component={ComplaintsStack}            options={{title: 'Complaints'}} />
      <Tab.Screen name="Chat"       component={ChatStack}                 options={{title: 'Chat'}} />
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

export default ParentNavigator;
