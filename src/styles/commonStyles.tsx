import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242424ff',
  },
  titleContainer: {
    width: '50%',
    alignItems: 'center',
    backgroundColor: '#333333ff',
    justifyContent: 'center',
    padding: 10,
  },
  titleText: {
    color: '#fff',
    fontSize: 20,
  },
  backButton: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
    backgroundColor: '#ff0766cb',
    padding: 15,
  },
  backButoonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
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
  modalBox: {
    width: '100%',
    backgroundColor: '#1d1d1dff',
    elevation: 10,
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
