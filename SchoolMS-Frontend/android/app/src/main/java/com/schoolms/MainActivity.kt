package com.schoolms

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "SchoolMS"

  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
  }

  // Required by react-native-screens: pass null so Android does not try to restore
  // fragment state when the Activity is recreated (e.g. after returning from the
  // system file picker or rotation). Without this, ScreenFragment fails to
  // re-instantiate and the app crashes with Fragment$InstantiationException.
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}