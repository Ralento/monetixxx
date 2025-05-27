import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { AuthProvider } from "../contexts/AuthContext"
import { SafeAreaProvider } from "react-native-safe-area-context"

// Importar estilos globales de NativeWind
import "../global.css"

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#1a1a1a" }, // Fondo negro
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" backgroundColor="#1a1a1a" />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
