module.exports = ({ config }) => {
  const googleMapsKey =
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_ANDROID_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_IOS_API_KEY?.trim() ||
    "AIzaSyAnjJcugrzeD5rNrj5WFwLAV6wUTrF_Ag4";

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
      infoPlist: {
        ...(((config && config.ios) || {}).infoPlist || {}),
        UIBackgroundModes: ["location"],
      },
      config: {
        ...(((config && config.ios) || {}).config || {}),
        googleMapsApiKey:
          process.env.GOOGLE_MAPS_IOS_API_KEY?.trim() ||
          process.env.GOOGLE_MAPS_API_KEY?.trim() ||
          googleMapsKey,
      },
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
        "android.permission.ACCESS_BACKGROUND_LOCATION",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_LOCATION",
        "android.permission.IGNORE_BATTERY_OPTIMIZATIONS",
        "android.permission.WAKE_LOCK",
        "android.permission.NFC",
      ],
      package: "com.school2home.driverhelper",
      ...((config && config.android) || {}),
      config: {
        ...(((config && config.android) || {}).config || {}),
        googleMaps: {
          ...((((config && config.android) || {}).config || {}).googleMaps || {}),
          apiKey:
            process.env.GOOGLE_MAPS_ANDROID_API_KEY?.trim() ||
            process.env.GOOGLE_MAPS_API_KEY?.trim() ||
            googleMapsKey,
        },
      },
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
            "SchoolToHome needs your location in the background so parents can track the bus while this app is minimised.",
          locationAlwaysPermission:
            "SchoolToHome needs your location in the background so parents can track the bus while this app is minimised.",
          locationWhenInUsePermission:
            "SchoolToHome needs your location to report the bus position during an active trip.",
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true,
        },
      ],
      "expo-task-manager",
      "expo-secure-store",
      [
        "expo-notifications",
        {
          icon: "./assets/images/icon.png",
          color: "#0F172A",
          sounds: [],
        },
      ],
    ],

    extra: {
      apiUrl: "https://apidev.school2home.in",
      // apiUrl: "http://192.168.72.162:8080",
      eas: {
        projectId: "a2993f5e-4947-4506-8408-145ec51e2f8a",
      },
      // Used by client-side Directions API requests (restricted key recommended).
      googleMapsApiKey: googleMapsKey,
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

