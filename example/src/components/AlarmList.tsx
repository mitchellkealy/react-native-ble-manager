// src/components/AlarmList.tsx

import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AlarmItem from './AlarmItem';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Alarm } from '../types/Alarm';

interface AlarmListProps {
  alarms: Alarm[];
  deleteAlarm: (id: number) => void;
  toggleAlarm: (id: number, enabled: boolean) => void;
  openModal: () => void;
}

const AlarmList: React.FC<AlarmListProps> = ({ alarms, deleteAlarm, toggleAlarm, openModal }) => {
  // Debugging Statement
  console.log('AlarmList props:', { alarms, deleteAlarm, toggleAlarm, openModal });

  // Defensive Check
  if (!alarms || !Array.isArray(alarms)) {
    console.warn('AlarmList received undefined or invalid alarms prop.');
    return (
      <View style={styles.noAlarmsContainer}>
        <Text style={styles.noAlarmsText}>No alarms available.</Text>
      </View>
    );
  }

  const renderAlarmItem = ({ item }: { item: Alarm }) => (
    <AlarmItem
      item={item}
      deleteAlarm={deleteAlarm}
      toggleAlarm={toggleAlarm}
    />
  );

  return (
    <View style={styles.container}>
      {alarms.length === 0 ? (
        <View style={styles.noAlarmsContainer}>
          <Text style={styles.noAlarmsText}>No alarms. Create one!</Text>
        </View>
      ) : (
        <FlatList
          data={alarms}
          renderItem={renderAlarmItem}
          keyExtractor={(item) => item.id.toString()} // Convert number to string
          contentContainerStyle={styles.alarmList}
        />
      )}

      <TouchableOpacity onPress={openModal} style={styles.createButton} accessibilityLabel="Create Alarm">
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noAlarmsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAlarmsText: {
    fontSize: 18,
    color: '#888',
  },
  alarmList: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#f0f0f0',
  },
  createButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});

export default AlarmList;
