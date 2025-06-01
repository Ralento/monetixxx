"use client"

import { View, Text, TouchableOpacity, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "expo-router"

export default function PerfilScreen() {
  const { user, logout } = useAuth()
  const router = useRouter()

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

  return (
    <SafeAreaView className="container">
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="mb-6 mt-4">
          <Text className="text-title">Mi Perfil</Text>
          <Text className="text-body">Gestiona tu cuenta</Text>
        </View>

        {/* User Info Card */}
        <View className="card mb-6 border border-primary-300/30">
          <View className="flex-row items-center">
            <View className="bg-primary-300/20 p-3 rounded-full mr-4">
              <Ionicons name="person-outline" size={24} color="#ffd166" />
            </View>
            <View>
              <Text className="text-title">{user?.nombre || "Usuario"}</Text>
              <Text className="text-body">{user?.email || "usuario@email.com"}</Text>
              <Text className="text-xs text-primary-300 font-medium">Cuenta Activa</Text>
            </View>
          </View>
        </View>

        {/* Balance Info */}
        <View className="card mb-6 border border-primary-300">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-secondary-300 text-xs mb-1">Saldo Actual</Text>
              <Text className="text-primary-300 text-2xl font-bold">${user?.saldo_actual || "0.00"}</Text>
              <Text className="text-secondary-400 text-xs">Última actualización: Hoy</Text>
            </View>
            <View className="bg-primary-300/20 p-2 rounded-full">
              <Ionicons name="wallet-outline" size={24} color="#ffd166" />
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View className="card mb-6">
          <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-secondary-700">
            <View className="flex-row items-center">
              <Ionicons name="settings-outline" size={20} color="#ffd166" />
              <Text className="text-white ml-3">Configuración</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={16} color="#ffd166" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-secondary-700">
            <View className="flex-row items-center">
              <Ionicons name="notifications-outline" size={20} color="#ffd166" />
              <Text className="text-white ml-3">Notificaciones</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={16} color="#ffd166" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-secondary-700">
            <View className="flex-row items-center">
              <Ionicons name="shield-outline" size={20} color="#ffd166" />
              <Text className="text-white ml-3">Privacidad</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={16} color="#ffd166" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center">
              <Ionicons name="help-circle-outline" size={20} color="#ffd166" />
              <Text className="text-white ml-3">Ayuda</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={16} color="#ffd166" />
          </TouchableOpacity>
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
