// Convierte una lista de filas en un archivo .csv y lo descarga.
// Excel en español usa ";" como separador, por eso lo usamos aquí.
export function exportarExcel(nombreArchivo, columnas, filas) {
  // Cada valor va entre comillas por si trae ; o saltos de línea
  const limpiar = (valor) => {
    const texto = valor === null || valor === undefined ? '' : String(valor)
    return '"' + texto.replace(/"/g, '""') + '"'
  }

  // Primera línea: los títulos de las columnas
  const encabezado = columnas.map((c) => limpiar(c.titulo)).join(';')

  // Una línea por cada fila de datos
  const lineas = filas.map((fila) => columnas.map((c) => limpiar(fila[c.campo])).join(';'))

  // "\uFEFF" al inicio hace que Excel lea bien las tildes y la ñ
  const contenido = '\uFEFF' + [encabezado, ...lineas].join('\r\n')

  // Crea el archivo en memoria y fuerza la descarga
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo + '.csv'
  enlace.click()
  URL.revokeObjectURL(url)
}