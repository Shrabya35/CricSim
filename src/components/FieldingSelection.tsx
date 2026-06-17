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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { commonStyles } from '../styles/commonStyles';

interface FieldingSelectionProps {
  visible: boolean;
  onOk: (fielding: string) => void;
  over: number;
}

const FIELDING_OPTIONS = [
  {
    name: 'Attacking 1',
    icon: 'sword-cross',
    color: '#ef4444',
    description: 'Maximum catching fielders',
  },
  {
    name: 'Attacking 2',
    icon: 'target',
    color: '#f97316',
    description: 'Looking for wickets',
  },
  {
    name: 'Neutral 1',
    icon: 'scale-balance',
    color: '#3b82f6',
    description: 'Balanced field placement',
  },
  {
    name: 'Neutral 2',
    icon: 'shield-half-full',
    color: '#2563eb',
    description: 'Attack with protection',
  },
  {
    name: 'Defensive 1',
    icon: 'shield',
    color: '#10b981',
    description: 'Protect the boundary',
  },
  {
    name: 'Defensive 2',
    icon: 'shield-lock',
    color: '#059669',
    description: 'Save every possible run',
  },
];

const FieldingSelection: React.FC<FieldingSelectionProps> = ({
  visible,
  over,
  onOk,
}) => {
  const fieldings =
    over < 6
      ? FIELDING_OPTIONS.filter(item => item.name.startsWith('Attacking'))
      : FIELDING_OPTIONS;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={commonStyles.modalOverlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select Field Setting</Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 4 }}
          >
            {fieldings.map(item => (
              <TouchableOpacity
                key={item.name}
                activeOpacity={0.85}
                style={styles.card}
                onPress={() => onOk(item.name)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: item.color },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color="#fff"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>{item.description}</Text>
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={28}
                  color="#888"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 330,
    maxHeight: '75%',
    backgroundColor: '#232323',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#3d3d3d',
    elevation: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.4,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2f2f2f',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444',
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  cardTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  cardSubtitle: {
    color: '#a0a0a0',
    fontSize: 13,
    marginTop: 3,
  },
});

export default FieldingSelection;
