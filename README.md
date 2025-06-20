# 🏋️ Iconik Pro Gym - App de Gestión de Gimnasio

Una aplicación móvil completa desarrollada con **React Native** y **Expo** para la gestión integral de gimnasios, con autenticación de usuarios, gestión de ejercicios, rutinas personalizadas y seguimiento de progreso.

## 🚀 Características Principales

### 👥 Gestión de Usuarios
- **Autenticación segura** con Firebase Auth
- **Roles diferenciados**: Administradores y Miembros
- **Perfiles personalizados** con información física
- **Gestión de membresías** con fechas de vencimiento

### 💪 Gestión de Ejercicios
- **Catálogo completo** de ejercicios con videos instructivos
- **Filtros avanzados** por grupo muscular y equipo
- **Subida de contenido** por administradores
- **Información detallada** con instrucciones y consejos

### 📋 Rutinas Personalizadas
- **Creación de rutinas** personalizadas
- **Seguimiento de entrenamientos** en tiempo real
- **Progreso visual** con gráficos y estadísticas
- **Historial completo** de entrenamientos

### 🎨 Interfaz Moderna
- **Diseño responsive** y adaptable
- **Tema oscuro/claro** automático
- **Navegación intuitiva** con React Navigation
- **Animaciones fluidas** y transiciones suaves

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React Native + Expo
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Estado Global**: Redux Toolkit
- **Navegación**: React Navigation v6
- **UI/UX**: Componentes personalizados
- **Lenguaje**: TypeScript
- **Base de datos**: Firestore (NoSQL)

## 📱 Capturas de Pantalla

*[Aquí puedes agregar capturas de pantalla de tu app]*

## 🔥 Configuración de Firebase

Este proyecto utiliza **Firebase real** para todas las funcionalidades:

- **Authentication**: Email/Password
- **Firestore**: Base de datos en tiempo real
- **Storage**: Almacenamiento de archivos multimedia
- **Reglas de seguridad**: Configuradas para roles y permisos

### Configuración Requerida

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Configurar Authentication, Firestore y Storage
3. Aplicar reglas de seguridad (ver `FIREBASE_RULES.md`)
4. Crear usuario administrador inicial

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- Expo CLI
- Cuenta de Firebase

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/iconik-pro-gym.git
cd iconik-pro-gym
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar Firebase**
   - Copiar configuración de Firebase a `src/config/firebase.ts`
   - Configurar reglas de Firestore y Storage
   - Crear usuario administrador

4. **Ejecutar la aplicación**
```bash
npm start
# o
expo start
```

5. **Probar en dispositivo**
   - Escanear QR con Expo Go (Android/iOS)
   - O ejecutar en emulador

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── config/             # Configuración (Firebase, etc.)
├── contexts/           # Contextos de React
├── navigation/         # Navegadores y stacks
├── redux/              # Estado global (Redux Toolkit)
├── screens/            # Pantallas de la aplicación
│   ├── admin/         # Pantallas de administrador
│   ├── auth/          # Pantallas de autenticación
│   └── member/        # Pantallas de miembro
├── services/          # Servicios (API, Firebase, etc.)
└── utils/             # Utilidades y helpers
```

## 🔐 Configuración de Seguridad

### Reglas de Firestore
```javascript
// Ver FIREBASE_RULES.md para configuración completa
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas específicas por colección
  }
}
```

### Reglas de Storage
```javascript
// Ver FIREBASE_RULES.md para configuración completa
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Reglas para archivos multimedia
  }
}
```

## 👥 Roles y Permisos

### 🔧 Administrador
- Gestión completa de ejercicios
- Subida de videos e imágenes
- Administración de usuarios
- Acceso a estadísticas globales

### 👤 Miembro
- Visualización de ejercicios
- Creación de rutinas personales
- Seguimiento de progreso
- Gestión de perfil personal

## 🚀 Despliegue

### Para Producción
1. Configurar EAS Build
2. Generar APK/IPA
3. Subir a Google Play/App Store

### Para Desarrollo
```bash
expo start --dev-client
```

## 📊 Estado del Proyecto

- ✅ **Autenticación**: Firebase Auth implementado
- ✅ **Base de datos**: Firestore configurado
- ✅ **Storage**: Firebase Storage activo
- ✅ **Navegación**: React Navigation v6
- ✅ **Estado**: Redux Toolkit
- ✅ **UI/UX**: Componentes modernos
- 🔄 **Testing**: En desarrollo
- 🔄 **CI/CD**: En desarrollo

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- LinkedIn: [Tu LinkedIn](https://linkedin.com/in/tu-perfil)

## 🙏 Agradecimientos

- [Expo](https://expo.dev/) por el framework
- [Firebase](https://firebase.google.com/) por el backend
- [React Navigation](https://reactnavigation.org/) por la navegación
- [Redux Toolkit](https://redux-toolkit.js.org/) por el estado global

---

⭐ **¡Dale una estrella si te gustó el proyecto!** ⭐ 