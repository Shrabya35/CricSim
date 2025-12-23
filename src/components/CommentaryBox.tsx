/* eslint-disable react-native/no-inline-styles */
import { Text, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { commentaryString } from '../types/match';

type Props = {
  outcomeString: commentaryString;
};

const CommentaryBox = ({ outcomeString }: Props) => {
  const bgAnim = useRef(new Animated.Value(0)).current;

  const highlightColor =
    outcomeString.result === 'wk'
      ? '#ff0766cb'
      : outcomeString.result === '4' || outcomeString.result === '6'
      ? '#1faa59'
      : '#2f2e2eff';

  const animatedBg = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#2f2e2eff', highlightColor],
  });

  useEffect(() => {
    if (!outcomeString?.result) return;

    bgAnim.setValue(0);

    Animated.sequence([
      Animated.timing(bgAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: false,
      }),
      Animated.timing(bgAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }),
      Animated.timing(bgAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: false,
      }),
      Animated.timing(bgAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  }, [outcomeString.result, bgAnim]);

  return (
    <Animated.View
      style={{
        backgroundColor: animatedBg,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 10,
        marginTop: 5,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 20 }}>
        {outcomeString.commentary}
      </Text>
    </Animated.View>
  );
};

export default CommentaryBox;
