import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector, useDispatch} from 'react-redux';
import {AppState, Platform} from 'react-native';
import AuthNavigator    from './AuthNavigator';
import AdminNavigator   from './AdminNavigator';
import TeacherNavigator from './TeacherNavigator';
import StudentNavigator from './StudentNavigator';
import ParentNavigator  from './ParentNavigator';
import SplashScreen     from '../screens/common/SplashScreen';
import {logoutUser, updateUser} from '../redux/slices/authSlice';
import {setFcmToken}    from '../redux/slices/appSlice';
import {incrementUnread} from '../redux/slices/notificationSlice';
import {appendMessage}   from '../redux/slices/chatSlice';
import {authAPI}         from '../services/authService';

const Stack = createStackNavigator();

const ROLE_NAVIGATORS = {
  admin:   AdminNavigator,
  teacher: TeacherNavigator,
  student: StudentNavigator,
  parent:  ParentNavigator,
};

const registerFcm = async () => {};

const RootNavigator = () => {
  const dispatch = useDispatch();
  const {isAuthenticated, user, isLoading, sessionExpiresAt} = useSelector(s => s.auth);

  // Auto-logout on session expiry
  useEffect(() => {
    const handleAppStateChange = nextState => {
      if (nextState === 'active' && isAuthenticated && sessionExpiresAt) {
        if (new Date(sessionExpiresAt) < new Date()) dispatch(logoutUser());
      }
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [isAuthenticated, sessionExpiresAt, dispatch]);


  if (isLoading) return <SplashScreen />;

  const MainNavigator = ROLE_NAVIGATORS[user?.role] ?? AuthNavigator;

  return (
    <NavigationContainer key={isAuthenticated ? 'authenticated' : 'unauthenticated'}>
      <Stack.Navigator screenOptions={{headerShown: false, animationEnabled: true}}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
