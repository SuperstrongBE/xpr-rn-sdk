import type { LinkSession, LinkTransport, ChainIdType } from '@proton/link';
import type { JsonRpc } from '@proton/js';
import type { ReactNativeTransportOptions } from './transport';
export interface LinkChainConfig {
  chainId: ChainIdType;
  nodeUrl: string | JsonRpc;
}
export interface LinkOptions {
  transport: LinkTransport;
  chains: LinkChainConfig[];
  chainId?: ChainIdType;
  client?: string | JsonRpc;
  service?: string | any;
  storage?: any;
  verifyProofs?: boolean;
  encodeChainIds?: boolean;
  scheme: 'proton' | 'proton-dev' | 'esr';
  walletType?: string;
  endpoints: string[];
  rpc?: JsonRpc;
  storagePrefix?: string;
  restoreSession?: boolean;
}
export interface ConnectWalletArgs {
  linkOptions: LinkOptions;
  transportOptions: ReactNativeTransportOptions;
}
export type ConnectWalletResult = {
  link: any;
  session: LinkSession | null | undefined;
  loginResult: any | undefined;
};
export type { LinkSession };
//# sourceMappingURL=types.d.ts.map
