import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface NoDataFoundProps {
  title: string;
  description?: string;
}

const NoDataFound = ({ title, description }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/folder.png')} // place your own illustration here
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
  );
};

export default NoDataFound;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
