package com.protonsdk

import com.facebook.react.bridge.ReactApplicationContext

abstract class ProtonSdkSpec internal constructor(context: ReactApplicationContext) :
  NativeProtonSdkSpec(context) {
}
