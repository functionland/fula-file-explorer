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
    privateKey_i: string,
    bloxAddr: string,
    root_cid: string,
  ) => {
    try {
      const _fulaInit = await fula.init(
        privateKey_i,
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

  interface Pool {
    pool_id: number;
    creator: string;
  }

  interface PoolResponse {
    pools: Pool[];
  }

  interface User {
    account: string;
    pool_id: number | null;
    request_pool_id: number | null;
    peer_id: string;
  }

  interface UsersResponse {
    users: User[];
  }
  const timeout = (ms: number): Promise<null> =>
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms),
    );
  const getPoolCreatorPeerId = async (
    poolId_i: number,
  ): Promise<string | null> => {
    // You can store the cluster URL in AsyncStorage or some other configuration storage.
    const clusterUrl = 'https://api.node3.functionyard.fula.network';

    try {
      // Fetch pool data
      const poolDataResponse = await Promise.race([
        fetch(`${clusterUrl}/fula/pool`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({pool_id: poolId_i}),
        }),
        timeout(10000), // Set timeout to 10000ms (10 seconds)
      ]);
      console.log(poolDataResponse);

      if (!poolDataResponse || !poolDataResponse.ok) {
        console.error(
          `Failed to fetch pool data. Status: ${poolDataResponse?.status}`,
        );
        throw new Error(
          `Failed to fetch pool data. Status: ${poolDataResponse?.status}`,
        );
      }

      const {pools}: PoolResponse = await poolDataResponse.json();
      const pool = pools.find(p => p.pool_id === poolId_i);

      // Fetch users in the pool
      const poolUsersResponse = await fetch(`${clusterUrl}/fula/pool/users`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({pool_id: pool?.pool_id}),
      });

      if (!poolUsersResponse.ok) {
        console.error(
          `Failed to fetch pool users. Status: ${poolUsersResponse.status}`,
        );
        throw new Error(
          `Failed to fetch pool users. Status: ${poolUsersResponse.status}`,
        );
      }

      const {users}: UsersResponse = await poolUsersResponse.json();
      const creatorUser = users.find(user => user.account === pool?.creator);
      console.log(users);
      if (!creatorUser) {
        console.error(`Creator ${pool?.creator} not found in pool users.`);
        throw new Error(`Creator ${pool?.creator} not found in pool users.`);
      }

      return creatorUser.peer_id;
    } catch (error) {
      console.error(`Error getting pool creator's peer_id: ${error}`);
      return null;
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
        14, 62,
      ];
      // Initialize Fula with your privateKey and dynamically constructed bloxAddr
      initFula(privateKey2.toString(), bloxAddr, rootCid);
    }
  }, [rootCid, poolId]);

  const setPoolCreatorFunc = async(poolId_i: number) {
    const _poolCreator = await getPoolCreatorPeerId(poolId_i);
    setPoolCreator(_poolCreator);

  }
  useEffect(() => {
    if (poolId) {
      setPoolCreatorFunc(parseInt(poolId, 10));
    }
  }, [poolId]);

  const handleLs = async () => {
    try {
      if (fulaInit) {
        const results = await fula.ls('root/fotos');
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
