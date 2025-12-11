const path = require('path');

module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@rnmapbox|react-native-vision-camera|ffmpeg-kit-react-native)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@utils/(.*)$': '<rootDir>/../../packages/utils/$1',
    '^@skatehubba/types$': '<rootDir>/../../packages/types/skate.ts',
    '^@env/(.*)$': '<rootDir>/../../packages/env/$1',
    '^@ui/(.*)$': '<rootDir>/../../packages/ui/$1',
    '^@skatehubba/skate-engine$': '<rootDir>/../../packages/skate-engine/index.ts',
    '^@db/(.*)$': '<rootDir>/../../packages/db/$1',
    '^@types/(.*)$': '<rootDir>/../../packages/types/$1',
    '^@zora/(.*)$': '<rootDir>/../../packages/zora/$1',
    '^@hubba/(.*)$': '<rootDir>/../../packages/hubba-coin/$1',
  },
  rootDir: path.resolve(__dirname),
  roots: ['<rootDir>'],
};
