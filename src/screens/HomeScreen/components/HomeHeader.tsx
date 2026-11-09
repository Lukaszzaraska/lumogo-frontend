import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../../../i18n';
import { colors } from '../../../theme/colors';
import type { HomeHeaderData } from '../../../types/home';

type HomeHeaderProps = {
  data: HomeHeaderData;
  onAvatarPress: () => void;
};

export function HomeHeader({ data, onAvatarPress }: HomeHeaderProps) {
  const locationLabel = `${data.location.city}, ${data.location.region}`;
  const streakLabel = data.currentStreakDays === 0
    ? 'Start your streak today'
    : `${data.currentStreakDays} day streak`;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.copy}>
          <Text style={styles.greeting}>{t('home.header.greeting', { firstName: data.user.firstName })}</Text>
          <Text style={styles.location}>{locationLabel}</Text>
          <View
            accessibilityLabel={streakLabel}
            style={styles.streakBadge}
          >
            <Text accessibilityElementsHidden style={styles.streakEmoji}>🔥</Text>
            <Text accessibilityElementsHidden style={styles.streakText}>{streakLabel}</Text>
          </View>
        </View>

        <Pressable
          accessibilityLabel={t('home.header.avatarAccessibilityLabel')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onAvatarPress}
          style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}
        >
          <Image
            resizeMode="cover"
            source={data.user.avatarUrl ? { uri: data.user.avatarUrl } : require('../../../../assets/images/profile-woman.png')}
            style={styles.avatarImage}
          />
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.backgroundPrimary,
    zIndex: 1,
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  copy: {
    flex: 1,
    paddingRight: 16,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 31,
  },
  location: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 2,
  },
  streakBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.conditionGoodBackground,
    borderColor: colors.conditionGoodBorder,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  streakEmoji: {
    fontSize: 15,
    lineHeight: 18,
  },
  streakText: {
    color: colors.primaryDefault,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginLeft: 5,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.conditionGoodBorder,
    borderRadius: 28,
    borderWidth: 3,
    height: 56,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 56,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarPressed: {
    opacity: 0.7,
  },
});
