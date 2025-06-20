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
import { auth, firestore, createUserWithEmailAndPassword, doc, setDoc } from "../../config/firebase";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/authSlice";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../../utils/theme";
import { Ionicons } from '@expo/vector-icons';
import ArtisticBackground from "../../components/ArtisticBackground";

const EmailSignUpScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    weight: "",
    height: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword, age } = formData;

    if (!name.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return false;
    }

    if (!email.trim()) {
      Alert.alert("Error", "El correo electrónico es obligatorio");
      return false;
    }

    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("Error", "Formato de correo inválido");
      return false;
    }

    if (!password || password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return false;
    }

    if (!age || parseInt(age) < 13 || parseInt(age) > 100) {
      Alert.alert("Error", "La edad debe estar entre 13 y 100 años");
      return false;
    }

    if (!acceptTerms) {
      Alert.alert("Error", "Debes aceptar los términos y condiciones");
      return false;
    }

    return true;
  };

  const onSignUpPressed = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { name, email, password, age, weight, height } = formData;

      // 1. Crear usuario en Firebase Auth
      console.log("🔥 Creando usuario en Firebase Auth...");
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email.trim().toLowerCase(), 
        password
      );

      const user = userCredential.user;
      console.log("✅ Usuario creado en Auth:", email);

      // 2. Calcular fecha de fin de membresía (30 días desde hoy)
      const membershipStart = new Date().toISOString();
      const membershipEndDate = new Date();
      membershipEndDate.setDate(membershipEndDate.getDate() + 30);
      const membershipEnd = membershipEndDate.toISOString();

      // 3. Guardar datos del usuario en Firestore
      console.log("💾 Guardando datos en Firestore...");
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: "MEMBER", // Todos los nuevos usuarios son miembros por defecto
        membershipStart,
        membershipEnd,
        age: parseInt(age),
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(firestore, "users", user.uid), userData);
      console.log("✅ Datos guardados en Firestore");

      // 4. Actualizar Redux store
      dispatch(setUser({
        uid: user.uid,
        email: email.trim().toLowerCase(),
        role: "MEMBER",
        membershipEnd,
        name: name.trim(),
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        age: parseInt(age),
      }));

      Alert.alert(
        "✅ ¡Registro exitoso!",
        `Bienvenido ${name}. Tu cuenta ha sido creada y tienes 30 días de membresía gratuita.`,
        [
          {
            text: "Comenzar",
            onPress: () => console.log("Usuario registrado y redirigido")
          }
        ]
      );

    } catch (error: any) {
      console.error("❌ Error al registrar usuario:", error);
      setIsLoading(false);

      let errorMessage = "Error al crear la cuenta";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Este correo ya está registrado. ¿Deseas iniciar sesión?";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La contraseña es muy débil. Usa al menos 6 caracteres.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Formato de correo inválido.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "El registro con email/contraseña no está habilitado.";
      }

      Alert.alert("Error de registro", errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ArtisticBackground />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Cuenta</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            {/* Nombre completo */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre completo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu nombre completo"
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                autoCapitalize="words"
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Correo electrónico *</Text>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@gmail.com"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            {/* Contraseña */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contraseña *</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            {/* Confirmar contraseña */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirmar contraseña *</Text>
              <TextInput
                style={styles.input}
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            {/* Edad */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Edad *</Text>
              <TextInput
                style={styles.input}
                placeholder="Años"
                value={formData.age}
                onChangeText={(value) => updateFormData('age', value)}
                keyboardType="numeric"
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            {/* Datos opcionales */}
            <Text style={styles.sectionTitle}>Datos Opcionales (para seguimiento)</Text>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.inputLabel}>Peso (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Kg"
                  value={formData.weight}
                  onChangeText={(value) => updateFormData('weight', value)}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                  editable={!isLoading}
                />
              </View>

              <View style={[styles.inputContainer, styles.halfInput]}>
                <Text style={styles.inputLabel}>Altura (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Cm"
                  value={formData.height}
                  onChangeText={(value) => updateFormData('height', value)}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                  editable={!isLoading}
                />
              </View>
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
                <Text style={styles.termsText}>Acepto los </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate("Terms" as never)}
                  disabled={isLoading}
                >
                  <Text style={styles.termsLink}>términos y condiciones</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity 
              style={[styles.registerButton, (!acceptTerms || isLoading) && styles.disabledButton]}
              onPress={onSignUpPressed}
              disabled={!acceptTerms || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom Link */}
          <View style={styles.bottomContainer}>
            <Text style={styles.bottomText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate("SignIn" as never)}
              disabled={isLoading}
            >
              <Text style={styles.bottomLink}>Inicia Sesión</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
  inputContainer: {
    marginBottom: 20,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -4,
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 16,
    textAlign: 'center',
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
  registerButton: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  registerButtonText: {
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
});

export default EmailSignUpScreen; 