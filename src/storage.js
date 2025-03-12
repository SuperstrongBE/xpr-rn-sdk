import AsyncStorage from '@react-native-async-storage/async-storage';
import {} from '@proton/link';
class Storage {
  keyPrefix;
  constructor(keyPrefix) {
    this.keyPrefix = keyPrefix;
  }
  async write(key, data) {
    AsyncStorage.setItem(this.storageKey(key), data);
  }
  async read(key) {
    return AsyncStorage.getItem(this.storageKey(key));
  }
  async remove(key) {
    AsyncStorage.removeItem(this.storageKey(key));
  }
  storageKey(key) {
    return `${this.keyPrefix}-${key}`;
  }
}
export default Storage;
//# sourceMappingURL=storage.js.map
