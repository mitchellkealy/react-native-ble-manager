// src/components/LoadingModal.tsx

import React from 'react';
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as Progress from 'react-native-progress'; // For the progress bar

interface LoadingModalProps {
  isVisible: boolean;
  message: string;
  progress?: number; // Optional progress value between 0 and 1
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isVisible, message, progress }) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {typeof progress === 'number' ? (
            <Progress.Bar progress={progress} width={200} color="#007AFF" />
          ) : (
            <ActivityIndicator size="large" color="#007AFF" />
          )}
          <Text style={styles.messageText}>{message}</Text>
        </View>
      </View>
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
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LoadingModal;
