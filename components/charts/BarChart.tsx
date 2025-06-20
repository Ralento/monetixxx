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
    <View style={{ overflow: 'hidden', borderRadius: 12, backgroundColor: '#1a1a1a' }}>
      {title && <Text className="text-title mb-4" style={{ alignSelf: 'center' }}>{title}</Text>}
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
            backgroundColor: "#1a1a1a",
            backgroundGradientFrom: "#1a1a1a",
            backgroundGradientTo: "#1a1a1a",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 209, 102, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 12,
            },
            barPercentage: 0.7,
          }}
          style={{
            marginVertical: 0,
            borderRadius: 12,
            backgroundColor: '#1a1a1a',
            padding: 0,
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
