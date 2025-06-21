import axios from "axios"

const API_URL = "http://192.168.1.76:8000/api"
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
  periodo?: 'semanal' | 'mensual' | 'anual'
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
      return response.data.data
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

  // Actualizar el saldo_actual del usuario
  static async actualizarSaldoUsuario(usuarioId: number, saldo_actual: number) {
    try {
      const response = await axios.put(`${API_URL}/usuarios/saldo/${usuarioId}`, { saldo_actual })
      return response.data.data
    } catch (error) {
      console.error("Error actualizando saldo:", error)
      throw error
    }
  }

  // Obtener todas las categorías
  static async obtenerCategorias() {
    try {
      const response = await axios.get(`${API_URL}/gastos/categorias`)
      return response.data.data
    } catch (error) {
      console.error("Error obteniendo categorías:", error)
      throw error
    }
  }

  // Obtener gastos mensuales para la gráfica
  static async obtenerGastosPorMes(usuarioId: number) {
    try {
      const response = await axios.get(`${API_URL}/gastos/usuario/${usuarioId}/estadisticas/tiempo?periodo=mensual`)
      return response.data.data
    } catch (error) {
      console.error("Error obteniendo gastos mensuales:", error)
      throw error
    }
  }

  // Obtener gastos por periodo para la gráfica
  static async obtenerGastosPorPeriodo(usuarioId: number, periodo: 'mensual' | 'semanal' | 'anual') {
    try {
      const response = await axios.get(`${API_URL}/gastos/usuario/${usuarioId}/estadisticas/tiempo?periodo=${periodo}`)
      return response.data.data
    } catch (error) {
      console.error("Error obteniendo gastos por periodo:", error)
      throw error
    }
  }

  // Actualizar datos personales del usuario
  static async actualizarDatosPersonales(usuarioId: number, nombre: string, email: string) {
    try {
      const response = await axios.put(`${API_URL}/usuarios/datos/${usuarioId}`, { nombre, email })
      return response.data.data
    } catch (error) {
      console.error("Error actualizando datos personales:", error)
      throw error
    }
  }

  // Cambiar contraseña del usuario
  static async cambiarContrasena(usuarioId: number, actual: string, nueva: string) {
    try {
      const response = await axios.put(`${API_URL}/usuarios/contrasena/${usuarioId}`, { actual, nueva })
      return response.data
    } catch (error) {
      console.error("Error cambiando contraseña:", error)
      throw error
    }
  }

  // Obtener saldo por periodo
  static async obtenerSaldoPorPeriodo(usuarioId: number, periodo: 'semanal' | 'mensual' | 'anual') {
    try {
      const response = await axios.get(`${API_URL}/usuarios/saldos/${usuarioId}/${periodo}`)
      return response.data.saldo
    } catch (error) {
      console.error('Error obteniendo saldo por periodo:', error)
      throw error
    }
  }

  // Actualizar saldo por periodo
  static async actualizarSaldoPorPeriodo(usuarioId: number, periodo: 'semanal' | 'mensual' | 'anual', saldo: number) {
    try {
      const response = await axios.put(`${API_URL}/usuarios/saldos/${usuarioId}/${periodo}`, { saldo })
      return response.data
    } catch (error) {
      console.error('Error actualizando saldo por periodo:', error)
      throw error
    }
  }
}
