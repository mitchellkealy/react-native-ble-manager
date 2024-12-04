// src/components/Header.tsx

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
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  sendButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default Header;
