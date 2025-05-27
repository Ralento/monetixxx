import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = "moentix-secret-key-2024"

interface JwtPayload {
  id: number
  nombre: string
  email: string
}

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: JwtPayload
    }
  }
}

export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Acceso no autorizado. Token no proporcionado",
      })
    }

    const token = authHeader.split(" ")[1]

    // Verificar token
    const decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload

    // Añadir usuario al request
    req.usuario = decodedToken

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    })
  }
}
