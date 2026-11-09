import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contentApi, type PrivacyData } from '../services/contentApi';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyTerms'>;

export default function PrivacyTermsScreen({ navigation }: Props) {
  const [data, setData] = useState<PrivacyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await contentApi.getPrivacy();
        setData(result);
      } catch {
        // keep empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
        <Text style={styles.headerTitle}>Privacy & terms</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : data ? (
          <>
            <Text style={styles.lastUpdated}>Last updated: {data.lastUpdated}</Text>
            {data.sections.map((section) => (
              <View key={section.title} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionContent}>{section.content}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.emptyText}>Content unavailable at the moment.</Text>
        )}
      </ScrollView>
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
  content: {
    paddingBottom: 40,
    paddingHorizontal: 28,
    paddingTop: 8,
  },
  loader: {
    marginVertical: 40,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
  lastUpdated: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionContent: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.8,
  },
});
