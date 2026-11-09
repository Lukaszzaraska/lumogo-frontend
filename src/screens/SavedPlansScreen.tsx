import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { plansApi, type SavedPlan } from '../services/plansApi';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedPlans'>;

function isPlanPast(plan: SavedPlan): boolean {
  if (!plan.plannedDate || !plan.endTime) return false;
  const [hours, minutes] = plan.endTime.split(':').map(Number);
  const endDate = new Date(`${plan.plannedDate}T00:00:00`);
  endDate.setHours(hours, minutes, 0, 0);
  return endDate.getTime() < Date.now();
}

function PlanCard({ plan, isPast, onDelete }: { plan: SavedPlan; isPast: boolean; onDelete?: () => void }) {
  return (
    <View style={[styles.planCard, isPast && styles.planCardPast]}>
      <View style={styles.planHeader}>
        <Text style={[styles.planEmoji, isPast && styles.pastText]}>{plan.activityEmoji}</Text>
        <View style={styles.planInfo}>
          <View style={styles.planTitleRow}>
            <Text style={[styles.planActivity, isPast && styles.pastText]}>{plan.activityLabel}</Text>
            {isPast && (
              <View style={styles.pastBadge}>
                <Text style={styles.pastBadgeText}>Completed</Text>
              </View>
            )}
          </View>
          <Text style={styles.planDate}>{plan.dateLabel}</Text>
        </View>
        {!isPast && onDelete && (
          <Pressable
            accessibilityLabel="Delete plan"
            accessibilityRole="button"
            hitSlop={10}
            onPress={onDelete}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
          >
            <Ionicons color={colors.conditionPoor} name="trash-outline" size={20} />
          </Pressable>
        )}
      </View>
      <View style={[styles.timeRow, isPast && styles.timeRowPast]}>
        <Ionicons color={isPast ? colors.textMuted : colors.primaryDefault} name="time-outline" size={16} />
        <Text style={[styles.timeText, isPast && styles.timeTextPast]}>{plan.startTime} – {plan.endTime}</Text>
      </View>
    </View>
  );
}

export default function SavedPlansScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    if (!user) return;
    try {
      const data = await plansApi.getPlans(user.id);
      setPlans(data);
    } catch {
      showToast('Failed to load saved plans.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    void fetchPlans();
  }, [fetchPlans]);

  const { upcoming, past } = useMemo(() => {
    const up: SavedPlan[] = [];
    const pa: SavedPlan[] = [];
    for (const plan of plans) {
      if (isPlanPast(plan)) {
        pa.push(plan);
      } else {
        up.push(plan);
      }
    }
    return { upcoming: up, past: pa };
  }, [plans]);

  const handleDelete = async (planId: number) => {
    try {
      await plansApi.deletePlan(planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
      showToast('Plan deleted.', 'success');
    } catch {
      showToast('Failed to delete plan.', 'error');
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
        <Text style={styles.headerTitle}>Saved plans</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : plans.length === 0 ? (
        <View style={styles.center}>
          <Ionicons color={colors.textDisabled} name="bookmark-outline" size={64} />
          <Text style={styles.emptyTitle}>No saved plans yet</Text>
          <Text style={styles.emptyDescription}>
            Plans you save from the weather planner will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {upcoming.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              {upcoming.map((plan) => (
                <PlanCard
                  key={plan.id}
                  isPast={false}
                  onDelete={() => void handleDelete(plan.id)}
                  plan={plan}
                />
              ))}
            </>
          )}

          {past.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, upcoming.length > 0 && { marginTop: 24 }]}>Past</Text>
              {past.map((plan) => (
                <PlanCard key={plan.id} isPast plan={plan} />
              ))}
            </>
          )}
        </ScrollView>
      )}
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
  listContent: {
    gap: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  planCard: {
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.conditionCardBorder,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  planCardPast: {
    backgroundColor: colors.homeMetricBackground,
    borderColor: colors.textDisabled,
    opacity: 0.7,
  },
  planHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  planEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  pastText: {
    opacity: 0.5,
  },
  planInfo: {
    flex: 1,
  },
  planTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  planActivity: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  pastBadge: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pastBadgeText: {
    color: colors.secondaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  planDate: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  deleteButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  timeRow: {
    alignItems: 'center',
    backgroundColor: colors.conditionGoodBackground,
    borderRadius: 12,
    flexDirection: 'row',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timeRowPast: {
    backgroundColor: colors.homeMetricBackground,
  },
  timeText: {
    color: colors.primaryDefault,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  timeTextPast: {
    color: colors.textMuted,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptyDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
