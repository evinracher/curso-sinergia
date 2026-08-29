import {
  ArrowDown,
  ArrowUpRight,
  Code2,
  Download,
  ExternalLink,
  File,
  FileText,
  Link,
  Menu,
  Monitor,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { classes } from './courseData'
import nodoLogo from './assets/logo-nodo.png'
import eafitLogo from './assets/logo-eafit.svg'
import kevinPhoto from './assets/kevin-parra.jpg'

const nodoUrl = 'https://www.eafit.edu.co/sistema-ciencia-tecnologia-innovacion/innovacion-desarrollo-tecnologico/nodo?gad_source=1&gad_campaignid=24062700376&gbraid=0AAAAACcJWUpQbEQO4mwvgsyXlNhgvCoDz&gclid=CjwKCAjw48TUBhBREiwAK0GnQTiMUxf8iVdxP4wV-uJ9FzD7AdzHwxesxc9l7vMjUiUa6Q7CrY0M4hoCbpkQAvD_BwE'
const eafitUrl = 'https://www.eafit.edu.co/'

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/evinracher/', icon: Link },
  { label: 'Portafolio', href: 'https://evinracher.github.io/', icon: ExternalLink },
  { label: 'GitHub', href: 'https://github.com/evinracher', icon: Code2 },
]

const resourceIcons = { pdf: FileText, txt: File, link: ExternalLink, file: File }

function Resource({ resource }) {
  const Icon = resourceIcons[resource.type] || File
  const href = resource.href.startsWith('/')
    ? `${import.meta.env.BASE_URL}${resource.href.slice(1)}`
    : resource.href
  return (
    <a className="resource" href={href} target="_blank" rel="noreferrer">
      <span className={`resource-icon ${resource.type}`}><Icon size={19} /></span>
      <span className="resource-copy">
        <strong>{resource.name}</strong>
        <small>{resource.type.toUpperCase()}{resource.size ? ` · ${resource.size}` : ''}</small>
      </span>
      <Download size={17} aria-hidden="true" />
    </a>
  )
}

function ClassCard({ item }) {
  const [expanded, setExpanded] = useState(false)
  const hasResources = item.resources.length > 0

  return (
    <article className={`class-card ${expanded ? 'is-open' : ''}`}>
      <button className="class-summary" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
        <span className="class-number">{item.number}</span>
        <span className="class-heading">
          <small>{item.module}</small>
          <strong>{item.title}</strong>
        </span>
        <span className={`availability ${hasResources ? 'available' : ''}`}>
          {hasResources ? `${item.resources.length} recurso${item.resources.length > 1 ? 's' : ''}` : 'Próximamente'}
        </span>
        <ArrowDown className="class-arrow" size={19} aria-hidden="true" />
      </button>
      <div className="class-detail">
        <div className="class-detail-inner">
          <p>{item.description}</p>
          {hasResources ? (
            <div className="resources-list">{item.resources.map((resource) => <Resource key={resource.href} resource={resource} />)}</div>
          ) : (
            <div className="empty-resource"><Sparkles size={18} /><span>Los materiales de esta clase se publicarán aquí.</span></div>
          )}
        </div>
      </div>
    </article>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const close = () => setMenuOpen(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="wordmark" href="#inicio" aria-label="SinergIA, inicio"><span>sinerg</span><i>IA</i></a>
        <nav className={menuOpen ? 'nav-open' : ''} aria-label="Navegación principal">
          <a href="#curso" onClick={() => setMenuOpen(false)}>El curso</a>
          <a href="#recursos" onClick={() => setMenuOpen(false)}>Recursos</a>
          <a href="#profesor" onClick={() => setMenuOpen(false)}>Profesor</a>
        </nav>
        <a className="header-cta" href="#recursos">Ver materiales <ArrowDown size={15} /></a>
        <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Abrir menú">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-copy">
            <div className="eyebrow"><span /> Un curso de Nodo · Universidad EAFIT</div>
            <h1>Eleva tu talento con <em>inteligencia artificial.</em></h1>
            <p>Aprende a usar IA generativa para mejorar tu productividad, crear asistentes inteligentes y automatizar tareas, sin necesidad de programar.</p>
            <div className="hero-actions">
              <a className="button primary" href="#recursos">Explorar recursos <ArrowDown size={17} /></a>
              <a className="button ghost" href="https://ecommerce.eafit.edu.co/es/nodo/sinergia-eleva-tu-talento-con-ia-generativa" target="_blank" rel="noreferrer">Sitio oficial <ArrowUpRight size={17} /></a>
            </div>
          </div>
          <div className="hero-index" aria-hidden="true">
            <span>01</span><div /><small>08 clases<br />24 horas</small>
          </div>
        </section>

        <section className="course-strip" id="curso">
          <div className="metric"><Monitor /><span><small>Modalidad</small><strong>Online</strong></span></div>
          <div className="institution-lockup">
            <span>Un curso creado por Nodo de la Universidad EAFIT</span>
            <div className="institution-logos">
              <a href={nodoUrl} target="_blank" rel="noreferrer" aria-label="Visitar el sitio de Nodo EAFIT">
                <img src={nodoLogo} alt="Nodo" />
                <ArrowUpRight size={14} />
              </a>
              <span className="logo-divider" />
              <a href={eafitUrl} target="_blank" rel="noreferrer" aria-label="Visitar el sitio de la Universidad EAFIT">
                <img src={eafitLogo} alt="Universidad EAFIT" />
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </section>

        <section className="method-section section-pad">
          <div className="section-label">La experiencia</div>
          <div className="method-grid">
            <h2>Aprender haciendo.<br /><span>Transformar aplicando.</span></h2>
            <div className="method-copy">
              <p>Una ruta de aprendizaje experiencial basada en proyectos reales. Cada sesión combina conceptos, exploración, práctica guiada y la construcción progresiva de una solución aplicable a tu contexto profesional.</p>
              <div className="route" aria-label="Ruta metodológica">
                {['Entender', 'Explorar', 'Hacer', 'Transformar', 'Construir', 'Apropiar'].map((step, index) => (
                  <span key={step}><i>{String(index + 1).padStart(2, '0')}</i>{step}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="resources-section section-pad" id="recursos">
          <div className="resources-header">
            <div><div className="section-label">Biblioteca del curso</div><h2>Recursos por clase</h2></div>
            <p>Presentaciones, prompts y materiales de apoyo se habilitarán a medida que avancemos.</p>
          </div>
          <div className="classes-list">{classes.map((item) => <ClassCard key={item.number} item={item} />)}</div>
        </section>

        <section className="teacher-section section-pad" id="profesor">
          <div className="teacher-photo-wrap">
            <img className="teacher-photo" src={kevinPhoto} alt="Kevin Parra, profesor del curso SinergIA" />
          </div>
          <div className="teacher-content">
            <div className="section-label">Tu profesor</div>
            <h2>Kevin Parra</h2>
            <strong>Ingeniero de software · Especialista en formación en Inteligencia Artificial</strong>
            <p>Ingeniero de EAFIT con más de seis años de experiencia creando productos digitales para compañías internacionales. Combina su trayectoria en ingeniería frontend con IA generativa para convertir conceptos complejos en herramientas prácticas, accesibles y aplicables al trabajo cotidiano.</p>
            <div className="socials">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer"><Icon size={17} /> {label} <ArrowUpRight size={14} /></a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <a className="wordmark" href="#inicio"><span>sinerg</span><i>IA</i></a>
        <p>Material académico para estudiantes del curso SinergIA.</p>
        <span>© 2026</span>
      </footer>
    </div>
  )
}

export default App
