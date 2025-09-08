import React, { useState, useEffect } from 'react';
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
  Platform,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import HealthConnect, {
  HealthConnectRecord,
  Permission,
  RecordType,
} from 'react-native-health-connect';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [heartRateData, setHeartRateData] = useState<HealthConnectRecord[]>([]);
  const [sleepData, setSleepData] = useState<HealthConnectRecord[]>([]);

  const PERMISSIONS = [
    { accessType: 'read', recordType: RecordType.HeartRate },
    { accessType: 'read', recordType: RecordType.SleepSession },
  ] as Permission[];

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
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions.');
    }
  };

  const readHealthData = async () => {
    if (!permissionsGranted) {
      Alert.alert('Permissions Required', 'Please grant permissions first.');
      return;
    }

    try {
      // Read Heart Rate Data
      const heartRateRecords = await HealthConnect.readRecords(RecordType.HeartRate, {
        timeRangeFilter: {
          operator: 'between',
          startTime: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), // Last 7 days
          endTime: new Date().toISOString(),
        },
      });
      setHeartRateData(heartRateRecords);
      console.log('Heart Rate Data:', heartRateRecords);

      // Read Sleep Data
      const sleepRecords = await HealthConnect.readRecords(RecordType.SleepSession, {
        timeRangeFilter: {
          operator: 'between',
          startTime: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), // Last 7 days
          endTime: new Date().toISOString(),
        },
      });
      setSleepData(sleepRecords);
      console.log('Sleep Data:', sleepRecords);

      Alert.alert('Data Fetched', 'Heart rate and sleep data fetched successfully. Check console for details.');

      // Placeholder for sending data to backend
      sendDataToBackend(heartRateRecords, sleepRecords);

    } catch (error) {
      console.error('Error reading health data:', error);
      Alert.alert('Error', 'Failed to read health data.');
    }
  };

  const sendDataToBackend = async (heartRate: HealthConnectRecord[], sleep: HealthConnectRecord[]) => {
    console.log('Simulating sending data to backend...');
    // In a real application, you would send this data to your server.
    // Example:
    // try {
    //   const response = await fetch('YOUR_BACKEND_API_ENDPOINT/health-data', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ heartRate, sleep }),
    //   });
    //   if (response.ok) {
    //     console.log('Data sent to backend successfully!');
    //   } else {
    //     console.error('Failed to send data to backend:', response.statusText);
    //   }
    // } catch (error) {
    //   console.error('Network error sending data:', error);
    // }
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
          <Button title="Request Health Permissions" onPress={requestPermissions} />
          <View style={styles.spacer} />
          <Button title="Read Health Data" onPress={readHealthData} disabled={!permissionsGranted} />
          <View style={styles.spacer} />
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
  highlight: {
    fontWeight: '700',
  },
  spacer: {
    marginVertical: 10,
  },
});

export default App;