#ifdef __cplusplus
#import "react-native-proton-sdk.h"
#endif

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNProtonSdkSpec.h"
@interface ProtonSdk : RCTEventEmitter <NativeProtonSdkSpec>
#else
@interface ProtonSdk : RCTEventEmitter <RCTBridgeModule>
#endif

// Wallet Connection
- (void)connectWallet:(NSDictionary *)options
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject;

// Deep Linking
- (void)handleDeepLink:(NSString *)url
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject;

// Transaction Signing
- (void)signTransaction:(NSDictionary *)transaction
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject;

// Session Management
- (void)restoreSession:(NSDictionary *)options
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject;

// Utility Methods
- (void)isWalletAvailable:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject;

@end
