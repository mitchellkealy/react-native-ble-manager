// src/components/AlarmItem.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Alarm } from '../types/Alarm';

interface AlarmItemProps {
  item: Alarm;
  deleteAlarm: (id: number) => void;
  toggleAlarm: (id: number, enabled: boolean) => void;
}

const AlarmItem: React.FC<AlarmItemProps> = ({ item, deleteAlarm, toggleAlarm }) => {
  const { id, time, enabled } = item;

  const handleToggle = (value: boolean) => {
    toggleAlarm(id, value);
  };

  const cardStyle = enabled ? styles.card : [styles.card, styles.cardDisabled];

  return (
    <View style={cardStyle}>
      <View style={styles.alarmInfo}>
        <Text style={styles.timeText}>{time}</Text>
        <Text style={styles.idText}>Alarm ID: {id}</Text>
      </View>
      <View style={styles.actions}>
        <Switch value={enabled} onValueChange={handleToggle} accessibilityLabel={`Toggle Alarm ${id}`} />
        <TouchableOpacity onPress={() => deleteAlarm(id)} style={styles.deleteButton} accessibilityLabel={`Delete Alarm ${id}`}>
          <Icon name="delete" size={24} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  cardDisabled: {
    opacity: 0.5,
  },
  alarmInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  idText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 16,
  },
});

export default AlarmItem;
