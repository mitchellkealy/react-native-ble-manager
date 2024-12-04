import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AlarmItem from './AlarmItem';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AlarmListProps {
  alarms: string[];
  deleteAlarm: (index: number) => void;
  toggleAlarm: (index: number, enabled: boolean) => void;
  openModal: () => void;
}

const AlarmList: React.FC<AlarmListProps> = ({ alarms, deleteAlarm, toggleAlarm, openModal }) => {
  const renderAlarmItem = ({ item, index }: { item: string; index: number }) => (
    <AlarmItem item={item} index={index} deleteAlarm={deleteAlarm} toggleAlarm={toggleAlarm} />
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
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.alarmList}
        />
      )}

      <TouchableOpacity onPress={openModal} style={styles.createButton}>
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
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
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
    position: 'absolute' as const,
    bottom: 32,
    right: 32,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    elevation: 5,
  },
});

export default AlarmList;
