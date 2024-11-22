import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet, PermissionsAndroid, Platform } from "react-native";
import BleManager from "react-native-ble-manager";
import { Buffer } from "buffer";

const SendAlarmTest = () => {
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);

  useEffect(() => {
    BleManager.start({ showAlert: false })
      .then(() => console.log("BLE Manager started"))
      .catch((error) => console.error("Failed to start BLE Manager", error));

    if (Platform.OS === "android") {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ])
        .then((result) => {
          console.log("Permissions granted:", result);
        })
        .catch((error) => console.error("Permissions error:", error));
    }
  }, []);

  const connectAndSendData = async () => {
    try {
      await BleManager.scan([], 5, true);
      console.log("Scanning for devices...");

      setTimeout(async () => {
        const discoveredDevices = await BleManager.getDiscoveredPeripherals();
        console.log("Discovered devices:", discoveredDevices);

        const gentlyDevice = discoveredDevices.find(
          (device) => device.name === "GentlyDevice"
        );

        if (!gentlyDevice) {
          Alert.alert("Device not found", "GentlyDevice was not found nearby.");
          return;
        }

        console.log("Connecting to GentlyDevice:", gentlyDevice.id);
        await BleManager.connect(gentlyDevice.id);
        setConnectedDevice(gentlyDevice.id);

        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second

        const services = await BleManager.retrieveServices(gentlyDevice.id);
        console.log("Discovered services and characteristics:", services);

        // Map characteristics to handles
        const alarmService = services.characteristics.filter(
          (char) => char.service === "12345678-1234-5678-1234-56789abcdef0"
        );

        const createUpdateChar = alarmService.find(
          (char) => char.characteristic === "12345678-1234-5678-1234-56789abcdef1"
        );

        const deleteChar = alarmService.find(
          (char) => char.characteristic === "12345678-1234-5678-1234-56789abcdef2"
        );

        if (!createUpdateChar || !deleteChar) {
          Alert.alert("Error", "Required characteristics not found.");
          return;
        }

        console.log("Mapped characteristics:", {
          createUpdateChar: createUpdateChar.characteristic,
          deleteChar: deleteChar.characteristic,
        });

        await new Promise((resolve) => setTimeout(resolve, 500)); // Add delay

        // Define alarms as UTF-8 strings (comma-separated format)
        const alarms = [
          "1,07:00:00,1", // Alarm ID 1, time 07:00:00, enabled
          "2,08:15:30,1", // Alarm ID 2, time 08:15:30, enabled
          "3,10:30:45,1", // Alarm ID 3, time 10:30:45, enabled
        ];

        // Send each alarm as a UTF-8 encoded string
        for (const alarm of alarms) {
          const alarmBuffer = Buffer.from(alarm, "utf-8");
          console.log("Sending alarm:", alarm);

          await BleManager.write(
            gentlyDevice.id,
            createUpdateChar.service, // Service UUID
            createUpdateChar.characteristic, // Create/Update Characteristic UUID
            alarmBuffer.toJSON().data // Send raw bytes
          );

          console.log("Alarm sent:", alarm);
          await new Promise((resolve) => setTimeout(resolve, 500)); // Delay between writes
        }

        // Delete alarm with ID 2
        const deleteAlarm = "2"; // Delete only needs the alarm ID
        const deleteBuffer = Buffer.from(deleteAlarm, "utf-8");
        console.log("Sending delete request:", deleteAlarm);

        await BleManager.write(
          gentlyDevice.id,
          deleteChar.service, // Service UUID
          deleteChar.characteristic, // Delete Characteristic UUID
          deleteBuffer.toJSON().data // Send raw bytes
        );

        console.log("Alarm deleted:", deleteAlarm);
        Alert.alert("Success", "Alarms created/updated and deleted!");
      }, 5000); // Wait for scanning to complete
    } catch (error) {
      console.error("Error during BLE operation:", error);
      Alert.alert("Error", error.message || "An unknown error occurred");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send Test Alarm Data</Text>
      <Button
        title={connectedDevice ? "Device Connected!" : "Connect and Send Alarm"}
        onPress={connectAndSendData}
        disabled={!!connectedDevice}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
  },
});

export default SendAlarmTest;
