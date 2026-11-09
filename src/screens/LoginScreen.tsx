import React, { useState } from 'react';
import { errorMessage } from '../api/client';
import { login } from '../api/auth';
import { useSession } from '../session/SessionContext';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Alert,
  ActivityIndicator,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import GoogleLogo from '../components/GoogleLogo';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

const doNothing = () => {};

/** Logowanie przez Google nie ma jeszcze obsługi w backendzie. */
const showGoogleUnavailable = () =>
  Alert.alert('Coming soon', 'Google sign-in is not available yet. Please continue with email.');

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useSession();
  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSignIn = async () => {
    if (!canSubmit) return;
    Keyboard.dismiss();
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(await login(email, password));
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (reason) {
      setError(errorMessage(reason));
      setIsSubmitting(false);
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

          <View style={styles.card}>
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  onBlur={() => setEmailFocused(false)}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  style={[styles.input, emailFocused && styles.inputFocused]}
                  value={email}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    autoCapitalize="none"
                    autoComplete="current-password"
                    onBlur={() => setPasswordFocused(false)}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    secureTextEntry={!passwordVisible}
                    style={[styles.input, styles.passwordInput, passwordFocused && styles.inputFocused]}
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
                <Pressable accessibilityRole="button" onPress={doNothing} style={styles.forgotButton}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              </View>
            </View>

            {error ? (
              <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                {error}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit, busy: isSubmitting }}
              disabled={!canSubmit}
              onPress={handleSignIn}
              style={({ pressed }) => [
                styles.signInButton,
                !canSubmit && styles.signInButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.backgroundPrimary} />
              ) : (
                <Text style={styles.signInText}>Sign in</Text>
              )}
            </Pressable>

            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>or continue with</Text>
              <View style={styles.separatorLine} />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={showGoogleUnavailable}
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
    height: 180,
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
    paddingBottom: 34,
    paddingHorizontal: 28,
    paddingTop: 47,
  },
  title: {
    color: '#4A4A4A',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#858585',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    gap: 20,
    marginTop: 36,
  },
  fieldGroup: {
    gap: 7,
  },
  label: {
    color: '#424242',
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
    color: '#4285F4',
    fontSize: 13,
  },
  signInButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#4A4A4A',
    borderRadius: 28,
    height: 57,
    justifyContent: 'center',
    marginTop: 35,
    width: '100%',
  },
  signInButtonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    color: '#D64545',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
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
    marginVertical: 20,
  },
  separatorLine: {
    backgroundColor: '#A7A7A7',
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  separatorText: {
    color: '#858585',
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
