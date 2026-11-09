import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../../../theme/colors';

type ChatProgressBarProps = {
  animationDuration?: number;
  onAnimationComplete?: () => void;
  progress: number;
};

export function ChatProgressBar({
  animationDuration = 450,
  onAnimationComplete,
  progress,
}: ChatProgressBarProps) {
  const progressPercent = useRef(new Animated.Value(progress * 100)).current;

  useEffect(() => {
    Animated.timing(progressPercent, {
      toValue: progress * 100,
      duration: animationDuration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) onAnimationComplete?.();
    });
  }, [animationDuration, onAnimationComplete, progress, progressPercent]);

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: progressPercent.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.conditionGoodBackground,
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.homeBackground,
    borderRadius: 4,
    height: 8,
  },
});
