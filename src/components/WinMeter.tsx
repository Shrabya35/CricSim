import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Line, Polygon, G } from 'react-native-svg';

type Props = {
  percent: number;
  size?: number;
};

const WinMeter = ({ percent, size = 200 }: Props) => {
  const radius = size * 0.6;
  const strokeWidth = size * 0.1;
  const cx = size;
  const cy = size;

  const svgWidth = size * 2;
  const svgHeight = size * 1.1;

  const angle = (percent / 100) * 180 - 90;

  const colors = ['#ff2626ff', '#f97316', '#facc15', '#7ff501ff', '#05f7ffff'];

  const segAngle = 180 / 5;
  const segments = [];

  for (let i = 0; i < 5; i++) {
    const start = -90 + segAngle * i;
    const end = start + segAngle;
    segments.push({
      d: describeArc(cx, cy, radius, start, end),
      color: colors[i],
    });
  }

  const arrowLength = radius - strokeWidth * 1.8;
  const headSize = size * 0.12;
  const tipY = cy - arrowLength;

  return (
    <View style={styles.container}>
      <Svg width={svgWidth} height={svgHeight}>
        {segments.map((seg, i) => (
          <Path
            key={i}
            d={seg.d}
            stroke={seg.color}
            strokeWidth={strokeWidth}
            fill="none"
          />
        ))}

        <G rotation={angle} origin={`${cx},${cy}`}>
          <Line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={tipY + headSize * 0.001}
            stroke="white"
            strokeWidth={strokeWidth * 0.35}
            strokeLinecap="round"
          />

          <Polygon
            points={`
              ${cx},${tipY - headSize * 0.4} 
              ${cx - headSize * 0.5},${tipY + headSize * 0.4} 
              ${cx + headSize * 0.5},${tipY + headSize * 0.4}
            `}
            fill="white"
          />
        </G>
      </Svg>
    </View>
  );
};

export default WinMeter;

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
