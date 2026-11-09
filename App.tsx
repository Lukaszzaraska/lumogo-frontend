import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { SessionProvider } from './src/session/SessionContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SessionProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
