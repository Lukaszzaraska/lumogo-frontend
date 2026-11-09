import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = {
  message?: string;
  onPress: () => void;
  title?: string;
};

export function LocationBanner({
  message = 'Enable location to get weather and recommendations for your area.',
  onPress,
  title = 'Enable location',
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons color={colors.accent} name="location" size={22} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{message}</Text>
      </View>
      <Pressable
        accessibilityLabel="Enable location"
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Enable</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: '#E8F5EC',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#1F1F1F',
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
