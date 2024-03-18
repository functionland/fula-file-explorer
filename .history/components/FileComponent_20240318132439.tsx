import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';

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
