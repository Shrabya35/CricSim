import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

interface CustomAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  onYes: () => void;
  onNo: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onYes,
  onNo,
}) => {
  return (
    <Modal transparent visible={visible} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.box}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.Btn}
              onPress={onYes}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.Btn}
              onPress={onNo}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>No</Text>
            </TouchableOpacity>
          </View>
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
    color: '#ff0766cb',
    fontWeight: 800,
    marginBottom: 30,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 40,
    color: '#fff',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  Btn: {
    backgroundColor: '#ff0766cb',
    paddingVertical: 10,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CustomAlert;
