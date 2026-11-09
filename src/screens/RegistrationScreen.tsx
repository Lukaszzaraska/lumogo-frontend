import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Animated,
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
import type { RootStackParamList } from '../navigation/AppNavigator';
import Dropdown from '../components/Dropdown';
import { errorMessage } from '../api/client';
import { authApi } from '../services/authApi';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Registration'>;

export default function RegistrationScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [gender, setGender] = useState<string>();
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [registrationError, setRegistrationError] = useState<string>();
  const [isRegistering, setIsRegistering] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 0.5,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const showSecurityStep = () => {
    if (step === 2) return;

    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      setStep(2);
      contentOffset.setValue(18);

      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentOffset, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const completeRegistration = async () => {
    if (isRegistering) return;

    Keyboard.dismiss();
    setIsRegistering(true);
    setRegistrationError(undefined);

    try {
      const result = await authApi.register({
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        gender: gender ?? '-',
        password,
      });
      await signIn(result);
    } catch (error) {
      setRegistrationError(
        errorMessage(error),
      );
      setIsRegistering(false);
      return;
    }

    Animated.timing(progress, {
      toValue: 1,
      duration: 650,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) navigation.replace('RegistrationSuccess');
    });
  };

  const handleBack = () => {
    if (step === 1) {
      navigation.goBack();
      return;
    }

    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      setStep(1);
      contentOffset.setValue(-18);

      Animated.parallel([
        Animated.timing(progress, {
          toValue: 0.5,
          duration: 520,
          useNativeDriver: false,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentOffset, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const canContinue = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    && /^[\p{L}\p{M}][\p{L}\p{M}' -]*$/u.test(firstName.trim())
    && firstName.trim().replace(/[^\p{L}]/gu, '').length >= 2;
  const canRegister = password.length >= 8
    && /[^\p{L}\p{N}\s]/u.test(password)
    && /\p{Lu}/u.test(password)
    && repeatPassword.length > 0
    && password === repeatPassword;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.screen}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{step === 1 ? 'Personal info' : 'Security'}</Text>
          </View>

          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>

          <Animated.View
            style={[
              styles.content,
              {
                opacity: contentOpacity,
                transform: [{ translateX: contentOffset }],
              },
            ]}
          >
            <View style={[styles.step, step !== 1 && styles.stepHidden]}>
              <PersonalInfoStep
                email={email}
                firstName={firstName}
                gender={gender}
                onEmailChange={setEmail}
                onFirstNameChange={setFirstName}
                onGenderChange={setGender}
              />
            </View>
            <View style={[styles.step, step !== 2 && styles.stepHidden]}>
              <SecurityStep
                error={registrationError}
                onPasswordChange={setPassword}
                onRepeatPasswordChange={setRepeatPassword}
                password={password}
                repeatPassword={repeatPassword}
              />
            </View>
          </Animated.View>

          <View style={[styles.actionDock, { paddingBottom: insets.bottom + 12 }]}>
            <FormActions
              actionDisabled={step === 1 ? !canContinue : !canRegister || isRegistering}
              actionLabel={step === 1 ? 'Continue' : isRegistering ? 'Registering...' : 'Register'}
              onAction={step === 1 ? showSecurityStep : completeRegistration}
              onBack={handleBack}
            />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

type PersonalInfoStepProps = {
  email: string;
  firstName: string;
  gender?: string;
  onEmailChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onGenderChange: (value: string) => void;
};

function PersonalInfoStep({
  email,
  firstName,
  gender,
  onEmailChange,
  onFirstNameChange,
  onGenderChange,
}: PersonalInfoStepProps) {
  const [emailTouched, setEmailTouched] = useState(false);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFirstNameValid = /^[\p{L}\p{M}][\p{L}\p{M}' -]*$/u.test(firstName.trim())
    && firstName.trim().replace(/[^\p{L}]/gu, '').length >= 2;

  return (
    <>
      <View style={styles.fields}>
        <Field
          keyboardType="email-address"
          label="Email"
          error={emailTouched && !isEmailValid ? 'Enter a valid email address.' : undefined}
          onBlur={() => setEmailTouched(true)}
          onChangeText={onEmailChange}
          placeholder="you@example.com"
          required
          value={email}
        />
        <Field
          label="First Name"
          error={firstNameTouched && !isFirstNameValid ? 'Enter at least 2 letters without numbers.' : undefined}
          onBlur={() => setFirstNameTouched(true)}
          onChangeText={onFirstNameChange}
          placeholder="Your name"
          required
          value={firstName}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Gender</Text>
          <Dropdown
            onChange={onGenderChange}
            options={['Woman', 'Man', 'Other']}
            placeholder="Select gender"
            value={gender}
          />
        </View>
      </View>
    </>
  );
}

type SecurityStepProps = {
  error?: string;
  onPasswordChange: (value: string) => void;
  onRepeatPasswordChange: (value: string) => void;
  password: string;
  repeatPassword: string;
};

function SecurityStep({
  error,
  onPasswordChange,
  onRepeatPasswordChange,
  password,
  repeatPassword,
}: SecurityStepProps) {
  const [passwordInteracted, setPasswordInteracted] = useState(false);
  const [repeatPasswordTouched, setRepeatPasswordTouched] = useState(false);
  const hasMinimumLength = password.length >= 8;
  const hasSpecialCharacter = /[^\p{L}\p{N}\s]/u.test(password);
  const hasBigLetter = /\p{Lu}/u.test(password);

  return (
    <>
      <View style={styles.fields}>
        <Field
          label="Password"
          onChangeText={onPasswordChange}
          onFocus={() => setPasswordInteracted(true)}
          placeholder="Password"
          required
          secureTextEntry
          value={password}
        />

        <View style={styles.requirements}>
          <Requirement active={passwordInteracted} label="Minimum 8 characters" met={hasMinimumLength} />
          <Requirement active={passwordInteracted} label="One special character" met={hasSpecialCharacter} />
          <Requirement active={passwordInteracted} label="One big letter" met={hasBigLetter} />
        </View>

        <Field
          error={
            repeatPasswordTouched && repeatPassword.length > 0 && password !== repeatPassword
              ? 'Passwords do not match.'
              : undefined
          }
          label="Repeat password"
          onBlur={() => setRepeatPasswordTouched(true)}
          onChangeText={onRepeatPasswordChange}
          placeholder="Repeat password"
          required
          secureTextEntry
          value={repeatPassword}
        />

        {error && <Text accessibilityRole="alert" style={styles.formError}>{error}</Text>}
      </View>
    </>
  );
}

type FieldProps = {
  error?: string;
  keyboardType?: 'default' | 'email-address';
  label: string;
  onBlur?: () => void;
  onChangeText: (value: string) => void;
  onFocus?: () => void;
  placeholder: string;
  required?: boolean;
  secureTextEntry?: boolean;
  value: string;
};

function Field({
  error,
  keyboardType = 'default',
  label,
  onBlur,
  onChangeText,
  onFocus,
  placeholder,
  required,
  secureTextEntry,
  value,
}: FieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.requiredMark}> *</Text>}
      </Text>
      <View style={styles.inputWrapper}>
        <TextInput
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          placeholder={placeholder}
          placeholderTextColor="#9A9A9A"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          style={[
            styles.input,
            secureTextEntry && styles.inputWithIcon,
            isFocused && styles.inputFocused,
          ]}
          value={value}
        />
        {secureTextEntry && (
          <Pressable
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setIsPasswordVisible((current) => !current)}
            style={({ pressed }) => [styles.passwordVisibilityButton, pressed && styles.pressed]}
          >
            <Ionicons
              color="#747775"
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={23}
            />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

function Requirement({ active, label, met }: { active: boolean; label: string; met: boolean }) {
  const stateStyle = !active
    ? styles.requirementNeutral
    : met
      ? styles.requirementMet
      : styles.requirementMissing;

  return (
    <View style={styles.requirementRow}>
      <View style={[styles.requirementCircle, stateStyle, met && active && styles.requirementCircleMet]}>
        {met && active && <Ionicons color="#FFFFFF" name="checkmark" size={10} />}
      </View>
      <Text style={[styles.requirementText, stateStyle]}>{label}</Text>
    </View>
  );
}

function ActionButton({
  disabled,
  label,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        disabled && styles.actionButtonDisabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

function FormActions({
  actionDisabled,
  actionLabel,
  onAction,
  onBack,
}: {
  actionDisabled?: boolean;
  actionLabel: string;
  onAction: () => void;
  onBack: () => void;
}) {
  return (
    <View style={styles.formActions}>
      <Pressable
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [styles.backActionButton, pressed && styles.pressed]}
      >
        <Text style={styles.backActionButtonText}>Back</Text>
      </Pressable>
      <ActionButton disabled={actionDisabled} label={actionLabel} onPress={onAction} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.accent,
    flex: 1,
  },
  screen: {
    backgroundColor: colors.backgroundPrimary,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    height: 96,
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.backgroundPrimary,
    fontSize: 30,
    fontWeight: '800',
  },
  progressTrack: {
    backgroundColor: '#E7E7E7',
    height: 4,
    marginHorizontal: 12,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.accent,
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
  },
  step: {
    flex: 1,
  },
  stepHidden: {
    display: 'none',
  },
  fields: {
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: '#1F1F1F',
    fontSize: 16,
    fontWeight: '500',
  },
  requiredMark: {
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
  inputWrapper: {
    position: 'relative',
  },
  inputWithIcon: {
    paddingRight: 49,
  },
  passwordVisibilityButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: 7,
    top: 4,
    width: 42,
  },
  inputFocused: {
    borderColor: colors.accent,
  },
  fieldError: {
    color: '#D64545',
    fontSize: 13,
    lineHeight: 17,
    marginLeft: 4,
    marginTop: -2,
  },
  formError: {
    color: '#D64545',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  requirements: {
    gap: 8,
    marginTop: -17,
  },
  requirementRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  requirementCircle: {
    alignItems: 'center',
    borderColor: '#747775',
    borderRadius: 6,
    borderWidth: 1,
    height: 12,
    justifyContent: 'center',
    width: 12,
  },
  requirementText: {
    color: '#858585',
    fontSize: 13,
  },
  requirementNeutral: {
    borderColor: '#858585',
    color: '#858585',
  },
  requirementMissing: {
    borderColor: '#D64545',
    color: '#D64545',
  },
  requirementMet: {
    borderColor: '#35B967',
    color: '#35B967',
  },
  requirementCircleMet: {
    backgroundColor: '#35B967',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 27,
    height: 56,
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#CFCFCF',
  },
  actionButtonText: {
    color: colors.backgroundPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  formActions: {
    gap: 12,
  },
  actionDock: {
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  backActionButton: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderColor: '#747775',
    borderRadius: 27,
    borderWidth: 1.5,
    height: 56,
    justifyContent: 'center',
  },
  backActionButtonText: {
    color: '#2A2A2A',
    fontSize: 17,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
