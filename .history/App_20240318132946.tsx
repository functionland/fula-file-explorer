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
import FileComponent from './components/FileComponent';

const App = () => {
  const [privateKey, setPrivateKey] = useState('');
  const [rootCid, setRootCid] = useState('');
  const [poolId, setPoolId] = useState('1');
  const [poolCreator, setPoolCreator] = useState<null | string>('');
  const [lsResults, setLsResults] = useState([]);
  const [fulaInit, setFulaInit] = useState<any>(null);

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
    if (poolId && rootCid && poolCreator && privateKey) {
      // Construct bloxAddr based on selected poolId
      const bloxAddr = `/dns4/${poolId}.pools.functionyard.fula.network/tcp/40001/p2p/${poolCreator}`;
      // Initialize Fula with your privateKey and dynamically constructed bloxAddr
      initFula(privateKey, bloxAddr, rootCid);
    }
  }, [rootCid, poolId, poolCreator, privateKey]);

  useEffect(() => {
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

    const setPoolCreatorFunc = async (poolId_i: number) => {
      const _poolCreator = await getPoolCreatorPeerId(poolId_i);
      setPoolCreator(_poolCreator);
    };
    if (poolId) {
      setPoolCreatorFunc(parseInt(poolId, 10));
    }
  }, [poolId]);

  const handleLs = async () => {
    try {
      if (fulaInit) {
        const results = await fula.ls('root/fotos');
        setLsResults(JSON.parse(JSON.stringify(results, null, 2)));
        console.log(JSON.stringify(results, null, 2));
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
        <Button
          title="List Files"
          onPress={handleLs}
          disabled={fulaInit == null}
        />
        <View style={styles.resultContainer}>
          <FileComponent files={lsResults} />
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