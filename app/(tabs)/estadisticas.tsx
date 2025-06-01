"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { GastoService, type EstadisticaCategoria } from "../../services/GastoService"
import { PieChart } from "../../components/charts/PieChart"
import { BarChart } from "../../components/charts/BarChart"

export default function EstadisticasScreen() {
  const { user } = useAuth()
  const [estadisticas, setEstadisticas] = useState<EstadisticaCategoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Datos de ejemplo para el gráfico de barras
  const mesesData = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    valores: [245.3, 189.75, 207.45, 178.2, 220.1, 198.65],
  }

  useEffect(() => {
    cargarEstadisticas()
  }, [])

  const cargarEstadisticas = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await GastoService.obtenerGastosPorCategoria(user.id)
      setEstadisticas(data)
      setError(null)
    } catch (err) {
      console.error("Error cargando estadísticas:", err)
      setError("No se pudieron cargar las estadísticas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="container">
      <ScrollView className="flex-1 px-4">
        {/* Header */}
        <View className="mb-6 mt-4">
          <Text className="text-title">Estadísticas</Text>
          <Text className="text-body">Análisis de tus gastos</Text>
        </View>

        {/* Summary Cards */}
        <View className="flex-row justify-between mb-6">
          <View className="card flex-1 mr-2 bg-secondary-800 border border-primary-300/30">
            <View className="items-center">
              <Ionicons name="trending-down-outline" size={24} color="#ffd166" />
              <Text className="text-primary-300 font-bold text-lg mt-1">$207.45</Text>
              <Text className="text-secondary-300 text-xs">Este mes</Text>
            </View>
          </View>

          <View className="card flex-1 ml-2 bg-secondary-800 border border-primary-300/30">
            <View className="items-center">
              <Ionicons name="calendar-outline" size={24} color="#ffd166" />
              <Text className="text-primary-300 font-bold text-lg mt-1">$15.50</Text>
              <Text className="text-secondary-300 text-xs">Promedio diario</Text>
            </View>
          </View>
        </View>

        {/* Pie Chart */}
        {loading ? (
          <View className="card mb-6 items-center justify-center py-10">
            <ActivityIndicator size="large" color="#ffd166" />
            <Text className="text-secondary-400 mt-2">Cargando estadísticas...</Text>
          </View>
        ) : error ? (
          <View className="card mb-6 items-center justify-center py-10">
            <Ionicons name="alert-circle-outline" size={32} color="#ef4444" />
            <Text className="text-danger-600 mt-2">{error}</Text>
          </View>
        ) : (
          <PieChart data={estadisticas} title="Gastos por Categoría" />
        )}

        {/* Bar Chart */}
        <View className="mb-6">
          <BarChart labels={mesesData.labels} data={mesesData.valores} title="Gastos Mensuales" />
        </View>

        {/* Categories Detail */}
        <View className="card mb-6">
          <Text className="text-title mb-4">Detalle por Categoría</Text>

          <View className="space-y-3">
            {loading ? (
              <ActivityIndicator size="small" color="#ffd166" />
            ) : error ? (
              <Text className="text-danger-600">{error}</Text>
            ) : estadisticas.length > 0 ? (
              estadisticas.map((item, index) => (
                <View key={index} className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color || '#ccc' }} />
                    <Text className="text-white">{item.categoria}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-white font-medium mr-2">${item.total !== undefined && item.total !== null ? item.total.toFixed(2) : '0.00'}</Text>
                    <Text className="text-xs text-secondary-400">{item.porcentaje}%</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-secondary-400">No hay datos disponibles</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
