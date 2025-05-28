import { Router } from "express"
import { GastoController } from "../controllers/GastoController"

const router = Router()

// ✅ Rutas básicas CRUD
router.get("/usuario/:usuarioId", GastoController.obtenerGastos)
router.get("/detalle/:id", GastoController.obtenerGastoPorId)
router.post("/", GastoController.crearGasto)
router.put("/:id", GastoController.actualizarGasto)
router.delete("/:id", GastoController.eliminarGasto)

// 📊 Rutas de estadísticas
router.get("/usuario/:usuarioId/estadisticas/categoria", GastoController.obtenerGastosPorCategoria)
router.get("/usuario/:usuarioId/estadisticas/tiempo", GastoController.obtenerGastosPorTiempo)
router.get("/usuario/:usuarioId/resumen", GastoController.obtenerResumenGastos)

export default router
