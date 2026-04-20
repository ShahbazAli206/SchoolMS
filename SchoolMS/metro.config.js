const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  resolver: {
    blockList: [
      /node_modules\/.*\/node_modules\/react-native\/.*/,
      /node_modules\/\.react-native-.*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);