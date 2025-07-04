import { Router } from "express"
import { GastoController } from "../controllers/GastoController"

const router = Router()

// ✅ Rutas básicas CRUD
router.get("/usuario/:usuarioId", GastoController.obtenerGastos)
router.get("/detale/:id", GastoController.obtenerGastoPorId)
router.post("/", GastoController.crearGasto)
router.put("/:id", GastoController.actualizarGasto)
router.delete("/:id", GastoController.eliminarGasto)

// 📊 Rutas de estadísticas
router.get("/usuario/:usuarioId/estadisticas/categoria", GastoController.obtenerGastosPorCategoria)
router.get("/usuario/:usuarioId/estadisticas/tiempo", GastoController.obtenerGastosPorTiempo)
router.get("/usuario/:usuarioId/resumen", GastoController.obtenerResumenGastos)

router.get("/categorias", GastoController.obtenerCategorias)

export default router
