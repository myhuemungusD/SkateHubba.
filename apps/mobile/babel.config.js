module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            '@utils': '../../packages/utils',
            '@skatehubba/types': '../../packages/types/skate.ts',
            '@env': '../../packages/env',
            '@ui': '../../packages/ui',
            '@skatehubba/skate-engine': '../../packages/skate-engine/index.ts',
            '@db': '../../packages/db',
            '@types': '../../packages/types',
            '@zora': '../../packages/zora',
            '@hubba': '../../packages/hubba-coin',
          },
        },
      ],
    ],
  };
};
