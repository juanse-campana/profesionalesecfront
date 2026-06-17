import { API_URL } from "@/lib/api"

export type CmsFaqItem = {
  question: string
  answer: string
}

export type FooterFaqsContent = {
  professionalFaqs: CmsFaqItem[]
  conversatorioFaqs: CmsFaqItem[]
}

export type ParagraphSection = {
  title: string
  paragraphs: string[]
  highlightedParagraphIndex: number
}

export type AboutUsContent = {
  hero: {
    eyebrow: string
    title: string
    description: string
  }
  mission: {
    title: string
    body: string
  }
  vision: {
    title: string
    body: string
  }
  whoWeAre: ParagraphSection
  history: ParagraphSection
  founders: {
    title: string
    items: Array<{
      initials: string
      name: string
      role: string
    }>
  }
  values: {
    title: string
    items: Array<{
      title: string
      description: string
    }>
  }
  trustReasons: {
    title: string
    items: string[]
  }
  commitments: {
    title: string
    items: string[]
  }
  eventsAndConversations: ParagraphSection
}

export type TermsSection = {
  id: string
  title: string
  paragraphs: string[]
  bulletItems: string[]
  closingParagraph: string
}

export type TermsAndConditionsContent = {
  hero: {
    badge: string
    title: string
    lastUpdatedLabel: string
  }
  sections: TermsSection[]
  contact: {
    title: string
    intro: string
    phone: string
    email: string
  }
}

export const defaultFooterFaqs: FooterFaqsContent = {
  professionalFaqs: [
    {
      question: "¿Qué es Profesionales.ec?",
      answer: "Plataforma que conecta profesionales certificados con clientes.",
    },
    {
      question: "¿Registro?",
      answer: 'Clic en "Crear Perfil Profesional" y completa tus datos.',
    },
    {
      question: "¿Costo?",
      answer: "Registro básico gratuito. Planes premium disponibles.",
    },
  ],
  conversatorioFaqs: [
    {
      question: "¿Conversatorios?",
      answer: "Eventos exclusivos de aprendizaje y networking.",
    },
    {
      question: "¿Inscripción?",
      answer: 'Sección "Educación" y completa el formulario.',
    },
    {
      question: "¿Certificado?",
      answer: "Sí, certificado digital de participación incluido.",
    },
  ],
}

export const defaultAboutUsContent: AboutUsContent = {
  hero: {
    eyebrow: "Profesionales Ecuador",
    title: "Sobre Nosotros",
    description:
      "Somos una plataforma creada para conectar conocimiento, experiencia y oportunidades. Impulsamos la formación continua, la colaboración profesional y el crecimiento de expertos en distintas áreas.",
  },
  mission: {
    title: "Misión",
    body:
      "Impulsar el desarrollo profesional en Ecuador y en la región, proporcionando una plataforma de difusión, capacitación y networking basada en altos estándares de calidad, ética y excelencia académica.",
  },
  vision: {
    title: "Visión",
    body:
      "Convertirnos en la principal red de profesionales en Ecuador, reconocida por su contribución activa al crecimiento educativo, social y empresarial del país.",
  },
  whoWeAre: {
    title: "¿Quiénes Somos?",
    paragraphs: [
      "En Profesionales Ecuador creemos en el poder de la excelencia, la educación continua y la colaboración entre expertos.",
      "Somos una plataforma diseñada para conectar a profesionales de diversas áreas con personas, empresas e instituciones que valoran el conocimiento especializado y la formación de calidad.",
      "Nuestro propósito es crear un espacio confiable donde el crecimiento profesional y la capacitación sean accesibles para todos.",
    ],
    highlightedParagraphIndex: 2,
  },
  history: {
    title: "Nuestra Historia",
    paragraphs: [
      "Profesionales Ecuador nace de la visión compartida del Ing. Terry Mendieta y el Ing. Juan Estrada, quienes identificaron la necesidad de un espacio serio y organizado para conectar a expertos de diferentes áreas.",
      "Contamos además con el valioso apoyo del Dr. Luis Gutiérrez en nuestro primer conversatorio, marcando el inicio de esta gran comunidad.",
      "Desde entonces, hemos crecido consolidándonos como un referente en conversatorios, formación continua y eventos de alta calidad.",
    ],
    highlightedParagraphIndex: 2,
  },
  founders: {
    title: "Fundadores",
    items: [
      { initials: "TM", name: "Terry Mendieta", role: "CEO / Fundador" },
      { initials: "JE", name: "Juan Estrada", role: "CEO / Fundador" },
    ],
  },
  values: {
    title: "Nuestros Valores",
    items: [
      { title: "Excelencia", description: "Promovemos siempre lo mejor de cada profesional." },
      { title: "Innovación", description: "Apostamos por la mejora continua y el uso de nuevas tecnologías." },
      { title: "Ética", description: "Actuamos con transparencia, respeto y responsabilidad." },
      { title: "Compromiso Social", description: "Buscamos impactar positivamente en nuestra sociedad." },
    ],
  },
  trustReasons: {
    title: "¿Por Qué Confiar en Profesionales Ecuador?",
    items: [
      "Somos un espacio de crecimiento y formación continua.",
      "Contamos con una red de expertos evaluados y certificados.",
      "Trabajamos bajo principios éticos y legales que protegen a todos nuestros usuarios.",
      "Nos comprometemos con tu desarrollo personal y profesional.",
    ],
  },
  commitments: {
    title: "Nuestro Compromiso",
    items: [
      "Evaluamos cuidadosamente el perfil de cada profesional antes de su incorporación a la plataforma.",
      "Organizamos conversatorios y eventos con los más altos estándares de calidad.",
      "Fomentamos la actualización constante y la difusión de conocimientos a través de contenidos confiables y pertinentes.",
      "Protegemos y promovemos la imagen de nuestros profesionales, siempre respetando acuerdos claros y transparentes.",
    ],
  },
  eventsAndConversations: {
    title: "Conversatorios y Eventos",
    paragraphs: [
      "En cada evento, conversatorio o actividad organizada por Profesionales Ecuador, los participantes autorizan la grabación de audio y video, así como la captura de fotografías.",
      "Estas grabaciones podrán ser utilizadas posteriormente con fines promocionales, educativos o comerciales, sin limitaciones territoriales ni temporales.",
      "Importante: El profesional autoriza de manera gratuita el uso comercial de su imagen, salvo que se llegue a un acuerdo diferente por escrito en algún caso extraordinario. Todos los contenidos generados en nuestros conversatorios son propiedad de Profesionales Ecuador, salvo pacto en contrario formalizado por escrito.",
    ],
    highlightedParagraphIndex: 2,
  },
}

export const defaultTermsAndConditionsContent: TermsAndConditionsContent = {
  hero: {
    badge: "Términos Legales",
    title: "Términos y Condiciones",
    lastUpdatedLabel: "Última actualización: 20 de febrero de 2025",
  },
  sections: [
    {
      id: "introduccion",
      title: "1. Introducción",
      paragraphs: [
        "Bienvenido(a) a Profesionales Ecuador. Estos Términos y Condiciones regulan el acceso, uso y participación en nuestra plataforma digital (www.profesionales.ec) y en todos los servicios relacionados que ofrecemos.",
        "Al acceder, navegar, registrarte o utilizar nuestros servicios, aceptas expresamente y sin reservas estar sujeto(a) a los presentes Términos y Condiciones, así como a nuestra Política de Privacidad y demás políticas aplicables.",
      ],
      bulletItems: [],
      closingParagraph: "",
    },
    {
      id: "informacion-general",
      title: "2. Información General",
      paragraphs: [
        "Profesionales Ecuador es una plataforma que promueve la visibilidad, conexión y desarrollo de profesionales en distintas áreas de especialización en el Ecuador.",
        "Actuamos como intermediarios digitales, brindando espacios de exposición, formación y difusión profesional, sin asumir responsabilidad directa sobre los servicios ofrecidos por los profesionales registrados.",
      ],
      bulletItems: [],
      closingParagraph: "",
    },
    {
      id: "registro",
      title: "4. Registro y Evaluación de Profesionales",
      paragraphs: [
        "El acceso como profesional registrado en Profesionales Ecuador no es automático ni garantizado.",
        "Evaluación previa: Todos los aspirantes a formar parte de la plataforma serán objeto de una evaluación exhaustiva realizada por el equipo de Profesionales Ecuador.",
      ],
      bulletItems: [
        "Formación académica verificada",
        "Experiencia profesional demostrable",
        "Reputación, referencias y trayectoria",
        "Cumplimiento ético y profesional",
      ],
      closingParagraph:
        "Profesionales Ecuador se reserva el derecho exclusivo de aceptar o rechazar solicitudes sin necesidad de justificar su decisión, en resguardo de la calidad y reputación de la plataforma.",
    },
    {
      id: "perfiles",
      title: "5. Perfiles Profesionales",
      paragraphs: [
        "Al registrarse y aceptar su incorporación, el profesional:",
      ],
      bulletItems: [
        "Autoriza expresamente a Profesionales Ecuador a publicar y difundir su perfil, incluyendo nombre completo, imagen personal, formación académica, experiencia, certificaciones y otros datos profesionales relevantes.",
        "Dicha autorización incluye el uso de los datos para promoción dentro y fuera de la plataforma, material publicitario, educativo o institucional, y campañas de marketing.",
      ],
      closingParagraph:
        "Esta cesión de derechos de imagen y datos profesionales es gratuita, ilimitada en tiempo y territorio, y no generará contraprestaciones económicas salvo que se acuerde expresamente por escrito.",
    },
    {
      id: "conversatorios",
      title: "6. Conversatorios y Eventos",
      paragraphs: [
        "Al inscribirse o participar en cualquier conversatorio, seminario, webinar o evento organizado por Profesionales Ecuador, el participante acepta y autoriza expresamente:",
      ],
      bulletItems: [
        "La grabación total o parcial de audio y video del evento",
        "La captura de fotografías durante el desarrollo del evento",
        "El uso, reproducción, distribución y difusión de dichas grabaciones e imágenes con fines promocionales, educativos o comerciales, sin limitaciones territoriales ni temporales",
      ],
      closingParagraph:
        "Los contenidos generados en los conversatorios serán propiedad exclusiva de Profesionales Ecuador, salvo pacto escrito en contrario.",
    },
    {
      id: "propiedad",
      title: "7. Propiedad Intelectual",
      paragraphs: [
        "Todo el contenido de la plataforma, incluyendo pero no limitado a textos, gráficos, logos, íconos, imágenes, clips de audio, clips de video, descargas digitales, compilaciones de datos y software, es propiedad exclusiva de Profesionales Ecuador o de sus proveedores de contenido.",
      ],
      bulletItems: [],
      closingParagraph:
        "Está estrictamente prohibido copiar, reproducir, distribuir, modificar o crear obras derivadas de cualquier material sin autorización escrita de Profesionales Ecuador.",
    },
  ],
  contact: {
    title: "19. Contacto",
    intro:
      "Para cualquier duda, comentario, solicitud o reclamo relacionado con estos Términos y Condiciones, puede contactarnos a:",
    phone: "0994147639",
    email: "info@profesionales.ec",
  },
}

async function cmsFetch<T>(endpoint: string, options: RequestInit = {}) {
  const isFormData = options.body instanceof FormData
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  })

  if (res.status === 204) return null as T

  let data: any = null
  try {
    data = await res.json()
  } catch {
    if (!res.ok) throw new Error(`Error API (${res.status})`)
    return null as T
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Error en la petición")
  }

  return (data?.data ?? data) as T
}

function adminHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  }
}

export const cmsLegalApi = {
  getPublicContent() {
    return cmsFetch<{
      footerFaqs: FooterFaqsContent
      aboutUs: AboutUsContent
      termsAndConditions: TermsAndConditionsContent
    }>("/cms/legal/public")
  },
  getFooterFaqs() {
    return cmsFetch<FooterFaqsContent>("/cms/legal/footer-faqs")
  },
  getAboutUs() {
    return cmsFetch<AboutUsContent>("/cms/legal/about-us")
  },
  getTermsAndConditions() {
    return cmsFetch<TermsAndConditionsContent>("/cms/legal/terms-and-conditions")
  },
  getAdminFooterFaqs(token: string) {
    return cmsFetch<FooterFaqsContent>("/cms/legal/admin/footer-faqs", { headers: adminHeaders(token) })
  },
  updateAdminFooterFaqs(payload: FooterFaqsContent, token: string) {
    return cmsFetch<FooterFaqsContent>("/cms/legal/admin/footer-faqs", {
      method: "PUT",
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    })
  },
  getAdminAboutUs(token: string) {
    return cmsFetch<AboutUsContent>("/cms/legal/admin/about-us", { headers: adminHeaders(token) })
  },
  updateAdminAboutUs(payload: AboutUsContent, token: string) {
    return cmsFetch<AboutUsContent>("/cms/legal/admin/about-us", {
      method: "PUT",
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    })
  },
  getAdminTermsAndConditions(token: string) {
    return cmsFetch<TermsAndConditionsContent>("/cms/legal/admin/terms-and-conditions", { headers: adminHeaders(token) })
  },
  updateAdminTermsAndConditions(payload: TermsAndConditionsContent, token: string) {
    return cmsFetch<TermsAndConditionsContent>("/cms/legal/admin/terms-and-conditions", {
      method: "PUT",
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    })
  },
}
