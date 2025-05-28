import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = "71c18e044661dc1ae82079c33e86494750c927d0f5448ed4b09d0b2376195411a6a0fceed38d5001f35bbb1c9c3725e46eb28871e2740fbcbd209314d4c3cbbc00428af3875067eeed821a9a443c02a869193cb136ba35d178c721ca231f4e109ea070eec8ec222882944048167d07cc965f8432609b2438fe4d3f72e9965153b5c2cf531c782a8fb5235193241a6f95da6f308dc4a4205ec390a0e8fc73859d6c6a161ca1a4487d76598f89cc7eeda37ab05a2f2057a52f8dcfc90628c56b87325e9acf0a7412f3b951439fc10e72354b6eec35c5d4c45885aae81745fc71c2eb5c7213f4884b86001b5e5865f35359fe7f8fbe7b572321c610d02eace70f4e"

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
