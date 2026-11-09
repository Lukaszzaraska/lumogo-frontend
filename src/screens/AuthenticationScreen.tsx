import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Authentication'>;

export default function AuthenticationScreen({ navigation }: Props) {
  const openSignUp = () => navigation.navigate('SignUp');
  const openLogin = () => navigation.navigate('Login');

  return (
    <ImageBackground
      resizeMode="cover"
      source={require('../../assets/images/background-authentication-lumo.jpeg')}
      style={styles.background}
    >
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <View style={styles.card}>
          <Text style={styles.title}>Feel good.{`\n`}Go further.</Text>
          <Text style={styles.description}>
            Real-time conditions and smart guidance for every step outside.
          </Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={openSignUp}
              style={({ pressed }) => [styles.button, styles.signUpButton, pressed && styles.pressed]}
            >
              <Text style={styles.signUpText}>Sign up</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={openLogin}
              style={({ pressed }) => [styles.button, styles.logInButton, pressed && styles.pressed]}
            >
              <Text style={styles.logInText}>Log in</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 24,
    paddingHorizontal: 34,
  },
  card: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 34,
    paddingBottom: 36,
    paddingHorizontal: 27,
    paddingTop: 25,
  },
  title: {
    color: colors.textSecondary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  description: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 23,
    marginTop: 10,
  },
  actions: {
    gap: 12,
    marginTop: 26,
    paddingHorizontal: 13,
  },
  button: {
    alignItems: 'center',
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
  },
  signUpButton: {
    backgroundColor: colors.textSecondary,
  },
  signUpText: {
    color: colors.backgroundPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  logInButton: {
    borderColor: colors.textMuted,
    borderWidth: 2,
  },
  logInText: {
    color: colors.textMuted,
    fontSize: 18,
  },
  pressed: {
    opacity: 0.75,
  },
});
