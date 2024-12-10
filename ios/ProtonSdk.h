#ifdef __cplusplus
#import "react-native-proton-sdk.h"
#endif

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNProtonSdkSpec.h"

@interface ProtonSdk : NSObject <NativeProtonSdkSpec>
#else
#import <React/RCTBridgeModule.h>

@interface ProtonSdk : NSObject <RCTBridgeModule>
#endif

@end
