import React from "react"
import { View, Text, Dimensions, ScrollView } from "react-native"
import { PieChart as RNPieChart } from "react-native-chart-kit"
import type { EstadisticaCategoria } from "../../services/GastoService"

interface PieChartProps {
  data: EstadisticaCategoria[]
  title?: string
}

export function PieChart({ data, title }: PieChartProps) {
  // Colores variados y distinguibles
  const betterColors = [
    "#ffd166", "#ef476f", "#06d6a0", "#118ab2", "#073b4c", "#f8961e", "#43aa8b", "#577590", "#ffb4a2", "#b5838d"
  ]

  // Prepara los datos para la gráfica
  const chartData = data.map((item, index) => ({
    name: item.categoria.length > 18 ? item.categoria.slice(0, 15) + '…' : item.categoria,
    value: Number(item.total),
    color: betterColors[index % betterColors.length],
    legendFontColor: "#cccccc",
    legendFontSize: 12,
  }))

  const screenWidth = Dimensions.get("window").width - 32 // Ancho de pantalla menos padding
  const pieWidth = screenWidth > 340 ? 340 : screenWidth

  return (
    <View className="card items-center justify-center px-0">
      {title && (
        <Text className="text-title mb-4 text-center w-full" numberOfLines={2} ellipsizeMode="tail">
          {title}
        </Text>
      )}
      {data.length > 0 ? (
        <>
          <View className="w-full flex-row items-center justify-center">
            <View className="items-center justify-center" style={{ width: pieWidth }}>
              <RNPieChart
                data={chartData}
                width={pieWidth}
                height={220}
                chartConfig={{
                  backgroundColor: "#333333",
                  backgroundGradientFrom: "#333333",
                  backgroundGradientTo: "#333333",
                  color: (opacity = 1) => `rgba(255, 209, 102, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: { borderRadius: 16 },
                }}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="80"
                absolute
                hasLegend={false}
                style={{ alignSelf: 'center' }}
              />
            </View>
          </View>
          <ScrollView className="w-full" contentContainerStyle={{ alignItems: 'center', marginTop: 12 }} horizontal={false}>
            {chartData.map((item, idx) => (
              <View key={idx} className="flex-row items-center mb-1 max-w-[95%]">
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: item.color, marginRight: 8 }} />
                <Text className="text-white text-base flex-shrink" numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                <Text className="text-primary-300 font-bold ml-2 text-base">
                  ${item.value.toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        <View className="h-[200px] justify-center items-center">
          <Text className="text-secondary-400">No hay datos disponibles</Text>
        </View>
      )}
    </View>
  )
}
