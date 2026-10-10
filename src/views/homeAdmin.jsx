import { useEffect, useState } from 'react';

export default function DashboardAdmin() {
  const [datos, setDatos] = useState({
    total_usuarios: 0,
    total_ventas: 0,
    total_productos: 0,
    ingresos_totales: 0
  });
  
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function obtenerDatos() {
      try {
        const respuesta = await fetch('/api/dashboard');
        
        if (!respuesta.ok) {
          throw new Error('Error al cargar el dashboard');
        }
        
        const data = await respuesta.json();
        setDatos(data);
      } catch (error) {
        console.error('Error obteniendo datos:', error);
      } finally {
        setCargando(false);
      }
    }

    obtenerDatos();
  }, []); 

  return (
    <div className="container-fluid mt-4"> {/* Clases de Bootstrap */}
      <h2 className="mb-4">Panel de Administración</h2>
      
      {cargando ? (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      ) : (
        <div className="row">
          
          {/* Tarjeta Usuarios */}
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title text-muted">Total Usuarios</h5>
                <h3 className="fw-bold">{datos.total_usuarios}</h3>
              </div>
            </div>
          </div>

          {/* Tarjeta Productos */}
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title text-muted">Total Productos</h5>
                <h3 className="fw-bold">{datos.total_productos}</h3>
              </div>
            </div>
          </div>

          {/* Tarjeta Ventas */}
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title text-muted">Total Ventas</h5>
                <h3 className="fw-bold">{datos.total_ventas}</h3>
              </div>
            </div>
          </div>

          {/* Tarjeta Ingresos */}
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title text-muted">Ingresos Totales</h5>
                {/* Asumiendo que quieres formatear los ingresos como moneda */}
                <h3 className="fw-bold">${datos.ingresos_totales}</h3>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}