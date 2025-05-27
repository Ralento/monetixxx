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
const JWT_SECRET = "moentix-secret-key-2024"

export class UsuarioController {
  // Registrar nuevo usuario
  static async registrar(req: Request, res: Response) {
    try {
      const { nombre, email, password } = req.body

      // Validar campos
      if (!nombre || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Todos los campos son obligatorios",
        })
      }

      // Verificar si el email ya existe
      const [existeEmail] = await pool.execute<Usuario[]>("SELECT id FROM usuarios WHERE email = ?", [email])

      if (existeEmail.length > 0) {
        return res.status(400).json({
          success: false,
          message: "El email ya está registrado",
        })
      }

      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(password, salt)

      // Insertar usuario
      const [result] = await pool.execute<ResultSetHeader>(
        "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
        [nombre, email, passwordHash],
      )

      // Generar token JWT
      const token = jwt.sign({ id: result.insertId, nombre, email }, JWT_SECRET, { expiresIn: "30d" })

      // Obtener usuario creado
      const [usuario] = await pool.execute<Usuario[]>(
        "SELECT id, nombre, email, saldo_actual FROM usuarios WHERE id = ?",
        [result.insertId],
      )

      res.status(201).json({
        success: true,
        message: "Usuario registrado exitosamente",
        data: {
          usuario: usuario[0],
          token,
        },
      })
    } catch (error) {
      console.error("Error registrando usuario:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  }

  // Login de usuario
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      // Validar campos
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email y contraseña son obligatorios",
        })
      }

      // Buscar usuario por email
      const [usuarios] = await pool.execute<Usuario[]>(
        "SELECT id, nombre, email, password, saldo_actual FROM usuarios WHERE email = ?",
        [email],
      )

      if (usuarios.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Credenciales incorrectas",
        })
      }

      const usuario = usuarios[0]

      // Verificar contraseña
      const passwordValida = await bcrypt.compare(password, usuario.password)

      if (!passwordValida) {
        return res.status(401).json({
          success: false,
          message: "Credenciales incorrectas",
        })
      }

      // Generar token JWT
      const token = jwt.sign({ id: usuario.id, nombre: usuario.nombre, email: usuario.email }, JWT_SECRET, {
        expiresIn: "30d",
      })

      // Eliminar password del objeto usuario
      const { password: _, ...usuarioSinPassword } = usuario

      res.json({
        success: true,
        message: "Login exitoso",
        data: {
          usuario: usuarioSinPassword,
          token,
        },
      })
    } catch (error) {
      console.error("Error en login:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
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
