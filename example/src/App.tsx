import { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ConnectWallet, type LinkOptions } from 'react-native-proton-sdk';

export default function App() {
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    const linkOptions: LinkOptions = {
      transport: {
        onRequest: (request: any) => {
          console.log('request', request);
        },
      },
      chains: [
        {
          chainId:
            'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
          nodeUrl: 'https://eos.greymass.com',
        },
      ],
      scheme: 'proton' as const,
      endpoints: ['https://eos.greymass.com'],
    };

    const connect = ConnectWallet({
      linkOptions,
      transportOptions: {
        requestAccount: 'test',
        getReturnUrl: () => 'proton://',
      },
    });

    connect().then((res) => {
      setResult(JSON.stringify(res, null, 2));
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
