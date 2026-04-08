import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  Alert,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import HealthConnect, {
  HealthConnectRecord,
  Permission,
  RecordType,
} from 'react-native-health-connect';

const PERMISSIONS: Permission[] = [
  { accessType: 'read', recordType: RecordType.HeartRate },
  { accessType: 'read', recordType: RecordType.SleepSession },
];

function getLast7DaysRange() {
  const endTime = new Date();
  const startTime = new Date(endTime);
  startTime.setDate(startTime.getDate() - 7);
  return {
    operator: 'between' as const,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
  };
}

function handleError(context: string, message: string, error?: unknown) {
  console.error(`Error ${context}:`, error);
  Alert.alert('Error', message);
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [heartRateData, setHeartRateData] = useState<HealthConnectRecord[]>([]);
  const [sleepData, setSleepData] = useState<HealthConnectRecord[]>([]);

  const requestPermissions = async () => {
    try {
      const grantedPermissions = await HealthConnect.requestPermissions(PERMISSIONS);
      if (grantedPermissions.length === PERMISSIONS.length) {
        setPermissionsGranted(true);
        Alert.alert('Permissions Granted', 'You can now fetch health data.');
      } else {
        Alert.alert('Permissions Denied', 'Not all permissions were granted.');
        setPermissionsGranted(false);
      }
    } catch (error) {
      handleError('requesting permissions', 'Failed to request permissions.', error);
    }
  };

  const readHealthData = async () => {
    if (!permissionsGranted) {
      Alert.alert('Permissions Required', 'Please grant permissions first.');
      return;
    }

    try {
      const timeRangeFilter = getLast7DaysRange();

      const heartRateRecords = await HealthConnect.readRecords(RecordType.HeartRate, {
        timeRangeFilter,
      });
      setHeartRateData(heartRateRecords);

      const sleepRecords = await HealthConnect.readRecords(RecordType.SleepSession, {
        timeRangeFilter,
      });
      setSleepData(sleepRecords);

      Alert.alert('Data Fetched', 'Heart rate and sleep data fetched successfully.');

      sendDataToBackend(heartRateRecords, sleepRecords);
    } catch (error) {
      handleError('reading health data', 'Failed to read health data.', error);
    }
  };

  const sendDataToBackend = async (_heartRate: HealthConnectRecord[], _sleep: HealthConnectRecord[]) => {
    // TODO: Replace with a real fetch() call to backend API endpoint.
    console.log('Simulating sending data to backend...');
    Alert.alert('Backend Simulation', 'Data would be sent to your backend here.');
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Health Connect Integration</Text>
          <Text style={styles.sectionDescription}>
            This app demonstrates integration with Google Health Connect.
          </Text>
          <View style={styles.buttonGroup}>
            <Button title="Request Health Permissions" onPress={requestPermissions} />
            <Button title="Read Health Data" onPress={readHealthData} disabled={!permissionsGranted} />
          </View>
          <Text style={styles.sectionDescription}>
            Permissions Granted: {permissionsGranted ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.sectionDescription}>
            Heart Rate Records: {heartRateData.length}
          </Text>
          <Text style={styles.sectionDescription}>
            Sleep Records: {sleepData.length}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  buttonGroup: {
    gap: 20,
    marginVertical: 10,
  },
});

export default App;
