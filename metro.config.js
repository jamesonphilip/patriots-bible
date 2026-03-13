const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Treat .kjv as a binary asset (not inlined into JS bundle)
config.resolver.assetExts.push('kjv');

module.exports = config;
