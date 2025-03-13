#import "ProtonSdk.h"
#import <React/RCTUtils.h>

@interface ProtonSdk ()
@property (nonatomic, strong) NSMutableDictionary *pendingRequests;
@property (nonatomic, strong) NSString *currentRequestId;
@end

@implementation ProtonSdk {
    bool hasListeners;
}

RCT_EXPORT_MODULE(ProtonSdk)

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

- (instancetype)init {
    if (self = [super init]) {
        _pendingRequests = [NSMutableDictionary new];
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"onWalletResponse", @"onWalletError"];
}

- (void)startObserving {
    hasListeners = YES;
}

- (void)stopObserving {
    hasListeners = NO;
}

#pragma mark - Wallet Connection

RCT_EXPORT_METHOD(connectWallet:(NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    NSString *requestId = [[NSUUID UUID] UUIDString];
    self.currentRequestId = requestId;
    
    // Store the promise callbacks
    self.pendingRequests[requestId] = @{
        @"resolve": resolve,
        @"reject": reject
    };
    
    // Generate deep link URL
    NSString *scheme = options[@"scheme"] ?: @"proton";
    NSString *chainId = options[@"chainId"];
    NSString *requestAccount = options[@"requestAccount"];
    
    NSString *deepLinkUrl = [NSString stringWithFormat:@"%@://link?request=%@&chain=%@&requestId=%@",
                            scheme,
                            requestAccount,
                            chainId,
                            requestId];
    
    // Open deep link
    dispatch_async(dispatch_get_main_queue(), ^{
        NSURL *url = [NSURL URLWithString:deepLinkUrl];
        if ([[UIApplication sharedApplication] canOpenURL:url]) {
            [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:nil];
        } else {
            reject(@"wallet_not_found", @"Proton Wallet app is not installed", nil);
        }
    });
}

RCT_EXPORT_METHOD(handleDeepLink:(NSString *)url
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    NSURL *deepLinkURL = [NSURL URLWithString:url];
    NSURLComponents *components = [[NSURLComponents alloc] initWithURL:deepLinkURL resolvingAgainstBaseURL:NO];
    
    // Parse query parameters
    NSMutableDictionary *params = [NSMutableDictionary new];
    for (NSURLQueryItem *item in components.queryItems) {
        params[item.name] = item.value;
    }
    
    NSString *requestId = params[@"requestId"];
    if (!requestId || ![self.pendingRequests objectForKey:requestId]) {
        reject(@"invalid_request", @"Invalid or expired request", nil);
        return;
    }
    
    // Handle response
    if ([params[@"status"] isEqualToString:@"success"]) {
        NSDictionary *response = @{
            @"account": params[@"account"],
            @"publicKey": params[@"publicKey"],
            @"signature": params[@"signature"]
        };
        
        RCTPromiseResolveBlock resolveBlock = self.pendingRequests[requestId][@"resolve"];
        resolveBlock(response);
    } else {
        RCTPromiseRejectBlock rejectBlock = self.pendingRequests[requestId][@"reject"];
        rejectBlock(@"user_cancelled", @"User cancelled the request", nil);
    }
    
    [self.pendingRequests removeObjectForKey:requestId];
}

RCT_EXPORT_METHOD(signTransaction:(NSDictionary *)transaction
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    NSString *requestId = [[NSUUID UUID] UUIDString];
    self.currentRequestId = requestId;
    
    // Store the promise callbacks
    self.pendingRequests[requestId] = @{
        @"resolve": resolve,
        @"reject": reject
    };
    
    // Convert transaction to string
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:transaction options:0 error:&error];
    if (error) {
        reject(@"invalid_transaction", @"Invalid transaction format", error);
        return;
    }
    
    NSString *transactionStr = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    NSString *encodedTransaction = [transactionStr stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]];
    
    // Generate deep link URL
    NSString *deepLinkUrl = [NSString stringWithFormat:@"proton://sign?tx=%@&requestId=%@",
                            encodedTransaction,
                            requestId];
    
    // Open deep link
    dispatch_async(dispatch_get_main_queue(), ^{
        NSURL *url = [NSURL URLWithString:deepLinkUrl];
        if ([[UIApplication sharedApplication] canOpenURL:url]) {
            [[UIApplication sharedApplication] openURL:url options:@{} completionHandler:nil];
        } else {
            reject(@"wallet_not_found", @"Proton Wallet app is not installed", nil);
        }
    });
}

RCT_EXPORT_METHOD(restoreSession:(NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    // Check if we have stored session data
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *sessionKey = [NSString stringWithFormat:@"proton_session_%@", options[@"account"]];
    NSDictionary *sessionData = [defaults objectForKey:sessionKey];
    
    if (sessionData) {
        resolve(sessionData);
    } else {
        reject(@"no_session", @"No stored session found", nil);
    }
}

RCT_EXPORT_METHOD(isWalletAvailable:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    NSURL *url = [NSURL URLWithString:@"proton://"];
    BOOL canOpenURL = [[UIApplication sharedApplication] canOpenURL:url];
    resolve(@(canOpenURL));
}

// Dont compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeProtonSdkSpecJSI>(params);
}
#endif

@end
