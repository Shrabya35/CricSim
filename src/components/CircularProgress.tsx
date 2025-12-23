import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
  rating: number;
  size?: number;
  strokeWidth?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  rating,
  size = 56,
  strokeWidth = 6,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (rating / 100) * circumference;

  const safeRating = Math.min(100, Math.max(0, rating));

  let strokeColor = '#09ff63ff';

  if (safeRating > 79) strokeColor = '#05f7ffff';
  else if (safeRating > 69) strokeColor = '#05f7ffff';
  else if (safeRating > 55) strokeColor = '#7ff501ff';
  else if (safeRating > 49) strokeColor = '#facc15';
  else if (safeRating > 24) strokeColor = '#f97316';
  else strokeColor = '#ff2626ff';

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          stroke="#444"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        <Circle
          stroke={strokeColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          rotation="180"
          origin={`${size / 2}, ${size / 2}`}
          transform={`rotate(270 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.ratingTextContainer}>
        <Text style={styles.ratingText}>{safeRating}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ratingTextContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CircularProgress;
