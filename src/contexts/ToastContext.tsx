import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastType = 'error' | 'success' | 'info';

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  error: { bg: '#FEF2F2', border: '#FECACA', icon: '#DC2626' },
  success: { bg: '#F0FDF4', border: '#BBF7D0', icon: '#16A34A' },
  info: { bg: '#EFF6FF', border: '#BFDBFE', icon: '#2563EB' },
};

const TOAST_ICONS: Record<ToastType, React.ComponentProps<typeof Ionicons>['name']> = {
  error: 'alert-circle',
  success: 'checkmark-circle',
  info: 'information-circle',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ message: string; type: ToastType; key: number } | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    opacity.setValue(0);
    translateY.setValue(-30);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -30, duration: 300, useNativeDriver: true }),
      ]).start(() => setToast(null));
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, opacity, translateY]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.container,
            { top: insets.top + 8, opacity, transform: [{ translateY }] },
          ]}
        >
          <View style={[styles.toast, { backgroundColor: TOAST_COLORS[toast.type].bg, borderColor: TOAST_COLORS[toast.type].border }]}>
            <Ionicons color={TOAST_COLORS[toast.type].icon} name={TOAST_ICONS[toast.type]} size={20} />
            <Text style={styles.message}>{toast.message}</Text>
            <Pressable hitSlop={8} onPress={() => setToast(null)}>
              <Ionicons color="#6B7280" name="close" size={18} />
            </Pressable>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  container: {
    left: 16,
    position: 'absolute',
    right: 16,
    zIndex: 9999,
  },
  toast: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    elevation: 6,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  message: {
    color: '#1F1F1F',
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
  },
});
