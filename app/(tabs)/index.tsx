"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { GastoService, type Gasto } from "../../services/GastoService"
import { useRouter } from "expo-router"
import { NuevoGastoModal } from "../../components/gastos/NuevoGastoModal"

export default function HomeScreen() {
  const { user, updateSaldo, statsUpdateFlag, periodoSaldo, setPeriodoSaldo, saldosPorPeriodo, setSaldoPorPeriodo } = useAuth()
  const router = useRouter()
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [nuevoSaldo, setNuevoSaldo] = useState<string>("")
  const [actualizandoSaldo, setActualizandoSaldo] = useState(false)

  useEffect(() => {
    cargarGastos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsUpdateFlag])

  // Log para verificar el saldo actual
  useEffect(() => {
    console.log('Saldo actual del usuario:', user?.saldo_actual)
  }, [user?.saldo_actual])

  const cargarGastos = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await GastoService.obtenerGastos(user.id)
      setGastos(data.slice(0, 3)) // Solo los 3 más recientes
    } catch (err) {
      console.error("Error cargando gastos:", err)
    } finally {
      setLoading(false)
    }
  }

  const getIconoCategoria = (categoriaId: number) => {
    switch (categoriaId) {
      case 1:
        return { icono: "restaurant-outline", color: "#ffd166", bg: "bg-primary-300/20" }
      case 2:
        return { icono: "car-outline", color: "#ffd166", bg: "bg-primary-300/20" }
      case 3:
        return { icono: "game-controller-outline", color: "#ffd166", bg: "bg-primary-300/20" }
      case 4:
        return { icono: "medical-outline", color: "#ffd166", bg: "bg-primary-300/20" }
      case 5:
        return { icono: "bag-outline", color: "#ffd166", bg: "bg-primary-300/20" }
      default:
        return { icono: "ellipsis-horizontal-outline", color: "#ffd166", bg: "bg-primary-300/20" }
    }
  }

  const getClaseGasto = (categoriaId: number) => {
    switch (categoriaId) {
      case 1:
        return "gasto-item-food"
      case 2:
        return "gasto-item-transport"
      case 3:
        return "gasto-item-entertainment"
      case 4:
        return "gasto-item-health"
      case 5:
        return "gasto-item-shopping"
      default:
        return "gasto-item-other"
    }
  }

  const formatFecha = (fecha: string) => {
    const hoy = new Date().toISOString().split("T")[0]
    const ayer = new Date(Date.now() - 86400000).toISOString().split("T")[0]

    if (fecha === hoy) return "Hoy"
    if (fecha === ayer) return "Ayer"

    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }

  const handleActualizarSaldo = async () => {
    if (!user) return
    const saldoNum = Number(nuevoSaldo)
    if (nuevoSaldo.trim() === "" || isNaN(saldoNum) || saldoNum < 0) {
      Alert.alert("Saldo no definido correctamente")
      return
    }
    setActualizandoSaldo(true)
    try {
      // Actualizar el saldo_actual del usuario en el backend
      const usuarioActualizado = await GastoService.actualizarSaldoUsuario(user.id, saldoNum)
      // Actualizar el saldo en el contexto
      updateSaldo(usuarioActualizado.saldo_actual)
      setNuevoSaldo("")
      Alert.alert(
        "Saldo actualizado",
        `Tu saldo actual se ha actualizado correctamente a $${saldoNum.toFixed(2)}.`
      )
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el saldo.")
    } finally {
      setActualizandoSaldo(false)
    }
  }

  return (
    <SafeAreaView className="container">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 mt-4">
          <View>
            <Text className="text-title">Hola, {user?.nombre || "Usuario"}</Text>
            <Text className="text-body">Bienvenido a Moentix</Text>
          </View>
        </View>

        {/* Balance Card */}
        <View className="card bg-secondary-800 border border-primary-300 mb-6">
          <View className="flex-row justify-between items-start">
            <View style={{ flex: 1 }}>
              <Text className="text-secondary-300 text-sm mb-1">Saldo Actual</Text>
              <View className="flex-row items-center">
                <Text className="text-primary-300 text-2xl font-bold mr-2">
                  ${user?.saldo_actual ? Number(user.saldo_actual).toFixed(2) : "0.00"}
                </Text>
                <View className="flex-row items-center" style={{ maxWidth: 220, flexWrap: 'wrap', gap: 2 }}>
                  {['semanal', 'mensual', 'anual'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPeriodoSaldo(p as any)}
                      style={{
                        backgroundColor: periodoSaldo === p ? '#ffd166' : 'transparent',
                        borderRadius: 12,
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        marginHorizontal: 1,
                        borderWidth: 1,
                        borderColor: '#ffd166',
                        minWidth: 56,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: periodoSaldo === p ? '#23272e' : '#ffd166', fontWeight: 'bold', fontSize: 12 }}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="flex-row items-center mt-2">
                <TextInput
                  className="bg-secondary-700 text-white px-2 py-1 rounded mr-2"
                  style={{ minWidth: 80 }}
                  placeholder="Nuevo saldo"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  value={nuevoSaldo}
                  onChangeText={setNuevoSaldo}
                  editable={!actualizandoSaldo}
                />
                <TouchableOpacity
                  className="btn-secondary px-4 py-2 rounded-lg font-medium ml-2"
                  onPress={handleActualizarSaldo}
                  disabled={actualizandoSaldo}
                  style={{ minWidth: 120, alignSelf: 'center' }}
                >
                  <Text className="text-primary-300 font-medium text-center w-full">
                    {actualizandoSaldo ? "Guardando..." : "Actualizar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            className="btn-secondary flex-1 items-center"
            onPress={() => router.push("/(tabs)/estadisticas")}
          >
            <Text className="text-primary-300 font-medium">Ver Estadísticas</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Expenses */}
        <View className="card mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-title">Gastos Recientes</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/gastos")}>
              <Text className="text-primary-300">Ver todos</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#ffd166" />
          ) : gastos.length > 0 ? (
            gastos.map((gasto) => {
              const { icono, color, bg } = getIconoCategoria(gasto.categoria_id)
              return (
                <View key={gasto.id} className={`gasto-item ${getClaseGasto(gasto.categoria_id)} mb-2`}>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                      <View className={`${bg} p-2 rounded-full mr-3`}>
                        <Ionicons name={icono as any} size={18} color={color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text className="text-white font-medium">{gasto.descripcion}</Text>
                        <Text className="text-sm text-secondary-400">{formatFecha(gasto.fecha)}</Text>
                      </View>
                    </View>
                    <Text className="text-primary-300 font-bold ml-2" style={{ alignSelf: 'center' }}>-${(Number(gasto.monto) || 0).toFixed(2)}</Text>
                  </View>
                </View>
              )
            })
          ) : (
            <Text className="text-secondary-400 text-center py-4">No hay gastos recientes</Text>
          )}
        </View>

        {/* Tip Card */}
        <View className="card mb-6 bg-secondary-800 border border-primary-300/30">
          <View className="flex-row items-start">
            <View className="bg-primary-300/20 p-2 rounded-full mr-3">
              <Ionicons name="bulb-outline" size={20} color="#ffd166" />
            </View>
            <View style={{ flex: 1 }}>
              <Text className="text-primary-300 font-medium mb-1">Consejo del día</Text>
              <Text className="text-secondary-300 text-sm" style={{ flexWrap: 'wrap', flexShrink: 1, flex: 1, lineHeight: 18 }}>
                Registra tus gastos diariamente para tener un mejor control de tus finanzas.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal para nuevo gasto */}
      <NuevoGastoModal visible={modalVisible} onClose={() => setModalVisible(false)} onSuccess={cargarGastos} />
    </SafeAreaView>
  )
}