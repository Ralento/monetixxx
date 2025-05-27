"use client"

import { View, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "../components/ui/Button"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="container">
      <View className="flex-1 justify-center items-center px-6">
        <View className="card w-full max-w-sm border border-primary-300/50">
          <View className="items-center mb-8">
            <View className="bg-primary-300/20 p-6 rounded-full mb-4">
              <Ionicons name="wallet-outline" size={48} color="#ffd166" />
            </View>
            <Text className="text-primary-300 text-3xl font-bold mb-2">Moentix</Text>
            <Text className="text-secondary-300 text-center">Gestiona tus gastos con estilo</Text>
          </View>

          <View className="space-y-4">
            <Button title="Iniciar Sesión" onPress={() => router.push("/(auth)/login")} variant="primary" />
            <Button title="Registrarse" onPress={() => router.push("/(auth)/register")} variant="secondary" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
