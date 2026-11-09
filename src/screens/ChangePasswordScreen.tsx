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
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authApi } from '../services/authApi';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;

export default function ChangePasswordScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentTouched, setCurrentTouched] = useState(false);
  const [newTouched, setNewTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const isCurrentValid = currentPassword.length >= 8;
  const isNewValid = newPassword.length >= 8;
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isNewDifferent = newPassword !== currentPassword;

  const canSave = isCurrentValid && isNewValid && doPasswordsMatch && isNewDifferent && !saving;

  const handleSave = async () => {
    if (!canSave || !user) return;
    setSaving(true);
    try {
      await authApi.changePassword(user.email, currentPassword, newPassword);
      showToast('Password changed successfully.', 'success');
      navigation.goBack();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to change password.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.screen}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Ionicons color={colors.textPrimary} name="arrow-back" size={26} />
            </Pressable>
            <Text style={styles.headerTitle}>Change password</Text>
            <View style={styles.backButton} />
          </View>

          <View style={[styles.form, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Current password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  autoCapitalize="none"
                  onBlur={() => setCurrentTouched(true)}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#9A9A9A"
                  secureTextEntry={!showCurrent}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    currentTouched && !isCurrentValid && currentPassword.length > 0 && styles.inputError,
                  ]}
                  value={currentPassword}
                />
                <Pressable
                  hitSlop={8}
                  onPress={() => setShowCurrent((v) => !v)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    color={colors.textMuted}
                    name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                  />
                </Pressable>
              </View>
              {currentTouched && !isCurrentValid && currentPassword.length > 0 && (
                <Text style={styles.fieldError}>Password must be at least 8 characters.</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>New password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  autoCapitalize="none"
                  onBlur={() => setNewTouched(true)}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor="#9A9A9A"
                  secureTextEntry={!showNew}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    newTouched && !isNewValid && newPassword.length > 0 && styles.inputError,
                    newTouched && !isNewDifferent && newPassword.length > 0 && styles.inputError,
                  ]}
                  value={newPassword}
                />
                <Pressable
                  hitSlop={8}
                  onPress={() => setShowNew((v) => !v)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    color={colors.textMuted}
                    name={showNew ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                  />
                </Pressable>
              </View>
              {newTouched && !isNewValid && newPassword.length > 0 && (
                <Text style={styles.fieldError}>Password must be at least 8 characters.</Text>
              )}
              {newTouched && isNewValid && !isNewDifferent && (
                <Text style={styles.fieldError}>New password must be different from current.</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm new password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  autoCapitalize="none"
                  onBlur={() => setConfirmTouched(true)}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat new password"
                  placeholderTextColor="#9A9A9A"
                  secureTextEntry={!showConfirm}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    confirmTouched && !doPasswordsMatch && confirmPassword.length > 0 && styles.inputError,
                  ]}
                  value={confirmPassword}
                />
                <Pressable
                  hitSlop={8}
                  onPress={() => setShowConfirm((v) => !v)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    color={colors.textMuted}
                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                  />
                </Pressable>
              </View>
              {confirmTouched && !doPasswordsMatch && confirmPassword.length > 0 && (
                <Text style={styles.fieldError}>Passwords do not match.</Text>
              )}
            </View>

            <View style={styles.spacer} />

            <Pressable
              accessibilityRole="button"
              disabled={!canSave}
              onPress={() => void handleSave()}
              style={({ pressed }) => [
                styles.saveButton,
                !canSave && styles.saveButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Change password'}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.backgroundPrimary,
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  form: {
    flex: 1,
    gap: 20,
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: '#1F1F1F',
    fontSize: 16,
    fontWeight: '500',
  },
  passwordRow: {
    position: 'relative',
  },
  input: {
    borderColor: '#747775',
    borderRadius: 18,
    borderWidth: 1.5,
    color: '#1F1F1F',
    fontSize: 16,
    height: 52,
    paddingHorizontal: 15,
  },
  passwordInput: {
    paddingRight: 48,
  },
  inputError: {
    borderColor: '#D64545',
  },
  eyeButton: {
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 48,
  },
  fieldError: {
    color: '#D64545',
    fontSize: 13,
    lineHeight: 17,
    marginLeft: 4,
    marginTop: -2,
  },
  spacer: {
    flex: 1,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 28,
    height: 57,
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#CFCFCF',
  },
  saveButtonText: {
    color: colors.backgroundPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
