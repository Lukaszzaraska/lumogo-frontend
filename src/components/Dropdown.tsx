import React, { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value?: string;
};

export default function Dropdown({ onChange, options, placeholder, value }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuLayout, setMenuLayout] = useState({ height: 0, width: 0, x: 0, y: 0 });
  const triggerRef = useRef<View>(null);
  const modalTopOffset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

  const toggleDropdown = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    Keyboard.dismiss();
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setMenuLayout({ height, width, x, y });
      setIsOpen(true);
    });
  };

  const selectOption = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <View ref={triggerRef} style={styles.container}>
      <Pressable
        accessibilityLabel={value ? `Selected: ${value}` : placeholder}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={toggleDropdown}
        style={({ pressed }) => [styles.trigger, isOpen && styles.triggerOpen, pressed && styles.pressed]}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>{value ?? placeholder}</Text>
        <Ionicons
          color="#424242"
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
        />
      </Pressable>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
        statusBarTranslucent
        transparent
        visible={isOpen}
      >
        <View style={styles.modalLayer}>
          <Pressable
            accessibilityLabel="Close gender options"
            onPress={() => setIsOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.menu,
              {
                left: menuLayout.x,
                top: menuLayout.y + menuLayout.height + modalTopOffset + 7,
                width: menuLayout.width,
              },
            ]}
          >
            {options.map((option, index) => (
              <Pressable
                accessibilityRole="button"
                key={option}
                onPress={() => selectOption(option)}
                style={({ pressed }) => [
                  styles.option,
                  index < options.length - 1 && styles.optionBorder,
                  pressed && styles.optionPressed,
                ]}
              >
                <Text style={styles.optionText}>{option}</Text>
                {value === option && <Ionicons color="#55D683" name="checkmark" size={19} />}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  trigger: {
    alignItems: 'center',
    borderColor: '#747775',
    borderRadius: 18,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  triggerOpen: {
    borderColor: '#55D683',
  },
  value: {
    color: '#1F1F1F',
    fontSize: 16,
  },
  placeholder: {
    color: '#9A9A9A',
  },
  menu: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D0D0D0',
    borderRadius: 14,
    borderWidth: 1,
    elevation: 5,
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 7,
  },
  modalLayer: {
    flex: 1,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 48,
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  optionBorder: {
    borderBottomColor: '#ECECEC',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionPressed: {
    backgroundColor: '#F1F1F1',
  },
  optionText: {
    color: '#1F1F1F',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.8,
  },
});
