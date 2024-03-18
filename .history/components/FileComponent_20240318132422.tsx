import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';

const files = [
  {
    name: "IMG-20240317-WA0004.jpg",
    created: "2024-03-17 21:31:18 UTC",
    modified: "2024-03-17 21:31:18 UTC",
  },
  {
    name: "IMG-20240318-WA0005.jpg",
    created: "2024-03-18 10:46:42 UTC",
    modified: "2024-03-18 10:46:42 UTC",
  },
  {
    name: "Screenshot_20240317-221908.png",
    created: "2024-03-18 02:19:09 UTC",
    modified: "2024-03-18 02:19:09 UTC",
  },
];

const FileComponent = () => {
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.fileName}>{item.name}</Text>
      <Text style={styles.fileInfo}>Created: {format(parseISO(item.created), 'PPPpp')}</Text>
      <Text style={styles.fileInfo}>Modified: {format(parseISO(item.modified), 'PPPpp')}</Text>
    </View>
  );

  return (
    <FlatList
      data={files}
      renderItem={renderItem}
      keyExtractor={item => item.name}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    marginTop: 20,
  },
  itemContainer: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    marginVertical: 8,
    borderRadius: 5,
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileInfo: {
    fontSize: 14,
  },
});

export default FileComponent;
