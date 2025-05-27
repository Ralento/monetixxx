import mysql from "mysql2/promise"

// Configuración directa sin variables de entorno
const configuracionDB = {
  host: "localhost",
  user: "root",
  password: "Rollo200726",
  database: "monetix",
  port: 3306,
}

export const pool = mysql.createPool({
  ...configuracionDB,
})

export const probarConexion = async () => {
  try {
    const conexion = await pool.getConnection()
    console.log("✅ Conexión a MySQL exitosa")
    console.log(`📊 Base de datos: ${configuracionDB.database}`)
    console.log(`🏠 Host: ${configuracionDB.host}:${configuracionDB.port}`)

    const [rows] = await conexion.execute("SELECT COUNT(*) as total FROM usuarios")
    console.log(`👥 Usuarios en la base de datos: ${(rows as any)[0].total}`)

    conexion.release()
    return true
  } catch (error) {
    console.error("❌ Error conectando a MySQL:")
    console.error("Mensaje:", (error as any).message)
    return false
  }
}
