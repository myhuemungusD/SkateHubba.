import 'react-native-gesture-handler/jestSetup';

// Mock Vision Camera (It crashes Jest immediately otherwise)
jest.mock('react-native-vision-camera', () => ({
  Camera: () => null,
  useCameraDevice: () => ({ id: 'mock-device' }),
  useCameraPermission: () => ({ hasPermission: true, requestPermission: jest.fn() }),
}));

// Mock Mapbox (Complex native UI)
// jest.mock('@rnmapbox/maps', () => ({
//   MapView: () => null,
//   Camera: () => null,
//   UserLocation: () => null,
//   setAccessToken: jest.fn(),
// }));

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence the annoying "EventEmitter" warnings in tests
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Mock Firebase
jest.mock('@utils/firebaseClient', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(() => jest.fn()),
  },
  firestore: {},
  storage: {},
}));

// Mock Expo Notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  removeNotificationSubscription: jest.fn(),
  AndroidNotificationPriority: {
    HIGH: 'high',
  },
}));

// Mock Expo AV
jest.mock('expo-av', () => ({
  Video: () => null,
  ResizeMode: {
    CONTAIN: 'contain',
    COVER: 'cover',
    STRETCH: 'stretch',
  },
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});
