import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';

interface CreateAlarmModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAddAlarm: (newAlarm: string) => void;
}

const CreateAlarmModal: React.FC<CreateAlarmModalProps> = ({ isVisible, onClose, onAddAlarm }) => {
  const [alarmId, setAlarmId] = useState('');
  const [alarmTime, setAlarmTime] = useState('');
  const [alarmEnabled, setAlarmEnabled] = useState('1'); // "1" for enabled, "0" for disabled

  const handleAddAlarm = () => {
    if (!alarmId || !alarmTime) {
      Alert.alert('Error', 'Please enter all alarm details.');
      return;
    }
    const newAlarm = `${alarmId},${alarmTime},${alarmEnabled}`;
    onAddAlarm(newAlarm);
    // Reset the form
    setAlarmId('');
    setAlarmTime('');
    setAlarmEnabled('1');
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              <Button title="Cancel" onPress={onClose} />
              <Button title="Add Alarm" onPress={handleAddAlarm} />
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
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
});

export default CreateAlarmModal;
