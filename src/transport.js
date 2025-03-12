import { LinkSession } from '@proton/link';
import { SigningRequest } from '@proton/signing-request';
import { Linking } from 'react-native';
export default class ReactNativeTransport {
  options;
  requestAccount;
  getReturnUrl;
  constructor(options) {
    this.options = options;
    this.requestAccount = options.requestAccount;
    this.getReturnUrl = options.getReturnUrl;
  }
  onRequest(request, _cancel) {
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
  onSessionRequest(_session, request, _cancel) {
    request.setInfoKey('return_path', this.getReturnUrl());
    const scheme = request.getScheme();
    console.log('onSessionRequest', `${scheme}://link`, this.getReturnUrl());
    Linking.openURL(`${scheme}://link`);
  }
}
//# sourceMappingURL=transport.js.map
