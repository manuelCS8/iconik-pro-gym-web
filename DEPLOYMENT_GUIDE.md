# 🚀 Guía de Despliegue - Iconik Pro Gym

## 📋 Resumen de Opciones

### 🖥️ **Web App (Admin Dashboard)**
- ✅ Acceso desde navegador
- ✅ No requiere instalación
- ✅ Actualizaciones automáticas
- ✅ Responsive design

### 📱 **Apps Móviles**
- ✅ **Android**: APK directo (15-30 min)
- ✅ **iOS**: IPA para TestFlight (20-40 min)

---

## 🖥️ **Paso 1: Web App (Admin Dashboard)**

### 1.1 Iniciar Web App Local
```bash
# Iniciar servidor de desarrollo web
npm run web
# o
npx expo start --web
```

### 1.2 Generar Build de Producción
```bash
# Generar archivos estáticos
npm run build:web
# o
npx expo export --platform web
```

### 1.3 Desplegar en Firebase Hosting (Recomendado)

#### Instalar Firebase CLI:
```bash
npm install -g firebase-tools
```

#### Inicializar Firebase:
```bash
firebase login
firebase init hosting
```

#### Configurar firebase.json:
```json
{
  "hosting": {
    "public": "web-build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### Desplegar:
```bash
firebase deploy --only hosting
```

### 1.4 Alternativas de Hosting

#### **Vercel (Gratis):**
```bash
npm install -g vercel
vercel
```

#### **Netlify (Gratis):**
```bash
npm install -g netlify-cli
netlify deploy
```

#### **GitHub Pages:**
```bash
# Configurar en GitHub Actions
# Subir web-build a gh-pages branch
```

---

## 📱 **Paso 2: Apps Móviles**

### 2.1 Configurar EAS (Ya hecho)
```bash
# Verificar configuración
cat eas.json
```

### 2.2 Generar APK Android
```bash
# Build para Android
npm run build:android
# o
eas build --platform android --profile preview
```

**Tiempo estimado:** 15-30 minutos
**Resultado:** APK descargable

### 2.3 Generar IPA iOS
```bash
# Build para iOS
npm run build:ios
# o
eas build --platform ios --profile preview
```

**Tiempo estimado:** 20-40 minutos
**Resultado:** IPA para TestFlight

### 2.4 Distribuir Apps

#### **Android APK:**
1. **Google Drive:**
   - Subir APK a Google Drive
   - Compartir link de descarga
   - Generar QR code para el link

2. **Servidor Web:**
   - Subir APK a tu servidor
   - Crear página de descarga
   - Generar QR code

3. **WhatsApp/Email:**
   - Enviar APK directamente
   - Tamaño: ~20-50 MB

#### **iOS IPA:**
1. **TestFlight (Recomendado):**
   - Requiere Apple Developer Account ($99/año)
   - Subir a App Store Connect
   - Invitar usuarios por email

2. **Enterprise Distribution:**
   - Requiere licencia Enterprise
   - Distribución interna

---

## 🔧 **Paso 3: Configuraciones Avanzadas**

### 3.1 Optimizar para Web

#### **Crear versión web específica del admin:**
```typescript
// src/screens/admin/AdminWebDashboard.tsx
// Versión optimizada para pantallas grandes
```

#### **Configurar PWA:**
```json
// web-build/manifest.json
{
  "name": "Iconik Pro Gym Admin",
  "short_name": "Iconik Admin",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#ff4444"
}
```

### 3.2 Configurar Builds Automáticos

#### **GitHub Actions:**
```yaml
# .github/workflows/build.yml
name: Build and Deploy
on:
  push:
    branches: [main]
jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build:android
```

### 3.3 Monitoreo y Analytics

#### **Firebase Analytics:**
```typescript
// Configurar en app
import analytics from '@react-native-firebase/analytics';
```

#### **Web Analytics:**
```html
<!-- Google Analytics en web -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

---

## 📊 **Paso 4: Monitoreo y Mantenimiento**

### 4.1 Verificar Funcionamiento

#### **Web App:**
- ✅ Probar en diferentes navegadores
- ✅ Verificar responsive design
- ✅ Testear funcionalidades admin

#### **Apps Móviles:**
- ✅ Instalar APK en dispositivos Android
- ✅ Probar en TestFlight (iOS)
- ✅ Verificar todas las funcionalidades

### 4.2 Actualizaciones

#### **Web App:**
```bash
# Actualizar código
git pull origin main
npm run build:web
firebase deploy --only hosting
```

#### **Apps Móviles:**
```bash
# Actualizar versión en app.json
# Generar nuevos builds
npm run build:android
npm run build:ios
```

### 4.3 Backup y Seguridad

#### **Firebase:**
- ✅ Configurar backups automáticos
- ✅ Revisar reglas de seguridad
- ✅ Monitorear uso y costos

#### **Código:**
- ✅ Backup en GitHub
- ✅ Documentar cambios
- ✅ Versionado semántico

---

## 🎯 **Comandos Rápidos**

### **Desarrollo:**
```bash
# Web app
npm run web

# Apps móviles
npm start
```

### **Build:**
```bash
# Web
npm run build:web

# Android
npm run build:android

# iOS
npm run build:ios

# Todo
npm run build:all
```

### **Despliegue:**
```bash
# Web
firebase deploy --only hosting

# Verificar builds
eas build:list
```

---

## 📞 **Soporte y Troubleshooting**

### **Problemas Comunes:**

1. **Web app no carga:**
   - Verificar configuración webpack
   - Revisar errores en consola
   - Limpiar cache: `npx expo start --clear`

2. **Build falla:**
   - Verificar eas.json
   - Revisar logs de EAS
   - Actualizar dependencias

3. **APK no instala:**
   - Verificar permisos de instalación
   - Comprobar compatibilidad Android
   - Firmar APK correctamente

### **Recursos Útiles:**
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Expo Web](https://docs.expo.dev/guides/web/)

---

## ✅ **Checklist de Despliegue**

### **Web App:**
- [ ] Configurar webpack
- [ ] Probar localmente
- [ ] Generar build de producción
- [ ] Configurar hosting
- [ ] Desplegar
- [ ] Probar en producción

### **Android:**
- [ ] Configurar EAS
- [ ] Generar APK
- [ ] Probar en dispositivos
- [ ] Distribuir APK
- [ ] Configurar actualizaciones

### **iOS:**
- [ ] Configurar Apple Developer
- [ ] Generar IPA
- [ ] Subir a TestFlight
- [ ] Invitar usuarios
- [ ] Monitorear feedback

---

**¡Tu app estará lista para producción! 🚀**
