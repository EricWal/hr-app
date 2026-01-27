import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';

export default function SuccessTick({ visible, onFinish }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1.15, useNativeDriver: true, speed: 20 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.delay(700),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.8, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(() => {
      if (onFinish) onFinish();
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View style={[styles.box, { transform: [{ scale }], opacity }]}>
        <View style={styles.circle}>
          <Text style={styles.check}>✓</Text>
        </View>
        <Text style={styles.text}>تم الإرسال بنجاح</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  box: {
    alignItems: 'center',
  },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  check: {
    color: colors.text.inverse,
    fontSize: 48,
    fontFamily: fonts.bold,
  },
  text: {
    color: colors.text.primary,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
});
