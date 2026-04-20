module.exports = ({ config }) => {
  const baseExpo = {
    ...(config || {}),
    name: "Driver Helper App",
    slug: "driverhelperapp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "driverhelperapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      ...((config && config.ios) || {}),
    },

    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.NFC" // ✅ keep NFC
      ],
      package: "com.school2home.driverhelper",
      ...((config && config.android) || {}),
    },

    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
      ...((config && config.web) || {}),
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: { backgroundColor: "#000000" },
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow SchoolToHome to use your location to track your relative distance to the school bus.",
        },
      ],
      "expo-secure-store",
    ],

    extra: {
      apiUrl: "https://apidev.school2home.in",
      eas: {
        projectId: "a2993f5e-4947-4506-8408-145ec51e2f8a",
      },
    },
  };

  return {
    ...baseExpo,

      
    experiments: {
      typedRoutes: true,
      reactCompiler: false,
    },
  };
};