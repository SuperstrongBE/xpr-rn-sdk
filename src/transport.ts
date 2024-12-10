import { LinkSession, type LinkTransport } from '@proton/link';
import { SigningRequest } from '@proton/signing-request';
import { Linking } from 'react-native';

export interface ReactNativeTransportOptions {
  /** Requesting account of the dapp */
  requestAccount: string;

  /** Return url to the original app */
  getReturnUrl(): string;
}

export default class ReactNativeTransport implements LinkTransport {
  private requestAccount: string;
  private getReturnUrl: () => string;

  constructor(public readonly options: ReactNativeTransportOptions) {
    this.requestAccount = options.requestAccount;
    this.getReturnUrl = options.getReturnUrl;
  }

  public onRequest(
    request: SigningRequest,
    _cancel: (reason: string | Error) => void
  ) {
    console.log('request');
    const deviceRequest = request.clone();
    deviceRequest.setInfoKey('same_device', true);
    deviceRequest.setInfoKey('return_path', this.getReturnUrl());

    if (this.requestAccount.length > 0) {
      request.setInfoKey('req_account', this.requestAccount);
      deviceRequest.setInfoKey('req_account', this.requestAccount);
    }

    const sameDeviceUri = deviceRequest.encode(true, false);
    console.log(sameDeviceUri);
    Linking.openURL(sameDeviceUri);
  }

  public onSessionRequest(
    _session: LinkSession,
    request: SigningRequest,
    _cancel: (reason: string | Error) => void
  ) {
    request.setInfoKey('return_path', this.getReturnUrl());
    const scheme = request.getScheme();
    console.log('onSessionRequest', `${scheme}://link`, this.getReturnUrl());
    Linking.openURL(`${scheme}://link`);
  }
}
