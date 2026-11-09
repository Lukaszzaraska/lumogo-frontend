import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import GoogleLogo from '../components/GoogleLogo';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useLocationPermission } from '../hooks/useLocationPermission';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { authApi } from '../services/authApi';
import { colors } from '../theme/colors';

const doNothing = () => {};

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { setUser } = useAuth();
  const { showToast } = useToast();
  const { status: locationStatus, request: requestLocation } = useLocationPermission();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 8;

  const handleLogin = async () => {
    if (isLoading) return;
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const user = await authApi.login(email.trim(), password);
      setUser(user);
      if (locationStatus !== 'granted') {
        await requestLocation();
      }
      navigation.replace('Main');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.screen}
        >
          <View style={styles.brandArea}>
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Ionicons color={colors.backgroundPrimary} name="arrow-back" size={30} />
            </Pressable>
            <Text style={styles.logo}>LumoGo</Text>
          </View>

          <View style={[styles.card, { paddingBottom: insets.bottom + 12 }]}>
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  onBlur={() => { setEmailFocused(false); setEmailTouched(true); }}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  placeholder="you@example.com"
                  placeholderTextColor="#9A9A9A"
                  style={[styles.input, emailFocused && styles.inputFocused, emailTouched && !isEmailValid && email.length > 0 && styles.inputError]}
                  value={email}
                />
                {emailTouched && !isEmailValid && email.length > 0 && (
                  <Text style={styles.fieldError}>Enter a valid email address.</Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="current-password"
                    onBlur={() => { setPasswordFocused(false); setPasswordTouched(true); }}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    placeholder="Password"
                    placeholderTextColor="#9A9A9A"
                    secureTextEntry={!passwordVisible}
                    style={[styles.input, styles.passwordInput, passwordFocused && styles.inputFocused, passwordTouched && !isPasswordValid && password.length > 0 && styles.inputError]}
                    value={password}
                  />
                  <Pressable
                    accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setPasswordVisible((current) => !current)}
                    style={({ pressed }) => [styles.eyeButton, pressed && styles.pressed]}
                  >
                    <Ionicons
                      color="#747775"
                      name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={23}
                    />
                  </Pressable>
                </View>
                {passwordTouched && !isPasswordValid && password.length > 0 && (
                  <Text style={styles.fieldError}>Password must be at least 8 characters.</Text>
                )}
                <Pressable accessibilityRole="button" onPress={doNothing} style={styles.forgotButton}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={isLoading || !isEmailValid || !isPasswordValid}
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.signInButton,
                (isLoading || !isEmailValid || !isPasswordValid) && styles.signInButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.signInText}>{isLoading ? 'Signing in...' : 'Sign in'}</Text>
            </Pressable>

            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>or continue with</Text>
              <View style={styles.separatorLine} />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={doNothing}
              style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}
            >
              <GoogleLogo />
              <Text style={styles.googleText}>Continue with Google</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#69C883',
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  brandArea: {
    alignItems: 'center',
    height: 160,
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    left: 18,
    position: 'absolute',
    top: 14,
    width: 48,
  },
  logo: {
    color: colors.backgroundPrimary,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1,
  },
  card: {
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: 31,
    borderTopRightRadius: 31,
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 30,
  },
  title: {
    color: '#0D0D0D',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#2A2A2A',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    gap: 16,
    marginTop: 24,
  },
  fieldGroup: {
    gap: 7,
  },
  label: {
    color: '#1F1F1F',
    fontSize: 15,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderColor: '#747775',
    borderRadius: 17,
    borderWidth: 1.5,
    color: '#1F1F1F',
    fontSize: 16,
    height: 52,
    paddingHorizontal: 15,
  },
  inputFocused: {
    borderColor: colors.accent,
  },
  inputError: {
    borderColor: '#D64545',
  },
  fieldError: {
    color: '#D64545',
    fontSize: 13,
    lineHeight: 17,
    marginLeft: 4,
    marginTop: -2,
  },
  passwordInput: {
    paddingRight: 49,
  },
  eyeButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: 7,
    top: 4,
    width: 42,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -1,
  },
  forgotText: {
    color: '#1A5294',
    fontSize: 13,
  },
  signInButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 28,
    height: 57,
    justifyContent: 'center',
    marginTop: 24,
    width: '100%',
  },
  signInButtonDisabled: {
    backgroundColor: '#CFCFCF',
  },
  signInText: {
    color: colors.backgroundPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  separator: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  separatorLine: {
    backgroundColor: '#A7A7A7',
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  separatorText: {
    color: '#2A2A2A',
    fontSize: 13,
  },
  googleButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#747775',
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 15,
    height: 57,
    justifyContent: 'center',
    width: '100%',
  },
  googleText: {
    color: '#1F1F1F',
    fontSize: 18,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.8,
  },
});
