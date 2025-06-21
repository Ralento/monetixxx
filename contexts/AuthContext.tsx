"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { GastoService } from "../services/GastoService"

// URL base de la API
const API_URL = "http://192.168.1.76:8000/api"

interface User {
  id: number
  nombre: string
  email: string
  saldo_actual: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (nombre: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
  updateSaldo: (nuevoSaldo: number) => Promise<void>
  triggerStatsUpdate: () => void
  statsUpdateFlag: number
  periodoSaldo: 'semanal' | 'mensual' | 'anual'
  setPeriodoSaldo: (p: 'semanal' | 'mensual' | 'anual') => void
  saldosPorPeriodo: Record<'semanal' | 'mensual' | 'anual', number>
  setSaldoPorPeriodo: (p: 'semanal' | 'mensual' | 'anual', saldo: number) => Promise<void>
  recargarSaldoPeriodo: (usuarioId: number, periodo: 'semanal' | 'mensual' | 'anual') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsUpdateFlag, setStatsUpdateFlag] = useState(0)
  const [periodoSaldo, setPeriodoSaldoState] = useState<'semanal' | 'mensual' | 'anual'>('mensual')
  const [saldosPorPeriodo, setSaldosPorPeriodo] = useState<Record<'semanal' | 'mensual' | 'anual', number>>({ semanal: 0, mensual: 0, anual: 0 })

  useEffect(() => {
    checkAuthState()
    AsyncStorage.getItem('periodoSaldo').then((p) => {
      if (p === 'semanal' || p === 'mensual' || p === 'anual') setPeriodoSaldoState(p)
    })
    // Leer saldos por periodo
    AsyncStorage.getItem('saldosPorPeriodo').then((s) => {
      if (s) {
        try {
          const obj = JSON.parse(s)
          setSaldosPorPeriodo({ semanal: obj.semanal || 0, mensual: obj.mensual || 0, anual: obj.anual || 0 })
        } catch {}
      }
    })
  }, [])

  const checkAuthState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token")
      const userData = await AsyncStorage.getItem("user")

      if (storedToken && userData) {
        setToken(storedToken)
        setUser(JSON.parse(userData))

        // Configurar axios para incluir el token en todas las solicitudes
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`
      }
    } catch (error) {
      console.error("Error checking auth state:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/usuarios/login`, {
        email,
        password,
      })

      const { usuario, token } = response.data.data

      // Guardar en AsyncStorage
      await AsyncStorage.setItem("token", token)
      await AsyncStorage.setItem("user", JSON.stringify(usuario))

      // Actualizar estado
      setUser(usuario)
      setToken(token)

      // Configurar axios para incluir el token en todas las solicitudes
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } catch (error) {
      console.error("Error en login:", error)
      throw new Error("Error en login")
    }
  }

  const register = async (nombre: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/usuarios/registro`, {
        nombre,
        email,
        password,
      })

      const { usuario, token } = response.data.data

      // Guardar en AsyncStorage
      await AsyncStorage.setItem("token", token)
      await AsyncStorage.setItem("user", JSON.stringify(usuario))

      // Actualizar estado
      setUser(usuario)
      setToken(token)

      // Configurar axios para incluir el token en todas las solicitudes
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } catch (error) {
      console.error("Error en registro:", error)
      throw new Error("Error en registro")
    }
  }

  const logout = async () => {
    try {
      // Eliminar de AsyncStorage
      await AsyncStorage.removeItem("token")
      await AsyncStorage.removeItem("user")

      // Limpiar estado
      setUser(null)
      setToken(null)

      // Eliminar token de axios
      delete axios.defaults.headers.common["Authorization"]
    } catch (error) {
      console.error("Error en logout:", error)
    }
  }

  // Actualizar el saldo_actual del usuario en el contexto y en AsyncStorage
  const updateSaldo = async (nuevoSaldo: number) => {
    if (!user) return
    const usuarioActualizado = { ...user, saldo_actual: nuevoSaldo }
    setUser(usuarioActualizado)
    await AsyncStorage.setItem("user", JSON.stringify(usuarioActualizado))
  }

  const triggerStatsUpdate = useCallback(() => {
    setStatsUpdateFlag((prev) => prev + 1)
  }, [])

  const setPeriodoSaldo = (p: 'semanal' | 'mensual' | 'anual') => {
    setPeriodoSaldoState(p)
    AsyncStorage.setItem('periodoSaldo', p)
  }

  const setSaldoPorPeriodo = async (p: 'semanal' | 'mensual' | 'anual', saldo: number) => {
    setSaldosPorPeriodo((prev) => {
      const nuevo = { ...prev, [p]: saldo }
      AsyncStorage.setItem('saldosPorPeriodo', JSON.stringify(nuevo))
      return nuevo
    })
  }

  // Nueva función para recargar el saldo del periodo desde el backend
  const recargarSaldoPeriodo = async (usuarioId: number, periodo: 'semanal' | 'mensual' | 'anual') => {
    try {
      const saldo = await GastoService.obtenerSaldoPorPeriodo(usuarioId, periodo)
      setSaldosPorPeriodo((prev) => ({ ...prev, [periodo]: saldo }))
    } catch {}
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user && !!token,
        updateSaldo,
        triggerStatsUpdate,
        statsUpdateFlag,
        periodoSaldo,
        setPeriodoSaldo,
        saldosPorPeriodo,
        setSaldoPorPeriodo,
        recargarSaldoPeriodo,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
