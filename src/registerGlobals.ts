import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import { TextEncoder, TextDecoder } from 'text-encoding-shim';

global.Buffer = Buffer;
global.TextDecoder = TextDecoder as any;
(global as any).TextEncoder = TextEncoder;

if (typeof global.crypto !== 'object') {
  (global as any).crypto = {};
}
