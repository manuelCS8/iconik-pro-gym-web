export default {
  expo: {
    name: "Iconik Pro Gym",
    slug: "iconik-pro-gym",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#E31C1F"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    web: {
      bundler: "metro",
      favicon: "./assets/favicon.png"
    },
    platforms: [
      "web"
    ],
    plugins: [
      "@react-native-firebase/app"
    ],
    jsEngine: "jsc",
    extra: {
      eas: {
        projectId: "53206c60-7c77-467d-8c33-878a04d8d9f2"
      }
    }
  }
};
