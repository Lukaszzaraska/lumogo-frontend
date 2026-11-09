import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from '../i18n';
import { useSession } from '../session/SessionContext';
import { colors } from '../theme/colors';

export default function ProfileScreen() {
  const { user, signOut } = useSession();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('profile.title')}</Text>
        {user ? (
          <>
            <Text style={styles.name}>{[user.firstName, user.lastName].filter(Boolean).join(' ')}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => void signOut()}
          style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
        >
          <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  email: {
    fontSize: 15,
    color: colors.textMuted,
  },
  signOutButton: {
    marginTop: 32,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.textMuted,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
});
