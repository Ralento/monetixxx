"use client"

import { useState } from "react"
import { View, Text, TextInput, Modal, TouchableOpacity, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Button } from "../ui/Button"
import { GastoService } from "../../services/GastoService"
import { useAuth } from "../../contexts/AuthContext"

interface NuevoGastoModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

const categorias = [
  { id: 1, nombre: "Comida", color: "#ffd166", icono: "restaurant-outline" },
  { id: 2, nombre: "Transporte", color: "#ffd166", icono: "car-outline" },
  { id: 3, nombre: "Entretenimiento", color: "#ffd166", icono: "game-controller-outline" },
  { id: 4, nombre: "Salud", color: "#ffd166", icono: "medical-outline" },
  { id: 5, nombre: "Compras", color: "#ffd166", icono: "bag-outline" },
  { id: 6, nombre: "Otros", color: "#ffd166", icono: "ellipsis-horizontal-outline" },
]

export function NuevoGastoModal({ visible, onClose, onSuccess }: NuevoGastoModalProps) {
  const { user } = useAuth()
  const [descripcion, setDescripcion] = useState("")
  const [monto, setMonto] = useState("")
  const [categoriaId, setCategoriaId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setDescripcion("")
    setMonto("")
    setCategoriaId(null)
  }

  const handleGuardar = async () => {
    if (!descripcion || !monto || !categoriaId || !user) {
      Alert.alert("Error", "Por favor completa todos los campos")
      return
    }

    const montoNum = Number.parseFloat(monto.replace(/,/g, "."))
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert("Error", "El monto debe ser un número positivo")
      return
    }

    setLoading(true)
    try {
      await GastoService.crearGasto({
        descripcion,
        monto: montoNum,
        fecha: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
        categoria_id: categoriaId,
        usuario_id: user.id,
      })

      Alert.alert("Éxito", "Gasto registrado correctamente")
      resetForm()
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error al guardar gasto:", error)
      Alert.alert("Error", "No se pudo guardar el gasto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/70">
        <View className="bg-secondary-800 rounded-t-xl p-4 h-3/4 border-t border-primary-300">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-title">Nuevo Gasto</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={24} color="#cccccc" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            <View className="space-y-4">
              <View>
                <Text className="text-body mb-1">Descripción</Text>
                <TextInput
                  className="input-field"
                  value={descripcion}
                  onChangeText={setDescripcion}
                  placeholder="¿En qué gastaste?"
                  placeholderTextColor="#666666"
                />
              </View>

              <View>
                <Text className="text-body mb-1">Monto</Text>
                <TextInput
                  className="input-field"
                  value={monto}
                  onChangeText={setMonto}
                  placeholder="0.00"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                />
              </View>

              <View>
                <Text className="text-body mb-2">Categoría</Text>
                <View className="flex-row flex-wrap">
                  {categorias.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      className={`m-1 p-2 rounded-lg border ${
                        categoriaId === cat.id ? "border-primary-300 bg-primary-300/20" : "border-secondary-700"
                      }`}
                      onPress={() => setCategoriaId(cat.id)}
                    >
                      <View className="items-center">
                        <View className="p-2 rounded-full mb-1" style={{ backgroundColor: "rgba(255, 209, 102, 0.2)" }}>
                          <Ionicons name={cat.icono as any} size={20} color="#ffd166" />
                        </View>
                        <Text className="text-xs text-white">{cat.nombre}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          <View className="pt-4">
            <Button title="Guardar Gasto" onPress={handleGuardar} loading={loading} variant="primary" />
          </View>
        </View>
      </View>
    </Modal>
  )
}
