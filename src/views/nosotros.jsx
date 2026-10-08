import { Link } from 'react-router-dom'

const estiloParrafo = {
  textAlign: 'center',
  color: '#f2fdff',
  fontFamily: 'sans-serif',
  fontSize: '18px',
  lineHeight: 1.6,
}
const estiloBoton = {
  background: 'linear-gradient(rgb(59, 67, 116), rgb(17, 17, 95))',
  border: 'none',
  width: '120px',
  padding: '8px 0',
}

const gemas = [
  {
    clase: 'img-diamante', imagen: 'img/productos/diamond.jpg', alt: 'Diamante',
    tag: 'tag-azul', origen: 'Sudáfrica · Botswana', nombre: 'Diamante',
    texto: 'La gema más dura de la naturaleza, símbolo de eternidad. Los seleccionamos certificados GIA según las 4C: corte, color, claridad y quilates.',
  },
  {
    clase: 'img-rubi', imagen: 'img/productos/ruby1.jpg', alt: 'Rubí',
    tag: 'tag-rojo', origen: 'Birmania · Mozambique', nombre: 'Rubí',
    texto: 'El rojo más intenso que existe en la naturaleza. Símbolo de pasión y vitalidad. Cada rubí de Splendor es natural, sin tratamientos de relleno.',
  },
  {
    clase: 'img-zafiro', imagen: 'img/productos/zafiro1.jpg', alt: 'Zafiro',
    tag: 'tag-morado', origen: 'Sri Lanka · Cachemira', nombre: 'Zafiro',
    texto: 'Azul profundo que evoca el cielo nocturno. Los zafiros de Cachemira son los más codiciados del mundo; también trabajamos zafiros amarillos y rosados.',
  },
  {
    clase: 'img-esmeralda', imagen: 'img/productos/esmeralda1.jpg', alt: 'Esmeralda',
    tag: 'tag-verde', origen: 'Colombia · Zambia', nombre: 'Esmeralda',
    texto: 'El verde más vivo de la naturaleza. Las esmeraldas colombianas son las más valoradas; su intensidad de color es insuperable en el mundo gemológico.',
  },
]

const etapas = [
  { numero: '01', titulo: 'Diseño a mano', icono: '✏️', clase: 'icono-lapiz',
    texto: 'Todo comienza con un boceto sobre papel. Nuestros diseñadores trazan cada curva y propuesta antes de tocar el metal.' },
  { numero: '02', titulo: 'Selección de materiales', icono: '💎', clase: 'icono-diamante',
    texto: 'Elegimos el oro y las piedras preciosas una a una bajo lupa certificada, asegurándonos de que cada gema sea impecable.' },
  { numero: '03', titulo: 'Trabajo en el taller', icono: '🔥', clase: 'icono-fuego',
    texto: 'El metal se funde, lamina y da forma a mano. Soldadura, engastado y pulido son ejecutados por nuestros maestros orfebres.' },
  { numero: '04', titulo: 'Control de calidad', icono: '✔️', clase: 'icono-check',
    texto: 'Cada joya pasa por una revisión de 12 puntos antes de salir del taller: peso, acabado, cierre, brillo y resistencia.' },
  { numero: '05', titulo: 'Empaque y entrega', icono: '✨ ', clase: 'icono-destello',
    texto: 'La pieza viaja en estuche artesanal con certificado de autenticidad y garantía vitalicia de mantenimiento gratuito.' },
]


const Decoracion = () => (
  <div className="decoracion-superior">
    <span className="rombo">♦</span>
  </div>
)


export function TarjetaGema({ clase, imagen, alt, tag, origen, nombre, texto }) {
  return (
    <article className="tarjeta-gema">
      <div className={`imagen-contenedor ${clase}`}>
        <img src={`/${imagen}`} alt={alt} className="img-fluid" />
      </div>
      <div className="contenido">
        <span className={`origen ${tag}`}>{origen}</span>
        <h3 className="titulo-cards" style={{ color: 'rgb(27, 27, 65)' }}>{nombre}</h3>
        <p>{texto}</p>
      </div>
    </article>
  )
}


export function EtapaJoya({ numero, titulo, texto, icono, clase }) {
  return (
    <div className="item">
      <div className="contenido">
        <span className="numero">{numero}</span>
        <h2 className="titulo">{titulo}</h2>
        <p className="texto">{texto}</p>
      </div>
      <div className="icono">
        <span className={clase}>{icono}</span>
      </div>
    </div>
  )
}

export default function Nosotros() {
  return (
    <div className="background min-vh-100">
      <h1 className="titulo-nosotros">Quiénes somos </h1>
      <p style={estiloParrafo}>
        Tres decadas creando joyas que transiendan generaciones. <br /> Artesania sin concesiones, materiales honestos y un compromiso <br />inquebrantable con la belleza que permanece
      </p>
      <div className="divisor"></div>
      <br />
      <h1 className="titulo-nosotros"> Lo que encontraras</h1>
      <p style={estiloParrafo}>En Spendor trabajamos con gemas naturales certificadas</p>

      <section className="gemas-section">
        <Decoracion />
        <div className="grid-tarjetas">
          {gemas.map((g) => (
            <TarjetaGema key={g.nombre} {...g} />
          ))}
        </div>
      </section>

      <br /><br /><br /><br />

      <h1 className="titulo-nosotros">Como se hace una joya</h1>
      <p style={estiloParrafo}>
        Desde la primera línea en papel hasta el momento en que la <br /> recibes en tus manos, cada joya recorre cinco etapas de <br /> creación artesanal.
      </p>
      <Decoracion />

      <section className="seccion">
        {etapas.map((e) => (
          <EtapaJoya key={e.numero} {...e} />
        ))}
      </section>

      <br /><br /><br /><br />

      <Decoracion />
      <h1 className="titulo-nosotros">¿Lista para encontrar tu joya?</h1>
      <p style={{ ...estiloParrafo, color: '#f2f5ff' }}>
        {' '}Explora nuestra coleccion y encuentra tu pieza favorita. inicia sesion para realizar tu compra
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontFamily: "serif, 'Times New Roman', Times, serif" }}>
        <button type="button" className="btn" style={estiloBoton}>
          <Link to="/productos" style={{ textDecoration: 'none', color: 'white' }}>Comprar ahora</Link>
        </button>
        <button type="button" className="btn" style={estiloBoton}>
          <Link to="/registroUsuario" style={{ textDecoration: 'none', color: 'white' }}>Iniciar sesión</Link>
        </button>
      </div>
      <br />
    </div>
  )
}