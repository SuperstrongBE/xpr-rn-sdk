import { LinkSession, type LinkTransport } from '@proton/link';
import { SigningRequest } from '@proton/signing-request';
export interface ReactNativeTransportOptions {
  /** Requesting account of the dapp */
  requestAccount: string;
  /** Return url to the original app */
  getReturnUrl(): string;
}
export default class ReactNativeTransport implements LinkTransport {
  readonly options: ReactNativeTransportOptions;
  private requestAccount;
  private getReturnUrl;
  constructor(options: ReactNativeTransportOptions);
  onRequest(
    request: SigningRequest,
    _cancel: (reason: string | Error) => void
  ): void;
  onSessionRequest(
    _session: LinkSession,
    request: SigningRequest,
    _cancel: (reason: string | Error) => void
  ): void;
}
//# sourceMappingURL=transport.d.ts.map
