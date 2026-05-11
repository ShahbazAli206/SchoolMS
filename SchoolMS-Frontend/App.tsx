import React, {useEffect} from 'react';
import {StatusBar, LogBox} from 'react-native';
import {Provider, useSelector} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {store, persistor} from './src/redux/store';
import {ThemeProvider, useTheme} from './src/themes/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/screens/common/SplashScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import OfflineBanner from './src/components/OfflineBanner';

LogBox.ignoreLogs(['Warning: ...']);

const AppContent = () => {
  const {colors, isDark} = useTheme();

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.headerBg}
      />
      <RootNavigator />
      <OfflineBanner />
    </>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={<SplashScreen />} persistor={persistor}>
            <ThemeProvider>
              <ErrorBoundary>
                <AppContent />
              </ErrorBoundary>
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
