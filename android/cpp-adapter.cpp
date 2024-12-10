#include <jni.h>
#include "react-native-proton-sdk.h"

extern "C"
JNIEXPORT jdouble JNICALL
Java_com_protonsdk_ProtonSdkModule_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return protonsdk::multiply(a, b);
}
