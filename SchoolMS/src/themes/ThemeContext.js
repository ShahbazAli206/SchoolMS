import React, {createContext, useContext} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {lightTheme, darkTheme} from './index';
import {toggleDarkMode} from '../redux/slices/appSlice';

const ThemeContext = createContext(lightTheme);

export const ThemeProvider = ({children}) => {
  const dispatch  = useDispatch();
  const isDark    = useSelector(s => s.app.isDarkMode);
  const theme     = isDark ? darkTheme : lightTheme;
  const toggle    = () => dispatch(toggleDarkMode());

  return (
    <ThemeContext.Provider value={{...theme, isDark, toggleTheme: toggle}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
