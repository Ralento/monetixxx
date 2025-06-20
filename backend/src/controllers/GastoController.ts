import type { Request, Response } from "express"
import { pool } from "../database/conexion"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

interface GastoRow extends RowDataPacket {
  id: number
  descripcion: string
  monto: number
  fecha: string
  categoria_id: number
  usuario_id: number
  categoria_nombre?: string
  categoria_color?: string
  categoria_icono?: string
  notas?: string
}

export class GastoController {
  // Obtener todos los gastos de un usuario
  static async obtenerGastos(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params
      const { limite = "50", pagina = "1", categoria, fechaInicio, fechaFin } = req.query

      // Convertir usuarioId a número entero
      const usuarioIdNum = Number.parseInt(usuarioId as string);

      let query = `
        SELECT 
          g.id,
          g.descripcion,
          g.monto,
          g.fecha,
          g.categoria_id,
          g.usuario_id,
          c.nombre as categoria_nombre,
          c.color as categoria_color,
          c.icono as categoria_icono
        FROM gastos g
        INNER JOIN categorias c ON g.categoria_id = c.id
        WHERE g.usuario_id = ?
      `

      const params: any[] = [usuarioIdNum]

      if (categoria) {
        query += " AND g.categoria_id = ?"
        params.push(categoria)
      }

      if (fechaInicio) {
        query += " AND g.fecha >= ?"
        params.push(fechaInicio)
      }

      if (fechaFin) {
        query += " AND g.fecha <= ?"
        params.push(fechaFin)
      }

      query += " ORDER BY g.fecha DESC, g.id DESC"

      const limitNum = Number.parseInt(limite as string)
      const paginaNum = Number.parseInt(pagina as string)
      const offset = (paginaNum - 1) * limitNum

      // Comentamos temporalmente LIMIT y OFFSET para depurar
      // query += " LIMIT ? OFFSET ?"
      // params.push(limitNum, offset)

      console.log("Executing query:", query)
      console.log("With params:", params)

      const [rows] = await pool.execute<GastoRow[]>(query, params)

      res.json({
        success: true,
        data: rows,
      })
    } catch (error) {
      console.error("Error obteniendo gastos:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  }

  // Obtener un gasto específico por su ID
  static async obtenerGastoPorId(req: Request, res: Response) {
    try {
      const { id } = req.params

      const [rows] = await pool.execute<GastoRow[]>(
        `SELECT 
          g.id,
          g.descripcion,
          g.monto,
          g.fecha,
          g.categoria_id,
          g.usuario_id,
          g.notas,
          c.nombre as categoria_nombre,
          c.color as categoria_color,
          c.icono as categoria_icono
        FROM gastos g
        INNER JOIN categorias c ON g.categoria_id = c.id
        WHERE g.id = ?`,
        [id],
      )

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Gasto no encontrado",
        })
      }

      res.json({
        success: true,
        data: rows[0],
      })
    } catch (error) {
      console.error("Error obteniendo gasto por ID:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  }

  // Crear nuevo gasto
  static async crearGasto(req: Request, res: Response) {
    try {
      const { descripcion, monto, fecha, categoria_id, usuario_id, notas } = req.body

      if (!descripcion || !monto || !fecha || !categoria_id || !usuario_id) {
        return res.status(400).json({
          success: false,
          message: "Todos los campos son obligatorios",
        })
      }

      if (monto <= 0) {
        return res.status(400).json({
          success: false,
          message: "El monto debe ser mayor a 0",
        })
      }

      // Crear el gasto
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO gastos (descripcion, monto, fecha, categoria_id, usuario_id, notas)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [descripcion, monto, fecha, categoria_id, usuario_id, notas || null],
      )

      // Restar el monto al saldo_actual del usuario
      await pool.execute(
        `UPDATE usuarios SET saldo_actual = saldo_actual - ? WHERE id = ?`,
        [monto, usuario_id],
      )

      // Obtener usuario actualizado
      const [usuarios] = await pool.execute<any[]>(
        `SELECT id, nombre, email, saldo_actual FROM usuarios WHERE id = ?`,
        [usuario_id],
      )

      // Obtener gasto creado
      const [gastoCreado] = await pool.execute<GastoRow[]>(
        `SELECT 
          g.id, g.descripcion, g.monto, g.fecha, g.categoria_id, g.usuario_id, g.notas,
          c.nombre as categoria_nombre, c.color as categoria_color, c.icono as categoria_icono
         FROM gastos g
         INNER JOIN categorias c ON g.categoria_id = c.id
         WHERE g.id = ?`,
        [result.insertId],
      )

      res.status(201).json({
        success: true,
        message: "Gasto creado exitosamente",
        data: {
          gasto: gastoCreado[0],
          usuario: usuarios[0],
        },
      })
    } catch (error) {
      console.error("Error creando gasto:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  }

  // Actualizar gasto existente
  static async actualizarGasto(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { descripcion, monto, fecha, categoria_id, notas } = req.body

      // Verificar si el gasto existe
      const [gastoRows] = await pool.execute<GastoRow[]>("SELECT * FROM gastos WHERE id = ?", [id])

      if (gastoRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Gasto no encontrado",
        })
      }

      // Validar campos
      if (!descripcion || !monto || !fecha || !categoria_id) {
        return res.status(400).json({
          success: false,
          message: "Todos los campos son obligatorios",
        })
      }

      if (monto <= 0) {
        return res.status(400).json({
          success: false,
          message: "El monto debe ser mayor a 0",
        })
      }

      // Actualizar gasto
      await pool.execute(
        `UPDATE gastos 
         SET descripcion = ?, monto = ?, fecha = ?, categoria_id = ?, notas = ?
         WHERE id = ?`,
        [descripcion, monto, fecha, categoria_id, notas || null, id],
      )

      // Obtener gasto actualizado
      const [gastoActualizado] = await pool.execute<GastoRow[]>(
        `SELECT 
          g.id, g.descripcion, g.monto, g.fecha, g.categoria_id, g.usuario_id, g.notas,
          c.nombre as categoria_nombre, c.color as categoria_color, c.icono as categoria_icono
         FROM gastos g
         INNER JOIN categorias c ON g.categoria_id = c.id
         WHERE g.id = ?`,
        [id],
      )

      res.json({
        success: true,
        message: "Gasto actualizado exitosamente",
        data: gastoActualizado[0],
      })
    } catch (error) {
      console.error("Error actualizando gasto:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  }

  // Eliminar gasto
  static async eliminarGasto(req: Request, res: Response) {
    try {
      const { id } = req.params

      // Obtener el gasto antes de eliminarlo
      const [gastoRows] = await pool.execute<GastoRow[]>("SELECT * FROM gastos WHERE id = ?", [id])

      if (gastoRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Gasto no encontrado",
        })
      }

      const gasto = gastoRows[0]

      // Eliminar el gasto
      await pool.execute("DELETE FROM gastos WHERE id = ?", [id])

      // Sumar el monto al saldo_actual del usuario
      await pool.execute(
        "UPDATE usuarios SET saldo_actual = saldo_actual + ? WHERE id = ?",
        [gasto.monto, gasto.usuario_id],
      )

      // Obtener usuario actualizado
      const [usuarios] = await pool.execute<any[]>(
        "SELECT id, nombre, email, saldo_actual FROM usuarios WHERE id = ?",
        [gasto.usuario_id],
      )

      res.json({
        success: true,
        message: "Gasto eliminado exitosamente",
        data: {
          usuario: usuarios[0],
        },
      })
    } catch (error) {
      console.error("Error eliminando gasto:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  }

  // Obtener estadísticas por categoría
  static async obtenerGastosPorCategoria(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params
      const { fechaInicio, fechaFin } = req.query

      let query = `
        SELECT 
          c.nombre as categoria,
          c.color,
          c.icono,
          COUNT(g.id) as cantidad,
          SUM(g.monto) as total
        FROM gastos g
        INNER JOIN categorias c ON g.categoria_id = c.id
        WHERE g.usuario_id = ?
      `

      const params: any[] = [usuarioId]

      if (fechaInicio) {
        query += " AND g.fecha >= ?"
        params.push(fechaInicio)
      }

      if (fechaFin) {
        query += " AND g.fecha <= ?"
        params.push(fechaFin)
      }

      query += `
        GROUP BY c.id, c.nombre, c.color, c.icono
        ORDER BY total DESC
      `

      const [rows] = await pool.execute<RowDataPacket[]>(query, params)

      // Calcular porcentajes
      const totalGeneral = rows.reduce((sum, row) => sum + row.total, 0)
      const estadisticas = rows.map((row) => ({
        ...row,
        porcentaje: totalGeneral > 0 ? ((row.total / totalGeneral) * 100).toFixed(2) : "0.00",
      }))

      res.json({
        success: true,
        data: estadisticas,
        resumen: {
          total_categorias: rows.length,
          total_gastado: totalGeneral,
        },
      })
    } catch (error) {
      console.error("Error obteniendo gastos por categoría:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  }

  // Obtener gastos por período de tiempo
  static async obtenerGastosPorTiempo(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params
      const { periodo = "mensual" } = req.query

      let groupBy = ""
      let format = ""

      switch (periodo) {
        case "diario":
          groupBy = "g.fecha"
          format = "%Y-%m-%d"
          break
        case "semanal":
          groupBy = "YEARWEEK(g.fecha, 1)"
          format = "%Y-%u"
          break
        case "mensual":
        default:
          groupBy = "EXTRACT(YEAR_MONTH FROM g.fecha)"
          format = "%Y-%m"
          break
      }

      const query = `
        SELECT 
          DATE_FORMAT(g.fecha, ?) as periodo,
          SUM(g.monto) as total
        FROM gastos g
        WHERE g.usuario_id = ?
        GROUP BY ${groupBy}
        ORDER BY g.fecha ASC
      `

      const [rows] = await pool.execute<RowDataPacket[]>(query, [format, usuarioId])

      res.json({
        success: true,
        data: rows,
      })
    } catch (error) {
      console.error("Error obteniendo gastos por tiempo:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  }

  // Obtener resumen de gastos
  static async obtenerResumenGastos(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params

      // Obtener total gastado
      const [totalRows] = await pool.execute<RowDataPacket[]>(
        "SELECT SUM(monto) as total FROM gastos WHERE usuario_id = ?",
        [usuarioId],
      )
      const totalGastado = totalRows[0].total || 0

      // Obtener gasto promedio
      const [promedioRows] = await pool.execute<RowDataPacket[]>(
        "SELECT AVG(monto) as promedio FROM gastos WHERE usuario_id = ?",
        [usuarioId],
      )
      const gastoPromedio = promedioRows[0].promedio || 0

      // Obtener gasto más alto
      const [maxRows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          g.id, g.descripcion, g.monto, g.fecha, c.nombre as categoria
        FROM gastos g
        INNER JOIN categorias c ON g.categoria_id = c.id
        WHERE g.usuario_id = ?
        ORDER BY g.monto DESC
        LIMIT 1`,
        [usuarioId],
      )
      const gastoMasAlto = maxRows.length > 0 ? maxRows[0] : null

      // Obtener categoría más frecuente
      const [categoriaRows] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          c.id, c.nombre, COUNT(g.id) as cantidad
        FROM gastos g
        INNER JOIN categorias c ON g.categoria_id = c.id
        WHERE g.usuario_id = ?
        GROUP BY c.id, c.nombre
        ORDER BY cantidad DESC
        LIMIT 1`,
        [usuarioId],
      )
      const categoriaMasFrecuente = categoriaRows.length > 0 ? categoriaRows[0] : null

      // Obtener estadísticas del mes actual
      const fechaActual = new Date()
      const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).toISOString().split("T")[0]
      const ultimoDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0]

      const [mesActualRows] = await pool.execute<RowDataPacket[]>(
        "SELECT SUM(monto) as total FROM gastos WHERE usuario_id = ? AND fecha BETWEEN ? AND ?",
        [usuarioId, primerDiaMes, ultimoDiaMes],
      )
      const gastoMesActual = mesActualRows[0].total || 0

      res.json({
        success: true,
        data: {
          total_gastado: totalGastado,
          gasto_promedio: gastoPromedio,
          gasto_mas_alto: gastoMasAlto,
          categoria_mas_frecuente: categoriaMasFrecuente,
          gasto_mes_actual: gastoMesActual,
          fecha_inicio_mes: primerDiaMes,
          fecha_fin_mes: ultimoDiaMes,
        },
      })
    } catch (error) {
      console.error("Error obteniendo resumen de gastos:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  }

  // Obtener todas las categorías
  static async obtenerCategorias(req: Request, res: Response) {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT id, nombre, color, icono FROM categorias ORDER BY id ASC"
      )
      res.json({ success: true, data: rows })
    } catch (error) {
      console.error("Error obteniendo categorías:", error)
      res.status(500).json({ success: false, message: "Error interno del servidor" })
    }
  }
}
