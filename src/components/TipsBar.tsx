import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { tips } from '../constants';

const TipsBar = () => {
  const [tip, setTip] = useState<string>('');

  useEffect(() => {
    showRandomTip();
  }, []);

  const showRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * tips.length);
    setTip(tips[randomIndex]);
  };

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.tipText} numberOfLines={3} ellipsizeMode="tail">
          {tip}
        </Text>
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.tipBottomText}>Tip of the day</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={showRandomTip}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Next Tip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 140,
    backgroundColor: '#4f4f4f',
    borderRadius: 10,
    padding: 15,
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  tipText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tipBottomText: {
    color: '#9e9e9e',
  },
  button: {
    backgroundColor: '#ff0766cb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TipsBar;
