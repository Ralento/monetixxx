import { View, Text, Dimensions } from "react-native"
import { PieChart as RNPieChart } from "react-native-chart-kit"
import type { EstadisticaCategoria } from "../../services/GastoService"

interface PieChartProps {
  data: EstadisticaCategoria[]
  title?: string
}

export function PieChart({ data, title }: PieChartProps) {
  // Preparar datos para el gráfico con colores dorados
  const chartData = data.map((item, index) => {
    // Generar diferentes tonos de dorado
    const goldColors = [
      "#ffd166", // Dorado principal
      "#e6bc5c",
      "#cca752",
      "#b39247",
      "#997e3d",
      "#806a33",
    ]

    return {
      name: item.categoria,
      value: Number(item.total),
      color: goldColors[index % goldColors.length],
      legendFontColor: "#cccccc", // Texto claro para fondo oscuro
      legendFontSize: 12,
    }
  })

  const screenWidth = Dimensions.get("window").width - 32 // Ancho de pantalla menos padding

  return (
    <View className="card">
      {title && <Text className="text-title mb-4">{title}</Text>}

      {data.length > 0 ? (
        <RNPieChart
          data={chartData}
          width={screenWidth}
          height={200}
          chartConfig={{
            backgroundColor: "#333333",
            backgroundGradientFrom: "#333333",
            backgroundGradientTo: "#333333",
            color: (opacity = 1) => `rgba(255, 209, 102, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="0"
          absolute
        />
      ) : (
        <View className="h-[200px] justify-center items-center">
          <Text className="text-secondary-400">No hay datos disponibles</Text>
        </View>
      )}
    </View>
  )
}
