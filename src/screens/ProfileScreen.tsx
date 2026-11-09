import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useLocationPermission } from '../hooks/useLocationPermission';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { TAB_BAR_HEIGHT, TAB_BAR_MIN_BOTTOM_OFFSET, type TabParamList } from '../navigation/TabNavigator';
import { colors } from '../theme/colors';

const profileImage = require('../../assets/images/profile-woman.png');
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type SettingsRowProps = {
  icon: IoniconName;
  label: string;
  onPress?: () => void;
  tone?: 'default' | 'danger';
  value?: string;
};

function SettingsRow({ icon, label, onPress, tone = 'default', value }: SettingsRowProps) {
  const color = tone === 'danger' ? colors.conditionPoor : colors.primaryDefault;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.pressed]}
    >
      <View style={[styles.rowIcon, { backgroundColor: `${color}16` }]}>
        <Ionicons color={color} name={icon} size={21} />
      </View>
      <Text style={[styles.rowLabel, tone === 'danger' && styles.dangerText]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Ionicons color={colors.textDisabled} name="chevron-forward" size={19} />
    </Pressable>
  );
}

type ToggleRowProps = {
  icon: IoniconName;
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
};

function ToggleRow({ icon, label, onChange, value }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons color={colors.primaryDefault} name={icon} size={21} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.switchSlot}>
        <Switch
          ios_backgroundColor={colors.homeMetricBackground}
          onValueChange={onChange}
          style={styles.toggle}
          trackColor={{ false: colors.homeMetricBackground, true: colors.conditionGoodBorder }}
          thumbColor={value ? colors.homeBackground : colors.textDisabled}
          value={value}
        />
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const stackNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [locationLabel, setLocationLabel] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const [geocode] = await Location.reverseGeocodeAsync(position.coords);
      if (cancelled || !geocode) return;
      const city = geocode.city ?? geocode.subregion ?? '';
      const region = geocode.region ?? '';
      setLocationLabel([city, region].filter(Boolean).join(', '));
    })();
    return () => { cancelled = true; };
  }, []);
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [airQualityAlerts, setAirQualityAlerts] = useState(true);
  const { status: locationStatus, openSettings } = useLocationPermission();
  const tabBarClearance = Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_OFFSET) + TAB_BAR_HEIGHT;

  const handleLogout = () => {
    logout();
    stackNav?.reset({
      index: 0,
      routes: [{ name: 'Authentication' }],
    });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileCard}>
          <Image source={profileImage} style={styles.avatar} />
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{user?.firstName ?? 'Guest'}</Text>
            <Text style={styles.email}>{user?.email ?? ''}</Text>
            <View style={styles.locationRow}>
              <Ionicons color={colors.primaryDefault} name="location-outline" size={14} />
              <Text style={styles.location}>{locationLabel || 'Location unavailable'}</Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
            onPress={() => stackNav?.navigate('EditProfile')}
            style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
          >
            <Ionicons color={colors.primaryDefault} name="pencil-outline" size={20} />
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Weather preferences</Text>
        <View style={styles.sectionCard}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons color={colors.primaryDefault} name="thermometer-outline" size={21} />
            </View>
            <Text style={styles.rowLabel}>Temperature unit</Text>
            <View style={styles.unitControl}>
              {(['C', 'F'] as const).map((unit) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: temperatureUnit === unit }}
                  key={unit}
                  onPress={() => setTemperatureUnit(unit)}
                  style={[styles.unitButton, temperatureUnit === unit && styles.unitButtonSelected]}
                >
                  <Text style={[styles.unitText, temperatureUnit === unit && styles.unitTextSelected]}>°{unit}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.divider} />
          <ToggleRow icon="notifications-outline" label="Weather alerts" onChange={setWeatherAlerts} value={weatherAlerts} />
          <View style={styles.divider} />
          <ToggleRow icon="leaf-outline" label="Air quality alerts" onChange={setAirQualityAlerts} value={airQualityAlerts} />
        </View>

        <Text style={styles.sectionTitle}>Planning</Text>
        <View style={styles.sectionCard}>
          <ToggleRow icon="calendar-outline" label="Calendar connection" onChange={openSettings} value={locationStatus === 'granted'} />
          <View style={styles.divider} />
          <SettingsRow icon="timer-outline" label="Preferences" onPress={() => stackNav?.navigate('Preferences')} />
          <View style={styles.divider} />
          <SettingsRow icon="bookmark-outline" label="Saved plans" onPress={() => stackNav?.navigate('SavedPlans')} />
        </View>

        <Text style={styles.sectionTitle}>Account & support</Text>
        <View style={styles.sectionCard}>
          <SettingsRow icon="person-outline" label="Personal information" onPress={() => stackNav?.navigate('EditProfile')} />
          <View style={styles.divider} />
          <SettingsRow icon="lock-closed-outline" label="Change password" onPress={() => stackNav?.navigate('ChangePassword')} />
          <View style={styles.divider} />
          <SettingsRow icon="shield-checkmark-outline" label="Privacy & terms" onPress={() => stackNav?.navigate('PrivacyTerms')} />
          <View style={styles.divider} />
          <SettingsRow icon="help-circle-outline" label="Help & support" onPress={() => stackNav?.navigate('HelpSupport')} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.conditionPoor} name="log-out-outline" size={21} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>

        <Text style={styles.version}>LumoGo 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.backgroundPrimary, flex: 1 },
  content: { backgroundColor: colors.homeMetricBackground, paddingHorizontal: 20, paddingTop: 18 },
  title: { color: colors.textPrimary, fontSize: 30, fontWeight: '800', lineHeight: 36, marginBottom: 18 },
  profileCard: { alignItems: 'center', backgroundColor: colors.backgroundPrimary, borderRadius: 28, elevation: 3, flexDirection: 'row', padding: 18, shadowColor: colors.textPrimary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5 },
  avatar: { backgroundColor: colors.conditionGoodBackground, borderColor: colors.conditionGoodBorder, borderRadius: 38, borderWidth: 3, height: 76, width: 76 },
  profileCopy: { flex: 1, marginLeft: 15 },
  name: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
  email: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  locationRow: { alignItems: 'center', flexDirection: 'row', marginTop: 7 },
  location: { color: colors.primaryDefault, fontSize: 12, marginLeft: 3 },
  editButton: { alignItems: 'center', backgroundColor: colors.conditionGoodBackground, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  pressed: { opacity: 0.68 },
  sectionTitle: { color: colors.textMuted, fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4, marginTop: 22, textTransform: 'uppercase' },
  sectionCard: { backgroundColor: colors.backgroundPrimary, borderRadius: 24, overflow: 'hidden', paddingHorizontal: 16 },
  row: { alignItems: 'center', flexDirection: 'row', minHeight: 62 },
  rowIcon: { alignItems: 'center', backgroundColor: colors.conditionGoodBackground, borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  rowLabel: { color: colors.textPrimary, flex: 1, fontSize: 15, fontWeight: '600', marginLeft: 12 },
  rowValue: { color: colors.textMuted, fontSize: 13, marginRight: 6 },
  dangerText: { color: colors.conditionPoor },
  divider: { backgroundColor: colors.homeMetricBackground, height: 1, marginLeft: 48 },
  switchSlot: { alignItems: 'flex-end', height: 32, justifyContent: 'center', width: 52 },
  toggle: { height: 32, width: 52 },
  unitControl: { backgroundColor: colors.homeMetricBackground, borderRadius: 17, flexDirection: 'row', padding: 3 },
  unitButton: { alignItems: 'center', borderRadius: 14, justifyContent: 'center', minHeight: 28, minWidth: 40 },
  unitButtonSelected: { backgroundColor: colors.backgroundPrimary },
  unitText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  unitTextSelected: { color: colors.primaryDefault },
  logoutButton: { alignItems: 'center', backgroundColor: colors.backgroundPrimary, borderColor: colors.conditionPoorBorder, borderRadius: 24, borderWidth: 1, flexDirection: 'row', height: 54, justifyContent: 'center', marginTop: 24 },
  logoutText: { color: colors.conditionPoor, fontSize: 16, fontWeight: '700', marginLeft: 8 },
  version: { color: colors.textDisabled, fontSize: 11, marginTop: 16, textAlign: 'center' },
});
