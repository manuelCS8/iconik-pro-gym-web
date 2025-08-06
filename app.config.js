import 'dotenv/config';

export default {
  expo: {
    name: "Iconik Pro Gym",
    slug: "iconik-pro-gym",
    version: "1.0.0",
    android: {
      package: "com.iconikprogym.app"
    },
    extra: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      eas: {
        projectId: "53206c60-7c77-467d-8c33-878a04d8d9f2"
      }
    },
  },
}; 