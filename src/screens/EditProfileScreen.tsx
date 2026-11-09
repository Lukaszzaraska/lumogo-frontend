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
import Dropdown from '../components/Dropdown';
import { errorMessage } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/authApi';
import { useToast } from '../contexts/ToastContext';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [gender, setGender] = useState(user?.gender ?? '');
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [firstNameTouched, setFirstNameTouched] = useState(false);

  const isFirstNameValid = /^[\p{L}\p{M}][\p{L}\p{M}' -]*$/u.test(firstName.trim())
    && firstName.trim().replace(/[^\p{L}]/gu, '').length >= 2;

  const hasChanges = firstName.trim() !== (user?.firstName ?? '')
    || gender !== (user?.gender ?? '');

  const handleSave = async () => {
    if (!isFirstNameValid || !user || saving) return;
    setSaving(true);
    try {
      // Pusty tekst usuwa płeć po stronie serwera.
      const updated = await authApi.updateProfile({ firstName: firstName.trim(), gender: gender || '-' });
      await updateUser(updated);
      showToast('Profile updated successfully.', 'success');
      navigation.goBack();
    } catch (error) {
      showToast(errorMessage(error), 'error');
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
            <Text style={styles.headerTitle}>Edit profile</Text>
            <View style={styles.backButton} />
          </View>

          <View style={[styles.form, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                editable={false}
                style={[styles.input, styles.inputDisabled]}
                value={user?.email ?? ''}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>First Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                autoCapitalize="words"
                onBlur={() => { setFirstNameFocused(false); setFirstNameTouched(true); }}
                onChangeText={setFirstName}
                onFocus={() => setFirstNameFocused(true)}
                placeholder="Your name"
                placeholderTextColor="#9A9A9A"
                style={[
                  styles.input,
                  firstNameFocused && styles.inputFocused,
                  firstNameTouched && !isFirstNameValid && firstName.length > 0 && styles.inputError,
                ]}
                value={firstName}
              />
              {firstNameTouched && !isFirstNameValid && firstName.length > 0 && (
                <Text style={styles.fieldError}>Enter at least 2 letters without numbers.</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Gender</Text>
              <Dropdown
                onChange={setGender}
                options={['Woman', 'Man', 'Other']}
                placeholder="Select gender"
                value={gender || undefined}
              />
            </View>

            <View style={styles.spacer} />

            <Pressable
              accessibilityRole="button"
              disabled={!hasChanges || !isFirstNameValid || saving}
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveButton,
                (!hasChanges || !isFirstNameValid) && styles.saveButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.saveButtonText}>Save changes</Text>
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
  required: {
    color: '#D64545',
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
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    color: '#6B7280',
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
