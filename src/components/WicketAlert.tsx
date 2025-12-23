/* eslint-disable react-native/no-inline-styles */
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import React from 'react';
import { BatsmanState } from '../types/match';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  visible: boolean;
  batsman: BatsmanState | null;
  theme: string | undefined;
  onOk: () => void;
};
const WicketAlert = ({ visible, onOk, batsman, theme }: Props) => {
  return (
    <Modal transparent visible={visible} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Wicket!</Text>

          <View
            style={{
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icons name="tshirt-crew" size={100} color={theme} />
            <Text style={{ color: '#fff', fontSize: 16 }}>
              {batsman?.runs} ({batsman?.balls})
            </Text>

            <Text style={{ color: '#fff', fontSize: 18, marginTop: 20 }}>
              {batsman?.player.name}
            </Text>
            <Text style={{ color: '#fff', fontSize: 16, marginBottom: 20 }}>
              {batsman?.outType}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.Btn}
            onPress={onOk}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  box: {
    width: '100%',
    backgroundColor: '#1d1d1dff',
    padding: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  title: {
    fontSize: 22,
    color: '#1faa59',
    fontWeight: 800,
    marginBottom: 30,
    textAlign: 'center',
  },
  Btn: {
    backgroundColor: '#ff0766cb',
    paddingVertical: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default WicketAlert;
