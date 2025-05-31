import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { probarConexion } from "./database/conexion"
import gastosRoutes from "./routes/gastos"
import usuariosRoutes from "./routes/usuarios"

const app = express()
const PORT = 8080

// Middlewares
app.use(helmet())
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}))
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas
app.use("/api/gastos", gastosRoutes)
app.use("/api/usuarios", usuariosRoutes)

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API de Moentix funcionando",
    version: "1.0.0",
    endpoints: ["/api/gastos", "/api/usuarios"],
  })
})

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    // Probar conexión a la base de datos
    const conexionExitosa = await probarConexion()

    if (!conexionExitosa) {
      console.error("❌ No se pudo conectar a la base de datos")
      process.exit(1)
    }

    // Iniciar servidor
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor ejecutándose en http://0.0.0.0:${PORT}`)
    })
  } catch (error) {
    console.error("❌ Error iniciando el servidor:", error)
    process.exit(1)
  }
}

iniciarServidor()
