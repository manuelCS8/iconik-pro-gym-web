# 🔐 Sistema de Autenticación - Guía Completa

## 📋 Resumen

Este proyecto incluye un sistema de autenticación completo con:
- **Firebase Authentication**
- **Google Sign-In**
- **Context API** para manejo de estado
- **Protección de rutas**
- **Hooks personalizados**

## 🏗️ Arquitectura

### Componentes Principales

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Maneja el estado global de autenticación
   - Proporciona métodos para login/logout
   - Escucha cambios en el estado de Firebase

2. **AuthProvider** (en `App.tsx`)
   - Envuelve la aplicación con el contexto de autenticación
   - Configura Google Sign-In

3. **LoginScreen** (`src/screens/auth/LoginScreen.tsx`)
   - Pantalla de login/registro
   - Soporte para email/password y Google Sign-In

4. **AuthGuard** (`src/components/AuthGuard.tsx`)
   - Componente para proteger rutas
   - Redirección automática según estado de autenticación

5. **Hooks personalizados** (`src/hooks/useAuthState.ts`)
   - `useAuthState` - Hook principal
   - `useRedirectIfAuthenticated` - Para usuarios ya autenticados
   - `useRedirectIfNotAuthenticated` - Para usuarios no autenticados
   - `useProtectedRoute` - Para rutas protegidas

## 🚀 Configuración

### 1. Configurar en App.tsx

```typescript
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}
```

### 2. Configurar Google Sign-In

En Firebase Console:
1. Ve a **Authentication** > **Sign-in method**
2. Habilita **Google**
3. Obtén las credenciales:
   - **Web Client ID**
   - **iOS Client ID**

Actualiza las variables de entorno:
```env
REACT_APP_GOOGLE_WEB_CLIENT_ID=tu_web_client_id
REACT_APP_GOOGLE_IOS_CLIENT_ID=tu_ios_client_id
```

## 📱 Uso en Componentes

### Hook Principal

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { 
    user, 
    loading, 
    isAuthenticated, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    signOut 
  } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View>
      {isAuthenticated ? (
        <Text>Bienvenido, {user?.email}</Text>
      ) : (
        <Text>Por favor inicia sesión</Text>
      )}
    </View>
  );
};
```

### Protección de Rutas

```typescript
import AuthGuard from '../components/AuthGuard';
import LoginScreen from '../screens/auth/LoginScreen';

const ProtectedScreen = () => {
  return (
    <AuthGuard 
      requireAuth={true} 
      fallback={<LoginScreen />}
    >
      <View>
        <Text>Contenido protegido</Text>
      </View>
    </AuthGuard>
  );
};
```

### Hooks de Redirección

```typescript
import { useRedirectIfAuthenticated, useRedirectIfNotAuthenticated } from '../hooks/useAuthState';

// Redirigir usuarios autenticados
const LoginScreen = () => {
  useRedirectIfAuthenticated('Home');
  // ... resto del componente
};

// Redirigir usuarios no autenticados
const HomeScreen = () => {
  useRedirectIfNotAuthenticated('Login');
  // ... resto del componente
};

// Proteger ruta
const ProfileScreen = () => {
  const { user, loading } = useProtectedRoute();
  // ... resto del componente
};
```

## 🔐 Métodos de Autenticación

### Email/Password

```typescript
const { signInWithEmail, signUpWithEmail } = useAuth();

// Iniciar sesión
try {
  await signInWithEmail('user@example.com', 'password123');
} catch (error) {
  console.error('Error:', error.message);
}

// Registrarse
try {
  await signUpWithEmail('newuser@example.com', 'password123');
} catch (error) {
  console.error('Error:', error.message);
}
```

### Google Sign-In

```typescript
const { signInWithGoogle } = useAuth();

try {
  await signInWithGoogle();
} catch (error) {
  console.error('Error:', error.message);
}
```

### Cerrar Sesión

```typescript
const { signOut } = useAuth();

try {
  await signOut();
} catch (error) {
  console.error('Error:', error.message);
}
```

## 🎯 Estados de Autenticación

### Estados Disponibles

1. **loading**: `boolean` - Verificando estado de autenticación
2. **user**: `User | null` - Usuario actual de Firebase
3. **isAuthenticated**: `boolean` - Si el usuario está autenticado

### Flujo de Estados

```
App Inicia → loading: true → Verificar Firebase → loading: false
                                    ↓
                              user: User | null
                                    ↓
                            isAuthenticated: boolean
```

## 🛡️ Manejo de Errores

### Errores Comunes

```typescript
// Email/Password
'auth/user-not-found' → 'Usuario no encontrado'
'auth/wrong-password' → 'Contraseña incorrecta'
'auth/invalid-email' → 'Email inválido'
'auth/email-already-in-use' → 'El email ya está en uso'
'auth/weak-password' → 'La contraseña es muy débil'

// Google Sign-In
statusCodes.SIGN_IN_CANCELLED → 'Usuario canceló el login'
statusCodes.IN_PROGRESS → 'Login en progreso'
statusCodes.PLAY_SERVICES_NOT_AVAILABLE → 'Google Play Services no disponible'
```

### Ejemplo de Manejo

```typescript
const handleSignIn = async () => {
  try {
    await signInWithEmail(email, password);
  } catch (error: any) {
    let message = 'Error desconocido';
    
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'Usuario no encontrado';
        break;
      case 'auth/wrong-password':
        message = 'Contraseña incorrecta';
        break;
      // ... más casos
    }
    
    Alert.alert('Error', message);
  }
};
```

## 🔄 Integración con Navegación

### Navegación Condicional

```typescript
import { useAuth } from '../contexts/AuthContext';

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AuthenticatedStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};
```

### Redirección Automática

```typescript
const HomeScreen = () => {
  useRedirectIfNotAuthenticated('Login');
  
  return (
    <View>
      <Text>Pantalla principal</Text>
    </View>
  );
};
```

## 🧪 Testing

### Mock del Contexto

```typescript
// __mocks__/AuthContext.tsx
export const useAuth = () => ({
  user: null,
  loading: false,
  isAuthenticated: false,
  signInWithGoogle: jest.fn(),
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  signOut: jest.fn(),
});
```

### Test de Componente

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { AuthProvider } from '../contexts/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

test('should show login form', () => {
  const { getByPlaceholderText } = renderWithAuth(<LoginScreen />);
  expect(getByPlaceholderText('tu@email.com')).toBeTruthy();
});
```

## 🚨 Consideraciones de Seguridad

1. **Variables de entorno**: Usa `.env` para credenciales
2. **Validación**: Valida inputs en el frontend
3. **Reglas de Firebase**: Configura reglas de seguridad apropiadas
4. **Tokens**: Maneja tokens de forma segura
5. **Logout**: Siempre limpia el estado al cerrar sesión

## 📚 Recursos Adicionales

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [React Context API](https://reactjs.org/docs/context.html)
- [React Navigation](https://reactnavigation.org/)

## 🔧 Troubleshooting

### Error: "Google Sign-In not configured"
- Verifica las credenciales en Firebase Console
- Asegúrate de que Google Sign-In esté habilitado

### Error: "Navigation prop is missing"
- Asegúrate de que el componente esté dentro de un NavigationContainer

### Error: "useAuth must be used within an AuthProvider"
- Verifica que el componente esté envuelto en AuthProvider

### Error: "Firebase not initialized"
- Verifica la configuración de Firebase
- Asegúrate de que las credenciales sean correctas 