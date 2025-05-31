"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"

// URL base de la API
const API_URL = "http://192.168.1.87:8080/api"

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
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
