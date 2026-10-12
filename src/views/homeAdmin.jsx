import { useEffect, useState } from 'react';

export default function DashboardAdmin() {
  // Inicializamos el estado usando los nombres EXACTOS de tu vista SQL "v_dashboard"
  const [datos, setDatos] = useState({
    usuarios: 0,
    productos: 0,
    compras: 0,
    ingresos: 0,
    inventario_unidades: 0,
    productos_criticos: 0,
    mensajes_sin_leer: 0
  });
  
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function obtenerDatos() {
      try {
        // Asegúrate de usar el puerto correcto de tu backend (ej. 3000)
        const respuesta = await fetch('http://localhost:3000/api/dashboard');
        
        if (!respuesta.ok) {
          throw new Error('Error al cargar el dashboard');
        }
        
        const data = await respuesta.json();
        
        // Actualizamos el estado con los datos que vienen de Aiven
        setDatos({
          usuarios: data.usuarios || 0,
          productos: data.productos || 0,
          compras: data.compras || 0,
          ingresos: data.ingresos || 0,
          inventario_unidades: data.inventario_unidades || 0,
          productos_criticos: data.productos_criticos || 0,
          mensajes_sin_leer: data.mensajes_sin_leer || 0
        });

      } catch (error) {
        console.error('Error obteniendo datos del dashboard:', error);
      } finally {
        setCargando(false);
      }
    }

    obtenerDatos();
  }, []); 

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Panel de Administración - Splendor</h2>
      
      {cargando ? (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      ) : (
        <>
          <div className="row mb-4">
            
            {/* Tarjeta Usuarios */}
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm h-100 border-start border-primary border-4">
                <div className="card-body">
                  <h5 className="card-title text-muted">Usuarios Activos</h5>
                  <h3 className="fw-bold">{datos.usuarios}</h3>
                </div>
              </div>
            </div>

            {/* Tarjeta Productos */}
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm h-100 border-start border-info border-4">
                <div className="card-body">
                  <h5 className="card-title text-muted">Catálogo Productos</h5>
                  <h3 className="fw-bold">{datos.productos}</h3>
                </div>
              </div>
            </div>

            {/* Tarjeta Órdenes (Compras) */}
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm h-100 border-start border-success border-4">
                <div className="card-body">
                  <h5 className="card-title text-muted">Total Órdenes</h5>
                  <h3 className="fw-bold">{datos.compras}</h3>
                </div>
              </div>
            </div>

            {/* Tarjeta Ingresos */}
            <div className="col-md-3 mb-3">
              <div className="card shadow-sm h-100 border-start border-warning border-4">
                <div className="card-body">
                  <h5 className="card-title text-muted">Ingresos Totales</h5>
                  <h3 className="fw-bold">${Number(datos.ingresos).toLocaleString('es-CL')}</h3>
                </div>
              </div>
            </div>
            
          </div>

          <h4 className="mb-3">Métricas Secundarias</h4>
          <div className="row">
            
            {/* Tarjeta Unidades en Inventario */}
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title text-muted">Total Unidades Inventario</h6>
                  <h4 className="fw-bold">{datos.inventario_unidades}</h4>
                </div>
              </div>
            </div>

            {/* Tarjeta Productos Críticos */}
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title text-muted">Alerta: Stock Crítico</h6>
                  <h4 className={`fw-bold ${datos.productos_criticos > 0 ? 'text-danger' : 'text-success'}`}>
                    {datos.productos_criticos}
                  </h4>
                </div>
              </div>
            </div>

            {/* Tarjeta Mensajes */}
            <div className="col-md-4 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title text-muted">Mensajes Sin Leer</h6>
                  <h4 className="fw-bold">{datos.mensajes_sin_leer}</h4>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}