import type { Request, Response } from "express"
import { pool } from "../database/conexion"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import type { RowDataPacket, ResultSetHeader } from "mysql2"

interface Usuario extends RowDataPacket {
  id: number
  nombre: string
  email: string
  password: string
  saldo_actual: number
}

// Clave secreta para JWT
const JWT_SECRET = "71c18e044661dc1ae82079c33e86494750c927d0f5448ed4b09d0b2376195411a6a0fceed38d5001f35bbb1c9c3725e46eb28871e2740fbcbd209314d4c3cbbc00428af3875067eeed821a9a443c02a869193cb136ba35d178c721ca231f4e109ea070eec8ec222882944048167d07cc965f8432609b2438fe4d3f72e9965153b5c2cf531c782a8fb5235193241a6f95da6f308dc4a4205ec390a0e8fc73859d6c6a161ca1a4487d76598f89cc7eeda37ab05a2f2057a52f8dcfc90628c56b87325e9acf0a7412f3b951439fc10e72354b6eec35c5d4c45885aae81745fc71c2eb5c7213f4884b86001b5e5865f35359fe7f8fbe7b572321c610d02eace70f4e"

export class UsuarioController {
  // Registrar nuevo usuario
  static async registrar(req: Request, res: Response) {
    try {
      console.log("📝 Datos recibidos para registro:", req.body)

      const { nombre, email, password } = req.body

      // Validar campos
      if (!nombre || !email || !password) {
        console.log("❌ Campos faltantes:", { nombre: !!nombre, email: !!email, password: !!password })
        return res.status(400).json({
          success: false,
          message: "Todos los campos son obligatorios",
        })
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Formato de email inválido",
        })
      }

      // Validar longitud de contraseña
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "La contraseña debe tener al menos 6 caracteres",
        })
      }

      console.log("🔍 Verificando si el email ya existe...")

      // Verificar si el email ya existe
      const [existeEmail] = await pool.execute<Usuario[]>("SELECT id FROM usuarios WHERE email = ?", [email])

      if (existeEmail.length > 0) {
        console.log("❌ Email ya registrado:", email)
        return res.status(400).json({
          success: false,
          message: "El email ya está registrado",
        })
      }

      console.log("🔐 Encriptando contraseña...")

      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(password, salt)

      console.log("💾 Insertando usuario en la base de datos...")

      // Insertar usuario
      const [result] = await pool.execute<ResultSetHeader>(
        "INSERT INTO usuarios (nombre, email, password, saldo_actual) VALUES (?, ?, ?, ?)",
        [nombre, email, passwordHash, 0.0],
      )

      console.log("✅ Usuario creado con ID:", result.insertId)

      // Generar token JWT
      const token = jwt.sign({ id: result.insertId, nombre, email }, JWT_SECRET, { expiresIn: "30d" })

      // Obtener usuario creado
      const [usuario] = await pool.execute<Usuario[]>(
        "SELECT id, nombre, email, saldo_actual FROM usuarios WHERE id = ?",
        [result.insertId],
      )

      console.log("🎉 Registro exitoso para:", email)

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        data: {
          usuario: usuario[0],
          token,
        },
      })
    } catch (error) {
      console.error("💥 Error registrando usuario:", error)

      // Log más detallado del error
      if (error instanceof Error) {
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      })
    }
  }

  // Login de usuario
  static async login(req: Request, res: Response) {
    try {
      console.log("🔑 Datos recibidos para login:", { email: req.body.email, password: "***" })

      const { email, password } = req.body

      // Validar campos
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email y contraseña son obligatorios",
        })
      }

      console.log("🔍 Buscando usuario por email...")

      // Buscar usuario por email
      const [usuarios] = await pool.execute<Usuario[]>(
        "SELECT id, nombre, email, password, saldo_actual FROM usuarios WHERE email = ?",
        [email],
      )

      if (usuarios.length === 0) {
        console.log("❌ Usuario no encontrado:", email)
        return res.status(401).json({
          success: false,
          message: "Credenciales incorrectas",
        })
      }

      const usuario = usuarios[0]
      console.log("✅ Usuario encontrado:", usuario.email)

      // Verificar contraseña
      const passwordValida = await bcrypt.compare(password, usuario.password)

      if (!passwordValida) {
        console.log("❌ Contraseña incorrecta para:", email)
        return res.status(401).json({
          success: false,
          message: "Credenciales incorrectas",
        })
      }

      console.log("🔐 Contraseña válida, generando token...")

      // Generar token JWT
      const token = jwt.sign({ id: usuario.id, nombre: usuario.nombre, email: usuario.email }, JWT_SECRET, {
        expiresIn: "30d",
      })

      // Eliminar password del objeto usuario
      const { password: _, ...usuarioSinPassword } = usuario

      console.log("🎉 Login exitoso para:", email)

      res.json({
        success: true,
        message: "Login exitoso",
        data: {
          usuario: usuarioSinPassword,
          token,
        },
      })
    } catch (error) {
      console.error("💥 Error en login:", error)

      if (error instanceof Error) {
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      }

      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      })
    }
  }

  // Obtener perfil de usuario
  static async obtenerPerfil(req: Request, res: Response) {
    try {
      const { id } = req.params

      const [usuarios] = await pool.execute<Usuario[]>(
        "SELECT id, nombre, email, saldo_actual FROM usuarios WHERE id = ?",
        [id],
      )

      if (usuarios.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        })
      }

      res.json({
        success: true,
        data: usuarios[0],
      })
    } catch (error) {
      console.error("Error obteniendo perfil:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  }
}
