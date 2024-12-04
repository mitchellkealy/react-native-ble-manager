import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface HeaderProps {
  onSendPress: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSendPress }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Alarms</Text>
      <TouchableOpacity onPress={onSendPress} style={styles.sendButton}>
        <Text style={styles.sendButtonText}>Send Alarms</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sendButton: {
    // Your styles here
  },
  sendButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
  },
});

export default Header;
