import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, GLOBAL_STYLES } from '../../utils/theme';
import RoleGuard from '../../components/RoleGuard';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member';
  membershipStart?: string;
  membershipEnd?: string;
  weight?: number;
  height?: number;
  age?: number;
  phone?: string;
}

interface NewMemberForm {
  name: string;
  email: string;
  role: 'Admin' | 'Member';
  membershipStart: string;
  membershipEnd: string;
  weight: string;
  height: string;
  age: string;
  phone: string;
}

const ManageMembersScreen: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<'All' | 'Admin' | 'Member'>('All');
  const [filterMembership, setFilterMembership] = useState<'All' | 'Active' | 'Expired'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState<NewMemberForm>({
    name: '',
    email: '',
    role: 'Member',
    membershipStart: new Date().toISOString().split('T')[0],
    membershipEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    weight: '',
    height: '',
    age: '',
    phone: '',
  });

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [members, searchText, filterRole, filterMembership]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      
      // Simular datos de miembros (en producción vendría de Firestore)
      const mockMembers: Member[] = [
        {
          id: "1",
          name: "Carlos Ruiz",
          email: "carlos@email.com",
          role: "Member",
          membershipStart: "2024-01-15",
          membershipEnd: "2024-12-15",
          weight: 75,
          height: 180,
          age: 28,
          phone: "+1234567890",
        },
        {
          id: "2",
          name: "María González",
          email: "maria@email.com",
          role: "Member",
          membershipStart: "2024-02-01",
          membershipEnd: "2024-11-01",
          weight: 62,
          height: 165,
          age: 25,
          phone: "+1234567891",
        },
        {
          id: "3",
          name: "Admin Usuario",
          email: "admin@iconik.com",
          role: "Admin",
          membershipStart: "2023-01-01",
          membershipEnd: "2025-01-01",
          weight: 80,
          height: 175,
          age: 35,
          phone: "+1234567892",
        },
        {
          id: "4",
          name: "Ana Silva",
          email: "ana@email.com",
          role: "Member",
          membershipStart: "2024-03-01",
          membershipEnd: "2024-09-01", // Expirada
          weight: 58,
          height: 170,
          age: 30,
          phone: "+1234567893",
        },
        {
          id: "5",
          name: "Juan Pérez",
          email: "juan@email.com",
          role: "Member",
          membershipStart: "2024-06-01",
          membershipEnd: "2025-06-01",
          weight: 85,
          height: 185,
          age: 32,
          phone: "+1234567894",
        },
      ];

      setMembers(mockMembers);
      console.log(`✅ Cargados ${mockMembers.length} miembros`);

    } catch (error) {
      console.error("Error loading members:", error);
      Alert.alert("Error", "No se pudieron cargar los miembros");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...members];

    // Filtro por texto de búsqueda
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(search) ||
        member.email.toLowerCase().includes(search)
      );
    }

    // Filtro por rol
    if (filterRole !== 'All') {
      filtered = filtered.filter(member => member.role === filterRole);
    }

    // Filtro por estado de membresía
    if (filterMembership !== 'All') {
      const today = new Date();
      filtered = filtered.filter(member => {
        if (!member.membershipEnd) return filterMembership === 'Expired';
        const endDate = new Date(member.membershipEnd);
        const isActive = endDate > today;
        return filterMembership === 'Active' ? isActive : !isActive;
      });
    }

    setFilteredMembers(filtered);
  };

  const getMembershipStatus = (membershipEnd?: string) => {
    if (!membershipEnd) return { text: "Sin membresía", color: COLORS.error };
    
    const today = new Date();
    const endDate = new Date(membershipEnd);
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) return { text: "Expirada", color: COLORS.error };
    if (daysLeft <= 7) return { text: `${daysLeft} días`, color: COLORS.warning };
    if (daysLeft <= 30) return { text: `${daysLeft} días`, color: COLORS.info };
    return { text: "Activa", color: COLORS.success };
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleAddMember = async () => {
    try {
      if (!newMember.name.trim() || !newMember.email.trim()) {
        Alert.alert("Error", "Nombre y email son obligatorios");
        return;
      }

      setIsLoading(true);
      
      // Simular creación de usuario (en producción usaría Firebase Auth)
      const newMemberData: Member = {
        id: `member-${Date.now()}`,
        name: newMember.name.trim(),
        email: newMember.email.trim(),
        role: newMember.role,
        membershipStart: newMember.membershipStart,
        membershipEnd: newMember.membershipEnd,
        weight: parseFloat(newMember.weight) || undefined,
        height: parseFloat(newMember.height) || undefined,
        age: parseInt(newMember.age) || undefined,
        phone: newMember.phone.trim() || undefined,
      };

      // Agregar a la lista local
      setMembers(prev => [...prev, newMemberData]);
      
      // Resetear formulario y cerrar modal
      setNewMember({
        name: '',
        email: '',
        role: 'Member',
        membershipStart: new Date().toISOString().split('T')[0],
        membershipEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weight: '',
        height: '',
        age: '',
        phone: '',
      });
      setShowAddModal(false);

      Alert.alert("Éxito", `Miembro ${newMemberData.name} agregado correctamente`);
      console.log("✅ Nuevo miembro agregado:", newMemberData.name);

    } catch (error) {
      console.error("Error adding member:", error);
      Alert.alert("Error", "No se pudo agregar el miembro");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenewMembership = (member: Member) => {
    Alert.prompt(
      "Renovar Membresía",
      `¿Cuántos meses quieres renovar para ${member.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Renovar",
          onPress: (months) => {
            const monthsNum = parseInt(months || '1');
            if (isNaN(monthsNum) || monthsNum <= 0) {
              Alert.alert("Error", "Ingresa un número válido de meses");
              return;
            }
            
            const newEndDate = new Date();
            newEndDate.setMonth(newEndDate.getMonth() + monthsNum);
            
            const updatedMembers = members.map(m => 
              m.id === member.id 
                ? { ...m, membershipEnd: newEndDate.toISOString().split('T')[0] }
                : m
            );
            setMembers(updatedMembers);
            
            Alert.alert("Éxito", `Membresía renovada por ${monthsNum} meses`);
            console.log(`✅ Membresía renovada: ${member.name} - ${monthsNum} meses`);
          }
        }
      ],
      "plain-text",
      "1"
    );
  };

  const handleDeleteMember = (member: Member) => {
    Alert.alert(
      "Eliminar Miembro",
      `¿Estás seguro de que quieres eliminar a ${member.name}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setMembers(prev => prev.filter(m => m.id !== member.id));
            Alert.alert("Éxito", `${member.name} ha sido eliminado`);
            console.log("❌ Miembro eliminado:", member.name);
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadMembers();
    setIsRefreshing(false);
  };

  const renderMember = ({ item }: { item: Member }) => {
    const status = getMembershipStatus(item.membershipEnd);
    
    return (
      <View style={styles.memberCard}>
        <View style={styles.memberHeader}>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.memberEmail}>{item.email}</Text>
            <View style={styles.memberDetails}>
              <View style={[styles.roleTag, { backgroundColor: item.role === 'Admin' ? COLORS.secondary : COLORS.primary }]}>
                <Text style={styles.roleText}>{item.role}</Text>
              </View>
              <View style={[styles.statusTag, { backgroundColor: status.color }]}>
                <Text style={styles.statusText}>{status.text}</Text>
              </View>
            </View>
            {item.membershipEnd && (
              <Text style={styles.membershipDate}>
                Expira: {formatDate(item.membershipEnd)}
              </Text>
            )}
          </View>
          
          <View style={styles.memberActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: COLORS.success }]}
              onPress={() => handleRenewMembership(item)}
            >
              <Ionicons name="refresh" size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Renovar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: COLORS.error }]}
              onPress={() => handleDeleteMember(item)}
            >
              <Ionicons name="trash" size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {(item.weight || item.height || item.age) && (
          <View style={styles.memberStats}>
            {item.weight && <Text style={styles.statText}>Peso: {item.weight}kg</Text>}
            {item.height && <Text style={styles.statText}>Altura: {item.height}cm</Text>}
            {item.age && <Text style={styles.statText}>Edad: {item.age} años</Text>}
          </View>
        )}
      </View>
    );
  };

  return (
    <RoleGuard 
      requiredRole="ADMIN" 
      fallbackMessage="Solo los administradores pueden gestionar miembros del gimnasio."
    >
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Gestión de Miembros</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="person-add" size={20} color={COLORS.white} />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        </View>
        
        {/* Filtros y búsqueda */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o email..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={COLORS.gray}
            />
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterTags}
          >
            <TouchableOpacity 
              style={[styles.filterTag, filterRole === 'All' && styles.activeFilterTag]}
              onPress={() => setFilterRole('All')}
            >
              <Text style={[styles.filterTagText, filterRole === 'All' && styles.activeFilterTagText]}>
                Todos
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterTag, filterRole === 'Admin' && styles.activeFilterTag]}
              onPress={() => setFilterRole('Admin')}
            >
              <Text style={[styles.filterTagText, filterRole === 'Admin' && styles.activeFilterTagText]}>
                Admins
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterTag, filterRole === 'Member' && styles.activeFilterTag]}
              onPress={() => setFilterRole('Member')}
            >
              <Text style={[styles.filterTagText, filterRole === 'Member' && styles.activeFilterTagText]}>
                Miembros
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterTag, filterMembership === 'Active' && styles.activeFilterTag]}
              onPress={() => setFilterMembership('Active')}
            >
              <Text style={[styles.filterTagText, filterMembership === 'Active' && styles.activeFilterTagText]}>
                Activos
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterTag, filterMembership === 'Expired' && styles.activeFilterTag]}
              onPress={() => setFilterMembership('Expired')}
            >
              <Text style={[styles.filterTagText, filterMembership === 'Expired' && styles.activeFilterTagText]}>
                Expirados
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        <Text style={styles.resultsText}>
          {filteredMembers.length} miembro{filteredMembers.length !== 1 ? 's' : ''} encontrado{filteredMembers.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Lista de miembros */}
      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No se encontraron miembros</Text>
            <Text style={styles.emptySubtext}>
              {searchText ? "Prueba con otros términos de búsqueda" : "Agrega el primer miembro"}
            </Text>
          </View>
        }
      />

      {/* Modal para agregar miembro */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.secondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Agregar Nuevo Miembro</Text>
            <TouchableOpacity 
              onPress={handleAddMember}
              disabled={isLoading}
              style={[styles.saveButton, isLoading && styles.disabledButton]}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? "Guardando..." : "Guardar"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre Completo *</Text>
              <TextInput
                style={styles.formInput}
                value={newMember.name}
                onChangeText={(text) => setNewMember(prev => ({ ...prev, name: text }))}
                placeholder="Ej: Juan Pérez"
                placeholderTextColor={COLORS.gray}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email *</Text>
              <TextInput
                style={styles.formInput}
                value={newMember.email}
                onChangeText={(text) => setNewMember(prev => ({ ...prev, email: text }))}
                placeholder="juan@email.com"
                placeholderTextColor={COLORS.gray}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Rol</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity 
                  style={[styles.roleOption, newMember.role === 'Member' && styles.activeRoleOption]}
                  onPress={() => setNewMember(prev => ({ ...prev, role: 'Member' }))}
                >
                  <Text style={[styles.roleOptionText, newMember.role === 'Member' && styles.activeRoleOptionText]}>
                    Miembro
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleOption, newMember.role === 'Admin' && styles.activeRoleOption]}
                  onPress={() => setNewMember(prev => ({ ...prev, role: 'Admin' }))}
                >
                  <Text style={[styles.roleOptionText, newMember.role === 'Admin' && styles.activeRoleOptionText]}>
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Inicio Membresía</Text>
                <TextInput
                  style={styles.formInput}
                  value={newMember.membershipStart}
                  onChangeText={(text) => setNewMember(prev => ({ ...prev, membershipStart: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.gray}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Fin Membresía</Text>
                <TextInput
                  style={styles.formInput}
                  value={newMember.membershipEnd}
                  onChangeText={(text) => setNewMember(prev => ({ ...prev, membershipEnd: text }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.gray}
                />
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Peso (kg)</Text>
                <TextInput
                  style={styles.formInput}
                  value={newMember.weight}
                  onChangeText={(text) => setNewMember(prev => ({ ...prev, weight: text }))}
                  placeholder="75"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Altura (cm)</Text>
                <TextInput
                  style={styles.formInput}
                  value={newMember.height}
                  onChangeText={(text) => setNewMember(prev => ({ ...prev, height: text }))}
                  placeholder="175"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Edad</Text>
                <TextInput
                  style={styles.formInput}
                  value={newMember.age}
                  onChangeText={(text) => setNewMember(prev => ({ ...prev, age: text }))}
                  placeholder="28"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Teléfono</Text>
                <TextInput
                  style={styles.formInput}
                  value={newMember.phone}
                  onChangeText={(text) => setNewMember(prev => ({ ...prev, phone: text }))}
                  placeholder="+1234567890"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
    </RoleGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    ...GLOBAL_STYLES.container,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  title: {
    fontSize: SIZES.fontLarge,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  filtersContainer: {
    marginBottom: SIZES.margin,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.margin,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginRight: SIZES.padding / 2,
    fontSize: SIZES.fontRegular,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.radius,
  },
  filtersTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SIZES.padding / 2,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterTag: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    backgroundColor: COLORS.grayLight,
    borderRadius: SIZES.radius,
    marginRight: SIZES.padding / 2,
    marginBottom: SIZES.padding / 2,
  },
  activeFilterTag: {
    backgroundColor: COLORS.primary,
  },
  filterTagText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    fontWeight: 'bold',
  },
  activeFilterTagText: {
    color: COLORS.white,
  },
  resultsText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
    marginTop: SIZES.margin / 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: SIZES.padding,
  },
  memberCard: {
    ...GLOBAL_STYLES.card,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: SIZES.fontRegular,
    color: COLORS.gray,
    marginBottom: SIZES.margin / 2,
  },
  memberDetails: {
    flexDirection: 'row',
    marginBottom: SIZES.margin / 2,
  },
  roleTag: {
    paddingHorizontal: SIZES.padding / 2,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: SIZES.margin / 2,
  },
  roleText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  statusTag: {
    paddingHorizontal: SIZES.padding / 2,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  membershipDate: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
  },
  memberActions: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding / 2,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontSmall,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  memberStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.margin / 2,
    paddingTop: SIZES.margin / 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  statText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.gray,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.paddingLarge * 2,
  },
  emptyText: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginTop: SIZES.margin,
  },
  emptySubtext: {
    fontSize: SIZES.fontRegular,
    color: COLORS.gray,
    marginTop: 4,
  },
  modalContainer: {
    ...GLOBAL_STYLES.container,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  modalTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    borderRadius: SIZES.radius,
  },
  disabledButton: {
    backgroundColor: COLORS.gray,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: SIZES.padding,
  },
  formGroup: {
    marginBottom: SIZES.margin,
  },
  formLabel: {
    fontSize: SIZES.fontRegular,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SIZES.margin / 2,
  },
  formInput: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    fontSize: SIZES.fontRegular,
    color: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
  },
  formRow: {
    flexDirection: 'row',
  },
  roleSelector: {
    flexDirection: 'row',
  },
  roleOption: {
    flex: 1,
    paddingVertical: SIZES.padding,
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
    marginRight: SIZES.margin / 2,
    borderRadius: SIZES.radius,
  },
  activeRoleOption: {
    backgroundColor: COLORS.primary,
  },
  roleOptionText: {
    fontSize: SIZES.fontRegular,
    color: COLORS.gray,
    fontWeight: 'bold',
  },
  activeRoleOptionText: {
    color: COLORS.white,
  },
});

export default ManageMembersScreen; 