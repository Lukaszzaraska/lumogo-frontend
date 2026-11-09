import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contentApi, type FaqItem } from '../services/contentApi';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'HelpSupport'>;

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type ContactOption = {
  icon: IoniconName;
  label: string;
  description: string;
  action: () => void;
};

function FaqAccordion({ item }: { item: FaqItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={() => setExpanded((v) => !v)}
      style={styles.faqItem}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons
          color={colors.textMuted}
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
        />
      </View>
      {expanded && <Text style={styles.faqAnswer}>{item.answer}</Text>}
    </Pressable>
  );
}

export default function HelpSupportScreen({ navigation }: Props) {
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await contentApi.getFaq();
        setFaqItems(data);
      } catch {
        // fallback empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const contactOptions: ContactOption[] = [
    {
      icon: 'mail-outline',
      label: 'Email us',
      description: 'support@lumogo.app',
      action: () => void Linking.openURL('mailto:support@lumogo.app'),
    },
    {
      icon: 'chatbubble-outline',
      label: 'Report a bug',
      description: 'Let us know what went wrong',
      action: () => void Linking.openURL('mailto:bugs@lumogo.app?subject=Bug%20Report'),
    },
  ];

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
        <Text style={styles.headerTitle}>Help & support</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Frequently asked questions</Text>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : faqItems.length > 0 ? (
          <View style={styles.faqCard}>
            {faqItems.map((item, index) => (
              <React.Fragment key={item.question}>
                {index > 0 && <View style={styles.divider} />}
                <FaqAccordion item={item} />
              </React.Fragment>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>FAQ unavailable at the moment.</Text>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Contact us</Text>

        <View style={styles.contactCard}>
          {contactOptions.map((option, index) => (
            <React.Fragment key={option.label}>
              {index > 0 && <View style={styles.divider} />}
              <Pressable
                accessibilityRole="button"
                onPress={option.action}
                style={({ pressed }) => [styles.contactRow, pressed && styles.pressed]}
              >
                <View style={styles.contactIcon}>
                  <Ionicons color={colors.primaryDefault} name={option.icon} size={22} />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>{option.label}</Text>
                  <Text style={styles.contactDescription}>{option.description}</Text>
                </View>
                <Ionicons color={colors.textDisabled} name="chevron-forward" size={19} />
              </Pressable>
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.versionNote}>LumoGo v1.0.0</Text>
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
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  faqCard: {
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.conditionCardBorder,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  faqItem: {
    paddingVertical: 16,
  },
  faqHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  faqQuestion: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginRight: 8,
  },
  faqAnswer: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  contactCard: {
    backgroundColor: colors.backgroundPrimary,
    borderColor: colors.conditionCardBorder,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  contactRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 62,
  },
  contactIcon: {
    alignItems: 'center',
    backgroundColor: colors.conditionGoodBackground,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  contactDescription: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  divider: {
    backgroundColor: colors.homeMetricBackground,
    height: 1,
  },
  versionNote: {
    color: colors.textDisabled,
    fontSize: 11,
    marginTop: 24,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
