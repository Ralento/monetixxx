"use client"

import { View, Text, TextInput, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState } from "react"
import { useRouter } from "expo-router"
import { Button } from "../../components/ui/Button"
import { useAuth } from "../../contexts/AuthContext"
import { Ionicons } from "@expo/vector-icons"

export default function RegisterScreen() {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleRegister = async () => {
    if (!nombre || !email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    setLoading(true)
    try {
      await register(nombre, email, password)
      router.replace("/(tabs)")
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="container">
      <View className="flex-1 justify-center px-6">
        <View className="card">
          <View className="items-center mb-6">
            <View className="bg-primary-300/20 p-4 rounded-full mb-2">
              <Ionicons name="person-add-outline" size={32} color="#ffd166" />
            </View>
            <Text className="text-title text-center">Crear Cuenta</Text>
            <Text className="text-secondary-400 text-center">Únete a Moentix</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-body mb-1">Nombre</Text>
              <TextInput
                className="input-field"
                value={nombre}
                onChangeText={setNombre}
                placeholder="Tu nombre"
                placeholderTextColor="#666666"
              />
            </View>

            <View>
              <Text className="text-body mb-1">Email</Text>
              <TextInput
                className="input-field"
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                placeholderTextColor="#666666"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className="text-body mb-1">Contraseña</Text>
              <TextInput
                className="input-field"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#666666"
                secureTextEntry
              />
            </View>

            <Button title="Crear Cuenta" onPress={handleRegister} loading={loading} variant="primary" />

            <Button
              title="¿Ya tienes cuenta? Inicia sesión"
              onPress={() => router.push("/(auth)/login")}
              variant="secondary"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
