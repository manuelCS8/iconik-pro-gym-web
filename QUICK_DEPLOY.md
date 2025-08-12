# 🚀 Despliegue Rápido - Iconik Pro Gym

## ⚡ Comandos Rápidos

### 🖥️ **Web App (Admin Dashboard)**
```bash
# Generar web app
npm run deploy:web

# O manualmente:
npm run build:web
```

### 📱 **Android APK**
```bash
# Generar APK
npm run deploy:android

# O manualmente:
npm run build:android
```

### 🍎 **iOS IPA**
```bash
# Generar IPA
npm run deploy:ios

# O manualmente:
npm run build:ios
```

### 🚀 **Todo Junto**
```bash
# Generar web app + APK + IPA
npm run deploy
```

---

## 📋 **Pasos Detallados**

### **1. Web App (5 minutos)**

#### Opción A: Script Automático
```bash
npm run deploy:web
```

#### Opción B: Manual
```bash
# 1. Generar build
npx expo export --platform web

# 2. Desplegar en Firebase (opcional)
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy --only hosting
```

**Resultado:** Web app en `web-build/` o URL de Firebase

---

### **2. Android APK (15-30 minutos)**

#### Opción A: Script Automático
```bash
npm run deploy:android
```

#### Opción B: Manual
```bash
# 1. Generar APK
eas build --platform android --profile preview

# 2. Descargar desde EAS Dashboard
# 3. Distribuir APK
```

**Resultado:** APK descargable desde EAS Dashboard

---

### **3. iOS IPA (20-40 minutos)**

#### Opción A: Script Automático
```bash
npm run deploy:ios
```

#### Opción B: Manual
```bash
# 1. Generar IPA
eas build --platform ios --profile preview

# 2. Subir a TestFlight (requiere Apple Developer)
# 3. Invitar usuarios
```

**Resultado:** IPA para TestFlight

---

## 🎯 **Distribución**

### **Web App:**
- ✅ **Firebase Hosting**: `https://tu-proyecto.web.app`
- ✅ **Vercel**: `https://tu-proyecto.vercel.app`
- ✅ **Netlify**: `https://tu-proyecto.netlify.app`

### **Android APK:**
- ✅ **Google Drive**: Subir y compartir link
- ✅ **WhatsApp/Email**: Enviar archivo directamente
- ✅ **QR Code**: Generar QR para descarga

### **iOS IPA:**
- ✅ **TestFlight**: Distribución oficial
- ✅ **Enterprise**: Distribución interna

---

## ⚠️ **Requisitos Previos**

### **Para Web App:**
- ✅ Node.js instalado
- ✅ Dependencias instaladas (`npm install`)

### **Para Android:**
- ✅ Cuenta de Expo
- ✅ EAS CLI instalado
- ✅ Proyecto configurado

### **Para iOS:**
- ✅ Cuenta de Expo
- ✅ Apple Developer Account ($99/año)
- ✅ EAS CLI instalado

---

## 🔧 **Troubleshooting**

### **Error: "EAS CLI not found"**
```bash
npm install -g eas-cli
```

### **Error: "Webpack config not found"**
```bash
npm install @expo/webpack-config@19.0.1 --legacy-peer-deps
```

### **Error: "Build failed"**
```bash
# Verificar configuración
cat eas.json

# Limpiar cache
npx expo start --clear
```

---

## 📞 **Soporte**

### **Logs de Build:**
- **EAS Dashboard**: https://expo.dev/accounts/[tu-usuario]/projects/[tu-proyecto]/builds

### **Documentación:**
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Expo Web**: https://docs.expo.dev/guides/web/

---

## ✅ **Checklist Final**

- [ ] Web app generada en `web-build/`
- [ ] APK Android disponible en EAS Dashboard
- [ ] IPA iOS disponible en EAS Dashboard
- [ ] Web app desplegada en hosting
- [ ] APK distribuido a usuarios
- [ ] TestFlight configurado (iOS)

---

**¡Listo para producción! 🎉**
