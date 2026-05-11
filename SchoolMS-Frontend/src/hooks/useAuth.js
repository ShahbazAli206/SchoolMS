import {useEffect, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppState} from 'react-native';
import {logoutUser, refreshToken} from '../redux/slices/authSlice';

/**
 * useAuth — session management hook.
 * - Auto-checks session on app foreground
 * - Triggers logout when session/token is expired
 * - Exposes helper actions
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const {user, accessToken, isAuthenticated, sessionExpiresAt} = useSelector(s => s.auth);

  const isSessionExpired = useCallback(() => {
    if (!sessionExpiresAt) return false;
    return new Date(sessionExpiresAt) < new Date();
  }, [sessionExpiresAt]);

  const checkAndRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    if (isSessionExpired()) {
      await dispatch(logoutUser());
      return;
    }
    // Proactively refresh access token 2 min before expiry (handled by apiClient interceptor)
    // but we can also dispatch refreshToken here if needed
  }, [isAuthenticated, isSessionExpired, dispatch]);

  // Check session every time app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        checkAndRefresh();
      }
    });
    return () => subscription.remove();
  }, [checkAndRefresh]);

  const logout = useCallback(() => dispatch(logoutUser()), [dispatch]);

  return {
    user,
    isAuthenticated,
    isSessionExpired: isSessionExpired(),
    logout,
    checkAndRefresh,
  };
};

export default useAuth;
