import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { PreferencesProvider } from './src/contexts/PreferencesContext';
import { ToastProvider } from './src/contexts/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
      <SafeAreaProvider>
        <ToastProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ToastProvider>
        <StatusBar style="auto" />
      </SafeAreaProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}
