import { useState } from 'react'
const preguntas = [
  {
    id: 'One',
    pregunta: '¿Todas las gemas incluyen certificado de autenticidad?',
    respuesta: (
      <>
        <strong>Sí, el 100% de nuestro catálogo está certificado.</strong> Cada diamante, esmeralda, zafiro o rubí se entrega con su respectivo certificado gemológico emitido por laboratorios reconocidos internacionalmente (como GIA, IGI o laboratorios autorizados), garantizando su autenticidad, peso y clasificación.
      </>
    ),
  },
  {
    id: 'Two',
    pregunta: '¿Venden las piedras sueltas o montadas en joyas?',
    respuesta: (
      <>
        Nos especializamos únicamente en la <strong>venta de gemas preciosas sueltas</strong>. Esto permite a nuestros clientes adquirir la piedra con total transparencia en cuanto a sus inclusiones, corte y color, para luego llevarla a su orfebre o diseñador de confianza.
      </>
    ),
  },
  {
    id: 'Three',
    pregunta: '¿Cómo garantizan el origen ético de las gemas?',
    respuesta: (
      <>
        Trabajamos strictly bajo el <strong>Proceso de Kimberley</strong> para el comercio de diamantes y garantizamos trazabilidad directa desde minas registradas para esmeraldas y zafiros, asegurando piedras libres de conflicto y de fuentes éticas.
      </>
    ),
  },
  {
    id: 'Four',
    pregunta: '¿Puedo solicitar una piedra con características o corte específico?',
    respuesta: (
      <>
        <strong>Por supuesto.</strong> Si buscas un quilataje, tipo de corte (brillante, esmeralda, oval) o tonalidad particular que no encuentres publicada, nuestro equipo realiza la búsqueda y gestión directa con nuestras minas y proveedores aliados.
      </>
    ),
  },
  {
    id: 'Five',
    pregunta: '¿Es posible agendar una cita para ver las gemas presencialmente?',
    respuesta: (
      <>
        Sí. Ofrecemos <strong>asesorías privadas en nuestro showroom</strong> con cita previa, donde podrás examinar las piedras detalladamente bajo lupa gemológica y luz adecuada antes de tomar una decisión.
      </>
    ),
  },
  {
    id: 'Six',
    pregunta: '¿Cómo realizan el envío seguro de piezas de alto valor?',
    respuesta: (
      <>
        Todos los envíos se realizan mediante <strong>empresas de logística especializada en valores</strong>, totalmente asegurados al 100% del valor comercial de la gema y bajo estricta verificación de identidad en la entrega.
      </>
    ),
  },
]

export function ItemAcordeon({ id, pregunta, abierto, onToggle, children }) {
  const panel = `panelsStayOpen-collapse${id}`
  return (
    <div className="accordion-item">
      <h2 className="accordion-header">
        <button
          className={`accordion-button${abierto ? '' : ' collapsed'}`}
          type="button"
          aria-expanded={abierto}
          aria-controls={panel}
          onClick={onToggle}
        >
          {pregunta}
        </button>
      </h2>
      <div id={panel} className={`accordion-collapse collapse${abierto ? ' show' : ''}`}>
        <div className="accordion-body">{children}</div>
      </div>
    </div>
  )
}

export default function Home() {
  const [abiertos, setAbiertos] = useState(['One'])

  const toggle = (id) =>
    setAbiertos((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  return (
    <div className="bg-main min-vh-100">
      <section className="hero-simple">
        <div className="hero-simple-overlay"></div>
        <div className="hero-simple-content text-center">
          <h1 className="herotitulo">Splendor</h1>
          <p className="herosubtitulo">Elegancia, pureza y belleza certificada en cada pieza</p>
        </div>
      </section>

      <section className="container my-5">
        <div className="video-section-card">
          <div className="video-text-col">
            <h2
              className="video-title"
              style={{ fontFamily: "Cambria, Cochin, Georgia, Times, 'Times New Roman', serif" }}
            >
              Gemas Preciosas Certificadas
            </h2>
            <p className="video-description">
              Descubre el proceso de selección y los estándares internacionales con los que evaluamos cada diamante, esmeralda y zafiro de nuestra colección.
            </p>
          </div>
          <div className="video-iframe-col">
            <iframe
              src="https://www.youtube.com/embed/3LSHnLj-utw?si=_vT-hsab5gfAph0U&start=55"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="video-iframe"
            ></iframe>
          </div>
        </div>
      </section>

      <section className="faq-container my-5 container">
        <div className="text-center mb-4">
          <p className="herotitulo" style={{ color: 'rgb(40, 42, 108)' }}>Preguntas Frecuentes</p>
          <h2 className="fst-italic fw-normal text-white">
            Lo que solemos resolver antes de adquirir una gema preciosa.
          </h2>
        </div>

        <div className="accordion" id="accordionGemas">
          {preguntas.map((p) => (
            <ItemAcordeon
              key={p.id}
              id={p.id}
              pregunta={p.pregunta}
              abierto={abiertos.includes(p.id)}
              onToggle={() => toggle(p.id)}
            >
              {p.respuesta}
            </ItemAcordeon>
          ))}
        </div>
      </section>

      <section className="container my-5">
        <p className="text-white mb-4">
          Explora nuestra colección de diamantes certificados y elige la pieza perfecta que refleje la belleza y el significado de tu amor.
        </p>

        <div className="row align-items-center py-4 bg-gia-card rounded-3">
          <div className="col-12 col-md-4 text-center mb-4 mb-md-0">
            <img src="/img/logo-gia-solo.svg" alt="gia" />
          </div>
          <div className="col-12 col-md-8">
            <h3 className="h5 fw-bold text-white mb-3">Instituto Gemológico de América</h3>

            <p className="text-light-subtle lh-base mb-3">
              <strong>GIA</strong> es una institución sin ánimo de lucro dedicada a la investigación y formación en gemología, desde 1931. Su misión es proteger a vendedores y compradores de gemas, a través del establecimiento de estándares de calidad universales.
            </p>

            <p className="text-light-subtle lh-base mb-0">
              El sistema internacional de calificación de diamantes son <strong>las 4 Cs</strong> (cut, clarity, color y carat weight – corte, pureza, color y peso en quilates), es el método universal para evaluar la calidad de cualquier diamante, en cualquier parte del mundo bajo los parámetros de <strong>GIA</strong>.
            </p>
          </div>
        </div>
      </section>

      <br />
    </div>
  )
}
