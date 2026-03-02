import { Text } from './common';
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTheme } from 'react-native-paper';

interface NoDataFoundProps {
  title: string;
  description?: string;
}

const NoDataFound = ({ title, description }) => {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/folder.png')} // place your own illustration here
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>
        {title}
      </Text>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
