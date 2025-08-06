import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const CreateUserScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'MEMBER' as 'MEMBER' | 'ADMIN',
    membershipType: 'basic' as 'basic' | 'premium' | 'vip',
    membershipMonths: '1',
    age: '',
    weight: '',
    height: '',
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { displayName, email, password, confirmPassword, age, membershipMonths } = formData;

    if (!displayName.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'El correo electrónico es obligatorio');
      return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Formato de correo inválido');
      return false;
    }

    if (!password || password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    if (!age || parseInt(age) < 13 || parseInt(age) > 100) {
      Alert.alert('Error', 'La edad debe estar entre 13 y 100 años');
      return false;
    }

    if (!membershipMonths || parseInt(membershipMonths) < 1) {
      Alert.alert('Error', 'La duración de la membresía debe ser al menos 1 mes');
      return false;
    }

    return true;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user) {
      Alert.alert('Error', 'No tienes permisos para crear usuarios');
      return;
    }

    setIsLoading(true);

    try {
      const { displayName, email, password, role, membershipType, membershipMonths, age, weight, height } = formData;

      // Calcular fecha de vencimiento de membresía
      const membershipEnd = new Date();
      membershipEnd.setMonth(membershipEnd.getMonth() + parseInt(membershipMonths));

      const userData = {
        email: email.trim().toLowerCase(),
        password,
        displayName: displayName.trim(),
        role: role.toUpperCase(), // <-- Siempre mayúsculas
        membershipType,
        membershipEnd,
        age: parseInt(age),
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
      };

      await authService.createUserByAdmin(user.uid, userData);

      Alert.alert(
        '✅ Usuario Creado',
        `El usuario ${displayName} ha sido creado exitosamente con rol de ${role === 'ADMIN' ? 'administrador' : 'miembro'}.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      
      let errorMessage = 'Error al crear el usuario';
      if (error.message?.includes('Solo los administradores')) {
        errorMessage = 'Solo los administradores pueden crear usuarios';
      } else if (error.message?.includes('límite máximo')) {
        errorMessage = 'Se ha alcanzado el límite máximo de 5 administradores';
      } else if (error.message?.includes('ya está en uso')) {
        errorMessage = 'Este correo ya está registrado';
      } else if (error.message?.includes('débil')) {
        errorMessage = 'La contraseña es muy débil';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, backgroundColor: '#181818' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>Agregar Nuevo Miembro</Text>
        <TouchableOpacity style={{ backgroundColor: '#ff4444', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Guardar</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ backgroundColor: '#181818', borderRadius: 16, padding: 24, marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 }}>Nombre Completo *</Text>
          <TextInput style={{ borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 16, fontSize: 16, backgroundColor: '#222', color: '#fff', marginBottom: 16 }} placeholder="Ej: Juan Pérez" placeholderTextColor="#888" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 }}>Email *</Text>
          <TextInput style={{ borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 16, fontSize: 16, backgroundColor: '#222', color: '#fff', marginBottom: 16 }} placeholder="juan@email.com" placeholderTextColor="#888" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 }}>Rol</Text>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333', alignItems: 'center', backgroundColor: '#ff4444', marginRight: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Miembro</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#333', alignItems: 'center', backgroundColor: '#222' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#ccc' }}>Admin</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 }}>Inicio Membresía</Text>
          <TextInput style={{ borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 16, fontSize: 16, backgroundColor: '#222', color: '#fff', marginBottom: 16 }} placeholder="2025-07-25" placeholderTextColor="#888" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 }}>Fin Membresía</Text>
          <TextInput style={{ borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 16, fontSize: 16, backgroundColor: '#222', color: '#fff', marginBottom: 16 }} placeholder="2025-08-24" placeholderTextColor="#888" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '48%' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 }}>Peso (kg)</Text>
              <TextInput style={{ borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 16, fontSize: 16, backgroundColor: '#222', color: '#fff', marginBottom: 16 }} placeholder="75" placeholderTextColor="#888" />
            </View>
            <View style={{ width: '48%' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 }}>Altura (cm)</Text>
              <TextInput style={{ borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 16, fontSize: 16, backgroundColor: '#222', color: '#fff', marginBottom: 16 }} placeholder="175" placeholderTextColor="#888" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '48%' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 }}>Edad</Text>
              <TextInput style={{ borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 16, fontSize: 16, backgroundColor: '#222', color: '#fff', marginBottom: 16 }} placeholder="28" placeholderTextColor="#888" />
            </View>
            <View style={{ width: '48%' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 }}>Teléfono</Text>
              <TextInput style={{ borderWidth: 1, borderColor: '#333', borderRadius: 8, padding: 16, fontSize: 16, backgroundColor: '#222', color: '#fff', marginBottom: 16 }} placeholder="+1234567890" placeholderTextColor="#888" />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#181818',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#222',
    color: '#fff',
    marginBottom: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    backgroundColor: '#222',
    marginRight: 8,
  },
  roleButtonActive: {
    backgroundColor: '#ff4444',
    borderColor: '#ff4444',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  membershipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  membershipButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  membershipButtonActive: {
    backgroundColor: '#ff4444',
    borderColor: '#ff4444',
  },
  membershipButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ccc',
  },
  membershipButtonTextActive: {
    color: '#fff',
  },
  createButton: {
    backgroundColor: '#ff4444',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateUserScreen; 