"use client"

import { View, Text, TextInput, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState } from "react"
import { useRouter } from "expo-router"
import { Button } from "../../components/ui/Button"
import { useAuth } from "../../contexts/AuthContext"
import { Ionicons } from "@expo/vector-icons"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      router.replace("/(tabs)")
    } catch (error) {
      Alert.alert("Error", "Credenciales incorrectas")
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
              <Ionicons name="wallet-outline" size={32} color="#ffd166" />
            </View>
            <Text className="text-title text-center">Moentix</Text>
            <Text className="text-secondary-400 text-center">Gestión de gastos elegante</Text>
          </View>

          <View className="space-y-4">
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
              <View style={{ position: 'relative' }}>
                <TextInput
                  className="input-field"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#666666"
                  secureTextEntry={!showPassword}
                  style={{ paddingRight: 40 }}
                />
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#ffd166"
                  style={{ position: 'absolute', right: 10, top: '50%', marginTop: -11 }}
                  onPress={() => setShowPassword((prev) => !prev)}
                />
              </View>
            </View>

            <View style={{ height: 16 }} />

            <Button title="Iniciar Sesión" onPress={handleLogin} loading={loading} variant="primary" />

            <Button
              title="¿No tienes cuenta? Regístrate"
              onPress={() => router.push("/(auth)/register")}
              variant="secondary"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
