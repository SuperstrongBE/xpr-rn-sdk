import './registerGlobals';
import ProtonLink, { LinkSession } from '@proton/link';
import type { ConnectWalletArgs } from './types';
export * from './types';
export declare function multiply(a: number, b: number): Promise<number>;
export declare function ConnectWallet({
  linkOptions,
  transportOptions,
}: ConnectWalletArgs): () => Promise<
  | {
      link: null;
      session: null;
      loginResult?: undefined;
    }
  | {
      link: ProtonLink;
      session: LinkSession | null | undefined;
      loginResult: import('@proton/link').LoginResult | undefined;
    }
>;
export { ProtonLink, LinkSession };
export default ConnectWallet;
//# sourceMappingURL=index.d.ts.map
