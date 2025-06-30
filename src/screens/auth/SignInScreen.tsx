import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/authSlice";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../../utils/theme";
import { Ionicons } from '@expo/vector-icons';
import ArtisticBackground from "../../components/ArtisticBackground";

const SignInScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const onSignInPressed = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Ingresa correo y contraseña.");
      return;
    }

    setIsLoading(true);
    const emailTrimmed = email.trim().toLowerCase();
    
    try {
      // ✅ 1. Verificar credenciales demo FIRST
      if (emailTrimmed === "admin@iconik.com" && password === "admin123") {
        console.log("✅ Login ADMIN demo exitoso");
        dispatch(setUser({
          uid: "admin-iconik-2024",
          email: "admin@iconik.com",
          role: "ADMIN",
          membershipEnd: "2025-12-31",
          name: "Administrador",
          weight: 80,
          height: 180,
          age: 30,
        }));
        Alert.alert("✅ Bienvenido Admin", "Acceso a panel de administración");
        setIsLoading(false);
        return;
      }
      
      if (emailTrimmed === "member@iconik.com" && password === "member123") {
        console.log("✅ Login MEMBER demo exitoso");
        dispatch(setUser({
          uid: "member-iconik-2024",
          email: "member@iconik.com",
          role: "MEMBER",
          membershipEnd: "2024-12-31",
          name: "Juan Pérez",
          weight: 75,
          height: 175,
          age: 28,
        }));
        Alert.alert("✅ Bienvenido Juan", "¡Listo para entrenar!");
        setIsLoading(false);
        return;
      }
      // Si no es demo, muestra error
      Alert.alert("Error", "Solo están habilitadas las credenciales demo.");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Ocurrió un error inesperado.");
    }
  };

  const onGoogleSignIn = () => {
    Alert.alert("Google Sign-In", "Funcionalidad en desarrollo. Usa credenciales demo.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ArtisticBackground />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image 
            source={require("../../assets/logo.png")} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Inicio de Sesión</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@gmail.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            {/* Terms and Conditions */}
            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
              disabled={isLoading}
            >
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>Aceptar </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate("Terms" as never)}
                  disabled={isLoading}
                >
                  <Text style={styles.termsLink}>términos y Condiciones</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Google Sign In Button */}
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={onGoogleSignIn}
              disabled={isLoading}
            >
              <Image 
                source={{uri: 'https://developers.google.com/identity/images/g-logo.png'}} 
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Iniciar Sesión Con Google</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, (!acceptTerms || isLoading) && styles.disabledButton]}
              onPress={onSignInPressed}
              disabled={!acceptTerms || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom Link */}
          <View style={styles.bottomContainer}>
            <Text style={styles.bottomText}>¿No tienes cuenta? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate("SignUp" as never)}
              disabled={isLoading}
            >
              <Text style={styles.bottomLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>

          {/* Admin Access Section */}
          <View style={styles.adminSection}>
            <Text style={styles.adminTitle}>🛠️ Acceso Administrador</Text>
            <Text style={styles.adminInfo}>admin@iconik.com / admin123</Text>
            <Text style={styles.memberInfo}>👤 Demo Miembro: member@iconik.com / member123</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingBottom: 60,
    position: 'relative',
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 40,
    marginLeft: -30,
  },

  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#ff4444',
    borderColor: '#ff4444',
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  termsText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  termsLink: {
    fontSize: 14,
    color: '#4285F4',
    textDecorationLine: 'underline',
    lineHeight: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottomText: {
    fontSize: 14,
    color: '#666',
  },
  bottomLink: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  adminSection: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  adminTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  adminInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  memberInfo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});

export default SignInScreen; 