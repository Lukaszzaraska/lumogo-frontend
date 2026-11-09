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
  const locationLabel = [data.location.city, data.location.region].filter(Boolean).join(', ');

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.copy}>
          <Text style={styles.greeting}>{t('home.header.greeting', { firstName: data.user.firstName })}</Text>
          <Text style={styles.location}>{locationLabel}</Text>
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
    elevation: 6,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 1,
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.backgroundPrimary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  copy: {
    flex: 1,
    paddingRight: 16,
  },
  greeting: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  location: {
    color: colors.textSecondary,
    fontSize: 18,
    lineHeight: 24,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.homeBackground,
    borderColor: colors.homeWarmDark,
    borderRadius: 36,
    borderWidth: 1.5,
    height: 72,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 72,
  },
  avatarImage: {
    height: '100%',
    width: '100%',
  },
  avatarPressed: {
    opacity: 0.7,
  },
});
