import React, { useCallback, useEffect, useState } from 'react';
import {
  type GestureResponderEvent,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TAB_BAR_HEIGHT,
  TAB_BAR_MIN_BOTTOM_OFFSET,
  type TabParamList,
} from '../../navigation/TabNavigator';
import { t, type TranslationKey } from '../../i18n';
import { colors } from '../../theme/colors';
import { homeHeaderMock } from '../../mocks/home';
import { useSession } from '../../session/SessionContext';
import { ChatProgressBar } from './components/ChatProgressBar';

const lumoAvatar = require('../../../assets/images/profile-lumo.png');
const userAvatar = require('../../../assets/images/profile-woman.png');
const travelLumo = require('../../../assets/images/travel-lumo.png');

const TOTAL_STEPS = 4;
const CONTENT_BOTTOM_SPACING = 24;

type ActivityOption = {
  id: string;
  emoji: string;
  labelKey: TranslationKey;
};

const ACTIVITY_OPTIONS: ActivityOption[] = [
  { id: 'walking', emoji: '🚶', labelKey: 'chat.steps.activity.options.walking' },
  { id: 'running', emoji: '🏃', labelKey: 'chat.steps.activity.options.running' },
  { id: 'gardening', emoji: '🌱', labelKey: 'chat.steps.activity.options.gardening' },
  { id: 'cycling', emoji: '🚴', labelKey: 'chat.steps.activity.options.cycling' },
  { id: 'dogWalk', emoji: '🐕', labelKey: 'chat.steps.activity.options.dogWalk' },
  { id: 'outdoorPlans', emoji: '🧺', labelKey: 'chat.steps.activity.options.outdoorPlans' },
];

const DURATION_OPTIONS = [15, 30, 45, 60] as const;

const DAY_OPTIONS = Array.from({ length: 5 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() + index);

  return {
    id: date.toISOString().slice(0, 10),
    label: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : `In ${index} days`,
    date: date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }),
  };
});

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  if (minutes % 60 === 0) return `${minutes / 60} h`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

function DurationSlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [draftValue, setDraftValue] = useState(value);
  const minimum = 15;
  const maximum = 360;
  const progress = (draftValue - minimum) / (maximum - minimum);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  const getValueFromGesture = (event: GestureResponderEvent) => {
    if (trackWidth === 0) return value;
    const ratio = Math.max(0, Math.min(1, event.nativeEvent.locationX / trackWidth));
    const steppedValue = Math.round((minimum + ratio * (maximum - minimum)) / 15) * 15;
    return Math.max(minimum, Math.min(maximum, steppedValue));
  };

  return (
    <View
      accessibilityLabel="Duration"
      accessibilityRole="adjustable"
      accessibilityValue={{ min: minimum, max: maximum, now: value, text: formatDuration(value) }}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      onMoveShouldSetResponder={() => true}
      onResponderMove={(event) => setDraftValue(getValueFromGesture(event))}
      onResponderRelease={(event) => onChange(getValueFromGesture(event))}
      onResponderTerminate={() => setDraftValue(value)}
      onResponderTerminationRequest={() => false}
      onStartShouldSetResponder={() => false}
      style={styles.durationSlider}
    >
      <View style={styles.durationTrack}>
        <View style={[styles.durationTrackFill, { width: `${progress * 100}%` }]} />
        <View style={[styles.durationThumb, { left: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedDayId, setSelectedDayId] = useState(DAY_OPTIONS[1].id);
  const [showSuccess, setShowSuccess] = useState(false);

  const completedSteps = currentStep - 1 + (selectedActivityId ? 1 : 0);
  const progress = completedSteps / TOTAL_STEPS;
  const tabBarClearance = Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_OFFSET) + TAB_BAR_HEIGHT;
  const selectedActivity = ACTIVITY_OPTIONS.find((option) => option.id === selectedActivityId);
  const selectedDay = DAY_OPTIONS.find((option) => option.id === selectedDayId);

  const handleSelectActivity = (id: string) => {
    setSelectedActivityId(id);
  };

  const handleNext = () => setCurrentStep((step) => step + 1);

  const handleBack = () => {
    if (currentStep === 1) {
      navigation.navigate('Home');
      return;
    }

    setCurrentStep((step) => step - 1);
  };

  const handleProgressComplete = useCallback(() => {
    if (currentStep === TOTAL_STEPS) setShowSuccess(true);
  }, [currentStep]);

  if (showSuccess) {
    return (
      <SafeAreaView edges={['top']} style={styles.resultSafe}>
        <View style={[styles.resultContent, { paddingBottom: tabBarClearance + 24 }]}>
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Great timing!</Text>
            <Text style={styles.resultSubtitle}>
              Here’s the best time for{`\n`}your outdoor activity.
            </Text>

            <View style={styles.resultTimeCard}>
              <Ionicons color="#FFBF22" name="sunny" size={44} />
              <View style={styles.resultTimeCopy}>
                <Text style={styles.resultTime}>12:00 – 12:30</Text>
                <Text style={styles.resultDate}>
                  {selectedDay ? `${selectedDay.label}, ${selectedDay.date.replace(',', '')}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.resultMascotCircle}>
              <Image resizeMode="contain" source={travelLumo} style={styles.resultMascot} />
            </View>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.resultPrimaryButton, pressed && styles.nextButtonPressed]}
            >
              <Ionicons color={colors.backgroundPrimary} name="calendar-outline" size={24} />
              <Text style={styles.resultPrimaryButtonText}>Add to calendar</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.resultSecondaryButton, pressed && styles.nextButtonPressed]}
            >
              <Ionicons color={colors.textMuted} name="bookmark-outline" size={22} />
              <Text style={styles.resultSecondaryButtonText}>Save plan</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('chat.header.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('chat.header.subtitle')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          {
            paddingBottom: tabBarClearance
              + CONTENT_BOTTOM_SPACING
              + (currentStep === 1 ? 72 : currentStep <= 3 ? 134 : 0),
          },
        ]}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.progressWrapper}>
          <ChatProgressBar
            animationDuration={currentStep === TOTAL_STEPS ? 650 : undefined}
            onAnimationComplete={handleProgressComplete}
            progress={progress}
          />
        </View>

        {currentStep === 1 ? (
          <>
            <View style={styles.messageRow}>
              <Image source={lumoAvatar} style={styles.lumoAvatar} />
              <View style={styles.bubble}>
                <View style={styles.bubbleTail} />
                <Text style={styles.bubbleText}>
                  {t('chat.steps.activity.question', { firstName: user?.firstName ?? homeHeaderMock.user.firstName })}
                </Text>
              </View>
            </View>

            <View style={styles.optionsGroup}>
              <View style={styles.optionsCard}>
                {ACTIVITY_OPTIONS.map((option) => {
                  const selected = option.id === selectedActivityId;

                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => handleSelectActivity(option.id)}
                      style={({ pressed }) => [
                        styles.option,
                        selected && styles.optionSelected,
                        pressed && styles.optionPressed,
                      ]}
                    >
                      <Text style={styles.optionEmoji}>{option.emoji}</Text>
                      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                        {t(option.labelKey)}
                      </Text>
                    </Pressable>
                  );
                })}

                <View style={styles.optionsCardTail} />
              </View>
              <Image source={userAvatar} style={styles.userAvatar} />
            </View>
          </>
        ) : currentStep === 2 ? (
          <>
            <View style={styles.userMessageRow}>
              <View style={styles.userBubble}>
                <Text style={styles.bubbleText}>
                  {selectedActivity ? `${selectedActivity.emoji} ${t(selectedActivity.labelKey)}` : ''}
                </Text>
                <View style={styles.userBubbleTail} />
              </View>
              <Image source={userAvatar} style={styles.stepAvatar} />
            </View>

            <View style={styles.messageRow}>
              <Image source={lumoAvatar} style={styles.stepAvatar} />
              <View style={styles.stepBubble}>
                <View style={styles.bubbleTail} />
                <Text style={styles.bubbleText}>
                  Great choice! {selectedActivity?.emoji}{'\n'}How long do you plan to be out?
                </Text>
              </View>
            </View>

            <View style={styles.durationCard}>
              <Text style={styles.durationTitle}>Duration</Text>
              <Text style={styles.durationSubtitle}>How long will you be outside?</Text>
              <Text style={styles.durationValue}>{formatDuration(selectedDuration)}</Text>

              <DurationSlider onChange={setSelectedDuration} value={selectedDuration} />
              <View style={styles.durationRangeLabels}>
                <Text style={styles.durationRangeText}>15 min</Text>
                <Text style={styles.durationRangeText}>6 h</Text>
              </View>

              <View style={styles.durationOptions}>
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
                      {duration === 60 ? '1 hour' : `${duration} min`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.messageRow}>
              <Image source={lumoAvatar} style={styles.stepAvatar} />
              <View style={styles.stepBubble}>
                <View style={styles.bubbleTail} />
                <Text style={styles.bubbleText}>When would you want to go?</Text>
              </View>
            </View>

            <View style={styles.dayCard}>
              <Text style={styles.durationTitle}>Choose a day</Text>
              <Text style={styles.durationSubtitle}>
                I will find the best weather window in the next 5 days.
              </Text>

              <View style={styles.dayOptions}>
                {DAY_OPTIONS.map((option) => {
                  const selected = option.id === selectedDayId;

                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setSelectedDayId(option.id)}
                      style={[styles.dayOption, selected && styles.dayOptionSelected]}
                    >
                      <Text style={[styles.dayOptionLabel, selected && styles.dayOptionLabelSelected]}>
                        {option.label}
                      </Text>
                      <Text style={[styles.dayOptionDate, selected && styles.dayOptionDateSelected]}>
                        {option.date}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
              </View>

              <View style={styles.calendarCard}>
                <View style={styles.calendarIntro}>
                  <View style={styles.calendarIcon}>
                    <Ionicons color={colors.homeBackground} name="calendar-outline" size={25} />
                  </View>
                  <View style={styles.calendarCopy}>
                    <Text style={styles.calendarTitle}>Find the time that fits your day</Text>
                    <Text style={styles.calendarDescription}>
                      Connect your calendar and I’ll look for the best weather windows around your plans.
                    </Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.calendarButton, pressed && styles.nextButtonPressed]}
                >
                  <Text style={styles.calendarButtonText}>Connect calendar</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {currentStep <= 3 ? (
        <View style={[styles.stepActions, { bottom: tabBarClearance + 32 }]}>
          {currentStep > 1 ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleBack}
              style={({ pressed }) => [styles.backButton, pressed && styles.nextButtonPressed]}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          ) : null}
          {currentStep <= 3 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: currentStep === 1 && !selectedActivityId }}
              disabled={currentStep === 1 && !selectedActivityId}
              onPress={handleNext}
              style={({ pressed }) => [
                styles.nextButton,
                currentStep === 1 && !selectedActivityId && styles.nextButtonDisabled,
                pressed && styles.nextButtonPressed,
              ]}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === 3 ? 'Calculate' : 'Next'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  resultSafe: {
    backgroundColor: colors.homeBackground,
    flex: 1,
  },
  resultContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  resultCard: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 24,
    elevation: 8,
    paddingBottom: 28,
    paddingHorizontal: 28,
    paddingTop: 36,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  resultTitle: {
    color: '#4A4A4A',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  resultSubtitle: {
    color: '#666666',
    fontSize: 20,
    lineHeight: 25,
    marginTop: 14,
    textAlign: 'center',
  },
  resultTimeCard: {
    alignItems: 'center',
    backgroundColor: '#E9FFF1',
    borderColor: colors.homeBackground,
    borderRadius: 20,
    borderWidth: 1.5,
    elevation: 4,
    flexDirection: 'row',
    marginTop: 28,
    paddingHorizontal: 18,
    paddingVertical: 17,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    width: '100%',
  },
  resultTimeCopy: {
    marginLeft: 18,
  },
  resultTime: {
    color: '#1FCB60',
    fontSize: 24,
    fontWeight: '800',
  },
  resultDate: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  resultMascotCircle: {
    alignItems: 'center',
    backgroundColor: colors.homeBackground,
    borderColor: '#7AEDA2',
    borderRadius: 106,
    borderWidth: 14,
    height: 212,
    justifyContent: 'center',
    marginVertical: 14,
    overflow: 'hidden',
    width: 212,
  },
  resultMascot: {
    height: 172,
    width: 172,
  },
  resultPrimaryButton: {
    alignItems: 'center',
    backgroundColor: colors.homeBackground,
    borderRadius: 23,
    flexDirection: 'row',
    height: 46,
    justifyContent: 'center',
    width: '100%',
  },
  resultPrimaryButtonText: {
    color: colors.backgroundPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
  resultSecondaryButton: {
    alignItems: 'center',
    borderColor: colors.textDisabled,
    borderRadius: 23,
    borderWidth: 2,
    flexDirection: 'row',
    height: 46,
    justifyContent: 'center',
    marginTop: 12,
    width: '100%',
  },
  resultSecondaryButtonText: {
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 6,
  },
  safe: {
    backgroundColor: colors.homeBackground,
    flex: 1,
  },
  scrollView: {
    backgroundColor: colors.homeMetricBackground,
  },
  header: {
    backgroundColor: colors.homeBackground,
    gap: 4,
    paddingBottom: 22,
    paddingHorizontal: 24,
    paddingTop: 22,
  },
  headerTitle: {
    color: colors.backgroundPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: colors.backgroundPrimary,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 26,
  },
  progressWrapper: {
    marginBottom: 25,
  },
  messageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 26,
    paddingHorizontal: 4,
  },
  lumoAvatar: {
    backgroundColor: colors.homeBackground,
    borderColor: colors.homeWarmDark,
    borderRadius: 26,
    borderWidth: 1.5,
    height: 52,
    marginRight: 10,
    width: 52,
  },
  bubble: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 18,
    elevation: 3,
    flexShrink: 1,
    marginLeft: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
  },
  bubbleTail: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 8,
    borderRightColor: colors.backgroundPrimary,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderTopWidth: 8,
    bottom: 14,
    height: 0,
    left: -10,
    position: 'absolute',
    width: 0,
  },
  bubbleText: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
  },
  optionsGroup: {
    position: 'relative',
  },
  optionsCard: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 18,
    elevation: 4,
    gap: 11,
    paddingBottom: 30,
    paddingHorizontal: 13,
    paddingTop: 27,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    marginLeft: 34,
    width: '70.5%',
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderColor: '#9A9A9A',
    borderRadius: 21,
    borderWidth: 1,
    flexDirection: 'row',
    height: 41,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  optionSelected: {
    backgroundColor: colors.conditionGoodBackground,
    borderColor: '#218C4E',
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionEmoji: {
    fontSize: 13,
    marginRight: 4,
  },
  optionLabel: {
    color: '#555555',
    fontSize: 14,
    fontWeight: '400',
  },
  optionLabelSelected: {
    color: '#218C4E',
    fontWeight: '600',
  },
  optionsCardTail: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 12,
    borderLeftColor: colors.backgroundPrimary,
    borderLeftWidth: 18,
    borderTopColor: 'transparent',
    borderTopWidth: 12,
    bottom: 16,
    height: 0,
    position: 'absolute',
    right: -17,
    width: 0,
  },
  userAvatar: {
    backgroundColor: colors.homeBackground,
    borderColor: colors.homeWarmDark,
    borderRadius: 26,
    borderWidth: 1.5,
    bottom: -1,
    height: 52,
    position: 'absolute',
    right: 4,
    width: 52,
  },
  userMessageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  userBubble: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 18,
    elevation: 3,
    marginRight: 18,
    minWidth: '68%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
  },
  userBubbleTail: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 8,
    borderLeftColor: colors.backgroundPrimary,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderTopWidth: 8,
    bottom: 14,
    height: 0,
    position: 'absolute',
    right: -10,
    width: 0,
  },
  stepAvatar: {
    backgroundColor: colors.homeBackground,
    borderColor: colors.homeWarmDark,
    borderRadius: 26,
    borderWidth: 1.5,
    height: 52,
    width: 52,
  },
  stepBubble: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 18,
    elevation: 3,
    flex: 1,
    marginLeft: 18,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
  },
  durationCard: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 18,
    elevation: 4,
    marginHorizontal: 14,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
  },
  durationTitle: {
    color: colors.textSecondary,
    fontSize: 22,
    fontWeight: '700',
  },
  durationSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  durationValue: {
    color: colors.homeBackground,
    fontSize: 36,
    fontWeight: '800',
    marginVertical: 28,
    textAlign: 'center',
  },
  durationSlider: {
    height: 32,
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  durationTrack: {
    backgroundColor: colors.homeMetricBackground,
    borderRadius: 4,
    height: 7,
    position: 'relative',
  },
  durationTrackFill: {
    backgroundColor: colors.homeBackground,
    borderRadius: 4,
    height: 7,
  },
  durationThumb: {
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.homeBackground,
    borderRadius: 8,
    borderWidth: 4,
    height: 16,
    marginLeft: -8,
    position: 'absolute',
    top: -5,
    width: 16,
  },
  durationRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 5,
    marginTop: 7,
  },
  durationRangeText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginTop: 28,
  },
  durationOption: {
    alignItems: 'center',
    borderColor: colors.textDisabled,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    height: 36,
    justifyContent: 'center',
  },
  durationOptionSelected: {
    backgroundColor: colors.conditionGoodBackground,
    borderColor: colors.homeBackground,
  },
  durationOptionText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  durationOptionTextSelected: {
    color: colors.homeBackground,
  },
  dayCard: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 18,
    elevation: 4,
    marginHorizontal: 14,
    paddingBottom: 20,
    paddingHorizontal: 18,
    paddingTop: 18,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
  },
  dayOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 18,
  },
  dayOption: {
    alignItems: 'center',
    borderColor: colors.textDisabled,
    borderRadius: 16,
    borderWidth: 1.5,
    height: 58,
    justifyContent: 'center',
    width: '30%',
  },
  dayOptionSelected: {
    backgroundColor: colors.conditionGoodBackground,
    borderColor: colors.homeBackground,
  },
  dayOptionLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  dayOptionLabelSelected: {
    color: '#218C4E',
  },
  dayOptionDate: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  dayOptionDateSelected: {
    color: '#218C4E',
    fontWeight: '600',
  },
  orRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginVertical: 18,
  },
  orLine: {
    backgroundColor: colors.textDisabled,
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  orText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  calendarCard: {
    backgroundColor: colors.conditionGoodBackground,
    borderColor: colors.homeBackground,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 10,
  },
  calendarIntro: {
    flexDirection: 'row',
  },
  calendarIcon: {
    alignItems: 'center',
    borderColor: colors.homeBackground,
    borderRadius: 21,
    borderWidth: 1.5,
    height: 42,
    justifyContent: 'center',
    marginRight: 10,
    width: 42,
  },
  calendarCopy: {
    flex: 1,
  },
  calendarTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  calendarDescription: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
  },
  calendarButton: {
    alignItems: 'center',
    backgroundColor: colors.homeBackground,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginTop: 12,
  },
  calendarButtonText: {
    color: colors.backgroundPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  nextButton: {
    alignItems: 'center',
    backgroundColor: colors.homeBackground,
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
  },
  stepActions: {
    left: 32,
    position: 'absolute',
    right: 32,
    gap: 10,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderColor: '#9A9A9A',
    borderRadius: 26,
    borderWidth: 1.5,
    height: 52,
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#9A9A9A',
    fontSize: 17,
    fontWeight: '700',
  },
  nextButtonPressed: {
    opacity: 0.8,
  },
  nextButtonDisabled: {
    backgroundColor: colors.textDisabled,
  },
  nextButtonText: {
    color: colors.backgroundPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
});
