import { Router } from "express"
import { UsuarioController } from "../controllers/UsuarioController"

const router = Router()

// Rutas de autenticación
router.post("/registro", UsuarioController.registrar)
router.post("/login", UsuarioController.login)
router.get("/perfil/:id", UsuarioController.obtenerPerfil)

export default router
