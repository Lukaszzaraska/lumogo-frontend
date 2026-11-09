import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../i18n';
import { colors } from '../../../theme/colors';

type HomePlannerCardProps = { onPress: () => void };

export function HomePlannerCard({ onPress }: HomePlannerCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('home.planner.title')}</Text>
      <Text style={styles.description}>{t('home.planner.description')}</Text>
      <Pressable
        accessibilityLabel={t('home.planner.buttonAccessibilityLabel')}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>{t('home.planner.button')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 28,
    elevation: 5,
    marginHorizontal: 20,
    marginTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 18,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },
  title: { color: colors.textPrimary, fontSize: 21, fontWeight: '600', lineHeight: 27 },
  description: { color: colors.textMuted, fontSize: 16, lineHeight: 21, marginTop: 6 },
  button: {
    alignItems: 'center', backgroundColor: colors.homeBackground, borderRadius: 28,
    justifyContent: 'center', marginTop: 14, minHeight: 48, paddingHorizontal: 16,
  },
  buttonPressed: { opacity: 0.78 },
  buttonText: {
    color: colors.backgroundPrimary, fontSize: 21, fontWeight: '700', lineHeight: 26, textAlign: 'center',
  },
});
