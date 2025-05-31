import axios from "axios"

const API_URL = "http://192.168.1.87:8080/api"

export interface Gasto {
  id: number
  descripcion: string
  monto: number
  fecha: string
  categoria_id: number
  usuario_id: number
  categoria_nombre?: string
  categoria_color?: string
  categoria_icono?: string
}

export interface EstadisticaCategoria {
  categoria: string
  color: string
  icono: string
  cantidad: number
  total: number
  porcentaje: string
}

export class GastoService {
  // Obtener todos los gastos de un usuario
  static async obtenerGastos(usuarioId: number) {
    try {
      const response = await axios.get(`${API_URL}/gastos/usuario/${usuarioId}`)
      return response.data.data
    } catch (error) {
      console.error("Error obteniendo gastos:", error)
      throw error
    }
  }

  // Crear un nuevo gasto
  static async crearGasto(gasto: Omit<Gasto, "id">) {
    try {
      const response = await axios.post(`${API_URL}/gastos`, gasto)
      return response.data.data
    } catch (error) {
      console.error("Error creando gasto:", error)
      throw error
    }
  }

  // Eliminar un gasto
  static async eliminarGasto(id: number) {
    try {
      const response = await axios.delete(`${API_URL}/gastos/${id}`)
      return response.data
    } catch (error) {
      console.error("Error eliminando gasto:", error)
      throw error
    }
  }

  // Obtener estadísticas por categoría
  static async obtenerGastosPorCategoria(usuarioId: number) {
    try {
      const response = await axios.get(`${API_URL}/gastos/usuario/${usuarioId}/estadisticas/categoria`)
      return response.data.data
    } catch (error) {
      console.error("Error obteniendo estadísticas por categoría:", error)
      throw error
    }
  }
}
