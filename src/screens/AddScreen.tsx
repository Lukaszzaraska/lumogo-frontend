import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT, TAB_BAR_MIN_BOTTOM_OFFSET } from '../navigation/TabNavigator';
import { colors } from '../theme/colors';

const lumoImage = require('../../assets/icons/lumo-success.png');

const activities = [
  { emoji: '🚶', id: 'walking', label: 'Walking' },
  { emoji: '🏃', id: 'running', label: 'Running' },
  { emoji: '🚴', id: 'cycling', label: 'Cycling' },
  { emoji: '🌱', id: 'gardening', label: 'Gardening' },
  { emoji: '🐕', id: 'dogWalk', label: 'Dog walk' },
  { emoji: '✨', id: 'other', label: 'Other' },
] as const;

const durations = [15, 30, 45, 60] as const;
const days = ['Today', 'Yesterday'] as const;
const moods = [
  { emoji: '🤩', id: 'great', label: 'Great' },
  { emoji: '🙂', id: 'good', label: 'Good' },
  { emoji: '😌', id: 'okay', label: 'Okay' },
] as const;

export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const [activityId, setActivityId] = useState<string | null>(null);
  const [day, setDay] = useState<(typeof days)[number]>('Today');
  const [duration, setDuration] = useState<number>(30);
  const [moodId, setMoodId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const tabBarClearance = Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_OFFSET) + TAB_BAR_HEIGHT;
  const selectedActivity = activities.find((activity) => activity.id === activityId);

  const resetForm = () => {
    setActivityId(null);
    setDay('Today');
    setDuration(30);
    setMoodId(null);
    setSaved(false);
  };

  if (saved && selectedActivity) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView
          contentContainerStyle={[styles.successContent, { paddingBottom: tabBarClearance + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successCard}>
            <View style={styles.successBadge}>
              <Ionicons color={colors.backgroundPrimary} name="checkmark" size={30} />
            </View>
            <Text style={styles.successTitle}>Activity logged!</Text>
            <Text style={styles.successSubtitle}>Nice work getting outside.</Text>

            <View style={styles.successSummary}>
              <Text style={styles.successEmoji}>{selectedActivity.emoji}</Text>
              <View style={styles.successCopy}>
                <Text style={styles.successActivity}>{selectedActivity.label}</Text>
                <Text style={styles.successDetails}>{duration} minutes · {day}</Text>
              </View>
            </View>

            <View style={styles.lumoCircle}>
              <Image resizeMode="contain" source={lumoImage} style={styles.lumoImage} />
            </View>
            <Text style={styles.encouragement}>Every active day brings you closer to your next streak.</Text>

            <Pressable
              accessibilityRole="button"
              onPress={resetForm}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Ionicons color={colors.primaryDefault} name="add" size={21} />
              <Text style={styles.secondaryButtonText}>Log another activity</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Log activity</Text>
        <Text style={styles.subtitle}>What did you do outside?</Text>

        <Text style={styles.sectionTitle}>Activity</Text>
        <View style={styles.activityGrid}>
          {activities.map((activity) => {
            const selected = activity.id === activityId;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={activity.id}
                onPress={() => setActivityId(activity.id)}
                style={({ pressed }) => [styles.activityCard, selected && styles.activityCardSelected, pressed && styles.pressed]}
              >
                <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                <Text style={[styles.activityLabel, selected && styles.selectedText]}>{activity.label}</Text>
                {selected ? <Ionicons color={colors.homeBackground} name="checkmark-circle" size={19} style={styles.activityCheck} /> : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>When?</Text>
        <View style={styles.segmentedControl}>
          {days.map((option) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: day === option }}
              key={option}
              onPress={() => setDay(option)}
              style={[styles.segment, day === option && styles.segmentSelected]}
            >
              <Text style={[styles.segmentText, day === option && styles.segmentTextSelected]}>{option}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Duration</Text>
        <View style={styles.choiceRow}>
          {durations.map((option) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: duration === option }}
              key={option}
              onPress={() => setDuration(option)}
              style={[styles.choice, duration === option && styles.choiceSelected]}
            >
              <Text style={[styles.choiceValue, duration === option && styles.selectedText]}>{option}</Text>
              <Text style={[styles.choiceUnit, duration === option && styles.selectedText]}>min</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.optionalHeading}>
          <Text style={styles.sectionTitle}>How did it feel?</Text>
          <Text style={styles.optional}>Optional</Text>
        </View>
        <View style={styles.moodRow}>
          {moods.map((mood) => {
            const selected = mood.id === moodId;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={mood.id}
                onPress={() => setMoodId(selected ? null : mood.id)}
                style={[styles.mood, selected && styles.moodSelected]}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[styles.moodLabel, selected && styles.selectedText]}>{mood.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !activityId }}
          disabled={!activityId}
          onPress={() => setSaved(true)}
          style={({ pressed }) => [styles.logButton, !activityId && styles.logButtonDisabled, pressed && styles.pressed]}
        >
          <Ionicons color={activityId ? colors.backgroundPrimary : colors.secondaryDefault} name="checkmark" size={22} />
          <Text style={[styles.logButtonText, !activityId && styles.logButtonTextDisabled]}>Log activity</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.backgroundPrimary, flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 18 },
  title: { color: colors.textPrimary, fontSize: 30, fontWeight: '800', lineHeight: 36 },
  subtitle: { color: colors.textMuted, fontSize: 15, marginTop: 3 },
  sectionTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: 10, marginTop: 22 },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  activityCard: { alignItems: 'center', backgroundColor: colors.homeMetricBackground, borderColor: 'transparent', borderRadius: 22, borderWidth: 1.5, flexDirection: 'row', height: 62, paddingHorizontal: 14, position: 'relative', width: '48.5%' },
  activityCardSelected: { backgroundColor: colors.conditionGoodBackground, borderColor: colors.homeBackground },
  activityEmoji: { fontSize: 22, marginRight: 8 },
  activityLabel: { color: colors.textMuted, flexShrink: 1, fontSize: 13, fontWeight: '700' },
  activityCheck: { position: 'absolute', right: 6, top: 6 },
  selectedText: { color: colors.primaryDefault, fontWeight: '800' },
  segmentedControl: { backgroundColor: colors.homeMetricBackground, borderRadius: 23, flexDirection: 'row', padding: 4 },
  segment: { alignItems: 'center', borderRadius: 19, flex: 1, height: 40, justifyContent: 'center' },
  segmentSelected: { backgroundColor: colors.backgroundPrimary, elevation: 2, shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  segmentText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  segmentTextSelected: { color: colors.primaryDefault },
  choiceRow: { flexDirection: 'row', gap: 8 },
  choice: { alignItems: 'center', backgroundColor: colors.homeMetricBackground, borderColor: 'transparent', borderRadius: 20, borderWidth: 1, flex: 1, height: 62, justifyContent: 'center' },
  choiceSelected: { backgroundColor: colors.conditionGoodBackground, borderColor: colors.homeBackground },
  choiceValue: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  choiceUnit: { color: colors.textMuted, fontSize: 10, marginTop: 1 },
  optionalHeading: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between' },
  optional: { color: colors.textDisabled, fontSize: 11 },
  moodRow: { flexDirection: 'row', gap: 10 },
  mood: { alignItems: 'center', backgroundColor: colors.homeMetricBackground, borderColor: 'transparent', borderRadius: 20, borderWidth: 1, flex: 1, paddingVertical: 12 },
  moodSelected: { backgroundColor: colors.conditionGoodBackground, borderColor: colors.conditionGoodBorder },
  moodEmoji: { fontSize: 24 },
  moodLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700', marginTop: 4 },
  logButton: { alignItems: 'center', backgroundColor: colors.homeBackground, borderRadius: 28, flexDirection: 'row', height: 56, justifyContent: 'center', marginTop: 26 },
  logButtonDisabled: { backgroundColor: colors.homeMetricBackground },
  logButtonText: { color: colors.backgroundPrimary, fontSize: 17, fontWeight: '800', marginLeft: 7 },
  logButtonTextDisabled: { color: colors.secondaryDefault },
  pressed: { opacity: 0.72 },
  successContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingTop: 20 },
  successCard: { alignItems: 'center', backgroundColor: colors.backgroundPrimary, borderColor: colors.conditionGoodBorder, borderRadius: 28, borderWidth: 1, elevation: 4, padding: 24, shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 6 },
  successBadge: { alignItems: 'center', backgroundColor: colors.homeBackground, borderRadius: 27, height: 54, justifyContent: 'center', width: 54 },
  successTitle: { color: colors.textPrimary, fontSize: 28, fontWeight: '800', marginTop: 16 },
  successSubtitle: { color: colors.textMuted, fontSize: 15, marginTop: 5 },
  successSummary: { alignItems: 'center', backgroundColor: colors.conditionGoodBackground, borderRadius: 22, flexDirection: 'row', marginTop: 22, padding: 16, width: '100%' },
  successEmoji: { fontSize: 34 },
  successCopy: { marginLeft: 14 },
  successActivity: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  successDetails: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  lumoCircle: { alignItems: 'center', backgroundColor: colors.homeBackground, borderColor: colors.conditionGoodBorder, borderRadius: 72, borderWidth: 7, height: 144, justifyContent: 'center', marginTop: 22, overflow: 'hidden', width: 144 },
  lumoImage: { height: 132, marginTop: 10, width: 132 },
  encouragement: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginTop: 15, textAlign: 'center' },
  secondaryButton: { alignItems: 'center', borderColor: colors.conditionGoodBorder, borderRadius: 26, borderWidth: 1.5, flexDirection: 'row', height: 52, justifyContent: 'center', marginTop: 22, width: '100%' },
  secondaryButtonText: { color: colors.primaryDefault, fontSize: 15, fontWeight: '800', marginLeft: 6 },
});
