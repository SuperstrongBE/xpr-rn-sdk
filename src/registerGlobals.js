import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import {
  TextEncoder as TextEncoderPolyfill,
  TextDecoder as TextDecoderPolyfill,
} from 'text-encoding-shim';
const globalAny = global;
globalAny.Buffer = Buffer;
globalAny.TextDecoder = TextDecoderPolyfill;
globalAny.TextEncoder = TextEncoderPolyfill;
if (typeof globalAny.crypto !== 'object') {
  globalAny.crypto = {};
}
//# sourceMappingURL=registerGlobals.js.map
