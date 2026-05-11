import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import PrincipalDashboardScreen  from '../screens/principal/PrincipalDashboardScreen';
import PrincipalComplaintsScreen from '../screens/principal/PrincipalComplaintsScreen';
import NotificationsScreen       from '../screens/common/NotificationsScreen';
import ConversationsScreen       from '../screens/common/ConversationsScreen';
import ChatScreen                from '../screens/common/ChatScreen';
import NewConversationScreen     from '../screens/common/NewConversationScreen';
import ProfileScreen             from '../screens/common/ProfileScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const PrincipalHomeStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="PrincipalDashboard"        component={PrincipalDashboardScreen} />
    <Stack.Screen name="PrincipalComplaintsList"   component={PrincipalComplaintsScreen} />
    <Stack.Screen name="NotificationsList"         component={NotificationsScreen} />
  </Stack.Navigator>
);

const ComplaintsStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="PrincipalComplaintsMain"   component={PrincipalComplaintsScreen} />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Conversations"   component={ConversationsScreen} />
    <Stack.Screen name="Chat"            component={ChatScreen} />
    <Stack.Screen name="NewConversation" component={NewConversationScreen} />
  </Stack.Navigator>
);

const ICONS = {Home: '🏠', Complaints: '📋', Chat: '💬', Settings: '⚙️'};

const TabBtn = ({label, icon, focused, onPress}) => (
  <TouchableOpacity style={styles.tabBtn} onPress={onPress} activeOpacity={0.7}>
    <Text style={{fontSize: 22, color: focused ? '#6C5CE7' : '#9CA3AF', marginBottom: 2}}>{icon}</Text>
    <Text style={{fontSize: 10, color: focused ? '#6C5CE7' : '#9CA3AF', fontWeight: focused ? '800' : '600'}}>{label}</Text>
  </TouchableOpacity>
);

const CustomTabBar = ({state, navigation}) => {
  const insets = useSafeAreaInsets();
  const focused = state.routes[state.index]?.name;
  const go = name => {
    if (focused === name) return;
    navigation.navigate(name);
  };
  return (
    <View style={[styles.tabBarOuter, {paddingBottom: insets.bottom > 0 ? insets.bottom : 8}]}>
      <View style={styles.tabBar}>
        <TabBtn label="Home"       icon={ICONS.Home}       focused={focused === 'Home'}       onPress={() => go('Home')} />
        <TabBtn label="Complaints" icon={ICONS.Complaints} focused={focused === 'Complaints'} onPress={() => go('Complaints')} />
        <TabBtn label="Chat"       icon={ICONS.Chat}       focused={focused === 'Chat'}       onPress={() => go('Chat')} />
        <TabBtn label="Settings"   icon={ICONS.Settings}   focused={focused === 'Settings'}   onPress={() => go('Settings')} />
      </View>
    </View>
  );
};

const PrincipalNavigator = () => (
  <Tab.Navigator screenOptions={{headerShown: false}} tabBar={p => <CustomTabBar {...p} />}>
    <Tab.Screen name="Home"       component={PrincipalHomeStack} />
    <Tab.Screen name="Complaints" component={ComplaintsStack} />
    <Tab.Screen name="Chat"       component={ChatStack} />
    <Tab.Screen name="Settings"   component={ProfileScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBarOuter: {backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EFEFF4'},
  tabBar: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', height: 62},
  tabBtn: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6},
});

export default PrincipalNavigator;
