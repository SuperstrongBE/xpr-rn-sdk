import type { LinkOptions, LinkSession } from '@proton/link';
import type { JsonRpc } from '@proton/js';
import type { ReactNativeTransportOptions } from './transport';

export interface ConnectWalletArgs {
  linkOptions: LinkOptions & {
    endpoints: string[];
    rpc?: JsonRpc;
    storage?: any;
    storagePrefix?: string;
    restoreSession?: boolean;
  };
  transportOptions: ReactNativeTransportOptions;
}

export type ConnectWalletResult = {
  link: any;
  session: LinkSession | null | undefined;
  loginResult: any | undefined;
};

export type { LinkOptions, LinkSession } from '@proton/link';
