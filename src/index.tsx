import { NativeModules, Platform } from 'react-native';
import './registerGlobals';

import ProtonLink, {
  type PermissionLevelType,
  LinkSession,
} from '@proton/link';
import { JsonRpc } from '@proton/js';
import { PermissionLevel } from '@greymass/eosio';
import Storage from './storage';
import type { ConnectWalletArgs } from './NativeProtonSdk';
import ReactNativeTransport from './transport';

const LINKING_ERROR =
  `The package 'react-native-proton-sdk' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// @ts-expect-error
const isTurboModuleEnabled = global.__turboModuleProxy != null;

const ProtonSdkModule = isTurboModuleEnabled
  ? require('./NativeProtonSdk').default
  : NativeModules.ProtonSdk;

const ProtonSdk = ProtonSdkModule
  ? ProtonSdkModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return ProtonSdk.multiply(a, b);
}

export function ConnectWallet({
  linkOptions,
  transportOptions,
}: ConnectWalletArgs) {
  return async () => {
    // Add RPC
    linkOptions.client = linkOptions.rpc || new JsonRpc(linkOptions.endpoints);

    // Add chain ID if not present
    if (!linkOptions.chainId) {
      const info = await linkOptions.client!.get_info();
      linkOptions.chainId = info.chain_id;
    }

    // Add storage if not present
    if (!linkOptions.storage) {
      linkOptions.storage = new Storage(
        linkOptions.storagePrefix || 'proton-storage'
      );
    }

    // Stop restore session if no saved data
    if (linkOptions.restoreSession) {
      const savedUserAuth = await linkOptions.storage.read('user-auth');
      if (!savedUserAuth) {
        // clean storage to remove unexpected side effects if session restore fails
        linkOptions.storage.remove('user-auth');
        return { link: null, session: null };
      }
    }

    let session, link, loginResult;

    if (
      linkOptions.chainId ===
      '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd'
    ) {
      linkOptions.scheme = 'proton-dev';
    } else {
      linkOptions.scheme = 'proton';
    }

    const transport = new ReactNativeTransport({
      ...transportOptions,
    });

    // Create link
    const options = {
      ...linkOptions,
      transport,
      walletType: 'proton',
      chains: [],
    };

    link = new ProtonLink(options);

    // Get session based on login or restore session
    if (!linkOptions.restoreSession) {
      loginResult = await link.login(transportOptions.requestAccount || '');
      session = loginResult.session;
      linkOptions.storage.write(
        'user-auth',
        JSON.stringify(loginResult.session.auth)
      );
    } else {
      const stringifiedUserAuth = await linkOptions.storage.read('user-auth');
      const parsedUserAuth = stringifiedUserAuth
        ? JSON.parse(stringifiedUserAuth)
        : {};
      const savedUserAuth: PermissionLevel =
        Object.keys(parsedUserAuth).length > 0 ? parsedUserAuth : null;
      if (savedUserAuth) {
        session = await link.restoreSession(
          transportOptions.requestAccount || '',
          savedUserAuth as unknown as PermissionLevelType
        );
      }
    }

    return { link, session, loginResult };
  };
}

export { ProtonLink, LinkSession };
export default ConnectWallet;
