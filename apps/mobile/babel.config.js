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
            '@ui': '../../packages/ui',
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
