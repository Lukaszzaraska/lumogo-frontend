import React, { useEffect, useRef, useState } from 'react';
import { errorMessage } from '../api/client';
import { register } from '../api/auth';
import { useSession } from '../session/SessionContext';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Dropdown from '../components/Dropdown';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Registration'>;

export default function RegistrationScreen({ navigation }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [gender, setGender] = useState<string>();
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { signIn } = useSession();
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
    if (isSubmitting) return;
    Keyboard.dismiss();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Płeć nie jest jeszcze zapisywana w backendzie; nazwisko jest opcjonalne.
      await signIn(await register({ email, firstName, password, passwordConfirm: repeatPassword }));
    } catch (reason) {
      setSubmitError(errorMessage(reason));
      setIsSubmitting(false);
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

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
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
                onBack={handleBack}
                onContinue={showSecurityStep}
                onEmailChange={setEmail}
                onFirstNameChange={setFirstName}
                onGenderChange={setGender}
              />
            </View>
            <View style={[styles.step, step !== 2 && styles.stepHidden]}>
              <SecurityStep
                error={submitError}
                isSubmitting={isSubmitting}
                onBack={handleBack}
                onPasswordChange={setPassword}
                onRegister={completeRegistration}
                onRepeatPasswordChange={setRepeatPassword}
                password={password}
                repeatPassword={repeatPassword}
              />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

type PersonalInfoStepProps = {
  email: string;
  firstName: string;
  gender?: string;
  onBack: () => void;
  onContinue: () => void;
  onEmailChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onGenderChange: (value: string) => void;
};

function PersonalInfoStep({
  email,
  firstName,
  gender,
  onBack,
  onContinue,
  onEmailChange,
  onFirstNameChange,
  onGenderChange,
}: PersonalInfoStepProps) {
  const [emailTouched, setEmailTouched] = useState(false);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFirstNameValid = /^[\p{L}\p{M}][\p{L}\p{M}' -]*$/u.test(firstName.trim())
    && firstName.trim().replace(/[^\p{L}]/gu, '').length >= 2;
  const canContinue = isEmailValid && isFirstNameValid;

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

      <FormActions
        actionDisabled={!canContinue}
        actionLabel="Continue"
        onAction={onContinue}
        onBack={onBack}
      />
    </>
  );
}

type SecurityStepProps = {
  error: string | null;
  isSubmitting: boolean;
  onBack: () => void;
  onPasswordChange: (value: string) => void;
  onRegister: () => void;
  onRepeatPasswordChange: (value: string) => void;
  password: string;
  repeatPassword: string;
};

function SecurityStep({
  error,
  isSubmitting,
  onBack,
  onPasswordChange,
  onRegister,
  onRepeatPasswordChange,
  password,
  repeatPassword,
}: SecurityStepProps) {
  const [passwordInteracted, setPasswordInteracted] = useState(false);
  const [repeatPasswordTouched, setRepeatPasswordTouched] = useState(false);
  const hasMinimumLength = password.length >= 8;
  const hasSpecialCharacter = /[^\p{L}\p{N}\s]/u.test(password);
  const hasBigLetter = /\p{Lu}/u.test(password);
  const isPasswordValid = hasMinimumLength && hasSpecialCharacter && hasBigLetter;
  const canRegister = isPasswordValid && repeatPassword.length > 0 && password === repeatPassword;

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
      </View>

      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.submitError}>
          {error}
        </Text>
      ) : null}

      <FormActions
        actionDisabled={!canRegister || isSubmitting}
        actionLabel="Register"
        isLoading={isSubmitting}
        onAction={onRegister}
        onBack={onBack}
      />
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
  isLoading,
  label,
  onPress,
}: {
  disabled?: boolean;
  isLoading?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: isLoading }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        disabled && styles.actionButtonDisabled,
        pressed && styles.pressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.backgroundPrimary} />
      ) : (
        <Text style={styles.actionButtonText}>{label}</Text>
      )}
    </Pressable>
  );
}

function FormActions({
  actionDisabled,
  actionLabel,
  isLoading,
  onAction,
  onBack,
}: {
  actionDisabled?: boolean;
  actionLabel: string;
  isLoading?: boolean;
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
      <ActionButton disabled={actionDisabled} isLoading={isLoading} label={actionLabel} onPress={onAction} />
    </View>
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
    backgroundColor: colors.accent,
    height: 112,
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
    marginTop: 22,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.accent,
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 28,
    paddingHorizontal: 28,
    paddingTop: 42,
  },
  step: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stepHidden: {
    display: 'none',
  },
  fields: {
    gap: 27,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: '#424242',
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
  submitError: {
    color: '#D64545',
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 12,
    textAlign: 'center',
  },
  fieldError: {
    color: '#D64545',
    fontSize: 13,
    lineHeight: 17,
    marginLeft: 4,
    marginTop: -2,
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
    color: '#5F5F5F',
    fontSize: 17,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
