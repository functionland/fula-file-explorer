import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, Button, View, StyleSheet } from 'react-native';
import { fula } from '@functionland/react-native-fula';
import { Picker } from '@react-native-picker/picker';

const App = () => {
  const [privateKey, setPrivateKey] = useState('');
  const [rootCid, setRootCid] = useState('');
  const [poolId, setPoolId] = useState("1");
  const [lsResults, setLsResults] = useState('');

  const handleLs = async () => {
    try {
      // Construct bloxAddr based on selected poolId
      const bloxAddr = `/dns4/${poolId}.pools.functionyard.fula.network/tcp/40001/p2p/12D3KooWFfj9VawA9KFeectbkWpmM2hhpfpeLewfmX8YBPQmHrm3`;

      // Initialize Fula with your privateKey and dynamically constructed bloxAddr
      const fulaInit = await fula.init(
        privateKey,
        '',
        bloxAddr,
        '',
        true,
        rootCid,
        true,
        true,
      );
      console.log(fulaInit);
      if (fulaInit) {
        const results = await fula.ls(rootCid);
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
