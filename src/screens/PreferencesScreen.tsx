import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePreferences } from '../contexts/PreferencesContext';
import { useToast } from '../contexts/ToastContext';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Preferences'>;

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120] as const;

const ACTIVITY_OPTIONS = [
  { id: 'walking', emoji: '🚶', label: 'Walking' },
  { id: 'running', emoji: '🏃', label: 'Running' },
  { id: 'gardening', emoji: '🌱', label: 'Gardening' },
  { id: 'cycling', emoji: '🚴', label: 'Cycling' },
  { id: 'dogWalk', emoji: '🐕', label: 'Dog walk' },
  { id: 'outdoorPlans', emoji: '🧺', label: 'Outdoor plans' },
] as const;

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  if (minutes % 60 === 0) return `${minutes / 60} h`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export default function PreferencesScreen({ navigation }: Props) {
  const { defaultDuration, favoriteActivities, save } = usePreferences();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const [selectedDuration, setSelectedDuration] = useState(defaultDuration);
  const [selectedActivities, setSelectedActivities] = useState<string[]>(favoriteActivities);
  const [saving, setSaving] = useState(false);

  const hasChanges = selectedDuration !== defaultDuration
    || selectedActivities.sort().join(',') !== [...favoriteActivities].sort().join(',');

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await save(selectedDuration, selectedActivities);
      showToast('Preferences saved.', 'success');
      navigation.goBack();
    } catch {
      showToast('Failed to save preferences.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
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
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Default activity time</Text>
        <Text style={styles.sectionDescription}>
          Choose your preferred default duration for outdoor activities.
        </Text>

        <Text style={styles.durationValue}>{formatDuration(selectedDuration)}</Text>

        <View style={styles.durationGrid}>
          {DURATION_OPTIONS.map((duration) => (
            <Pressable
              key={duration}
              onPress={() => setSelectedDuration(duration)}
              style={[
                styles.durationOption,
                selectedDuration === duration && styles.durationOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.durationOptionText,
                  selectedDuration === duration && styles.durationOptionTextSelected,
                ]}
              >
                {formatDuration(duration)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Favorite activities</Text>
        <Text style={styles.sectionDescription}>
          Select activities you enjoy the most. These will be suggested first when planning.
        </Text>

        <View style={styles.activityGrid}>
          {ACTIVITY_OPTIONS.map((activity) => {
            const selected = selectedActivities.includes(activity.id);
            return (
              <Pressable
                key={activity.id}
                onPress={() => toggleActivity(activity.id)}
                style={[
                  styles.activityOption,
                  selected && styles.activityOptionSelected,
                ]}
              >
                <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                <Text
                  style={[
                    styles.activityLabel,
                    selected && styles.activityLabelSelected,
                  ]}
                >
                  {activity.label}
                </Text>
                {selected && (
                  <View style={styles.checkBadge}>
                    <Ionicons color={colors.backgroundPrimary} name="checkmark" size={14} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.saveWrapper, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityRole="button"
          disabled={!hasChanges || saving}
          onPress={() => void handleSave()}
          style={({ pressed }) => [
            styles.saveButton,
            (!hasChanges || saving) && styles.saveButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save preferences'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.backgroundPrimary,
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
  content: {
    paddingBottom: 40,
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  durationValue: {
    color: colors.accent,
    fontSize: 36,
    fontWeight: '800',
    marginTop: 20,
    textAlign: 'center',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 20,
  },
  durationOption: {
    alignItems: 'center',
    borderColor: colors.textDisabled,
    borderRadius: 20,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    minWidth: '28%',
    paddingHorizontal: 16,
  },
  durationOptionSelected: {
    backgroundColor: colors.conditionGoodBackground,
    borderColor: colors.accent,
  },
  durationOptionText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  durationOptionTextSelected: {
    color: colors.primaryDefault,
    fontWeight: '700',
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  activityOption: {
    alignItems: 'center',
    borderColor: colors.conditionCardBorder,
    borderRadius: 20,
    borderWidth: 1,
    flexBasis: '47%',
    flexDirection: 'row',
    flexGrow: 1,
    height: 52,
    maxWidth: '48%',
    paddingHorizontal: 14,
  },
  activityOptionSelected: {
    backgroundColor: colors.conditionGoodBackground,
    borderColor: colors.accent,
  },
  activityEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  activityLabel: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  activityLabelSelected: {
    color: colors.primaryDefault,
    fontWeight: '700',
  },
  checkBadge: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  saveWrapper: {
    backgroundColor: colors.backgroundPrimary,
    borderTopColor: colors.homeMetricBackground,
    borderTopWidth: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
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
