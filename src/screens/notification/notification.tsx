import { View, Text } from 'react-native';
import React from 'react';
import AppLayout from '../../components/safeareawrapper';
import { globalStyle } from '../../utils/globalStyles';
import { useTheme } from 'react-native-paper';
import { metrics } from '../../utils/metrics';
import NoDataFound from '../../components/no_data_found';

const Notification = ({ navigation }: any) => {
  const theme = useTheme();
  return (
    <AppLayout title="Notifications" onBackPress={() => navigation.goBack()}>
      <View
        style={[
          globalStyle(theme).container,
          { padding: metrics.doubleMargin },
        ]}
      >
        <NoDataFound title={'No Notification Found'} />
      </View>
    </AppLayout>
  );
};

export default Notification;
