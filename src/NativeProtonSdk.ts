import type { JsonRpc } from '@proton/js';
import type {
  LinkSession,
  LinkOptions,
  LinkStorage,
  LoginResult,
} from '@proton/link';
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { ReactNativeTransportOptions } from './transport';
import type { ProtonLink } from 'react-native-proton-sdk';

export interface ConnectWalletArgs {
  linkOptions: LinkOptions & {
    endpoints: string[];
    rpc?: JsonRpc;
    storage?: LinkStorage;
    storagePrefix?: string;
    restoreSession?: boolean;
  };
  transportOptions: ReactNativeTransportOptions;
}

export type ConnectWalletResult = {
  link: ProtonLink;
  session: LinkSession | null | undefined;
  loginResult: LoginResult | undefined;
};

export interface Spec extends TurboModule {
  multiply(a: number, b: number): Promise<number>;
  ConnectWallet({}: ConnectWalletArgs): Promise<ConnectWalletResult>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ProtonSdk');
