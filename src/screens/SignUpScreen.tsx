import React from 'react';
import {
  Alert,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import GoogleLogo from '../components/GoogleLogo';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

/** Logowanie przez Google nie ma jeszcze obsługi w backendzie. */
const showGoogleUnavailable = () =>
  Alert.alert('Coming soon', 'Google sign-in is not available yet. Please continue with email.');

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ImageBackground
        resizeMode="cover"
        source={require('../../assets/images/background-singup.png')}
        style={styles.background}
      />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backButton,
            { top: insets.top + 14 },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons color={colors.backgroundPrimary} name="arrow-back" size={30} />
        </Pressable>

        <Text style={styles.logo}>LumoGo</Text>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.title}>Get Started</Text>
            <Text style={styles.description}>
              Choose how you’d like to create{`\n`}your account.
            </Text>

            <Pressable
              accessibilityLabel="Continue with email"
              accessibilityRole="button"
              onPress={() => navigation.navigate('Registration')}
              style={({ pressed }) => [styles.button, styles.emailButton, pressed && styles.pressed]}
            >
              <Text style={styles.emailButtonText}>Continue with email</Text>
            </Pressable>

            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>or continue with</Text>
              <View style={styles.separatorLine} />
            </View>

            <Pressable
              accessibilityLabel="Continue with Google"
              accessibilityRole="button"
              onPress={showGoogleUnavailable}
              style={({ pressed }) => [styles.button, styles.googleButton, pressed && styles.pressed]}
            >
              <View style={styles.googleContent}>
                <GoogleLogo />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </View>
            </Pressable>

            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already have an account? </Text>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginLink}>Log in</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.accent,
    flex: 1,
  },
  background: {
    bottom: -60,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 26,
  },
  backButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    width: 48,
  },
  logo: {
    alignSelf: 'center',
    color: colors.backgroundPrimary,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 14,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 18,
  },
  card: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 30,
    paddingBottom: 55,
    paddingHorizontal: 26,
    paddingTop: 47,
  },
  title: {
    color: '#4A4A4A',
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: '#7A7A7A',
    fontSize: 18,
    lineHeight: 25,
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    borderRadius: 28,
    height: 57,
    justifyContent: 'center',
  },
  emailButton: {
    backgroundColor: colors.accent,
    marginTop: 50,
  },
  emailButtonText: {
    color: colors.backgroundPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  separator: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 17,
    marginVertical: 26,
  },
  separatorLine: {
    backgroundColor: '#A7A7A7',
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  separatorText: {
    color: '#858585',
    fontSize: 16,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#747775',
    borderWidth: 1,
  },
  googleContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
  },
  googleButtonText: {
    color: '#1F1F1F',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 20,
  },
  loginRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 43,
  },
  loginPrompt: {
    color: '#858585',
    fontSize: 16,
  },
  loginLink: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
});
