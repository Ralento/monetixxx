import { Router } from "express"
import { UsuarioController } from "../controllers/UsuarioController"

const router = Router()

// Rutas de autenticación
router.post("/registro", UsuarioController.registrar)
router.post("/login", UsuarioController.login)
router.get("/perfil/:id", UsuarioController.obtenerPerfil)
router.put("/saldo/:id", UsuarioController.actualizarSaldo)
router.put("/datos/:id", UsuarioController.actualizarDatosPersonales)
router.put("/contrasena/:id", UsuarioController.cambiarContrasena)
router.get('/saldos/:usuarioId/:periodo', UsuarioController.obtenerSaldoPorPeriodo);
router.put('/saldos/:usuarioId/:periodo', UsuarioController.actualizarSaldoPorPeriodo);

export default router
