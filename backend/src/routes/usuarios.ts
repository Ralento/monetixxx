import { Router } from "express"
import { UsuarioController } from "../controllers/UsuarioController"

const router = Router()

// Rutas de autenticación
// @ts-ignore
router.post("/registro", UsuarioController.registrar)
// @ts-ignore
router.post("/login", UsuarioController.login)
// @ts-ignore
router.get("/perfil/:id", UsuarioController.obtenerPerfil)

export default router
