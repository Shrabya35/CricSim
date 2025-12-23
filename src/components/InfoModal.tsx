/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { commonStyles } from '../styles/commonStyles';

interface InfoModalProps {
  visible: boolean;
  image: any;
  name: string;
  theme: string;
  onOk: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({
  visible,
  image,
  name,
  theme,
  onOk,
}) => {
  return (
    <Modal transparent visible={visible} statusBarTranslucent>
      <View style={commonStyles.modalOverlay}>
        <View style={commonStyles.modalBox}>
          <View style={styles.top}>
            <View
              style={{
                padding: 10,
                borderRadius: 50,
                backgroundColor: theme,
              }}
            >
              <Image
                source={image}
                style={{
                  width: 80,
                  height: 80,
                }}
              />
            </View>
            <View>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 22,
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {name}
              </Text>
              <Text
                style={{
                  color: '#ff0766cb',
                  fontSize: 16,
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                (Nepal Cricket League)
              </Text>
            </View>
          </View>
          <View style={styles.bottom}>
            <Text style={{ color: '#fff', fontSize: 16 }}>
              This is your team management center. {'\n'}
              {'\n'}
              {'\n'}
              Click on the different buttons for information about your club and
              your league.
            </Text>

            <TouchableOpacity
              style={styles.Btn}
              onPress={onOk}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  top: {
    width: '100%',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  bottom: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 30,
    gap: 50,
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

export default InfoModal;
