import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocationPermission } from '../hooks/useLocationPermission';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationSuccess'>;

export default function RegistrationSuccessScreen({ navigation }: Props) {
  const { request } = useLocationPermission();

  const handleLetsGo = async () => {
    await request();
    navigation.replace('Main');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>You're all set!</Text>
        <Text style={styles.subtitle}>Welcome to LumoGo!</Text>

        <View style={styles.imageCircle}>
          <Image
            accessibilityLabel="Lumo celebrating successful registration"
            resizeMode="contain"
            source={require('../../assets/icons/lumo-success.png')}
            style={styles.image}
          />
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={handleLetsGo}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Let's go!</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.backgroundPrimary,
    flex: 1,
    paddingBottom: 26,
    paddingHorizontal: 28,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#4A4A4A',
    fontSize: 29,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#858585',
    fontSize: 17,
    marginTop: 10,
    textAlign: 'center',
  },
  imageCircle: {
    alignItems: 'center',
    backgroundColor: '#55D683',
    borderColor: '#78E69E',
    borderRadius: 115,
    borderWidth: 10,
    height: 230,
    justifyContent: 'center',
    marginTop: 35,
    overflow: 'hidden',
    width: 230,
  },
  image: {
    height: 210,
    marginTop: 19,
    width: 210,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 28,
    height: 57,
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.backgroundPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
