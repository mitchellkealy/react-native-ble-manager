import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  Platform,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { NativeEventEmitter, NativeModules } from "react-native";
import BleManager from "react-native-ble-manager";
import { Buffer } from "buffer";
import Icon from "react-native-vector-icons/MaterialIcons"; // Make sure to install this package

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const SendAlarmTest = () => {
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const connectedDeviceRef = useRef(connectedDevice);
  const [alarms, setAlarms] = useState<string[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [alarmId, setAlarmId] = useState("");
  const [alarmTime, setAlarmTime] = useState("");
  const [alarmEnabled, setAlarmEnabled] = useState("1"); // "1" for enabled, "0" for disabled

  // Keep the ref updated with the latest connectedDevice value
  useEffect(() => {
    connectedDeviceRef.current = connectedDevice;
  }, [connectedDevice]);

  // Define handleDisconnect outside useEffect
  const handleDisconnect = (peripheral) => {
    console.log("Disconnected from", peripheral.peripheral);
    if (peripheral.peripheral === connectedDeviceRef.current) {
      setConnectedDevice(null);
    }
  };

  useEffect(() => {
    BleManager.start({ showAlert: false })
      .then(() => console.log("BLE Manager started"))
      .catch((error) => console.error("Failed to start BLE Manager", error));

    // Store the subscription object
    const disconnectListener = bleManagerEmitter.addListener(
      "BleManagerDisconnectPeripheral",
      handleDisconnect
    );

    return () => {
      // Remove the listener on cleanup
      disconnectListener.remove();
    };
  }, []); // Empty dependency array to run only once

  const openModal = () => {
    setAlarmId("");
    setAlarmTime("");
    setAlarmEnabled("1");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const addAlarm = () => {
    if (!alarmId || !alarmTime) {
      Alert.alert("Error", "Please enter all alarm details.");
      return;
    }
    const newAlarm = `${alarmId},${alarmTime},${alarmEnabled}`;
    setAlarms([...alarms, newAlarm]);
    closeModal();
  };

  const deleteAlarmFromList = (index) => {
    const newAlarms = [...alarms];
    newAlarms.splice(index, 1);
    setAlarms(newAlarms);
  };

  const sendAlarmsToDevice = async () => {
    if (alarms.length === 0) {
      Alert.alert("No Alarms", "Please add alarms before sending.");
      return;
    }

    try {
      console.log("Starting scan...");
      await BleManager.scan([], 5, true);
      console.log("Scan started");

      setTimeout(async () => {
        const peripheralsArray = await BleManager.getDiscoveredPeripherals();
        console.log("Discovered devices:", peripheralsArray);

        const gentlyDevice = peripheralsArray.find(
          (device) => device.name === "GentlyDevice"
        );

        if (!gentlyDevice) {
          Alert.alert("Device not found", "GentlyDevice was not found nearby.");
          return;
        }

        try {
          console.log("Connecting to GentlyDevice:", gentlyDevice.id);
          await BleManager.connect(gentlyDevice.id);
          console.log("Successfully connected to:", gentlyDevice.id);
          setConnectedDevice(gentlyDevice.id);
        } catch (error) {
          console.error("Error connecting to device:", error);
          Alert.alert(
            "Connection Error",
            error.message || "An unknown error occurred"
          );
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second

        const services = await BleManager.retrieveServices(gentlyDevice.id);
        console.log("Retrieved services:", services);

        // Define your service and characteristic UUIDs
        const ALARM_SERVICE_UUID = "12345678-1234-5678-1234-56789abcdef0";
        const CREATE_UPDATE_CHAR_UUID =
          "12345678-1234-5678-1234-56789abcdef1";
        const DELETE_CHAR_UUID = "12345678-1234-5678-1234-56789abcdef2";

        // Find the characteristics
        const createUpdateChar = services.characteristics.find(
          (char) =>
            char.service.toLowerCase() === ALARM_SERVICE_UUID.toLowerCase() &&
            char.characteristic.toLowerCase() ===
              CREATE_UPDATE_CHAR_UUID.toLowerCase()
        );

        if (!createUpdateChar) {
          Alert.alert("Error", "Required characteristic not found.");
          return;
        }

        console.log("Characteristic found:", createUpdateChar.characteristic);

        // Add delay if necessary
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Send each alarm
        for (const alarm of alarms) {
          // Convert alarm string to base64
          const alarmBase64 = Buffer.from(alarm, "utf-8").toString("base64");

          // Convert base64 string to bytes
          const alarmDataBytes = Array.from(Buffer.from(alarmBase64, "utf-8"));

          console.log("Sending alarm:", alarm);
          console.log("Base64-encoded alarm:", alarmBase64);

          await BleManager.write(
            gentlyDevice.id,
            createUpdateChar.service,
            createUpdateChar.characteristic,
            alarmDataBytes
          );

          console.log("Alarm sent:", alarm);
          // Add delay between writes if necessary
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        Alert.alert("Success", "Alarms sent to the device!");
      }, 5000); // Wait for scan to complete
    } catch (error) {
      console.error("Error during BLE operation:", error);
      Alert.alert("Error", error.message || "An unknown error occurred");
    }
  };

  const renderAlarmItem = ({ item, index }) => {
    const [id, time, enabled] = item.split(",");
    return (
      <View style={styles.alarmItem}>
        <Text style={styles.alarmText}>
          Alarm ID: {id}, Time: {time}, Enabled: {enabled === "1" ? "Yes" : "No"}
        </Text>
        <TouchableOpacity
          onPress={() => deleteAlarmFromList(index)}
          style={styles.deleteButton}
        >
          <Icon name="delete" size={24} color="#ff0000" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Alarms</Text>
        <TouchableOpacity
          onPress={sendAlarmsToDevice}
          style={styles.sendButton}
        >
          <Icon name="send" size={24} color="#007AFF" />
          <Text style={styles.sendButtonText}>Send Alarms</Text>
        </TouchableOpacity>
      </View>

      {alarms.length === 0 ? (
        <View style={styles.noAlarmsContainer}>
          <Text style={styles.noAlarmsText}>No alarms. Create one!</Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          renderItem={renderAlarmItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.alarmList}
        />
      )}

      <TouchableOpacity onPress={openModal} style={styles.createButton}>
        <Icon name="add" size={24} color="#fff" />
        <Text style={styles.createButtonText}>Create Alarm</Text>
      </TouchableOpacity>

      {/* Create Alarm Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create Alarm</Text>
            <TextInput
              style={styles.input}
              placeholder="Alarm ID"
              value={alarmId}
              onChangeText={setAlarmId}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Time (HH:MM:SS)"
              value={alarmTime}
              onChangeText={setAlarmTime}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={closeModal} />
              <Button title="Add Alarm" onPress={addAlarm} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  sendButtonText: {
    fontSize: 16,
    color: "#007AFF",
    marginLeft: 8,
  },
  noAlarmsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noAlarmsText: {
    fontSize: 18,
    color: "#888",
  },
  alarmList: {
    padding: 16,
  },
  alarmItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  alarmText: {
    flex: 1,
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
  },
  createButton: {
    position: "absolute",
    bottom: 32,
    right: 32,
    backgroundColor: "#007AFF",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default SendAlarmTest;
