import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  Button,
  View,
  StyleSheet,
} from 'react-native';
import {fula} from '@functionland/react-native-fula';
import {Picker} from '@react-native-picker/picker';

const App = () => {
  const [privateKey, setPrivateKey] = useState('');
  const [rootCid, setRootCid] = useState('');
  const [poolId, setPoolId] = useState('1');
  const [lsResults, setLsResults] = useState('');
  const [fulaInit, setFulaInit] = useState(null);

  const initFula = async (
    privateKey_tower: string,
    bloxAddr: string,
    root_cid: string,
  ) => {
    try {
      const _fulaInit = await fula.init(
        privateKey_tower,
        '',
        bloxAddr,
        '',
        true,
        root_cid,
      );
      console.log(_fulaInit);
      setFulaInit(_fulaInit);
    } catch (e) {
      console.log(e);
      return Promise.reject(e);
    }
  };

  useEffect(() => {
    if (!__DEV__) {
      console.log = () => null;
      //console.error = () => null
    }
    fula
      .registerLifecycleListener()
      .then(() => console.log('Lifecycle listener registered'))
      .catch(error =>
        console.error('Failed to register lifecycle listener', error),
      );
  }, []);
  useEffect(() => {
    if (poolId && rootCid) {
      // Construct bloxAddr based on selected poolId
      const bloxAddr = `/dns4/${poolId}.pools.functionyard.fula.network/tcp/40001/p2p/12D3KooWFfj9VawA9KFeectbkWpmM2hhpfpeLewfmX8YBPQmHrm3`;
      const privateKey2 = [
        136, 140, 244, 206, 112, 88, 174, 215, 168, 255, 187, 101, 60, 246, 164,
        180, 36, 243, 231, 82, 182, 24, 99, 79, 114, 144, 196, 186, 92, 27, 109,
        89, 153, 106, 217, 201, 106, 9, 66, 33, 214, 195, 255, 234, 178, 244,
        203, 112, 62, 91, 140, 55, 179, 10, 208, 210, 177, 111, 61, 46, 73, 148,
        62,
      ];
      // Initialize Fula with your privateKey and dynamically constructed bloxAddr
      initFula(privateKey2.toString(), bloxAddr, rootCid);
    }
  }, [rootCid, poolId]);

  const handleLs = async () => {
    try {
      if (fulaInit) {
        const results = await fula.ls('root');
        setLsResults(JSON.stringify(results, null, 2));
      }
    } catch (error) {
      console.error('Failed to list:', error);
      setLsResults('Failed to retrieve list. Error: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setPrivateKey}
          value={privateKey}
          placeholder="Enter privateKey"
        />
        <TextInput
          style={styles.input}
          onChangeText={setRootCid}
          value={rootCid}
          placeholder="Enter root_cid"
        />
        <Picker
          selectedValue={poolId}
          style={styles.picker}
          onValueChange={(itemValue, itemIndex) => setPoolId(itemValue)}>
          <Picker.Item label="Pool 1" value="1" />
          <Picker.Item label="Pool 2" value="2" />
          <Picker.Item label="Pool 3" value="3" />
        </Picker>
        <Button title="List Files" onPress={handleLs} />
        <View style={styles.resultContainer}>
          <Text style={styles.results}>{lsResults}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    padding: 20,
  },
  input: {
    height: 40,
    marginVertical: 12,
    borderWidth: 1,
    padding: 10,
  },
  picker: {
    height: 50,
    marginVertical: 12,
  },
  resultContainer: {
    marginTop: 20,
  },
  results: {
    fontFamily: 'monospace',
  },
});

export default App;
