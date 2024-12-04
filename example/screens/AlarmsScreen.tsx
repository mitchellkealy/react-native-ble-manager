import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { Buffer } from 'buffer';
import Header from '../components/Header';
import AlarmList from '../components/AlarmsList';
import CreateAlarmModal from '../components/CreateAlarmModal';
import LoadingModal from '../components/LoadingModal'; // Import LoadingModal

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const AlarmsScreen: React.FC = () => {
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const connectedDeviceRef = useRef<string | null>(connectedDevice);
  const [alarms, setAlarms] = useState<string[]>([]);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [progress, setProgress] = useState<number | undefined>(undefined);

  useEffect(() => {
    connectedDeviceRef.current = connectedDevice;
  }, [connectedDevice]);

  const handleDisconnect = (peripheral) => {
    console.log('Disconnected from', peripheral.peripheral);
    if (peripheral.peripheral === connectedDeviceRef.current) {
      setConnectedDevice(null);
    }
  };

  useEffect(() => {
    BleManager.start({ showAlert: false })
      .then(() => console.log('BLE Manager started'))
      .catch((error) => console.error('Failed to start BLE Manager', error));

    const disconnectListener = bleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      handleDisconnect
    );

    return () => {
      disconnectListener.remove();
    };
  }, []);

  const sendAlarmsToDevice = async () => {
    if (alarms.length === 0) {
      Alert.alert('No Alarms', 'Please add alarms before sending.');
      return;
    }
  
    try {
      setIsLoading(true);
      setLoadingMessage('Starting scan...');
      console.log('Starting scan...');
  
      // Start scanning
      await BleManager.scan([], 5, true);
      console.log('Scan started');
      setLoadingMessage('Scanning for devices...');
  
      // Wait for the scan to complete
      await new Promise((resolve) => {
        const handler = bleManagerEmitter.addListener('BleManagerStopScan', () => {
          console.log('Scan stopped');
          handler.remove();
          resolve();
        });
      });
  
      // Now get the peripherals
      const peripheralsArray = await BleManager.getDiscoveredPeripherals();
      console.log('Discovered devices:', peripheralsArray);
  
      const gentlyDevice = peripheralsArray.find(
        (device) => device.name === 'GentlyDevice'
      );
  
      if (!gentlyDevice) {
        setIsLoading(false);
        Alert.alert('Device not found', 'GentlyDevice was not found nearby.');
        return;
      }
  
      try {
        setLoadingMessage('Connecting to device...');
        console.log('Connecting to GentlyDevice:', gentlyDevice.id);
        await BleManager.connect(gentlyDevice.id);
        console.log('Successfully connected to:', gentlyDevice.id);
        setConnectedDevice(gentlyDevice.id);
      } catch (error) {
        setIsLoading(false);
        console.error('Error connecting to device:', error);
        Alert.alert('Connection Error', error.message || 'An unknown error occurred');
        return;
      }
  
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
  
      setLoadingMessage('Retrieving services...');
      const services = await BleManager.retrieveServices(gentlyDevice.id);
      console.log('Retrieved services:', services);
  
      const ALARM_SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';
      const CREATE_UPDATE_CHAR_UUID = '12345678-1234-5678-1234-56789abcdef1';
  
      const createUpdateChar = services.characteristics.find(
        (char) =>
          char.service.toLowerCase() === ALARM_SERVICE_UUID.toLowerCase() &&
          char.characteristic.toLowerCase() === CREATE_UPDATE_CHAR_UUID.toLowerCase()
      );
  
      if (!createUpdateChar) {
        setIsLoading(false);
        Alert.alert('Error', 'Required characteristic not found.');
        return;
      }
  
      console.log('Characteristic found:', createUpdateChar.characteristic);
  
      await new Promise((resolve) => setTimeout(resolve, 500));
  
      // Send each alarm
      for (let i = 0; i < alarms.length; i++) {
        const alarm = alarms[i];
        const alarmBase64 = Buffer.from(alarm, 'utf-8').toString('base64');
        const alarmDataBytes = Array.from(Buffer.from(alarmBase64, 'utf-8'));
  
        setLoadingMessage(`Sending alarm ${i + 1} of ${alarms.length}...`);
        setProgress((i + 1) / alarms.length);
        console.log('Sending alarm:', alarm);
        console.log('Base64-encoded alarm:', alarmBase64);
  
        await BleManager.write(
          gentlyDevice.id,
          createUpdateChar.service,
          createUpdateChar.characteristic,
          alarmDataBytes
        );
  
        console.log('Alarm sent:', alarm);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
  
      setIsLoading(false);
      setProgress(undefined);
      Alert.alert('Success', 'Alarms sent to the device!');
    } catch (error) {
      setIsLoading(false);
      setProgress(undefined);
      console.error('Error during BLE operation:', error);
      Alert.alert('Error', error.message || 'An unknown error occurred');
    }
  };
  

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const addAlarm = (newAlarm) => {
    setAlarms([...alarms, newAlarm]);
    closeModal();
  };

  const deleteAlarmFromList = (index) => {
    const newAlarms = [...alarms];
    newAlarms.splice(index, 1);
    setAlarms(newAlarms);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <Header onSendPress={sendAlarmsToDevice} />

      <AlarmList
        alarms={alarms}
        deleteAlarm={deleteAlarmFromList}
        openModal={openModal}
      />

      <CreateAlarmModal
        isVisible={isModalVisible}
        onClose={closeModal}
        onAddAlarm={addAlarm}
      />

      <LoadingModal isVisible={isLoading} message={loadingMessage} progress={progress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default AlarmsScreen;
