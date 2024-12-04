// src/screens/AlarmsScreen.tsx

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
import AlarmList from '../components/AlarmList';
import CreateAlarmModal from '../components/CreateAlarmModal';
import LoadingModal from '../components/LoadingModal';
import { Alarm } from '../types/Alarm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALARMS_STORAGE_KEY } from '../constants/storageKeys';
import { getNextAvailableId } from '../utils/getNextAvailableId';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const AlarmsScreen: React.FC = () => {
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const connectedDeviceRef = useRef<string | null>(connectedDevice);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [progress, setProgress] = useState<number | undefined>(undefined);

  useEffect(() => {
    connectedDeviceRef.current = connectedDevice;
  }, [connectedDevice]);

  // Load alarms on mount
  useEffect(() => {
    const loadAlarms = async () => {
      try {
        const storedAlarms = await AsyncStorage.getItem(ALARMS_STORAGE_KEY);
        if (storedAlarms) {
          const parsedAlarms = JSON.parse(storedAlarms);
          if (Array.isArray(parsedAlarms)) {
            setAlarms(parsedAlarms);
          } else {
            console.warn('Stored alarms is not an array.');
            setAlarms([]); // Reset to empty array if data is malformed
          }
        }
      } catch (error) {
        console.error('Failed to load alarms:', error);
        setAlarms([]); // Reset to empty array on error
      }
    };

    loadAlarms();
  }, []);

  // Save alarms whenever they change
  useEffect(() => {
    const saveAlarms = async () => {
      try {
        await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
      } catch (error) {
        console.error('Failed to save alarms:', error);
      }
    };

    saveAlarms();
  }, [alarms]);

  const handleDisconnect = (peripheral: any) => {
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
      await BleManager.scan([], 5, true);
      console.log('Scan started');

      setLoadingMessage('Scanning for devices...');

      // Wait for the scan to complete using event listener
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
        (device: any) => device.name === 'GentlyDevice'
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
      } catch (error: any) {
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
        (char: any) =>
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
        const alarmString = `${alarm.id},${alarm.time},${alarm.enabled ? '1' : '0'}`;
        console.log(`Alarm String to Encode [${i + 1}]:`, alarmString); // Debugging Log
        const alarmBase64 = Buffer.from(alarmString, 'utf-8').toString('base64');
        console.log(`Alarm Base64 [${i + 1}]:`, alarmBase64); // Debugging Log
        const alarmDataBytes = Buffer.from(alarmBase64, 'utf-8'); // Correctly encode base64 string to bytes
        console.log(`Alarm Data Bytes [${i + 1}]:`, alarmDataBytes); // Debugging Log

        setLoadingMessage(`Sending alarm ${i + 1} of ${alarms.length}...`);
        setProgress((i + 1) / alarms.length);
        console.log('Sending alarm:', alarm);

        await BleManager.write(
          gentlyDevice.id,
          createUpdateChar.service,
          createUpdateChar.characteristic,
          Array.from(alarmDataBytes) // Convert Buffer to array of numbers
        );

        console.log('Alarm sent:', alarm);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setIsLoading(false);
      setProgress(undefined);
      Alert.alert('Success', 'Alarms sent to the device!');
    } catch (error: any) {
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

  const addAlarm = (newAlarmData: { time: string; enabled: boolean }) => {
    const newId = getNextAvailableId(alarms);
    const newAlarm: Alarm = {
      id: newId,
      time: newAlarmData.time,
      enabled: newAlarmData.enabled,
    };
    console.log('Adding New Alarm:', newAlarm); // Debugging Log
    setAlarms((prevAlarms) => [...prevAlarms, newAlarm]); // Use functional update
    closeModal();
  };

  const deleteAlarmFromList = (id: number) => {
    console.log('Deleting Alarm with ID:', id); // Debugging Log
    const newAlarms = alarms.filter((alarm) => alarm.id !== id);
    setAlarms(newAlarms);
  };

  // Implement the toggleAlarm function
  const toggleAlarm = (id: number, enabled: boolean) => {
    console.log(`Toggling Alarm ID: ${id} to ${enabled ? 'Enabled' : 'Disabled'}`); // Debugging Log
    const newAlarms = alarms.map((alarm) =>
      alarm.id === id ? { ...alarm, enabled } : alarm
    );
    setAlarms(newAlarms);
  };

  // Debugging Statement
  console.log('AlarmsScreen alarms state:', alarms);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <Header onSendPress={sendAlarmsToDevice} />

      <AlarmList
        alarms={alarms}
        deleteAlarm={deleteAlarmFromList}
        toggleAlarm={toggleAlarm} // Pass toggleAlarm to AlarmList
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
