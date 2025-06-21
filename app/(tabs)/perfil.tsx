"use client"

import { View, Text, TouchableOpacity, Alert, TextInput, Modal } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "expo-router"
import { GastoService } from "../../services/GastoService"
import { useState } from "react"

export default function PerfilScreen() {
  const { user, logout, periodoSaldo, saldosPorPeriodo } = useAuth()
  const router = useRouter()
  const [editVisible, setEditVisible] = useState(false)
  const [editNombre, setEditNombre] = useState(user?.nombre || "")
  const [editEmail, setEditEmail] = useState(user?.email || "")
  const [editLoading, setEditLoading] = useState(false)

  const [passwordVisible, setPasswordVisible] = useState(false)
  const [actualPassword, setActualPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [passwordModal, setPasswordModal] = useState(false)

  const [showActual, setShowActual] = useState(false)
  const [showNueva, setShowNueva] = useState(false)
  const [showRepetir, setShowRepetir] = useState(false)

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          await logout()
          router.replace("/(auth)/login")
        },
      },
    ])
  }

  const handleEdit = async () => {
    setEditLoading(true)
    try {
      await GastoService.actualizarDatosPersonales(user!.id, editNombre, editEmail)
      Alert.alert("Éxito", "Datos actualizados correctamente")
      setEditVisible(false)
      // Opcional: recargar datos del usuario si el contexto lo permite
    } catch (error) {
      Alert.alert("Error", "No se pudieron actualizar los datos")
    } finally {
      setEditLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!actualPassword || !newPassword || !repeatPassword) {
      Alert.alert("Error", "Completa todos los campos")
      return
    }
    if (newPassword !== repeatPassword) {
      Alert.alert("Error", "Las contraseñas nuevas no coinciden")
      return
    }
    setPasswordLoading(true)
    try {
      await GastoService.cambiarContrasena(user!.id, actualPassword, newPassword)
      Alert.alert("Éxito", "Contraseña actualizada correctamente")
      setPasswordModal(false)
      setActualPassword("")
      setNewPassword("")
      setRepeatPassword("")
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "No se pudo cambiar la contraseña")
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <SafeAreaView className="container">
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="mb-2 mt-2">
          <Text className="text-title">Mi Perfil</Text>
          <Text className="text-body">Gestiona tu cuenta</Text>
        </View>

        {/* User Info Card */}
        <View className="card mb-6 border border-primary-300/30" style={{ marginTop: 32 }}>
          <View className="flex-row items-center">
            <View className="bg-primary-300/20 p-3 rounded-full mr-4" style={{ marginTop: -24 }}>
              <Ionicons name="person-outline" size={32} color="#ffd166" />
            </View>
            <View style={{ flex: 1 }}>
              <Text className="text-title">{user?.nombre || "Usuario"}</Text>
              <Text className="text-body">{user?.email || "usuario@email.com"}</Text>
              <Text className="text-xs text-primary-300 font-medium">Cuenta Activa</Text>
            </View>
            <TouchableOpacity onPress={() => {
              if (!user) return;
              setEditNombre(user.nombre)
              setEditEmail(user.email)
              setEditVisible(true)
            }} style={{ marginLeft: 8 }}>
              <Ionicons name="create-outline" size={22} color="#ffd166" />
            </TouchableOpacity>
          </View>
          {/* Botón para cambiar contraseña */}
          <TouchableOpacity className="btn-secondary mt-4" onPress={() => setPasswordModal(true)}>
            <Text className="text-primary-300 font-medium text-center">Cambiar Contraseña</Text>
          </TouchableOpacity>
        </View>

        {/* Modal de edición de datos personales */}
        <Modal visible={editVisible} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <View className="bg-secondary-800 border border-primary-300 rounded-lg p-6 w-full max-w-md" style={{ width: '90%' }}>
              <Text className="text-title mb-4">Editar Información Personal</Text>
              <Text className="text-body mb-1">Nombre</Text>
              <TextInput
                className="input-field mb-3"
                value={editNombre}
                onChangeText={setEditNombre}
                placeholder="Nombre"
                placeholderTextColor="#666"
              />
              <Text className="text-body mb-1">Email</Text>
              <TextInput
                className="input-field mb-3"
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Email"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View className="flex-row justify-end mt-2">
                <TouchableOpacity onPress={() => setEditVisible(false)} className="btn-secondary mr-2">
                  <Text className="text-primary-300 font-medium">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEdit} disabled={editLoading} className="btn-primary">
                  <Text className="text-secondary-900 font-medium">{editLoading ? "Guardando..." : "Guardar"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal para cambiar contraseña */}
        <Modal visible={passwordModal} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <View className="bg-secondary-800 border border-primary-300 rounded-lg p-6 w-full max-w-md" style={{ width: '90%' }}>
              <Text className="text-title mb-4">Cambiar Contraseña</Text>
              <Text className="text-body mb-1">Contraseña Actual</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  className="input-field mb-3"
                  value={actualPassword}
                  onChangeText={setActualPassword}
                  placeholder="Contraseña actual"
                  placeholderTextColor="#666"
                  secureTextEntry={!showActual}
                  style={{ paddingRight: 40 }}
                />
                <Ionicons
                  name={showActual ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#ffd166"
                  style={{ position: 'absolute', right: 10, top: '50%', transform: [{ translateY: -11 }] }}
                  onPress={() => setShowActual((prev) => !prev)}
                />
              </View>
              <Text className="text-body mb-1">Nueva Contraseña</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  className="input-field mb-3"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Nueva contraseña"
                  placeholderTextColor="#666"
                  secureTextEntry={!showNueva}
                  style={{ paddingRight: 40 }}
                />
                <Ionicons
                  name={showNueva ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#ffd166"
                  style={{ position: 'absolute', right: 10, top: '50%', transform: [{ translateY: -11 }] }}
                  onPress={() => setShowNueva((prev) => !prev)}
                />
              </View>
              <Text className="text-body mb-1">Repetir Nueva Contraseña</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  className="input-field mb-3"
                  value={repeatPassword}
                  onChangeText={setRepeatPassword}
                  placeholder="Repetir nueva contraseña"
                  placeholderTextColor="#666"
                  secureTextEntry={!showRepetir}
                  style={{ paddingRight: 40 }}
                />
                <Ionicons
                  name={showRepetir ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#ffd166"
                  style={{ position: 'absolute', right: 10, top: '50%', transform: [{ translateY: -11 }] }}
                  onPress={() => setShowRepetir((prev) => !prev)}
                />
              </View>
              <View className="flex-row justify-end mt-2">
                <TouchableOpacity onPress={() => setPasswordModal(false)} className="btn-secondary mr-2">
                  <Text className="text-primary-300 font-medium">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleChangePassword} disabled={passwordLoading} className="btn-primary">
                  <Text className="text-secondary-900 font-medium">{passwordLoading ? "Guardando..." : "Guardar"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Balance Info */}
        <View className="card mb-6 border border-primary-300">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-secondary-300 text-xs mb-1">Saldo Actual</Text>
              <Text className="text-primary-300 text-2xl font-bold">$
                {saldosPorPeriodo[periodoSaldo] != null ? Number(saldosPorPeriodo[periodoSaldo]).toFixed(2) : "0.00"}
                <Text className="text-xs text-primary-300 ml-4">({periodoSaldo.charAt(0).toUpperCase() + periodoSaldo.slice(1)})</Text>
              </Text>
              <Text className="text-secondary-400 text-xs">Última actualización: Hoy</Text>
            </View>
            <View className="bg-primary-300/20 p-2 rounded-full">
              <Ionicons name="wallet-outline" size={24} color="#ffd166" />
            </View>
          </View>
        </View>

        

        {/* Logout Button */}
        <TouchableOpacity className="btn-danger" onPress={handleLogout}>
          <Text className="text-white font-medium text-center">Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <View className="mt-6 items-center">
          <Text className="text-xs text-secondary-400">Moentix v1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
