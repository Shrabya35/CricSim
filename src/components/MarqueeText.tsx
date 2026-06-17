import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

interface MarqueeProps {
  text: string;
  speed?: number;
}

const Marquee: React.FC<MarqueeProps> = ({ text, speed = 50 }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (textWidth === 0 || containerWidth === 0) return;

    const distance = containerWidth + textWidth;
    const duration = (distance / speed) * 1000;

    const animate = () => {
      translateX.setValue(containerWidth);
      Animated.timing(translateX, {
        toValue: -textWidth,
        duration: duration,
        useNativeDriver: true,
        easing: undefined,
      }).start(() => animate());
    };

    animate();
  }, [textWidth, containerWidth, speed, translateX]);

  return (
    <View
      style={styles.container}
      onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && (
        <Animated.Text
          onLayout={e => setTextWidth(e.nativeEvent.layout.width)}
          style={[styles.text, { transform: [{ translateX }] }]}
          numberOfLines={1}
          ellipsizeMode="clip"
        >
          {text}
        </Animated.Text>
      )}
    </View>
  );
};

export default Marquee;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    height: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
