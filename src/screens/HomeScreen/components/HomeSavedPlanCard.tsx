import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { t } from '../../../i18n';
import { colors } from '../../../theme/colors';
import type { HomeSavedPlanData } from '../../../types/home';

type HomeSavedPlanCardProps = {
  plan: HomeSavedPlanData;
};

type ConditionProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  label: string;
  value: string;
};

function Condition({ icon, iconColor, label, value }: ConditionProps) {
  return (
    <View style={styles.condition}>
      <Ionicons color={iconColor} name={icon} size={23} />
      <View style={styles.conditionCopy}>
        <Text numberOfLines={1} style={styles.conditionLabel}>
          {label}
        </Text>
        <Text numberOfLines={1} style={styles.conditionValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function HomeSavedPlanCard({ plan }: HomeSavedPlanCardProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${plan.activityLabel}, ${plan.dateLabel}, ${plan.startTime} to ${plan.endTime}`}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('home.savedPlan.title')}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('home.savedPlan.status')}</Text>
        </View>
      </View>

      <View style={styles.planRow}>
        <View style={styles.activityIcon}>
          <Text style={styles.activityEmoji}>{plan.activityEmoji}</Text>
        </View>
        <View style={styles.planCopy}>
          <Text style={styles.activityLabel}>{plan.activityLabel}</Text>
          <Text style={styles.date}>{plan.dateLabel}</Text>
          <Text style={styles.time}>{plan.startTime} – {plan.endTime}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.conditions}>
        <Condition
          icon="thermometer-outline"
          iconColor={colors.homeWarmAccent}
          label="18°C"
          value={t('home.savedPlan.temperature')}
        />
        <Condition
          icon="leaf-outline"
          iconColor={colors.conditionMetricAccent}
          label={t('home.savedPlan.wind')}
          value={t('home.savedPlan.windValue')}
        />
        <Condition
          icon="sparkles-outline"
          iconColor={colors.conditionGood}
          label={t('home.savedPlan.airQuality')}
          value={t('home.savedPlan.airQualityValue')}
        />
      </View>
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
    padding: 18,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 27,
  },
  badge: {
    backgroundColor: colors.conditionGoodBackground,
    borderColor: colors.conditionGoodBorder,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  badgeText: {
    color: colors.primaryDefault,
    fontSize: 13,
    fontWeight: '700',
  },
  planRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 14,
  },
  activityIcon: {
    alignItems: 'center',
    backgroundColor: colors.homeWarmLight,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  activityEmoji: {
    fontSize: 32,
  },
  planCopy: {
    flex: 1,
    marginLeft: 18,
  },
  activityLabel: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 24,
  },
  date: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 3,
  },
  time: {
    color: colors.primaryDefault,
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 31,
    marginTop: 4,
  },
  divider: {
    backgroundColor: colors.homeMetricBackground,
    height: 1,
    marginVertical: 14,
  },
  conditions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  condition: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    minWidth: 0,
  },
  conditionCopy: {
    flex: 1,
    marginLeft: 6,
    minWidth: 0,
  },
  conditionLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  conditionValue: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
  },
});
