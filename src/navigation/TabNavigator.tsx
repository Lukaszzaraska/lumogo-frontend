import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSession } from '../session/SessionContext';
import type { RootStackParamList } from './AppNavigator';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import HomeScreen from '../screens/HomeScreen';
import WeatherScreen from '../screens/WeatherScreen';
import ChatScreen from '../screens/ChatScreen';
import AddScreen from '../screens/AddScreen';
import ProfileScreen from '../screens/ProfileScreen';
import type { HomeSavedPlanData } from '../types/home';

export type TabParamList = {
  Home: { savedPlan?: HomeSavedPlanData } | undefined;
  Weather: undefined;
  Add: undefined;
  Chat: undefined;
  Profile: undefined;
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<Exclude<keyof TabParamList, 'Add'>, { active: IoniconName; inactive: IoniconName }> = {
  Home:    { active: 'home',           inactive: 'home-outline' },
  Weather: { active: 'cloud',          inactive: 'cloud-outline' },
  Chat:    { active: 'chatbubble',     inactive: 'chatbubble-outline' },
  Profile: { active: 'person',         inactive: 'person-outline' },
};

const Tab = createBottomTabNavigator<TabParamList>();

export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_MIN_BOTTOM_OFFSET = 12;

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, isRestoring } = useSession();

  // Wylogowanie albo token odrzucony przez serwer: wróć do ekranu startowego.
  useEffect(() => {
    if (!isRestoring && !user) {
      rootNavigation.reset({ index: 0, routes: [{ name: 'Authentication' }] });
    }
  }, [isRestoring, user, rootNavigation]);

  return (
    <Tab.Navigator
      safeAreaInsets={{ bottom: insets.bottom }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabelPosition: 'beside-icon',
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.navActive,
        tabBarInactiveTintColor: colors.textDisabled,
        tabBarStyle: {
          backgroundColor: colors.backgroundPrimary,
          borderColor: '#E5E5E5',
          borderRadius: 34,
          borderWidth: 1,
          bottom: Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_OFFSET),
          elevation: 24,
          height: TAB_BAR_HEIGHT,
          marginHorizontal: 28,
          paddingBottom: 0,
          paddingTop: 0,
          position: 'absolute',
          shadowColor: colors.textPrimary,
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.34,
          shadowRadius: 18,
        },
        tabBarItemStyle: {
          borderRadius: 34,
          height: TAB_BAR_HEIGHT,
        },
        tabBarIconStyle: {
          margin: 0,
        },
        tabBarBackground: () => null,
        tabBarIcon: ({ focused, color }) => {
          if (route.name === 'Add') {
            return (
              <View style={styles.addButtonDock}>
                <View style={styles.addButtonBridge} />
                <View style={styles.addButton}>
                  <Ionicons color={colors.backgroundPrimary} name="add" size={36} />
                </View>
              </View>
            );
          }

          const icons = TAB_ICONS[route.name];
          const name = focused ? icons.active : icons.inactive;
          return (
            <View style={styles.iconContainer}>
              <Ionicons color={color} name={name} size={26} />
              {focused ? <View style={styles.activeDot} /> : null}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Weather" component={WeatherScreen} />
      <Tab.Screen name="Add" component={AddScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  addButtonDock: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    transform: [{ translateY: -16 }],
    width: 72,
  },
  addButtonBridge: {
    backgroundColor: colors.backgroundPrimary,
    bottom: -12,
    height: 28,
    left: 0,
    position: 'absolute',
    width: 72,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.navActive,
    borderRadius: 29,
    elevation: 6,
    height: 58,
    justifyContent: 'center',
    shadowColor: colors.secondaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    width: 58,
  },
  iconContainer: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  activeDot: {
    backgroundColor: colors.navActive,
    borderRadius: 2,
    height: 4,
    marginTop: 4,
    width: 4,
  },
});
