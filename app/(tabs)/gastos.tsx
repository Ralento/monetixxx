"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { GastoService, type Gasto } from "../../services/GastoService"
import { NuevoGastoModal } from "../../components/gastos/NuevoGastoModal"

export default function GastosScreen() {
  const { user } = useAuth()
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState<number | null>(null)

  useEffect(() => {
    cargarGastos()
  }, [])

  const cargarGastos = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await GastoService.obtenerGastos(user.id)
      setGastos(data)
      setError(null)
    } catch (err) {
      console.error("Error cargando gastos:", err)
      setError("No se pudieron cargar los gastos")
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarGasto = async (id: number) => {
    Alert.alert("Eliminar Gasto", "¿Estás seguro que deseas eliminar este gasto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await GastoService.eliminarGasto(id)
            cargarGastos() // Recargar la lista
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar el gasto")
          }
        },
      },
    ])
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

  const gastosFiltrados = filtroCategoria ? gastos.filter((g) => g.categoria_id === filtroCategoria) : gastos

  return (
    <SafeAreaView className="container">
      <View className="flex-1 px-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6 mt-4">
          <Text className="text-title">Mis Gastos</Text>
          <TouchableOpacity className="btn-primary" onPress={() => setModalVisible(true)}>
            <Text className="text-secondary-900 font-medium">+ Nuevo</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row space-x-2">
            <TouchableOpacity
              className={`px-3 py-1 rounded-full ${filtroCategoria === null ? "bg-primary-300" : "bg-secondary-700"}`}
              onPress={() => setFiltroCategoria(null)}
            >
              <Text className={`font-medium ${filtroCategoria === null ? "text-secondary-900" : "text-white"}`}>
                Todos
              </Text>
            </TouchableOpacity>

            {[1, 2, 3, 4, 5, 6].map((catId) => {
              return (
                <TouchableOpacity
                  key={catId}
                  className={`px-3 py-1 rounded-full ${filtroCategoria === catId ? "bg-primary-300" : "bg-secondary-700"}`}
                  onPress={() => setFiltroCategoria(catId)}
                >
                  <Text className={`font-medium ${filtroCategoria === catId ? "text-secondary-900" : "text-white"}`}>
                    {catId === 1
                      ? "Comida"
                      : catId === 2
                        ? "Transporte"
                        : catId === 3
                          ? "Entretenimiento"
                          : catId === 4
                            ? "Salud"
                            : catId === 5
                              ? "Compras"
                              : "Otros"}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>

        {/* Expense List */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#ffd166" />
            <Text className="text-secondary-400 mt-2">Cargando gastos...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text className="text-danger-600 mt-2">{error}</Text>
          </View>
        ) : gastosFiltrados.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="receipt-outline" size={48} color="#999999" />
            <Text className="text-secondary-400 mt-2">No hay gastos registrados</Text>
          </View>
        ) : (
          <ScrollView className="flex-1">
            {gastosFiltrados.map((gasto) => {
              const { icono, color, bg } = getIconoCategoria(gasto.categoria_id)
              return (
                <View key={gasto.id} className={`gasto-item ${getClaseGasto(gasto.categoria_id)} mb-2`}>
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                      <View className={`${bg} p-2 rounded-full mr-3`}>
                        <Ionicons name={icono as any} size={20} color={color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-medium">{gasto.descripcion}</Text>
                        <Text className="text-sm text-secondary-400">{formatFecha(gasto.fecha)}</Text>
                        <Text className="text-xs text-primary-300">{gasto.categoria_nombre || "Categoría"}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-primary-300 font-bold mr-2">-${gasto.monto.toFixed(2)}</Text>
                      <TouchableOpacity onPress={() => handleEliminarGasto(gasto.id)}>
                        <Ionicons name="trash-outline" size={18} color="#999999" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
            })}
          </ScrollView>
        )}
      </View>

      {/* Modal para nuevo gasto */}
      <NuevoGastoModal visible={modalVisible} onClose={() => setModalVisible(false)} onSuccess={cargarGastos} />
    </SafeAreaView>
  )
}
