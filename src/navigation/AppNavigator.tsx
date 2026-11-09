import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import LoadingScreen from '../screens/LoadingScreen';
import AuthenticationScreen from '../screens/AuthenticationScreen';
import SignUpScreen from '../screens/SignUpScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import RegistrationSuccessScreen from '../screens/RegistrationSuccessScreen';
import LoginScreen from '../screens/LoginScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import SavedPlansScreen from '../screens/SavedPlansScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import PrivacyTermsScreen from '../screens/PrivacyTermsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';

export type RootStackParamList = {
  Loading: undefined;
  Authentication: undefined;
  SignUp: undefined;
  Registration: undefined;
  RegistrationSuccess: undefined;
  Login: undefined;
  Main: undefined;
  EditProfile: undefined;
  Preferences: undefined;
  SavedPlans: undefined;
  ChangePassword: undefined;
  PrivacyTerms: undefined;
  HelpSupport: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="Authentication" component={AuthenticationScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Registration" component={RegistrationScreen} />
      <Stack.Screen name="RegistrationSuccess" component={RegistrationSuccessScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen name="SavedPlans" component={SavedPlansScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="PrivacyTerms" component={PrivacyTermsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    </Stack.Navigator>
  );
}
