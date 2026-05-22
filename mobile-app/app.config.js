require('dotenv').config();

module.exports = {
  expo: {
    name: 'Navigation App',
    slug: 'NavigationApp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.anonymous.mobileapp',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        '@rnmapbox/maps',
        { RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOADS_TOKEN },
      ],
    ],
  },
};
