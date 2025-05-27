import { View, Text, Dimensions } from "react-native"
import { BarChart as RNBarChart } from "react-native-chart-kit"

interface BarChartProps {
  labels: string[]
  data: number[]
  title?: string
}

export function BarChart({ labels, data, title }: BarChartProps) {
  const screenWidth = Dimensions.get("window").width - 32 // Ancho de pantalla menos padding

  return (
    <View className="card">
      {title && <Text className="text-title mb-4">{title}</Text>}

      {labels.length > 0 && data.length > 0 ? (
        <RNBarChart
          data={{
            labels,
            datasets: [
              {
                data,
              },
            ],
          }}
          width={screenWidth}
          height={220}
          yAxisLabel="$"
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: "#333333",
            backgroundGradientFrom: "#333333",
            backgroundGradientTo: "#333333",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 209, 102, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            barPercentage: 0.7,
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      ) : (
        <View className="h-[220px] justify-center items-center">
          <Text className="text-secondary-400">No hay datos disponibles</Text>
        </View>
      )}
    </View>
  )
}
