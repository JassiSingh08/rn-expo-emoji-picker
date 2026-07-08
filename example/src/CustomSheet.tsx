import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import type { ReactNode } from 'react';

export interface CustomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Minimal dependency-free bottom sheet so the example runs in Expo Go.
 * With @gorhom/bottom-sheet you'd instead pass
 * `ScrollComponent={BottomSheetScrollView}` to the picker.
 */
export function CustomSheet({ visible, onClose, children }: CustomSheetProps) {
  const { height } = useWindowDimensions();
  const sheetHeight = Math.min(520, height * 0.65);
  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const [mounted, setMounted] = useState(visible);
  const dark = useColorScheme() === 'dark';

  useEffect(() => {
    if (visible) setMounted(true);
    Animated.timing(translateY, {
      toValue: visible ? 0 : sheetHeight,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
  }, [visible, sheetHeight, translateY]);

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            transform: [{ translateY }],
            backgroundColor: dark ? '#1C1C1E' : '#FFF',
          },
        ]}
      >
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(128,128,128,0.4)',
    marginVertical: 8,
  },
});
