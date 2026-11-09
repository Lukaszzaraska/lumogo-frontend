import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import type { HomeRecommendationData } from '../../../types/home';

const lumoImage = require('../../../../assets/images/profile-lumo.png');

type HomeRecommendationProps = {
  data: HomeRecommendationData;
};

export function HomeRecommendation({ data }: HomeRecommendationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.assistant}>
        <Image source={lumoImage} style={styles.assistantImage} />
        <Text style={styles.assistantName}>{data.assistantName}</Text>
      </View>

      <View style={styles.messageBubble}>
        <View style={styles.messageTail} />
        <Text style={styles.message}>
          {data.messageParts.map((part, index) => (
            <Text
              key={`${part.text}-${index}`}
              style={part.emphasized ? styles.messageEmphasis : undefined}
            >
              {part.text}
            </Text>
          ))}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 20,
    paddingTop: 14,
  },
  assistant: {
    alignItems: 'center',
    marginRight: 12,
    width: 60,
  },
  assistantImage: {
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.conditionGoodBorder,
    borderRadius: 30,
    borderWidth: 3,
    height: 60,
    width: 60,
  },
  assistantName: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  messageBubble: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 28,
    flex: 1,
    minHeight: 100,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 5,
  },
  messageTail: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 12,
    borderRightColor: colors.backgroundPrimary,
    borderRightWidth: 18,
    borderTopColor: 'transparent',
    borderTopWidth: 12,
    bottom: 22,
    height: 0,
    left: -16,
    position: 'absolute',
    width: 0,
  },
  message: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 21,
  },
  messageEmphasis: {
    color: colors.accent,
    fontWeight: '700',
  },
});
