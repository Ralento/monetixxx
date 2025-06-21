"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, LayoutAnimation, Platform, UIManager } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { GastoService, type Gasto } from "../../services/GastoService"
import { NuevoGastoModal } from "../../components/gastos/NuevoGastoModal"

// Habilitar animaciones en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function GastosScreen() {
  const { user, updateSaldo, triggerStatsUpdate } = useAuth()
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState<number | null>(null)
  const [categoriaExpandida, setCategoriaExpandida] = useState<number | null>(null)
  const [categorias, setCategorias] = useState<any[]>([])
  const [todosExpandido, setTodosExpandido] = useState(false)

  useEffect(() => {
    cargarGastos()
    cargarCategorias()
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

  const cargarCategorias = async () => {
    try {
      const data = await GastoService.obtenerCategorias()
      setCategorias(data)
    } catch (err) {
      setCategorias([])
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
            const { usuario } = await GastoService.eliminarGasto(id)
            await updateSaldo(usuario.saldo_actual)
            cargarGastos() // Recargar la lista
            triggerStatsUpdate() // Notificar globalmente
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

  // Agrupar gastos por categoría
  const gastosPorCategoria: { [key: number]: Gasto[] } = {}
  gastos.forEach((g) => {
    if (!gastosPorCategoria[g.categoria_id]) gastosPorCategoria[g.categoria_id] = []
    gastosPorCategoria[g.categoria_id].push(g)
  })

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

        {/* Lista de categorías y gastos */}
        <View className="mb-6">
          <Text className="text-title mb-4">Gastos por Categoría</Text>

          {/* Apartado TODOS */}
          <View className="mb-2">
            <TouchableOpacity
              className="flex-row items-center px-4 py-3 bg-secondary-800 rounded-lg border border-primary-300/30"
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                setTodosExpandido(!todosExpandido)
                setCategoriaExpandida(null)
              }}
            >
              <Ionicons name="apps-outline" size={22} color="#ffd166" style={{ marginRight: 12 }} />
              <Text className="text-white font-medium text-lg flex-1">Todos</Text>
              <Ionicons name={todosExpandido ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#ffd166" />
            </TouchableOpacity>
            {todosExpandido && (
              <View className="bg-secondary-900 rounded-b-lg px-4 py-2 mt-1">
                {gastos.length === 0 ? (
                  <Text className="text-secondary-400 text-center py-2">No hay gastos registrados</Text>
                ) : (
                  gastos.map((gasto) => {
                    const cat = categorias.find((c) => c.id === gasto.categoria_id)
                    return (
                      <View key={gasto.id} className="flex-row items-center py-2 border-b border-secondary-700 last:border-b-0">
                        <Ionicons name={cat?.icono as any} size={18} color={cat?.color || "#ffd166"} style={{ marginRight: 10 }} />
                        <View className="flex-1">
                          <Text className="text-white font-medium">{gasto.descripcion}</Text>
                          <Text className="text-xs text-secondary-400">{formatFecha(gasto.fecha)} - {cat?.nombre}</Text>
                        </View>
                        <Text className="text-primary-300 font-bold ml-2">-${(Number(gasto.monto) || 0).toFixed(2)}</Text>
                        <TouchableOpacity onPress={() => handleEliminarGasto(gasto.id)} className="ml-2">
                          <Ionicons name="trash-outline" size={18} color="#999999" />
                        </TouchableOpacity>
                      </View>
                    )
                  })
                )}
              </View>
            )}
          </View>

          {/* Apartados por categoría */}
          {categorias.map((cat) => {
            const gastosCat = gastosPorCategoria[cat.id] || []
            const expandida = categoriaExpandida === cat.id
            return (
              <View key={cat.id} className="mb-2">
                <TouchableOpacity
                  className="flex-row items-center px-4 py-3 bg-secondary-800 rounded-lg border border-primary-300/30"
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
                    setCategoriaExpandida(expandida ? null : cat.id)
                  }}
                >
                  <Ionicons name={cat.icono as any} size={22} color={cat.color || "#ffd166"} style={{ marginRight: 12 }} />
                  <Text className="text-white font-medium text-lg flex-1">{cat.nombre}</Text>
                  <Ionicons name={expandida ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#ffd166" />
                </TouchableOpacity>
                {expandida && (
                  <View className="bg-secondary-900 rounded-b-lg px-4 py-2 mt-1">
                    {gastosCat.length === 0 ? (
                      <Text className="text-secondary-400 text-center py-2">No hay gastos en esta categoría</Text>
                    ) : (
                      gastosCat.map((gasto) => (
                        <View key={gasto.id} className="flex-row justify-between items-center py-2 border-b border-secondary-700 last:border-b-0">
                          <View className="flex-1">
                            <Text className="text-white font-medium">{gasto.descripcion}</Text>
                            <Text className="text-xs text-secondary-400">{formatFecha(gasto.fecha)}</Text>
                          </View>
                          <Text className="text-primary-300 font-bold ml-2">-${(Number(gasto.monto) || 0).toFixed(2)}</Text>
                          <TouchableOpacity onPress={() => handleEliminarGasto(gasto.id)} className="ml-2">
                            <Ionicons name="trash-outline" size={18} color="#999999" />
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            )
          })}
        </View>

        {/* Modal para nuevo gasto */}
        <NuevoGastoModal visible={modalVisible} onClose={() => setModalVisible(false)} onSuccess={cargarGastos} />
      </View>
    </SafeAreaView>
  )
}
