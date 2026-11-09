import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  PanResponder,
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
import { ChatProgressBar } from './components/ChatProgressBar';
import { useAuth } from '../../contexts/AuthContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import { useToast } from '../../contexts/ToastContext';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
import { calendarApi } from '../../services/calendarApi';
import { plansApi } from '../../services/plansApi';
import { ApiError, errorMessage } from '../../api/client';
import { CALENDAR_ENABLED } from '../../api/config';
import { getBestWindow } from '../../api/planner';
import { getApproxLocation } from '../../location/approxLocation';
import { findAvailableWindow, type AvailableWindow } from '../../utils/calendarAvailability';

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

  // Data lokalna (toISOString dawałby dzień w UTC, czyli po północy wczorajszy).
  const id = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  return {
    id,
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

function formatEndTime(startHour: number, startMinute: number, durationMinutes: number) {
  const totalMinutes = startHour * 60 + startMinute + durationMinutes;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatClock(date: Date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function DurationSlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const minimum = 15;
  const maximum = 360;
  const valueToRatio = (nextValue: number) =>
    Math.max(0, Math.min(1, (nextValue - minimum) / (maximum - minimum)));
  const [dragRatio, setDragRatio] = useState(() => valueToRatio(value));
  const dragRatioRef = useRef(dragRatio);
  const gestureStartRatioRef = useRef(dragRatio);
  const trackWidthRef = useRef(trackWidth);
  const trackWindowXRef = useRef<number | null>(null);
  const sliderRef = useRef<View>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    const nextRatio = valueToRatio(value);
    dragRatioRef.current = nextRatio;
    setDragRatio(nextRatio);
  }, [value]);

  useEffect(() => {
    trackWidthRef.current = trackWidth;
  }, [trackWidth]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const updateRatio = (nextRatio: number) => {
    if (!Number.isFinite(nextRatio)) return;

    const clampedRatio = Math.max(0, Math.min(1, nextRatio));
    dragRatioRef.current = clampedRatio;
    setDragRatio(clampedRatio);
  };

  const commitRatio = (ratio: number) => {
    if (!Number.isFinite(ratio)) return;

    const steppedValue = Math.round((minimum + ratio * (maximum - minimum)) / 15) * 15;
    onChangeRef.current(Math.max(minimum, Math.min(maximum, steppedValue)));
  };

  const handleSliderLayout = (width: number) => {
    setTrackWidth(width);
    sliderRef.current?.measureInWindow((x) => {
      if (Number.isFinite(x)) trackWindowXRef.current = x;
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gestureState) => {
          const width = trackWidthRef.current;
          const trackWindowX = trackWindowXRef.current;
          const initialRatio = width > 0 && trackWindowX !== null && Number.isFinite(gestureState.x0)
            ? (gestureState.x0 - trackWindowX) / width
            : dragRatioRef.current;

          updateRatio(initialRatio);
          gestureStartRatioRef.current = Math.max(0, Math.min(1, initialRatio));
        },
        onPanResponderMove: (_, gestureState) => {
          const width = trackWidthRef.current;
          if (width <= 0 || !Number.isFinite(gestureState.dx)) return;

          updateRatio(gestureStartRatioRef.current + gestureState.dx / width);
        },
        onPanResponderRelease: () => commitRatio(dragRatioRef.current),
        onPanResponderTerminate: () => {
          const currentRatio = valueToRatio(value);
          updateRatio(currentRatio);
        },
        onPanResponderTerminationRequest: () => false,
        onStartShouldSetPanResponder: () => true,
      }),
    [value],
  );

  const handleAccessibilityAction = (actionName: string) => {
    if (actionName === 'increment') onChange(Math.min(maximum, value + 15));
    if (actionName === 'decrement') onChange(Math.max(minimum, value - 15));
  };

  return (
    <View
      ref={sliderRef}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      accessibilityLabel="Duration"
      accessibilityRole="adjustable"
      accessibilityValue={{ min: minimum, max: maximum, now: value, text: formatDuration(value) }}
      onLayout={(event) => handleSliderLayout(event.nativeEvent.layout.width)}
      onAccessibilityAction={(event) => handleAccessibilityAction(event.nativeEvent.actionName)}
      style={styles.durationSlider}
      {...panResponder.panHandlers}
    >
      <View style={styles.durationTrack}>
        <View style={[styles.durationTrackFill, { width: `${dragRatio * 100}%` }]} />
        <View style={[styles.durationThumb, { left: `${dragRatio * 100}%` }]} />
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { defaultDuration, favoriteActivities, loaded: prefsLoaded } = usePreferences();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(defaultDuration);
  const [prefsApplied, setPrefsApplied] = useState(false);

  useEffect(() => {
    if (prefsLoaded && !prefsApplied) {
      setSelectedDuration(defaultDuration);
      setPrefsApplied(true);
    }
  }, [prefsLoaded, defaultDuration, prefsApplied]);
  const [selectedDayId, setSelectedDayId] = useState(DAY_OPTIONS[1].id);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recommendedWindow, setRecommendedWindow] = useState<AvailableWindow | null>(null);
  const [calendarCalculationError, setCalendarCalculationError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const googleCalendar = useGoogleCalendar();

  const sortedActivities = [...ACTIVITY_OPTIONS].sort((a, b) => {
    const aFav = favoriteActivities.includes(a.id) ? 0 : 1;
    const bFav = favoriteActivities.includes(b.id) ? 0 : 1;
    return aFav - bFav;
  });

  const completedSteps = currentStep - 1 + (selectedActivityId ? 1 : 0);
  const progress = completedSteps / TOTAL_STEPS;
  const tabBarClearance = Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_OFFSET) + TAB_BAR_HEIGHT;
  const selectedActivity = ACTIVITY_OPTIONS.find((option) => option.id === selectedActivityId);
  const selectedDay = DAY_OPTIONS.find((option) => option.id === selectedDayId);

  const handleSelectActivity = (id: string) => {
    setSelectedActivityId(id);
  };

  const handleCalculate = async () => {
    setCalendarCalculationError(null);

    if (!googleCalendar.connected) {
      // Bez kalendarza: najlepsze okno według prognozy pogody (backend: /api/conditions/best-window).
      setCalculating(true);
      try {
        const location = await getApproxLocation();
        const window = await getBestWindow({
          latitude: location.latitude,
          longitude: location.longitude,
          date: selectedDayId,
          durationMinutes: selectedDuration,
        });
        setRecommendedWindow({
          start: new Date(`${selectedDayId}T${window.start}:00`),
          end: new Date(`${selectedDayId}T${window.end}:00`),
        });
        setCurrentStep((step) => step + 1);
      } catch (error) {
        setCalendarCalculationError(
          error instanceof ApiError && error.status === 422 ? t('planner.noWindow') : errorMessage(error),
        );
      } finally {
        setCalculating(false);
      }
      return;
    }

    setCalculating(true);
    try {
      const timeMin = new Date(`${selectedDayId}T00:00:00`);
      const timeMax = new Date(timeMin);
      timeMax.setDate(timeMax.getDate() + 1);
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const busyPeriods = await calendarApi.getBusyPeriods(timeMin, timeMax, timeZone);
      const availableWindow = findAvailableWindow(selectedDayId, selectedDuration, busyPeriods);

      if (!availableWindow) {
        setCalendarCalculationError('No free window fits this day. Choose another day or a shorter duration.');
        return;
      }

      setRecommendedWindow(availableWindow);
      setCurrentStep((step) => step + 1);
    } catch (calculationError) {
      setCalendarCalculationError(
        calculationError instanceof Error
          ? calculationError.message
          : 'Could not check your calendar availability.',
      );
    } finally {
      setCalculating(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 3) {
      void handleCalculate();
      return;
    }
    setCurrentStep((step) => step + 1);
  };

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

  const handleSavePlan = async () => {
    if (!selectedActivity || !selectedDay || !recommendedWindow || !user) return;

    const planData = {
      activityEmoji: selectedActivity.emoji,
      activityLabel: t(selectedActivity.labelKey),
      dateLabel: `${selectedDay.label}, ${selectedDay.date.replace(',', '')}`,
      startTime: formatClock(recommendedWindow.start),
      endTime: formatClock(recommendedWindow.end),
    };

    try {
      await plansApi.savePlan({ ...planData, plannedDate: selectedDayId });
      showToast('Plan saved!', 'success');
    } catch {
      showToast('Failed to save plan.', 'error');
    }

    navigation.navigate('Home', { savedPlan: planData });
  };

  if (showSuccess) {
    return (
      <SafeAreaView edges={['top']} style={styles.resultSafe}>
        <ScrollView
          contentContainerStyle={[styles.resultContent, { paddingBottom: tabBarClearance + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultCard}>
            <Pressable
              accessibilityLabel="Close"
              accessibilityRole="button"
              onPress={() => { setShowSuccess(false); setCurrentStep(1); setSelectedActivityId(null); }}
              style={({ pressed }) => [styles.closeButton, pressed && styles.nextButtonPressed]}
            >
              <Ionicons color={colors.textMuted} name="close" size={22} />
            </Pressable>
            <Text style={styles.resultTitle}>Great timing!</Text>
            <Text style={styles.resultSubtitle}>
              Here’s the best time for{`\n`}your outdoor activity.
            </Text>

            <View style={styles.resultTimeCard}>
              <Ionicons color="#FFBF22" name="sunny" size={36} />
              <View style={styles.resultTimeCopy}>
                <Text style={styles.resultTime}>
                  {recommendedWindow
                    ? `${formatClock(recommendedWindow.start)} – ${formatClock(recommendedWindow.end)}`
                    : `12:00 – ${formatEndTime(12, 0, selectedDuration)}`}
                </Text>
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
              accessibilityLabel="Save plan and return home"
              accessibilityRole="button"
              onPress={() => void handleSavePlan()}
              style={({ pressed }) => [styles.resultSecondaryButton, pressed && styles.nextButtonPressed]}
            >
              <Ionicons color={colors.textMuted} name="bookmark-outline" size={22} />
              <Text style={styles.resultSecondaryButtonText}>Save plan</Text>
            </Pressable>
          </View>
        </ScrollView>
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
          <View style={styles.progressHeading}>
            <Text style={styles.progressLabel}>Plan your weather window</Text>
            <Text style={styles.progressStep}>Step {Math.min(currentStep, 3)} of 3</Text>
          </View>
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
                  {t('chat.steps.activity.question', { firstName: homeHeaderMock.user.firstName })}
                </Text>
              </View>
            </View>

            <View style={styles.optionsGroup}>
              <View style={styles.optionsCard}>
                {sortedActivities.map((option) => {
                  const selected = option.id === selectedActivityId;
                  const isFavorite = favoriteActivities.includes(option.id);

                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => handleSelectActivity(option.id)}
                      style={({ pressed }) => [
                        styles.option,
                        isFavorite && !selected && styles.optionFavorite,
                        selected && styles.optionSelected,
                        pressed && styles.optionPressed,
                      ]}
                    >
                      <Text style={styles.optionEmoji}>{option.emoji}</Text>
                      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                        {t(option.labelKey)}
                      </Text>
                      {isFavorite && (
                        <Ionicons color={selected ? colors.primaryDefault : colors.homeWarmAccent} name="heart" size={14} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
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

              {calendarCalculationError && !CALENDAR_ENABLED ? (
                <Text style={styles.calendarError}>{calendarCalculationError}</Text>
              ) : null}

              {CALENDAR_ENABLED ? (
              <>
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
                  accessibilityState={{ disabled: googleCalendar.loading }}
                  disabled={googleCalendar.loading || googleCalendar.connected}
                  onPress={() => void googleCalendar.connect()}
                  style={({ pressed }) => [
                    styles.calendarButton,
                    googleCalendar.connected && styles.calendarButtonConnected,
                    pressed && styles.nextButtonPressed,
                  ]}
                >
                  {googleCalendar.loading ? (
                    <ActivityIndicator color={colors.backgroundPrimary} size="small" />
                  ) : (
                    <Text style={styles.calendarButtonText}>
                      {googleCalendar.connected ? '✓ Calendar connected' : 'Connect Google Calendar'}
                    </Text>
                  )}
                </Pressable>
                {googleCalendar.error ? <Text style={styles.calendarError}>{googleCalendar.error}</Text> : null}
                {calendarCalculationError ? <Text style={styles.calendarError}>{calendarCalculationError}</Text> : null}
              </View>
              </>
              ) : null}
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
              accessibilityState={{ disabled: (currentStep === 1 && !selectedActivityId) || calculating }}
              disabled={(currentStep === 1 && !selectedActivityId) || calculating}
              onPress={handleNext}
              style={({ pressed }) => [
                styles.nextButton,
                ((currentStep === 1 && !selectedActivityId) || calculating) && styles.nextButtonDisabled,
                pressed && styles.nextButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.nextButtonText,
                  currentStep === 1 && !selectedActivityId && styles.nextButtonTextDisabled,
                ]}
              >
                {calculating ? 'Checking calendar…' : currentStep === 3 ? 'Calculate' : 'Next'}
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
  closeButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: colors.homeMetricBackground,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  resultContent: {
    backgroundColor: colors.homeBackground,
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  resultCard: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 28,
    elevation: 5,
    paddingBottom: 22,
    paddingHorizontal: 20,
    paddingTop: 14,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },
  resultTitle: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  resultSubtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 6,
    textAlign: 'center',
  },
  resultTimeCard: {
    alignItems: 'center',
    backgroundColor: colors.conditionGoodBackground,
    borderColor: colors.conditionGoodBorder,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: '100%',
  },
  resultTimeCopy: {
    marginLeft: 12,
  },
  resultTime: {
    color: colors.primaryDefault,
    fontSize: 18,
    fontWeight: '800',
  },
  resultDate: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  resultMascotCircle: {
    alignItems: 'center',
    backgroundColor: colors.homeBackground,
    borderColor: colors.conditionGoodBorder,
    borderRadius: 70,
    borderWidth: 8,
    height: 140,
    justifyContent: 'center',
    marginVertical: 16,
    overflow: 'hidden',
    width: 140,
  },
  resultMascot: {
    height: 114,
    width: 114,
  },
  resultPrimaryButton: {
    alignItems: 'center',
    backgroundColor: colors.homeBackground,
    borderRadius: 24,
    flexDirection: 'row',
    height: 50,
    justifyContent: 'center',
    width: '100%',
  },
  resultPrimaryButtonText: {
    color: colors.backgroundPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  resultSecondaryButton: {
    alignItems: 'center',
    borderColor: colors.textDisabled,
    borderRadius: 24,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 48,
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },
  resultSecondaryButtonText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  safe: {
    backgroundColor: colors.backgroundPrimary,
    flex: 1,
  },
  scrollView: {
    backgroundColor: colors.homeBackground,
  },
  header: {
    backgroundColor: colors.backgroundPrimary,
    gap: 4,
    paddingBottom: 18,
    paddingHorizontal: 24,
    paddingTop: 16,
    zIndex: 1,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  progressWrapper: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 20,
    elevation: 3,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  progressStep: {
    color: colors.primaryDefault,
    fontSize: 12,
    fontWeight: '700',
  },
  messageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  lumoAvatar: {
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.conditionGoodBorder,
    borderRadius: 26,
    borderWidth: 3,
    height: 52,
    marginRight: 10,
    width: 52,
  },
  bubble: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 24,
    elevation: 4,
    flexShrink: 1,
    marginLeft: 8,
    paddingHorizontal: 18,
    paddingVertical: 15,
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
    left: -8,
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
    borderRadius: 28,
    elevation: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 10,
    justifyContent: 'space-between',
    padding: 16,
    rowGap: 10,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    width: '100%',
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.conditionCardBorder,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    flexBasis: '47%',
    flexGrow: 1,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 8,
    maxWidth: '48%',
  },
  optionFavorite: {
    borderColor: colors.homeWarmLight,
    borderWidth: 1.5,
  },
  optionSelected: {
    backgroundColor: colors.conditionGoodBackground,
    borderColor: colors.homeBackground,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionEmoji: {
    fontSize: 19,
    marginRight: 7,
  },
  optionLabel: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
  },
  optionLabelSelected: {
    color: colors.primaryDefault,
    fontWeight: '700',
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
  },
  userBubble: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 24,
    elevation: 4,
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
    right: -8,
    width: 0,
  },
  stepAvatar: {
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.conditionGoodBorder,
    borderRadius: 26,
    borderWidth: 3,
    height: 52,
    width: 52,
  },
  stepBubble: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 24,
    elevation: 4,
    flex: 1,
    marginLeft: 18,
    paddingHorizontal: 18,
    paddingVertical: 15,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
  },
  durationCard: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 28,
    elevation: 5,
    paddingBottom: 26,
    paddingHorizontal: 22,
    paddingTop: 22,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
  },
  durationTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  durationSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  durationValue: {
    color: colors.primaryDefault,
    fontSize: 36,
    fontWeight: '800',
    marginVertical: 24,
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
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    height: 40,
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
    color: colors.primaryDefault,
    fontWeight: '700',
  },
  dayCard: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 28,
    elevation: 5,
    paddingBottom: 22,
    paddingHorizontal: 20,
    paddingTop: 22,
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
    borderRadius: 18,
    borderWidth: 1,
    height: 62,
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
    color: colors.primaryDefault,
  },
  dayOptionDate: {
    color: colors.textMuted,
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  dayOptionDateSelected: {
    color: colors.primaryDefault,
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
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
  },
  calendarIntro: {
    flexDirection: 'row',
  },
  calendarIcon: {
    alignItems: 'center',
    borderColor: colors.homeBackground,
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 23,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    marginRight: 10,
    width: 46,
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
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginTop: 12,
  },
  calendarButtonText: {
    color: colors.backgroundPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  calendarButtonConnected: {
    backgroundColor: colors.primaryDefault,
  },
  calendarError: {
    color: colors.conditionPoor,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  nextButton: {
    alignItems: 'center',
    backgroundColor: colors.homeBackground,
    borderRadius: 25,
    flex: 2,
    height: 50,
    justifyContent: 'center',
  },
  stepActions: {
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.conditionCardBorder,
    borderRadius: 31,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 12,
    flexDirection: 'row',
    gap: 8,
    left: 20,
    padding: 3,
    position: 'absolute',
    right: 20,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.conditionCardBorder,
    borderRadius: 25,
    borderWidth: 1,
    flex: 1,
    height: 50,
    justifyContent: 'center',
  },
  backButtonText: {
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: '700',
  },
  nextButtonPressed: {
    opacity: 0.8,
  },
  nextButtonDisabled: {
    backgroundColor: colors.homeMetricBackground,
  },
  nextButtonText: {
    color: colors.backgroundPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  nextButtonTextDisabled: {
    color: colors.secondaryDefault,
  },
});
