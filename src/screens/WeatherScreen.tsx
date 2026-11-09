import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LocationBanner } from '../components/LocationBanner';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { TAB_BAR_HEIGHT, TAB_BAR_MIN_BOTTOM_OFFSET } from '../navigation/TabNavigator';
import { weatherForecastMock } from '../mocks/weather';
import { colors } from '../theme/colors';
import type { WeatherCondition } from '../types/weather';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const weatherIcons: Record<WeatherCondition, IoniconName> = {
  cloudy: 'cloud-outline',
  partlyCloudy: 'partly-sunny-outline',
  rainy: 'rainy-outline',
  sunny: 'sunny-outline',
};

type MetricProps = { color: string; icon: IoniconName; label: string; value: string };

function Metric({ color, icon, label, value }: MetricProps) {
  return (
    <View style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons color={color} name={icon} size={21} />
      </View>
      <View style={styles.metricCopy}>
        <Text numberOfLines={1} style={styles.metricLabel}>{label}</Text>
        <Text numberOfLines={1} style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function WeatherScreen() {
  const insets = useSafeAreaInsets();
  const { status: locationStatus, request: requestLocation, openSettings } = useLocationPermission();
  const [selectedDayId, setSelectedDayId] = useState(weatherForecastMock[0].id);
  const selectedDay = weatherForecastMock.find((day) => day.id === selectedDayId) ?? weatherForecastMock[0];
  const tabBarClearance = Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_OFFSET) + TAB_BAR_HEIGHT;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {locationStatus !== 'granted' && (
        <LocationBanner
          message="Allow location access to see the weather forecast for your area."
          onPress={locationStatus === 'denied' ? openSettings : requestLocation}
          title="Unlock weather forecast"
        />
      )}
      <View style={styles.stickyHeader}>
        <View>
          <Text style={styles.title}>Weather</Text>
          <View style={styles.locationRow}>
            <Ionicons color={colors.primaryDefault} name="location-outline" size={16} />
            <Text style={styles.location}>Kraków, Małopolska</Text>
          </View>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons color={colors.homeBackground} name="partly-sunny-outline" size={29} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View accessibilityRole="tablist" style={styles.dayTabs}>
          {weatherForecastMock.map((day) => {
            const selected = day.id === selectedDay.id;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                key={day.id}
                onPress={() => setSelectedDayId(day.id)}
                style={({ pressed }) => [styles.dayTab, selected && styles.dayTabSelected, pressed && styles.pressed]}
              >
                <Text style={[styles.dayTabLabel, selected && styles.dayTabLabelSelected]}>{day.tabLabel}</Text>
                <Text style={[styles.dayTabDate, selected && styles.dayTabDateSelected]}>{day.shortDate}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons color={colors.homeWarmAccent} name={weatherIcons[selectedDay.condition]} size={72} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.temperature}>{selectedDay.temperatureCelsius}°</Text>
            <Text style={styles.description}>{selectedDay.description}</Text>
            <Text style={styles.feelsLike}>Feels like {selectedDay.feelsLikeCelsius}°</Text>
          </View>
          <View style={styles.range}>
            <Text style={styles.rangeHigh}>H {selectedDay.highCelsius}°</Text>
            <Text style={styles.rangeLow}>L {selectedDay.lowCelsius}°</Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Ionicons color={colors.primaryDefault} name="sparkles-outline" size={22} />
          </View>
          <View style={styles.insightCopy}>
            <Text style={styles.insightTitle}>Lumo’s outlook</Text>
            <Text style={styles.insightText}>{selectedDay.insight}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Conditions</Text>
        <View style={styles.metricsCard}>
          <Metric color={colors.conditionMetricAccent} icon="leaf-outline" label="Wind" value={`${selectedDay.windSpeedKmh} km/h`} />
          <Metric color="#4FAAE8" icon="water-outline" label="Humidity" value={`${selectedDay.humidityPercent}%`} />
          <Metric color={colors.conditionGood} icon="sparkles-outline" label="Air quality" value={`AQI ${selectedDay.airQualityIndex}`} />
          <Metric color={colors.homeWarmAccent} icon="sunny-outline" label="UV index" value={`${selectedDay.uvIndex} · Low`} />
        </View>

        <Text style={styles.sectionTitle}>Throughout the day</Text>
        <ScrollView contentContainerStyle={styles.hourlyContent} horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
          {selectedDay.hourly.map((hour) => (
            <View key={hour.time} style={styles.hourCard}>
              <Text style={styles.hourTime}>{hour.time}</Text>
              <Ionicons color={colors.homeWarmAccent} name={weatherIcons[hour.condition]} size={26} />
              <Text style={styles.hourTemperature}>{hour.temperatureCelsius}°</Text>
              <View style={styles.rainRow}>
                <Ionicons color="#4FAAE8" name="water" size={10} />
                <Text style={styles.rainText}>{hour.precipitationPercent}%</Text>
              </View>
            </View>
          ))}
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.backgroundPrimary, flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  stickyHeader: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
    paddingHorizontal: 20,
    paddingTop: 18,
    zIndex: 2,
  },
  title: { color: colors.textPrimary, fontSize: 30, fontWeight: '800', lineHeight: 36 },
  locationRow: { alignItems: 'center', flexDirection: 'row', marginTop: 3 },
  location: { color: colors.textMuted, fontSize: 14, marginLeft: 4 },
  headerIcon: { alignItems: 'center', backgroundColor: colors.conditionGoodBackground, borderRadius: 25, height: 50, justifyContent: 'center', width: 50 },
  dayTabs: { backgroundColor: colors.homeMetricBackground, borderRadius: 24, flexDirection: 'row', padding: 5 },
  dayTab: { alignItems: 'center', borderRadius: 20, flex: 1, paddingVertical: 9 },
  dayTabSelected: { backgroundColor: colors.backgroundPrimary, elevation: 2, shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  dayTabLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  dayTabLabelSelected: { color: colors.primaryDefault, fontWeight: '800' },
  dayTabDate: { color: colors.textDisabled, fontSize: 10, marginTop: 2 },
  dayTabDateSelected: { color: colors.primaryLight },
  pressed: { opacity: 0.72 },
  heroCard: { alignItems: 'center', backgroundColor: colors.conditionGoodBackground, borderColor: colors.conditionGoodBorder, borderRadius: 28, borderWidth: 1, flexDirection: 'row', marginTop: 18, padding: 20 },
  heroIcon: { alignItems: 'center', justifyContent: 'center', width: 86 },
  heroCopy: { flex: 1, marginLeft: 12 },
  temperature: { color: colors.textPrimary, fontSize: 52, fontWeight: '800', lineHeight: 56 },
  description: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  feelsLike: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  range: { alignItems: 'flex-end', alignSelf: 'flex-start', paddingTop: 8 },
  rangeHigh: { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  rangeLow: { color: colors.textMuted, fontSize: 13, marginTop: 5 },
  insightCard: { alignItems: 'flex-start', borderColor: colors.conditionCardBorder, borderRadius: 22, borderWidth: 1, flexDirection: 'row', marginTop: 14, padding: 15 },
  insightIcon: { alignItems: 'center', backgroundColor: colors.conditionGoodBackground, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  insightCopy: { flex: 1, marginLeft: 12 },
  insightTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '800' },
  insightText: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 10, marginTop: 22 },
  metricsCard: { borderColor: colors.homeMetricBackground, borderRadius: 24, borderWidth: 1, flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden' },
  metric: { alignItems: 'center', flexDirection: 'row', minHeight: 68, paddingHorizontal: 12, width: '50%' },
  metricIcon: { alignItems: 'center', borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  metricCopy: { flex: 1, marginLeft: 9, minWidth: 0 },
  metricLabel: { color: colors.textMuted, fontSize: 10 },
  metricValue: { color: colors.textPrimary, fontSize: 13, fontWeight: '800', marginTop: 2 },
  hourlyScroll: { marginHorizontal: -20 },
  hourlyContent: { gap: 10, paddingHorizontal: 20 },
  hourCard: { alignItems: 'center', backgroundColor: colors.homeMetricBackground, borderRadius: 20, minWidth: 72, paddingHorizontal: 10, paddingVertical: 12 },
  hourTime: { color: colors.textMuted, fontSize: 11, marginBottom: 8 },
  hourTemperature: { color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginTop: 6 },
  rainRow: { alignItems: 'center', flexDirection: 'row', marginTop: 4 },
  rainText: { color: '#4FAAE8', fontSize: 9, marginLeft: 2 },
});
