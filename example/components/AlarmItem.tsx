import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AlarmItemProps {
  item: string;
  index: number;
  deleteAlarm: (index: number) => void;
  toggleAlarm: (index: number, enabled: boolean) => void;
}

const AlarmItem: React.FC<AlarmItemProps> = ({ item, index, deleteAlarm, toggleAlarm }) => {
  const [id, time, enabled] = item.split(',');
  const isEnabled = enabled === '1';

  const handleToggle = (value: boolean) => {
    toggleAlarm(index, value);
  };

  const cardStyle = isEnabled ? styles.card : [styles.card, styles.cardDisabled];

  return (
    <View style={cardStyle}>
      <View style={styles.alarmInfo}>
        <Text style={styles.timeText}>{time}</Text>
        <Text style={styles.idText}>Alarm ID: {id}</Text>
      </View>
      <View style={styles.actions}>
        <Switch value={isEnabled} onValueChange={handleToggle} />
        <TouchableOpacity onPress={() => deleteAlarm(index)} style={styles.deleteButton}>
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
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
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
    fontWeight: 'bold' as const,
    color: '#000',
  },
  idText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  deleteButton: {
    marginLeft: 16,
  },
});

export default AlarmItem;
