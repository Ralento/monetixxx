"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { GastoService, type EstadisticaCategoria } from "../../services/GastoService"
import { PieChart } from "../../components/charts/PieChart"
import { BarChart } from "../../components/charts/BarChart"

export default function EstadisticasScreen() {
  const { user, statsUpdateFlag, periodoSaldo, setPeriodoSaldo, saldosPorPeriodo } = useAuth()
  const [estadisticas, setEstadisticas] = useState<EstadisticaCategoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gastoMes, setGastoMes] = useState<number>(0)
  const [saldoInicialMes, setSaldoInicialMes] = useState<number | null>(null)
  const [gastosMensuales, setGastosMensuales] = useState<{ labels: string[]; valores: number[] }>({ labels: [], valores: [] })
  const [periodoGrafica, setPeriodoGrafica] = useState<'semanal' | 'mensual' | 'anual'>(periodoSaldo)
  const [gastosGrafica, setGastosGrafica] = useState<{ labels: string[]; valores: number[] }>({ labels: [], valores: [] })
  const [loadingGrafica, setLoadingGrafica] = useState(false)

  // Datos de ejemplo para el gráfico de barras
  const mesesData = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    valores: [245.3, 189.75, 207.45, 178.2, 220.1, 198.65],
  }

  useEffect(() => {
    cargarEstadisticas()
    cargarResumen()
    cargarGastosGrafica(periodoSaldo)
  }, [statsUpdateFlag])

  // Cargar gráfica al cambiar periodo
  useEffect(() => {
    cargarGastosGrafica(periodoSaldo)
  }, [periodoSaldo, user])

  // Sincroniza periodoGrafica con periodoSaldo global
  useEffect(() => {
    setPeriodoGrafica(periodoSaldo)
  }, [periodoSaldo])

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

  // Nueva función para cargar el resumen del mes
  const cargarResumen = async () => {
    if (!user) return
    try {
      const response = await fetch(`http://192.168.1.76:8000/api/gastos/usuario/${user.id}/resumen`)
      const json = await response.json()
      if (json.success && json.data) {
        const saldoActual = Number(user.saldo_actual) || 0;
        const gastoMes = Number(json.data.gasto_mes_actual) || 0;
        setGastoMes(gastoMes)
        setSaldoInicialMes(saldoActual + gastoMes)
      }
    } catch (err) {
      // No hacer nada
    }
  }

  // Nueva función para cargar los datos de la gráfica dinámica
  const cargarGastosGrafica = async (periodo: 'semanal' | 'mensual' | 'anual') => {
    if (!user) return
    setLoadingGrafica(true)
    try {
      const data = await GastoService.obtenerGastosPorPeriodo(user.id, periodo)
      let labels: string[] = []
      let valores: number[] = []
      if (periodo === 'mensual') {
        labels = data.map((item: any) => item.periodo.slice(5)) // MM
        valores = data.map((item: any) => Number(item.total) || 0)
      } else if (periodo === 'semanal') {
        labels = data.map((item: any) => `Sem ${item.periodo.slice(-2)}`)
        valores = data.map((item: any) => Number(item.total) || 0)
      } else if (periodo === 'anual') {
        labels = data.map((item: any) => item.periodo.slice(0, 4)) // YYYY
        valores = data.map((item: any) => Number(item.total) || 0)
      }
      setGastosGrafica({ labels, valores })
    } catch (err) {
      setGastosGrafica({ labels: [], valores: [] })
    } finally {
      setLoadingGrafica(false)
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

        {/* Barra de selección de periodo */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10, marginTop: -10 }}>
          {['semanal', 'mensual', 'anual'].map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriodoSaldo(p as any)}
              style={{
                backgroundColor: periodoSaldo === p ? '#ffd166' : 'transparent',
                borderRadius: 16,
                paddingVertical: 6,
                paddingHorizontal: 16,
                marginHorizontal: 4,
                borderWidth: 1,
                borderColor: '#ffd166',
              }}
            >
              <Text style={{ color: periodoSaldo === p ? '#23272e' : '#ffd166', fontWeight: 'bold' }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View className="flex-row justify-between mb-6">
          <View className="card flex-1 mr-2 bg-secondary-800 border border-primary-300/30">
            <View className="items-center">
              <Ionicons name="wallet-outline" size={24} color="#ffd166" />
              <Text className="text-primary-300 font-bold text-lg mt-1">
                ${saldosPorPeriodo[periodoSaldo] != null ? Number(saldosPorPeriodo[periodoSaldo]).toFixed(2) : "0.00"}
              </Text>
              <Text className="text-secondary-300 text-xs">Saldo actual</Text>
              {/* Saldo inicial mes */}
              {typeof saldoInicialMes === 'number' && !isNaN(saldoInicialMes) ? (
                <Text className="text-secondary-400 text-xs mt-1">
                  {periodoSaldo === 'semanal'
                    ? 'Saldo inicial semana:'
                    : periodoSaldo === 'anual'
                      ? 'Saldo inicial año:'
                      : 'Saldo inicial mes:'}
                  ${saldosPorPeriodo[periodoSaldo] != null ? Number(saldosPorPeriodo[periodoSaldo]).toFixed(2) : "0.00"}
                  <Text className="text-xs text-secondary-400 ml-1">({periodoSaldo.charAt(0).toUpperCase() + periodoSaldo.slice(1)})</Text>
                </Text>
              ) : null}
            </View>
          </View>

          <View className="card flex-1 ml-2 bg-secondary-800 border border-primary-300/30">
            <View className="items-center">
              <Ionicons name="trending-down-outline" size={24} color="#ffd166" />
              <Text className="text-primary-300 font-bold text-lg mt-1">
                -${gastoMes.toFixed(2)}
              </Text>
              <Text className="text-secondary-300 text-xs">
                {periodoSaldo === 'semanal'
                  ? 'Gastado esta semana'
                  : periodoSaldo === 'anual'
                    ? 'Gastado este año'
                    : 'Gastado este mes'}
              </Text>
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

        {/* Bar Chart dinámica con barra de selección */}
        <View style={{ width: '100%', alignItems: 'center', marginBottom: 24, paddingHorizontal: 0, justifyContent: 'center' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ width: '100%', alignSelf: 'center' }} contentContainerStyle={{ minWidth: 320, maxWidth: 700, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: Math.min(Math.max(320, gastosGrafica.labels.length * 60), 700), backgroundColor: '#1a1a1a', borderRadius: 12, padding: 12, alignSelf: 'center' }}>
              {loadingGrafica ? (
                <ActivityIndicator size="large" color="#ffd166" />
              ) : (
                <BarChart
                  labels={gastosGrafica.labels}
                  data={gastosGrafica.valores}
                  title={`Gastos ${periodoSaldo.charAt(0).toUpperCase() + periodoSaldo.slice(1)}`}
                />
              )}
            </View>
          </ScrollView>
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
                    <Text className="text-white font-medium mr-2">${(Number(item.total) || 0).toFixed(2)}</Text>
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
