import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { t, type TranslationKey } from '../../../i18n';
import { colors } from '../../../theme/colors';
import type { HomeConditionsData, HomeConditionsStatus } from '../../../types/home';
import {
  getHomeConditionsMaxScore,
  getHomeConditionMetrics,
  getHomeConditionsScore,
  getHomeConditionsStatus,
} from '../utils/homeConditions';

type HomeConditionsCardProps = {
  data: HomeConditionsData;
};

const statusLabelKeys: Record<HomeConditionsStatus, TranslationKey> = {
  good: 'home.conditions.status.good',
  moderate: 'home.conditions.status.moderate',
  poor: 'home.conditions.status.poor',
};

const statusTones: Record<
  HomeConditionsStatus,
  { backgroundColor: string; borderColor: string; color: string }
> = {
  good: {
    backgroundColor: colors.conditionGoodBackground,
    borderColor: colors.conditionGoodBorder,
    color: colors.conditionGood,
  },
  moderate: {
    backgroundColor: colors.conditionModerateBackground,
    borderColor: colors.conditionModerateBorder,
    color: colors.conditionModerate,
  },
  poor: {
    backgroundColor: colors.conditionPoorBackground,
    borderColor: colors.conditionPoorBorder,
    color: colors.conditionPoor,
  },
};

const metricIcons: Record<
  ReturnType<typeof getHomeConditionMetrics>[number]['id'],
  { color: string; name: React.ComponentProps<typeof Ionicons>['name'] }
> = {
  temperature: { color: colors.homeWarmAccent, name: 'thermometer-outline' },
  wind: { color: colors.conditionMetricAccent, name: 'leaf-outline' },
  humidity: { color: '#4FAAE8', name: 'water-outline' },
  airQuality: { color: colors.conditionGood, name: 'sparkles-outline' },
};

export function HomeConditionsCard({ data }: HomeConditionsCardProps) {
  const score = getHomeConditionsScore(data);
  const maxScore = getHomeConditionsMaxScore(data);
  const status = getHomeConditionsStatus(data);
  const statusTone = statusTones[status];
  const metrics = getHomeConditionMetrics(data);

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.scoreCopy}>
          <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={styles.title}>
            {t('home.conditions.title')}
          </Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.score, { color: statusTone.color }]}>{score}</Text>
            <Text style={styles.scoreSuffix}>/{maxScore}</Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusTone.backgroundColor,
              borderColor: statusTone.borderColor,
            },
          ]}
        >
          <Text
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            numberOfLines={1}
            style={[styles.statusText, { color: statusTone.color }]}
          >
            {t(statusLabelKeys[status])}
          </Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <View
            key={metric.id}
            style={[styles.metricTile, index > 0 && styles.metricTileWithDivider]}
          >
            <Ionicons
              color={metricIcons[metric.id].color}
              name={metricIcons[metric.id].name}
              size={22}
            />
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              numberOfLines={1}
              style={[styles.metricValue, metric.accented ? styles.metricValueAccent : undefined]}
            >
              {metric.value}
            </Text>
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.58}
              numberOfLines={1}
              style={styles.metricLabel}
            >
              {t(metric.labelKey)}
            </Text>
          </View>
        ))}
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
    paddingBottom: 14,
    paddingHorizontal: 20,
    paddingTop: 14,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },
  summary: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreCopy: {
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'flex-start',
    minWidth: 0,
    paddingRight: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 23,
  },
  scoreRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    marginTop: 4,
  },
  score: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
  },
  scoreSuffix: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    marginLeft: 3,
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: 19,
    borderWidth: 1.25,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'center',
    minWidth: 68,
    paddingHorizontal: 12,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  metricsGrid: {
    borderTopColor: colors.homeMetricBackground,
    borderTopWidth: 1,
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    width: '100%',
  },
  metricTile: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: 4,
  },
  metricTileWithDivider: {
    borderLeftColor: colors.homeMetricBackground,
    borderLeftWidth: 1,
  },
  metricValue: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginTop: 5,
    maxWidth: '100%',
  },
  metricValueAccent: {
    color: colors.conditionMetricAccent,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 1,
    maxWidth: '100%',
  },
});
