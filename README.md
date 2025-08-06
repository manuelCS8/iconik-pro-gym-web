# 🏋️ Iconik Pro Gym - App Móvil

Una aplicación móvil completa para gimnasios desarrollada con React Native y Expo, que permite a los administradores gestionar rutinas, ejercicios y miembros, mientras que los usuarios pueden seguir entrenamientos personalizados y calcular su nutrición con IA.

## ✨ Características Principales

### 👥 Gestión de Usuarios
- **Sistema de autenticación** con Firebase Auth
- **Roles diferenciados**: Administradores y Miembros
- **Perfiles personalizados** con información de entrenamiento

### 🏋️ Sistema de Entrenamiento
- **Rutinas del gimnasio**: Creadas por administradores
- **Rutinas personalizadas**: Los usuarios pueden crear sus propias rutinas
- **Ejercicios detallados**: Con videos, imágenes y descripciones
- **Seguimiento de entrenamiento**: Cronómetro, registro de series y progreso
- **Navegación intuitiva**: Entre ejercicios y rutinas

### 🧠 Calculadora de Nutrición con IA
- **Análisis de comidas**: Usando OpenAI GPT-4 Vision
- **Cálculo de calorías**: Basado en la fórmula Mifflin-St Jeor
- **Macros personalizados**: Proteínas, carbohidratos y grasas
- **Objetivos personalizables**: Perder, ganar o mantener peso
- **Límite de uso**: Control de consultas diarias por usuario

### 📱 Interfaz Moderna
- **Diseño oscuro**: Tema elegante y profesional
- **Navegación fluida**: Bottom tabs y stack navigation
- **Componentes reutilizables**: UI consistente en toda la app
- **Responsive**: Optimizada para diferentes tamaños de pantalla

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React Native + Expo
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Estado**: Redux Toolkit
- **Navegación**: React Navigation
- **IA**: OpenAI GPT-4 Vision API
- **Base de datos local**: AsyncStorage (temporal)
- **UI**: Componentes nativos + Iconos Expo

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Expo CLI
- Cuenta de Firebase
- Cuenta de OpenAI (para funcionalidad de nutrición)

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/iconik-pro-gym.git
cd iconik-pro-gym
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Firebase**
   - Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Descargar `google-services.json` (Android) y `GoogleService-Info.plist` (iOS)
   - Colocar los archivos en la raíz del proyecto
   - Configurar las reglas de Firestore (ver `firestore.rules`)

4. **Configurar variables de entorno**
   - Crear archivo `.env` en la raíz
   - Agregar las claves de Firebase y OpenAI

5. **Ejecutar la aplicación**
```bash
npx expo start
```

## 🔧 Configuración de Firebase

### Reglas de Firestore
```javascript
// Ver archivo firestore.rules para reglas completas
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para usuarios, ejercicios, rutinas, etc.
  }
}
```

### Estructura de Datos
- **users**: Información de usuarios y roles
- **exercises**: Ejercicios con videos e imágenes
- **routines**: Rutinas del gimnasio
- **userRoutines**: Rutinas creadas por usuarios
- **temp_meal_logs**: Registros de nutrición (temporal)

## 📱 Funcionalidades por Rol

### 👨‍💼 Administrador
- Gestión de ejercicios y videos
- Creación de rutinas oficiales
- Administración de miembros
- Estadísticas del gimnasio

### 👤 Miembro
- Visualización de rutinas disponibles
- Creación de rutinas personalizadas
- Seguimiento de entrenamientos
- Calculadora de nutrición con IA
- Perfil personal

## 🧠 Funcionalidad de Nutrición

### Características
- **Análisis de imágenes**: Sube fotos de comidas
- **Cálculo automático**: Calorías y macros estimados
- **Objetivos personalizables**: 5 niveles de intensidad
- **Historial**: Registro de comidas diarias
- **Límites de uso**: Control de consultas por día

### Configuración
- **OpenAI API Key**: Requerida para análisis de imágenes
- **Límite diario**: Configurable por usuario
- **Almacenamiento**: Local con sincronización Firebase

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── config/             # Configuración de Firebase
├── contexts/           # Contextos de React
├── hooks/              # Custom hooks
├── navigation/         # Configuración de navegación
├── redux/              # Estado global (Redux)
├── screens/            # Pantallas de la aplicación
│   ├── admin/         # Pantallas de administrador
│   ├── auth/          # Autenticación
│   ├── member/        # Pantallas de miembro
│   └── nutrition/     # Funcionalidad de nutrición
├── services/           # Servicios y APIs
└── utils/              # Utilidades y helpers
```

## 🔐 Seguridad

- **Autenticación**: Firebase Auth con roles
- **Reglas de Firestore**: Acceso controlado por usuario
- **Validación**: Datos verificados en frontend y backend
- **Límites de uso**: Control de consultas de IA

## 📊 Estado del Proyecto

### ✅ Completado
- [x] Sistema de autenticación
- [x] Gestión de ejercicios
- [x] Rutinas del gimnasio
- [x] Rutinas personalizadas
- [x] Sistema de entrenamiento
- [x] Calculadora de nutrición con IA
- [x] Interfaz de usuario
- [x] Navegación completa

### 🚧 En Desarrollo
- [ ] Reportes de progreso
- [ ] Notificaciones push
- [ ] Integración con wearables
- [ ] Exportación de datos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Tu Nombre** - [@tu-twitter](https://twitter.com/tu-twitter)

## 🙏 Agradecimientos

- [Expo](https://expo.dev/) por el framework
- [Firebase](https://firebase.google.com/) por el backend
- [OpenAI](https://openai.com/) por la API de IA
- [React Navigation](https://reactnavigation.org/) por la navegación

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:
- 📧 Email: tu-email@ejemplo.com
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/iconik-pro-gym/issues)
- 📖 Documentación: [Wiki del proyecto](https://github.com/tu-usuario/iconik-pro-gym/wiki)

---

⭐ **¡Dale una estrella al proyecto si te gustó!** 