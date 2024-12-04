// src/components/CreateAlarmModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CreateAlarmModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddAlarm: (newAlarm: { time: string; enabled: boolean }) => void;
}

const CreateAlarmModal: React.FC<CreateAlarmModalProps> = ({
  isVisible,
  onClose,
  onAddAlarm,
}) => {
  const [alarmTime, setAlarmTime] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(true);

  const handleAddAlarm = () => {
    const hours = alarmTime.getHours().toString().padStart(2, '0');
    const minutes = alarmTime.getMinutes().toString().padStart(2, '0');
    const seconds = alarmTime.getSeconds().toString().padStart(2, '0'); // Ensure seconds are included
    const timeString = `${hours}:${minutes}:${seconds}`; // Format: "HH:MM:SS"
    console.log('Creating Alarm with Time:', timeString); // Debugging Log
    const newAlarm = {
      time: timeString,
      enabled: alarmEnabled,
    };
    onAddAlarm(newAlarm);
    // Reset the form
    setAlarmTime(new Date());
    setAlarmEnabled(true);
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      setAlarmTime(selectedDate);
      console.log('Selected Time:', selectedDate.toLocaleTimeString()); // Debugging Log
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Create Alarm</Text>
              <TouchableOpacity onPress={onClose} accessibilityLabel="Close Modal">
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Time Picker Section */}
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => setShowPicker(true)}
                accessibilityLabel="Set Alarm Time"
              >
                <Text style={styles.timePickerText}>Set Time</Text>
                <Icon name="access-time" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.selectedTime}>
                Selected Time: {alarmTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Text>
              {showPicker && (
                <DateTimePicker
                  value={alarmTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                />
              )}

              {/* Enable/Disable Switch */}
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Enable Alarm</Text>
                <TouchableOpacity
                  onPress={() => setAlarmEnabled((prev) => !prev)}
                  style={styles.switchButton}
                  accessibilityLabel="Toggle Alarm Enabled"
                >
                  <View style={[styles.switch, alarmEnabled && styles.switchOn]}>
                    {alarmEnabled && <View style={styles.switchIndicator} />}
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                accessibilityLabel="Cancel"
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddAlarm}
                accessibilityLabel="Add Alarm"
              >
                <Text style={[styles.buttonText, styles.addButtonText]}>Add Alarm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    marginBottom: 20,
  },
  timePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  timePickerText: {
    fontSize: 16,
    color: '#007AFF',
  },
  selectedTime: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  switchButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    padding: 2,
  },
  switch: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    padding: 2,
  },
  switchOn: {
    backgroundColor: '#007AFF',
  },
  switchIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
  },
  addButtonText: {
    color: '#fff',
  },
});

export default CreateAlarmModal;
