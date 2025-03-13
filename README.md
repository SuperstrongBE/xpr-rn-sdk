# React Native Proton SDK

## iOS Setup

1. Install the package:
```bash
yarn add react-native-proton-sdk
```

2. Install iOS dependencies:
```bash
cd ios && pod install
```

3. Add URL Schemes to your Info.plist:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>proton</string>
            <string>proton-dev</string>
        </array>
        <key>CFBundleURLName</key>
        <string>com.protonsdk</string>
    </dict>
</array>
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>proton</string>
    <string>proton-dev</string>
</array>
```

4. Add Deep Link Handling to AppDelegate.mm:
```objc
// Add at the top of the file
#import <React/RCTLinkingManager.h>

// Add inside the implementation
- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
 return [RCTLinkingManager application:application
                  continueUserActivity:userActivity
                    restorationHandler:restorationHandler];
}
```

## Usage

```typescript
import { ConnectWallet } from "react-native-proton-sdk";

// Connect to wallet
const connect = ConnectWallet({
  linkOptions: {
    endpoints: ["https://eos.greymass.com"],
    chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
    scheme: "proton",
  },
  transportOptions: {
    requestAccount: "myaccount",
    getReturnUrl: () => "myapp://callback",
  },
});

// Call connect function
const result = await connect();
console.log(result);
```

## Features

- Wallet Connection
- Deep Linking Support
- Transaction Signing
- Session Management
- iOS and Android Support

## API Reference

### ConnectWallet
```typescript
function ConnectWallet(options: {
  linkOptions: {
    endpoints: string[];
    chainId?: string;
    scheme?: "proton" | "proton-dev";
    restoreSession?: boolean;
  };
  transportOptions: {
    requestAccount: string;
    getReturnUrl: () => string;
  };
}): () => Promise<{
  link: ProtonLink;
  session: LinkSession | null;
  loginResult: any;
}>;
```

### Native Module Methods

#### `connectWallet(options)`
Connect to the Proton wallet.

#### `handleDeepLink(url)`
Handle deep link responses from the wallet.

#### `signTransaction(transaction)`
Sign a transaction using the wallet.

#### `restoreSession(options)`
Restore a previously established session.

#### `isWalletAvailable()`
Check if the Proton wallet app is installed.

## License

MIT
