export const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

// --- Interfaces ---

export interface Usuario {
  id: number
  nombre: string
  correo: string
  rol_id: number
  foto_url?: string
  telefono?: string
  academic_name?: string
  cedula?: string // Added based on DB schema
  estado?: string
}

export interface RegisterData {
  nombre: string
  correo: string
  contrasena: string
  rol_id?: number
  academic_name?: string
  telefono?: string
  cedula?: string
  foto_url?: string
}

export interface LoginData {
  correo: string
  contrasena: string
}

export interface PerfilProfesionalData {
  id?: number
  profesion_id: number
  especialidad_id?: number
  ciudad_id?: number
  descripcion: string
  telefono?: string
  cedula?: string // Added
  foto_url?: string
  banner_url?: string
  modalidad?: string
  latitud?: number
  longitud?: number
  calle_principal?: string
  referencia?: string
  permitir_reagendar?: boolean
  tarifa?: number
  tarifa_hora?: number // Added for compatibility with admin view
  plan?: string
  comprobante_pago_url?: string
  payment_method?: string
  payphone_flow?: boolean
}

export interface ComprobanteTemporalResponse {
  url: string
}

export interface UbicacionData {
  latitud: number
  longitud: number
  direccion?: string
}

export interface CambiarContrasenaData {
  contrasena_actual: string
  nueva_contrasena: string
}

export interface PerfilProfesionalSummary {
  id: number
  slug?: string
  profesion_id: number
  especialidad_id?: number
  profesion?: { id: number; nombre: string }
  especialidad?: { id: number; nombre: string }
}

export interface Articulo {
  id: number
  usuario_id: number
  titulo: string
  contenido: string
  resumen?: string
  imagen_url?: string
  pdf_url?: string
  estado: "borrador" | "publicado" | "archivado"
  fecha_publicacion: string
  created_at: string
  updated_at: string
  autor?: {
    id: number
    nombre: string
    correo?: string
    foto_url?: string
    perfiles_profesionales?: PerfilProfesionalSummary[]
  }
}

export interface Auditoria {
  id: number
  modulo: string
  accion: string
  descripcion: string
  ip_origen?: string
  usuario_id: number
  created_at: string
}

export interface Certificado {
  id: number
  codigo: string
  usuario_id: number
  ponencia_id: number
  url_pdf: string
  fecha_emision: string
}

export interface CertificateRequestPayload {
  scope: "conversatorio"
  ponencia_id: number
  payment_method: "gratuito" | "payphone" | "transferencia"
  costo?: number
  comprobante_pago_url?: string | null
  pago_id?: number | null
  metadata?: Record<string, any> | null
}

export interface CertificateValidationResult {
  id: number
  codigo_verificacion: string
  scope: "conversatorio"
  status: string
  payment_method: string
  costo: number
  fecha_solicitud: string | null
  fecha_emision: string | null
  certificado_url: string | null
  usuario: { id: number; nombre: string; correo: string } | null
  conversatorio: {
    id: number
    titulo: string
    slug?: string | null
    fecha_inicio?: string | null
    fecha_fin?: string | null
  } | null
  ponencia: {
    id: number
    tema_charla?: string | null
    nombre_ponente?: string | null
    slug?: string | null
    hora_inicio?: string | null
    hora_fin?: string | null
  } | null
}

export interface CertificateRecord {
  id: number
  usuario_id: number | null
  ponencia_id: number
  ponencia_ponente_id: number | null
  pago_id: number | null
  scope: "conversatorio"
  status: string
  payment_method: "gratuito" | "payphone" | "transferencia"
  costo: number
  comprobante_pago_url: string | null
  codigo_verificacion: string
  url_pdf: string | null
  fecha_solicitud: string
  fecha_emision: string | null
  metadata?: Record<string, any> | null
  usuario?: { id: number; nombre: string; correo: string } | null
  ponencia?: { id: number; titulo: string; slug?: string | null; fecha_inicio?: string | null; fecha_fin?: string | null } | null
  ponencia_ponente?: { id: number; tema_charla?: string | null; nombre_ponente?: string | null; slug?: string | null; hora_inicio?: string | null; hora_fin?: string | null } | null
  pago?: { id: number; monto: number | string; metodo: string; referencia?: string | null; estado_id: number; gateway?: string | null; gateway_reference?: string | null } | null
}

export interface PayPhoneCertificatePreparePayload {
  scope: "conversatorio"
  ponencia_id: number
  clientTransactionId?: string
  currency?: string
  reference?: string
  responseUrl?: string
  cancellationUrl?: string
  costo?: number
}

export interface PayPhoneCertificatePrepareData {
  reused: boolean
  certificado: CertificateRecord
  checkout: PayPhonePriorityCheckout
}

export interface PayPhoneCertificateConfirmPayload {
  clientTransactionId: string
  id?: number | string
  paymentId?: number | string
  payphonePaymentId?: number | string
}

export interface PayPhoneCertificateConfirmData {
  approved: boolean
  reviewRequired: boolean
  manualReviewMessage: string | null
  certificado: CertificateRecord
  confirmation: {
    id: number | null
    transactionId: number | null
    clientTransactionId: string | null
    statusCode: number | null
    normalizedStatus: string | null
  }
}

export interface ChatSesion {
  id: number
  usuario_id: number
  direccion_id?: number
  estado: string
  created_at: string
}

export interface Mensaje {
  id: number
  chat_sesion_id: number
  rol: 'usuario' | 'asistente'
  contenido: string
  created_at: string
}

export interface Cita {
  id: number
  profesional_id: number
  usuario_id?: number
  nombres_completos?: string
  correo?: string
  telefono?: string
  comentario?: string
  fecha_cita: string
  hora_cita: string
  estado_id: number
  created_at: string
}

export interface Pago {
  id: number
  usuario_id: number
  plan_id: number
  monto: number
  metodo: string
  referencia?: string
  estado: string
  created_at: string
}

export interface Plan {
  id: number
  nombre: string
  precio: number
  duracion_dias: number
  descripcion?: string
  activo: boolean
}

export interface BankAccount {
  id: number
  bank_name: string
  account_type: string
  account_number: string
  holder_identifier: string
  holder_name: string
  email: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BankAccountPayload {
  bank_name: string
  account_type: string
  account_number: string
  holder_identifier: string
  holder_name: string
  email?: string | null
  is_active?: boolean
}

export interface PayPhoneAdminConfiguration {
  PAYPHONE_ENABLED: boolean
  PAYPHONE_TOKEN: string
  PAYPHONE_STORE_ID: string
  PAYPHONE_RESPONSE_URL: string
  PAYPHONE_CANCELLATION_URL: string
}

export interface PayPhonePriorityTransaction {
  id: number
  pago_id: number | null
  user_id: number
  perfil_id: number | null
  client_transaction_id: string
  payphone_payment_id: number | null
  payphone_transaction_id: number | null
  amount: number
  currency: string
  status: string
  confirm_deadline_at: string | null
  error_detail: string | null
}

export interface PayPhonePriorityCheckout {
  id: number | null
  transactionId: number | null
  clientTransactionId: string | null
  checkoutUrl: string | null
  payWithCard: string | null
  payWithPayPhone: string | null
  statusCode: number | null
  normalizedStatus: string | null
}

export interface PayPhonePriorityPreparePayload {
  clientTransactionId?: string
  cancellationUrl?: string
  currency?: string
  idempotencyKey?: string
  perfil_id?: number
  plan?: string
  registrationDraft?: PayPhonePriorityRegistrationDraft
  reference?: string
  responseUrl?: string
}

export interface PayPhonePriorityDocumentDraft {
  tipo: string
  url: string
}

export interface PayPhonePriorityServiceDraft {
  descripcion: string
}

export interface PayPhonePriorityScheduleDraft {
  matriz: boolean[]
}

export interface PayPhonePriorityProfileDraft {
  profesion_id: number
  especialidad_id?: number | null
  ciudad_id?: number | null
  descripcion: string
  telefono?: string
  cedula?: string
  foto_url?: string
  banner_url?: string
  modalidad?: string
  latitud?: number
  longitud?: number
  lat?: number
  lng?: number
  calle_principal?: string
  referencia?: string
  permitir_reagendar?: boolean
  tarifa?: number | null
  tarifa_hora?: number | null
  facebook_url?: string
  instagram_url?: string
  tiktok_url?: string
  linkedin_url?: string
  x_url?: string
  yt_url?: string
  show_phone?: boolean
  show_email?: boolean
  plan?: string
  comprobante_pago_url?: string
  payment_method?: string
  payphone_flow?: boolean
}

export interface PayPhonePriorityRegisterDraft {
  nombre: string
  correo: string
  contrasena: string
  cedula?: string
  telefono?: string
}

export interface PayPhonePriorityRegistrationDraft {
  mode: "new_user" | "existing_user"
  registerData?: PayPhonePriorityRegisterDraft
  profileData: PayPhonePriorityProfileDraft
  schedule: PayPhonePriorityScheduleDraft
  services: PayPhonePriorityServiceDraft[]
  documents: PayPhonePriorityDocumentDraft[]
}

export interface PayPhonePriorityPrepareData {
  reused: boolean
  transaction: PayPhonePriorityTransaction
  checkout: PayPhonePriorityCheckout
}

export interface PayPhonePriorityConfirmPayload {
  clientTransactionId: string
  id?: number | string
  idempotencyKey?: string
  payphonePaymentId?: number | string
}

export interface PayPhonePriorityConfirmData {
  approved: boolean
  reviewRequired: boolean
  manualReviewMessage: string | null
  transaction: PayPhonePriorityTransaction
  confirmation: {
    id: number | null
    transactionId: number | null
    clientTransactionId: string | null
    statusCode: number | null
    normalizedStatus: string | null
  }
}

export interface Ponencia {
  id: number
  slug?: string
  titulo: string
  descripcion: string
  fecha_inicio: string
  hora_inicio?: string
  fecha_fin: string
  hora_fin?: string
  subtitulo?: string
  profesion_id: number
  precio: number
  cupo: number
  estado: string
  provincia_id?: number
  ciudad_id?: number
  ciudad?: { id: number; nombre: string }
  provincia?: { id: number; nombre: string }
  direccion?: string
  latitud?: number
  longitud?: number
  imagen_banner?: string
  video_url?: string
  galeria_fotos?: string[] | any
  es_destacado?: boolean
  url_revista_general?: string
  foto_revista_general?: string
  resumen_formato?: string
  config_visual?: Record<string, any> | null
  dias?: PonenciaDia[]
}

export interface PonenciaDia {
  id?: number
  ponencia_id?: number
  fecha: string
  orden: number
  titulo_dia?: string
  hora_inicio?: string
  hora_fin?: string
  ponentes?: PonenciaPonente[]
}

export interface PonenciaMaterialApoyo {
  id?: number
  ponencia_ponente_id?: number
  tipo: "link" | "file"
  categoria?: string | null
  titulo?: string | null
  descripcion?: string | null
  url: string
  mime_type?: string | null
  nombre_archivo?: string | null
  extension?: string | null
  tamano_bytes?: number | null
  orden?: number
}

export interface PonenciaPonente {
  id?: number
  ponencia_id?: number
  dia_id?: number
  usuario_id?: number
  nombre_ponente?: string
  profesion?: string
  tema_charla?: string
  foto_revista_url?: string
  url_revista_personal?: string
  slug?: string // NUEVO
  biografia?: string // NUEVO
  video_url?: string // NUEVO
  slogan?: string // NUEVO
  fondo_banner?: string // PREMIUM
  galeria_fotos?: string[] // PREMIUM
  es_muestra_gratis?: boolean
  hora_inicio?: string
  hora_fin?: string
  materiales_apoyo?: PonenciaMaterialApoyo[]
  orden: number
  usuario?: { id: number; nombre: string; foto_url?: string }
}

export interface Publicidad {
  id: number
  usuario_id: number
  ubicacion_slug: string
  tipo: string
  titulo: string
  contenido?: string
  url_destino?: string
  fecha_inicio: string
  fecha_fin: string
  imagen_url?: string
  estado: string
}

export interface Revista {
  id: number
  titulo: string
  descripcion: string
  portada_url?: string
  pdf_url: string
  fecha_publicacion: string
  edicion?: string
  activo: boolean
}

export interface ApiResponse {
  message?: string
  mensaje?: string
  token?: string
  usuario?: Usuario
  error?: string
  [key: string]: any
}

// --- Helper Functions ---

async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
  const isFormData = options.body instanceof FormData;
  const defaultHeaders: Record<string, string> = {};

  if (!isFormData) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  // Handle 204 No Content
  if (res.status === 204) return null;

  let data;
  try {
    data = await res.json();
  } catch (e) {
    // If JSON parse fails, try to get text or just throw status
    if (!res.ok) {
      throw new Error(`Error API (${res.status}): ${res.statusText}`);
    }
    return null; // or res.text() if needed
  }

  if (!res.ok) {
    throw new Error(data.error?.message || data.message || data.error || data.mensaje || "Error en la petición");
  }

  // Golden Rule #6: API Contract Support { data, error, meta }
  return data.data !== undefined ? data.data : data;
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function optionalAuthHeader(token?: string | null) {
  return token ? authHeader(token) : {}
}

// --- API Objects ---

// Auth API
export const authApi = {
  async register(data: RegisterData): Promise<ApiResponse> {
    return fetchApi("/auth/registro", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async registerUsuario(data: RegisterData): Promise<ApiResponse> {
    return fetchApi("/auth/registro-usuario", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async login(data: LoginData): Promise<ApiResponse> {
    return fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async logout(token: string) {
    return fetchApi("/auth/logout", {
      method: "POST",
      headers: authHeader(token),
    });
  },

  async renovar(token: string) {
    return fetchApi("/auth/renovar", {
      headers: authHeader(token),
    });
  },

  async cambiarContrasena(token: string, data: CambiarContrasenaData) {
    return fetchApi("/auth/cambiar-contrasena", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data)
    });
  },

  async verificarEmail(token: string): Promise<ApiResponse> {
    return fetchApi(`/auth/verificar-email/${token}`, {
      method: "GET",
    });
  },

  async solicitarRecuperacion(correo: string): Promise<ApiResponse> {
    return fetchApi("/auth/recuperar-contrasena", {
      method: "POST",
      body: JSON.stringify({ correo }),
    });
  },

  async restablecerContrasena(token: string, nueva_contrasena: string): Promise<ApiResponse> {
    return fetchApi("/auth/restablecer-contrasena", {
      method: "POST",
      body: JSON.stringify({ token, nueva_contrasena }),
    });
  }
}

// Catalogos API
export const catalogosApi = {
  async obtenerProfesiones() { return fetchApi("/catalogos/profesiones"); },
  async crearProfesion(data: { nombre: string }, token: string) {
    return fetchApi("/catalogos/profesiones", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },
  async actualizarProfesion(id: number, data: { nombre: string }, token: string) {
    return fetchApi(`/catalogos/profesiones/${id}`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },
  async obtenerEspecialidades(profesion_id?: number) {
    const query = profesion_id ? `?profesion_id=${profesion_id}` : ""
    return fetchApi(`/catalogos/especialidades${query}`);
  },
  async crearEspecialidad(data: { nombre: string; profesion_id: number }, token: string) {
    return fetchApi("/catalogos/especialidades", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },
  async obtenerProvincias() { return fetchApi("/catalogos/provincias"); },
  async obtenerCiudades(provincia_id?: number) {
    const query = provincia_id ? `?provincia_id=${provincia_id}` : "";
    return fetchApi(`/catalogos/ciudades${query}`);
  },
}

// Profesional API
export const profesionalApi = {
  async crearPerfil(data: PerfilProfesionalData, token: string) {
    return fetchApi("/profesionales/crear-perfil", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },

  async subirComprobantePago(archivo: File): Promise<ComprobanteTemporalResponse> {
    const formData = new FormData()
    formData.append("archivo", archivo)

    const res = await fetch(`${API_URL}/profesionales/comprobante-pago`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || err.message || "Error al subir comprobante")
    }

    return res.json()
  },

  async obtenerMiPerfil(token: string, id?: number) {
    const query = id ? `?id=${id}` : ""
    return fetchApi(`/profesionales/perfil${query}`, {
      headers: authHeader(token)
    });
  },

  async actualizarPerfil(data: Partial<PerfilProfesionalData> & { id: number }, token: string) {
    return fetchApi("/profesionales/actualizar-perfil", {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(data)
    });
  },

  async subirDocumento(tipo: string, archivo: File, token: string, perfilId?: number) {
    const formData = new FormData()
    formData.append("archivo", archivo)
    formData.append("tipo", tipo)
    if (perfilId) formData.append("perfilId", perfilId.toString())

    // Custom fetch for FormData since it doesn't use Content-Type: application/json
    const res = await fetch(`${API_URL}/profesionales/documentos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }, // Browser sets multipart boundary automatically
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || err.message || "Error al subir documento");
    }
    return res.json();
  },

  async buscar(filtros: any) {
    const params = new URLSearchParams()
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== null) params.append(key, filtros[key].toString());
    });
    return fetchApi(`/profesionales/buscar?${params.toString()}`);
  },

  async obtenerVerificados(filtros: any = {}) {
    const params = new URLSearchParams()
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== "") {
        params.append(key, filtros[key].toString());
      }
    });
    
    // Usamos fetch nativo para evitar que fetchApi nos quite el objeto `meta`
    const res = await fetch(`${API_URL}/profesionales/verificados?${params.toString()}`);
    if (!res.ok) {
      throw new Error("Error fetching verificados");
    }
    return res.json(); // Devolvemos el json completo { data: [...], meta: {...} }
  },

  async buscarCercanos(lat: number, lng: number, radio: number = 10) {
    return fetchApi(`/profesionales/cercanos?lat=${lat}&lng=${lng}&radio=${radio}`);
  },

  async obtenerStatsEspecialidades(profesionIds?: number[]) {
    const query = profesionIds && profesionIds.length > 0
      ? `?profesion_ids=${profesionIds.join(",")}`
      : ""
    return fetchApi(`/profesionales/stats/especialidades${query}`)
  },

  async obtenerPublico(slug: string) {
    return fetchApi(`/profesionales/publico/${slug}`);
  },

  async gestionarUbicacion(data: UbicacionData, token: string) {
    return fetchApi("/profesionales/ubicacion", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data)
    });
  },

  async obtenerUbicacion(token: string) {
    return fetchApi("/profesionales/ubicacion", { headers: authHeader(token) });
  },

  async obtenerDestacados() {
    return fetchApi("/profesionales/destacados");
  },
}

// Citas API
export const citasApi = {
  async agendarPublico(data: any) {
    return fetchApi("/citas/publico", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async agendarPrivado(data: any, token: string) {
    return fetchApi("/citas", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data)
    });
  },

  async listar(token: string) {
    return fetchApi("/citas", { headers: authHeader(token) });
  },

  async cambiarEstado(id: number, estado_id: number, token: string) {
    return fetchApi(`/citas/${id}/estado`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify({ estado_id }),
    });
  },

  async reagendar(id: number, data: { fecha_cita: string, hora_cita: string }, token: string) {
    return fetchApi(`/citas/${id}/reagendar`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(data)
    });
  }
}


// Auditoria API (Admin)
export const auditoriaApi = {
  async registrar(data: Partial<Auditoria>, token: string) {
    return fetchApi("/auditoria", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data)
    });
  },
  async listar(token: string) { return fetchApi("/auditoria", { headers: authHeader(token) }); },
  async listarPorUsuario(usuarioId: number, token: string) {
    return fetchApi(`/auditoria/usuario/${usuarioId}`, { headers: authHeader(token) });
  },
  async obtenerDetalle(id: number, token: string) { return fetchApi(`/auditoria/${id}`, { headers: authHeader(token) }); },
  async eliminar(id: number, token: string) {
    return fetchApi(`/auditoria/${id}`, { method: "DELETE", headers: authHeader(token) });
  }
}

// Certificados API
export const certificadosApi = {
  async solicitar(data: CertificateRequestPayload, token: string): Promise<CertificateRecord> {
    return fetchApi("/certificados/solicitar", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    })
  },

  async preparePayPhoneCheckout(data: PayPhoneCertificatePreparePayload, token: string): Promise<PayPhoneCertificatePrepareData> {
    return fetchApi("/certificados/payphone/prepare", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    })
  },

  async confirmPayPhoneCheckout(data: PayPhoneCertificateConfirmPayload, token: string): Promise<PayPhoneCertificateConfirmData> {
    return fetchApi("/certificados/payphone/confirm", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    })
  },

  async generar(data: CertificateRequestPayload & { usuario_id: number; url_pdf?: string | null }, token: string): Promise<CertificateRecord> {
    return fetchApi("/certificados", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    })
  },

  async listar(token: string): Promise<CertificateRecord[]> {
    return fetchApi("/certificados", { headers: authHeader(token) })
  },

  async listarMios(token: string): Promise<CertificateRecord[]> {
    return fetchApi("/certificados/mios", { headers: authHeader(token) })
  },

  async actualizarEstado(id: number, data: { status: string; force_regenerate?: boolean; url_pdf?: string | null; pago_id?: number | null; comprobante_pago_url?: string | null }, token: string): Promise<CertificateRecord> {
    return fetchApi(`/certificados/${id}/status`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(data),
    })
  },

  async eliminar(id: number, token: string): Promise<{ id: number }> {
    return fetchApi(`/certificados/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    })
  },

  async validar(id: number | string): Promise<CertificateValidationResult> {
    return fetchApi(`/certificados/validar/${id}`)
  },

  async obtenerDescargaUrl(codigo: string, token: string): Promise<string> {
    const res = await fetch(`${API_URL}/certificados/descargar/${codigo}`, {
      method: "GET",
      headers: authHeader(token),
      redirect: "follow",
    })

    if (!res.ok) {
      let data: any = null
      try {
        data = await res.json()
      } catch {}
      throw new Error(data?.error?.message || data?.message || data?.error || "No se pudo obtener la descarga del certificado")
    }

    return res.url
  },
}

export interface UsuarioPortalConfiguracion {
  usuario: {
    id: number
    nombre: string
    correo: string
    telefono?: string | null
    foto_url?: string | null
    academic_name?: string | null
    academic_name_updated_at?: string | null
    rol?: string | null
  }
  academic_name_locked: boolean
  academic_name_days_remaining: number
  academic_name_next_available_at?: string | null
  academic_name_lock_days: number
}

export interface UsuarioPortalCitaRecord {
  id: number
  fecha_cita: string
  hora_cita: string
  comentario?: string | null
  nombres_completos?: string | null
  estado?: string | null
  estado_id?: number
  fecha_creacion?: string | null
  reagendada_veces?: number
  cita_datetime?: string | null
  es_proxima?: boolean
  profesional?: {
    id: number
    nombre: string
    academic_name?: string | null
    display_name?: string | null
    correo?: string | null
    telefono?: string | null
    foto_url?: string | null
    perfil_slug?: string | null
    perfil_id?: number | null
    verificado?: boolean | null
  } | null
}

export interface UsuarioPortalCursoRecord {
  id: number
  fecha_inscripcion?: string | null
  estado_validacion?: string | null
  estado_canonico?: string | null
  curso?: {
    id: number
    titulo: string
    slug?: string | null
    tipo?: string | null
    estado?: string | null
    fecha_inicio?: string | null
    fecha_fin?: string | null
    hora_inicio?: string | null
    hora_fin?: string | null
    precio?: number | null
    imagen_banner?: string | null
  } | null
  asistencia?: {
    id: number
    metodo_verificacion?: string | null
    fecha_asistencia?: string | null
  } | null
  certificado?: {
    id: number
    status?: string | null
    payment_method?: string | null
    url_pdf?: string | null
    codigo_verificacion?: string | null
    fecha_emision?: string | null
  } | null
}

export const usuarioPortalApi = {
  async obtenerConfiguracion(token: string): Promise<UsuarioPortalConfiguracion> {
    return fetchApi('/usuario/configuracion', { headers: authHeader(token) })
  },

  async actualizarConfiguracion(data: { nombre?: string; telefono?: string; foto_url?: string }, token: string): Promise<UsuarioPortalConfiguracion> {
    return fetchApi('/usuario/configuracion', { method: 'PUT', headers: authHeader(token), body: JSON.stringify(data) })
  },

  async actualizarAcademicName(academic_name: string, token: string): Promise<UsuarioPortalConfiguracion> {
    return fetchApi('/usuario/configuracion/academic-name', { method: 'PUT', headers: authHeader(token), body: JSON.stringify({ academic_name }) })
  },

  async listarCitas(token: string): Promise<UsuarioPortalCitaRecord[]> {
    const data = await fetchApi('/usuario/citas', { headers: authHeader(token) })
    return Array.isArray(data?.items) ? data.items : []
  },

  async listarCursos(token: string): Promise<UsuarioPortalCursoRecord[]> {
    const data = await fetchApi('/usuario/cursos', { headers: authHeader(token) })
    return Array.isArray(data?.items) ? data.items : []
  },
}

// Chat API
export const chatApi = {
  async crearSesion(direccion_id: number, token: string) {
    return fetchApi("/chat/sesion", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ direccion_id })
    });
  },
  async enviarMensaje(data: { chat_sesion_id: number, rol: string, contenido: string }, token: string) {
    return fetchApi("/chat/mensaje", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data)
    });
  },
  async obtenerHistorial(id: number, token: string) {
    return fetchApi(`/chat/${id}`, { headers: authHeader(token) });
  }
}

// Pagos API
export const pagosApi = {
  async registrar(data: { plan_id: number, monto: number, metodo: string, referencia?: string }, token: string) {
    return fetchApi("/pagos", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data)
    });
  },
  async listar(token: string) { return fetchApi("/pagos", { headers: authHeader(token) }); }, // Admin
  async confirmar(id: number, token: string) { // Admin
    return fetchApi(`/pagos/${id}/confirmar`, { method: "PUT", headers: authHeader(token) });
  }
}

// Planes API (Admin mostly)
export const planesApi = {
  async listar(token?: string) {
    const headers = token ? authHeader(token) : {};
    return fetchApi("/planes/listar-planes", { headers });
  },
  async crear(data: Partial<Plan>, token: string) {
    return fetchApi("/planes/crear", { method: "POST", headers: authHeader(token), body: JSON.stringify(data) });
  },
  async actualizar(id: number, data: Partial<Plan>, token: string) {
    return fetchApi(`/planes/${id}`, { method: "PUT", headers: authHeader(token), body: JSON.stringify(data) });
  },
}

const buildPonenciasPath = (suffix = "", routePrefix = "/ponencias") => `${routePrefix}${suffix}`

// Ponencias API
export const ponenciasApi = {
  async crear(data: Partial<Ponencia>, token: string, routePrefix = "/ponencias") {
    return fetchApi(buildPonenciasPath("", routePrefix), { method: "POST", headers: authHeader(token), body: JSON.stringify(data) });
  },
  async publicar(id: number, token: string, routePrefix = "/ponencias") {
    return fetchApi(buildPonenciasPath(`/${id}/publicar`, routePrefix), { method: "PUT", headers: authHeader(token) });
  },
  async inscribir(data: { ponencia_id: number, cedula: string, correo: string, celular?: string }, routePrefix = "/ponencias") {
    return fetchApi(buildPonenciasPath('/inscripcion', routePrefix), { method: "POST", body: JSON.stringify(data) });
  },
  async registrarAsistencia(data: { inscripcion_id: number, metodo_verificacion: string }, token: string, routePrefix = "/ponencias") {
    return fetchApi(buildPonenciasPath('/asistencia', routePrefix), {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data)
    });
  },
  async registrarAsistenciaEnPonencia(ponenciaId: number, data: { inscripcion_id: number, metodo_verificacion: string }, token: string, routePrefix = "/ponencias") {
    return fetchApi(buildPonenciasPath(`/${ponenciaId}/asistencia`, routePrefix), {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data)
    });
  },
  async listar(token?: string, routePrefix = "/ponencias") {
    const headers = token ? authHeader(token) : {};
    return fetchApi(buildPonenciasPath("", routePrefix), { headers });
  },
  async listarTodas(token: string, routePrefix = "/ponencias") {
    return fetchApi(buildPonenciasPath('/todas', routePrefix), { headers: authHeader(token) });
  },
  async obtener(slug: string, routePrefix = "/ponencias") {
    return fetchApi(buildPonenciasPath(`/${slug}`, routePrefix));
  },
  async obtenerPorId(id: number, token: string, routePrefix = "/ponencias") {
    return fetchApi(buildPonenciasPath(`/id/${id}`, routePrefix), { headers: authHeader(token) });
  },
  async listarInscritos(id: number, token: string, routePrefix = "/ponencias") {
    return fetchApi(buildPonenciasPath(`/${id}/inscritos`, routePrefix), { headers: authHeader(token) });
  },
  async estadoCupos(id: number, routePrefix = "/ponencias") {
    return fetchApi(buildPonenciasPath(`/${id}/estado-cupos`, routePrefix));
  },
  async generarCertificadosMasivo(id: number, token: string, routePrefix = "/ponencias") {
    return fetchApi(buildPonenciasPath(`/${id}/generar-certificados-masivo`, routePrefix), {
      method: "POST",
      headers: authHeader(token),
    });
  },
  async actualizar(id: number, data: Partial<Ponencia>, token: string, routePrefix = "/ponencias") {
    return fetchApi(buildPonenciasPath(`/${id}`, routePrefix), {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(data)
    });
  },
}

// Revistas API
export const revistaApi = {
  async listarPublicadas() { return fetchApi("/revistas"); },
  async listarTodas(token: string) { return fetchApi("/revistas/todas", { headers: authHeader(token) }); },
  async crear(data: Partial<Revista>, token: string) {
    return fetchApi("/revistas", { method: "POST", headers: authHeader(token), body: JSON.stringify(data) });
  },
  async actualizar(id: number, data: Partial<Revista>, token: string) {
    return fetchApi(`/revistas/${id}`, { method: "PUT", headers: authHeader(token), body: JSON.stringify(data) });
  },
  async eliminar(id: number, token: string) {
    return fetchApi(`/revistas/${id}`, { method: "DELETE", headers: authHeader(token) });
  }
}

// Ponentes API
export const ponentesApi = {
  async asignar(data: { ponencia_id: number, usuario_id?: number, nombre_ponente?: string }, token: string) {
    return fetchApi("/ponentes/asignar", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data)
    });
  },
  async eliminar(id: number, token: string) {
    return fetchApi(`/ponentes/${id}`, { method: "DELETE", headers: authHeader(token) });
  },
  async listar(token: string) {
    try {
      return await fetchApi("/ponentes", { headers: authHeader(token) });
    } catch (e) {
      console.warn("Ponentes list endpoint not found, returning empty list.");
      return [];
    }
  }, // Admin
  async listarMisPonencias(token: string) { return fetchApi("/ponentes/mis-ponencias", { headers: authHeader(token) }); },
  async obtenerPerfilPublico(ponenciaId: string | number, slug: string) {
    return fetchApi(`/ponentes/perfil/${ponenciaId}/${slug}`);
  }
}

// Publicidad API
export const publicidadApi = {
  async crear(data: FormData, token: string) {
    // Multipart
    const res = await fetch(`${API_URL}/publicidades/crear`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });
    if (!res.ok) throw new Error("Error al crear publicidad");
    return res.json();
  },
  async aprobar(id: number, token: string) {
    return fetchApi(`/publicidades/${id}/aprobar`, { method: "PUT", headers: authHeader(token) });
  },
  async listar() { return fetchApi("/publicidades/listar"); }
}

export const bankAccountsApi = {
  async listPublic(): Promise<BankAccount[]> {
    return fetchApi("/bank-accounts")
  },

  async listAdmin(token: string): Promise<BankAccount[]> {
    return fetchApi("/bank-accounts/admin", { headers: authHeader(token) })
  },

  async create(data: BankAccountPayload, token: string): Promise<BankAccount> {
    return fetchApi("/bank-accounts", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    })
  },

  async update(id: number, data: BankAccountPayload, token: string): Promise<BankAccount> {
    return fetchApi(`/bank-accounts/${id}`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(data),
    })
  },

  async updateStatus(id: number, is_active: boolean, token: string): Promise<BankAccount> {
    return fetchApi(`/bank-accounts/${id}/status`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify({ is_active }),
    })
  },
}

export const payphoneApi = {
  async getAdminConfiguration(token: string): Promise<PayPhoneAdminConfiguration> {
    return fetchApi("/payphone/admin/configuration", {
      headers: authHeader(token),
    })
  },

  async updateAdminConfiguration(data: PayPhoneAdminConfiguration, token: string): Promise<PayPhoneAdminConfiguration> {
    return fetchApi("/payphone/admin/configuration", {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(data),
    })
  },

  async preparePriorityCheckout(
    data: PayPhonePriorityPreparePayload,
    token?: string | null,
  ): Promise<PayPhonePriorityPrepareData> {
    return fetchApi("/payphone/priority/checkout/prepare", {
      method: "POST",
      headers: optionalAuthHeader(token),
      body: JSON.stringify(data),
    })
  },

  async confirmPriorityCheckout(
    data: PayPhonePriorityConfirmPayload,
    token?: string | null,
  ): Promise<PayPhonePriorityConfirmData> {
    return fetchApi("/payphone/priority/checkout/confirm", {
      method: "POST",
      headers: optionalAuthHeader(token),
      body: JSON.stringify(data),
    })
  },
}

// Admin Stats & Users
// Admin API
export const adminApi = {
  normalizeProfileStatus(raw: any): "pendiente" | "aprobado" | "rechazado" {
    const rawEstado = (
      raw?.estado_perfil ??
      raw?.perfil_estado?.estado ??
      raw?.estado ??
      raw?.estado_nombre ??
      raw?.estado_texto ??
      raw?.status
    )

    if (typeof rawEstado === "string") {
      const normalized = rawEstado
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")

      if (["aprobado", "aprobada", "approved"].includes(normalized)) return "aprobado"
      if (["rechazado", "rechazada", "denegado", "denegada", "rejected"].includes(normalized)) return "rechazado"
      if (["pendiente", "revision", "en_revision", "en revision", "por_revisar", "pending"].includes(normalized)) return "pendiente"
    }

    const estadoId = Number(raw?.estado_id ?? raw?.perfil_estado_id ?? raw?.estadoPerfilId)
    if (estadoId === 3) return "aprobado"
    if (estadoId === 4) return "rechazado"

    if (typeof raw?.verificado === "boolean") {
      return raw.verificado ? "aprobado" : "pendiente"
    }

    return "pendiente"
  },

  normalizeProfilesResponse(raw: any): any[] {
    if (Array.isArray(raw)) return [...raw]
    if (!raw || typeof raw !== "object") return []

    const candidateKeys = [
      "profesionales",
      "profiles",
      "items",
      "rows",
      "results",
      "data",
    ] as const

    for (const key of candidateKeys) {
      const value = (raw as any)[key]
      if (Array.isArray(value)) return [...value]
      if (value && typeof value === "object") {
        for (const nestedKey of candidateKeys) {
          const nestedValue = (value as any)[nestedKey]
          if (Array.isArray(nestedValue)) return [...nestedValue]
        }
      }
    }

    return []
  },

  // Stats Facade (for Dashboard compatibility)
  async getStats(token: string) {
    const [ponenciasRes, profesionalesRes, planesRes] = await Promise.allSettled([
      ponenciasApi.listarTodas(token).catch(() => ponenciasApi.listar(token)),
      this.getAllProfiles(token),
      planesApi.listar(token)
    ]);

    // Extract arrays from API responses (APIs return { ponencias: [...] }, { planes: [...] }, etc.)
    const ponenciasData = ponenciasRes.status === 'fulfilled' ? ponenciasRes.value : {};
    const profesionalesData = profesionalesRes.status === 'fulfilled' ? profesionalesRes.value : [];
    const planesData = planesRes.status === 'fulfilled' ? planesRes.value : {};

    return {
      ponencias: Array.isArray(ponenciasData) ? ponenciasData : (ponenciasData.ponencias || []),
      profesionales: this.normalizeProfilesResponse(profesionalesData),
      planes: Array.isArray(planesData) ? planesData : (planesData.planes || [])
    }
  },

  // Stats (Real endpoints)
  async getDashboardStats(tipo: 'usuarios' | 'pagos' | 'citas' | 'profesionales', token: string) {
    return fetchApi(`/estadisticas/${tipo}`, { headers: authHeader(token) });
  },

  // Users Management
  async getAllUsers(token: string) {
    return fetchApi("/usuarios", { headers: authHeader(token) });
  },

  async createUser(data: RegisterData, token: string) {
    return fetchApi("/usuarios", { method: "POST", headers: authHeader(token), body: JSON.stringify(data) });
  },

  async createProfessionalUser(data: RegisterData, token: string) {
    return fetchApi("/usuarios/profesional", { method: "POST", headers: authHeader(token), body: JSON.stringify(data) });
  },

  async deleteUser(id: number, token: string) {
    return fetchApi(`/usuarios/${id}`, { method: "DELETE", headers: authHeader(token) });
  },

  // Profiles Management
  async getProfilesPage(token: string, params: { page?: number; limit?: number; status?: string } = {}) {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.set("page", String(params.page))
    if (params.limit) searchParams.set("limit", String(params.limit))
    if (params.status && params.status !== "todos") searchParams.set("status", params.status)

    const query = searchParams.toString()
    const raw = await fetchApi(`/profesionales${query ? `?${query}` : ""}`, { headers: authHeader(token) })
    return {
      items: this.normalizeProfilesResponse(raw),
      meta: raw?.meta || {
        totalItems: 0,
        totalPages: 1,
        currentPage: params.page || 1,
        itemsPerPage: params.limit || 12,
        statusCounts: { todos: 0, pendiente: 0, aprobado: 0, rechazado: 0 },
      },
    }
  },

  async getAllProfiles(token: string) {
    const raw = await fetchApi("/profesionales", { headers: authHeader(token) });
    return this.normalizeProfilesResponse(raw);
  },

  async approveProfile(id: number, token: string) {
    return fetchApi(`/profesionales/estado-perfil/${id}`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify({ estado: "aprobado" })
    });
  },

  async rejectProfile(id: number, token: string) {
    return fetchApi(`/profesionales/estado-perfil/${id}`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify({ estado: "rechazado" })
    });
  },

  // Ponencias Management (Admin)
  async createPonencia(data: any, token: string) {
    return ponenciasApi.crear(data, token);
  },

  async updatePonencia(id: number, data: any, token: string) {
    // 1. Update general fields
    const updateRes = await fetchApi(`/ponencias/${id}`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(data)
    });

    // 2. If the user wants to publish, call the separate publish endpoint
    if (data.estado === 'publicada') {
      await this.publishPonencia(id, token);
    }
    
    return updateRes;
  },

  async deletePonencia(id: number, token: string, routePrefix = "/ponencias") {
    return fetchApi(`${routePrefix}/${id}`, {
      method: "DELETE",
      headers: authHeader(token)
    });
  },

  async publishPonencia(id: number, token: string, routePrefix = "/ponencias") {
    return ponenciasApi.publicar(id, token, routePrefix);
  },

  // Planes Management (Admin)
  async getPlanes(token: string) {
    return planesApi.listar(token);
  },

  async createPlan(data: any, token: string) {
    return planesApi.crear(data, token);
  },

  async updatePlan(id: number, data: any, token: string) {
    return planesApi.actualizar(id, data, token);
  },

  async deletePlan(id: number, token: string) {
    return fetchApi(`/planes/${id}`, {
      method: "DELETE",
      headers: authHeader(token)
    });
  },

  async toggleDestacado(id: number, token: string) {
    return fetchApi(`/profesionales/destacado/${id}`, {
      method: "PATCH",
      headers: authHeader(token),
    });
  }
}

// Servicios API
export const serviciosApi = {
  async crear(data: { perfilId: number, descripcion: string }, token: string) {
    return fetchApi("/servicios", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },
  async listarMios(perfilId: number, token: string) {
    return fetchApi(`/servicios/mis-servicios?perfilId=${perfilId}`, { headers: authHeader(token) });
  },
  async listarPorPerfil(slug: string) {
    return fetchApi(`/servicios/perfil/${slug}`);
  },
  async actualizar(id: number, data: { descripcion: string }, token: string) {
    return fetchApi(`/servicios/${id}`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },
  async eliminar(id: number, token: string) {
    return fetchApi(`/servicios/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
  },
}

// Usuario API (General user profile)
export const usuarioApi = {
  async obtenerMiPerfil(token: string) { return fetchApi("/usuarios/perfil", { headers: authHeader(token) }); },
  async actualizarPerfil(data: any, token: string) {
    return fetchApi("/usuarios/perfil", { method: "PUT", headers: authHeader(token), body: JSON.stringify(data) });
  },
  async eliminarCuenta(token: string) {
    return fetchApi("/usuarios/mi-cuenta", { method: "DELETE", headers: authHeader(token) });
  }
}

// Multimedia API
export const multimediaApi = {
  async subirFotoPerfil(archivo: File, token: string): Promise<{ url: string, public_id: string, format: string }> {
    const formData = new FormData()
    formData.append("archivo", archivo)

    const res = await fetch(`${API_URL}/multimedia/profile-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || err.message || "Error al subir foto de perfil");
    }
    const data = await res.json();
    return data.data;
  },

  async subir(archivo: File, folder = "conversatorios", token: string): Promise<{ url: string, public_id: string, format: string }> {
    const formData = new FormData()
    formData.append("archivo", archivo)
    formData.append("folder", folder)

    const res = await fetch(`${API_URL}/multimedia/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || err.message || "Error al subir archivo");
    }
    const data = await res.json();
    return data.data;
  }
}

export interface PageMeta {
  totalItems: number
  totalPages: number
  currentPage: number
  itemsPerPage: number
}

export interface PaginatedArticulos {
  data: Articulo[]
  meta: PageMeta
}

const EMPTY_PAGINATED_ARTICULOS: PaginatedArticulos = {
  data: [],
  meta: { totalItems: 0, totalPages: 1, currentPage: 1, itemsPerPage: 0 },
}

// Articulos API
export const articulosApi = {
  async listarPublicados(opts: {
    profesionIds?: number[]
    profileSlug?: string
    limit?: number
    page?: number
    keyword?: string
  } = {}): Promise<PaginatedArticulos> {
    const params = new URLSearchParams()
    if (opts.profesionIds && opts.profesionIds.length > 0) {
      params.set("profesion_ids", opts.profesionIds.join(","))
    }
    if (opts.profileSlug) params.set("perfil_slug", opts.profileSlug)
    if (opts.limit && opts.limit > 0) params.set("limit", String(opts.limit))
    if (opts.page && opts.page > 0) params.set("page", String(opts.page))
    if (opts.keyword) params.set("keyword", opts.keyword)
    const qs = params.toString()
    const result = await fetchApi(`/articulos${qs ? `?${qs}` : ""}`)
    // Resiliencia: si el back devuelve un array plano (legacy), lo wrappeamos.
    if (Array.isArray(result)) {
      return {
        data: result as Articulo[],
        meta: {
          totalItems: result.length,
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: result.length,
        },
      }
    }
    if (result && typeof result === "object" && Array.isArray((result as any).data)) {
      return result as PaginatedArticulos
    }
    return EMPTY_PAGINATED_ARTICULOS
  },
  async obtenerPorId(id: number | string) {
    return fetchApi(`/articulos/${id}`)
  },
  async listarMios(token: string) {
    return fetchApi("/articulos/mios", { headers: authHeader(token) });
  },
  async crear(data: FormData | { titulo: string; contenido: string; resumen?: string; imagen_url?: string }, token: string) {
    if (data instanceof FormData) {
      return fetchApi("/articulos", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // Browser sets multipart boundary
        body: data,
      });
    }
    return fetchApi("/articulos", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },
  async actualizar(id: number, data: FormData | Partial<Articulo>, token: string) {
    if (data instanceof FormData) {
      return fetchApi(`/articulos/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
    }
    return fetchApi(`/articulos/${id}`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },
  async eliminar(id: number, token: string) {
    return fetchApi(`/articulos/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
  },
  async moderar(id: number, token: string) {
    return fetchApi(`/articulos/${id}/moderar`, {
      method: "PUT",
      headers: authHeader(token),
    });
  },
  async archivar(id: number, token: string) {
    return fetchApi(`/articulos/${id}/archivar`, {
      method: "PUT",
      headers: authHeader(token),
    });
  },
  async listarTodos(token: string) {
    return fetchApi("/articulos/admin/todos", {
      headers: authHeader(token),
    });
  },
}

// Horarios API
export const horariosApi = {
  async obtenerPorPerfil(perfilId: number, token: string) {
    return fetchApi(`/horarios/perfil/${perfilId}`, {
      headers: authHeader(token),
    });
  },

  async actualizar(data: { perfilId: number; matriz: boolean[] }, token: string) {
    if (!data.matriz || data.matriz.length !== 168) {
      throw new Error(`La matriz de horario debe tener exactamente 168 elementos (7x24). Recibidos: ${data.matriz?.length || 0}`);
    }
    return fetchApi(`/horarios/actualizar`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({
        perfilId: Number(data.perfilId),
        matriz: data.matriz
      }),
    });
  },

  async obtenerPublico(slug: string) {
    return fetchApi(`/horarios/publico/${slug}`);
  },
};

// Token helpers
export const saveToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token)
  }
}

export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("refreshToken")
  }
}
