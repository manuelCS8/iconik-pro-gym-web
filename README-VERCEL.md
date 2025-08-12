# 🚀 Iconik Pro Gym - Deploy en Vercel

## 📋 Pasos para Deploy

### 1. **Subir a GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/iconik-pro-gym.git
git push -u origin main
```

### 2. **Conectar con Vercel**
1. Ve a [vercel.com](https://vercel.com)
2. Crea cuenta o inicia sesión
3. Haz clic en "New Project"
4. Importa tu repositorio de GitHub
5. Configuración automática (Vercel detectará la configuración)

### 3. **Configuración del Proyecto**
- **Framework Preset:** Other
- **Build Command:** `node build-web.js`
- **Output Directory:** `web-build`
- **Install Command:** `npm install`

### 4. **Variables de Entorno (Opcional)**
Si necesitas configurar Firebase:
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`

### 5. **Deploy**
- Haz clic en "Deploy"
- Espera 3-5 minutos
- ¡Tu app estará lista!

## 🌐 URL de tu App
Tu app estará disponible en: `https://tu-proyecto.vercel.app`

## 📱 Funcionalidades Web
- ✅ Autenticación con Firebase
- ✅ Gestión de usuarios (Admin/Member)
- ✅ Rutinas y ejercicios
- ✅ Perfil de usuario
- ⚠️ Nutrición (limitada sin SQLite)
- ⚠️ Historial de entrenamiento (limitado sin SQLite)

## 🔧 Solución de Problemas
Si hay errores de build:
1. Verifica que el repositorio esté público
2. Revisa los logs de build en Vercel
3. Asegúrate de que todas las dependencias estén en package.json
