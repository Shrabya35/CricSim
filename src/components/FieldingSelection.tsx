/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { commonStyles } from '../styles/commonStyles';

interface FieldingSelectionProps {
  visible: boolean;
  onOk: (fielding: string) => void;
  over: number;
}

const ATTACKING_FIELDINGS = ['Attacking 1', 'Attacking 2'];

const ALL_FIELDINGS = [
  'Attacking 1',
  'Attacking 2',
  'Neutral 1',
  'Neutral 2',
  'Defensive 1',
  'Defensive 2',
];

const FieldingSelection: React.FC<FieldingSelectionProps> = ({
  visible,
  over,
  onOk,
}) => {
  const allowedFieldings = over < 6 ? ATTACKING_FIELDINGS : ALL_FIELDINGS;

  return (
    <Modal
      transparent
      visible={visible}
      statusBarTranslucent
      animationType="fade"
    >
      <View style={commonStyles.modalOverlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select Fielding</Text>

          <View style={styles.dropdownContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {allowedFieldings.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    index === allowedFieldings.length - 1 && {
                      borderBottomWidth: 0,
                    },
                  ]}
                  onPress={() => onOk(item)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2b2b2b',
    borderRadius: 12,
    padding: 18,
    width: 280,
    elevation: 12,
  },

  title: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.6,
  },

  dropdownContainer: {
    backgroundColor: '#333333ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    overflow: 'hidden',
    maxHeight: 260,
  },

  dropdownItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },

  dropdownItemText: {
    color: '#fff',
    fontSize: 16,
    letterSpacing: 0.4,
  },
});

export default FieldingSelection;
