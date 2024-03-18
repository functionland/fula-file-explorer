import React from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {format, parseISO} from 'date-fns';
export type File = {
  name: string;
  created: string;
  modified: string;
};

type FileComponentProps = {
  files: File[];
};
const FileComponent: React.FC<FileComponentProps> = ({files}) => {
  console.log(JSON.stringify(files));
  const renderItem = ({item}) => {
    // Adjusting the date strings to be ISO 8601 compliant
    const createdDate = item.created.replace(' UTC', 'Z');
    const modifiedDate = item.modified.replace(' UTC', 'Z');

    return (
      <View style={styles.itemContainer}>
        <Text style={styles.fileName}>{item.name}</Text>
        <Text style={styles.fileInfo}>
          Created: {format(parseISO(createdDate), 'PPPpp')}
        </Text>
        <Text style={styles.fileInfo}>
          Modified: {format(parseISO(modifiedDate), 'PPPpp')}
        </Text>
      </View>
    );
  };

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
    color: 'black',
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
