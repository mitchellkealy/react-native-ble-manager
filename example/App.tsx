import 'react-native-get-random-values'; // Polyfill must be imported first
import React from 'react';
import { SafeAreaView } from 'react-native';
import AlarmsScreen from './src/screens/AlarmsScreen';

const App: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AlarmsScreen />
    </SafeAreaView>
  );
};

export default App;