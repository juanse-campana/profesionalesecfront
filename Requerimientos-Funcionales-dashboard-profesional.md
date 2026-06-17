# Requerimientos Funcionales

## App Movil: Profesionales EC Mobile (Flutter)

**Estado:** Documento de Especificación Funcional  

---

## 1. Introducción

### 1.1 Propósito

Este documento define los requerimientos funcionales completos del **Dashboard del Profesional** del app Profesionales EC. El dashboard permite a profesionales (abogados, médicos, ingenieros, etc.) gestionar su perfil público, servicios, artículos, citas, horarios, redes sociales y configuración de cuenta desde la app móvil de Flutter.

### 1.2 Alcance

El alcance cubre los siete (7) módulos del dashboard profesional accesibles desde el NavigationRail o BottomNavigationBar, más los requerimientos transversales de autenticación, subida de archivos, geolocalización, pagos y diseño adaptativo.

**Módulos incluidos:**
| # | Módulo | Ruta | Widget Principal |
|---|--------|------|---------------------|
| 1 | Perfil Profesional | `/professional-dashboard` | `ProfessionalForm` (wizard de 5-6 pasos) |
| 2 | Servicios | `/professional-dashboard/services` | `ServicesManager` |
| 3 | Artículos | `/professional-dashboard/articles` | `ArticleFormScreen` |
| 4 | Citas | `/professional-dashboard/appointments` | `RescheduleBottomSheet`, `BookingForm` |
| 5 | Horarios | `/professional-dashboard/schedule` | `ScheduleManager`, `ScheduleGrid` |
| 6 | Redes Sociales | `/professional-dashboard/social-media` | `SocialMediaManager` |
| 7 | Configuración | `/professional-dashboard/settings` | Pantalla de configuración |

**Navegación:** `lib/config/professional_nav.dart` define `PROFESSIONAL_NAV_ITEMS` con 7 elementos de navegación usando `ProfessionalNavigationRail` (tablet, colapsable con animación) y `ProfessionalBottomNav` (teléfono, bottom navigation bar). Ambos usan `GoRouter.of(context).location` para detección de estado activo.

### 1.3 Usuarios del Sistema

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **Profesional** | Usuario registrado con `rol_id = 2`. Dueño del perfil profesional. | Dashboard completo de su perfil |

## 2. Arquitectura General del Dashboard

### 2.1 Estructura de Componentes

```
Dashboard Layout
├── ProfessionalNavigationRail (tablet, colapsable con animación)
│   └── PROFESSIONAL_NAV_ITEMS (7 secciones + iconos Material)
├── ProfessionalBottomNav (teléfono, bottom navigation bar)
│   └── Mismos 7 items de navegación
└── Contenido Principal (GoRouter ShellRoute)
```

**Stack tecnológico:**
- **Framework:** Flutter (Dart)
- **Lenguaje:** Dart (null safety)
- **UI:** Flutter widgets / Material Design 3
- **Iconos:** Material Icons / Flutter Icons
- **Estado:** StatefulWidget / setState + Provider (state management)
- **Ruteo:** GoRouter (navegación declarativa)
- **Autenticación:** JWT (token en `flutter_secure_storage` bajo la clave `auth_token`)
- **Subida de archivos:** Cloudinary (`dw4p8pdcz`, preset `profesionales`)

### 2.2 Modelo de Datos General

19 entidades identificadas: Usuario, PerfilProfesional, PerfilProfesionalSummary, Servicio, Horario, Cita, Artículo, Pago, Plan, BankAccount, Ponencia, PonenciaDia, PonenciaPonente, Publicidad, Revista, Certificado, Auditoria, ChatSesion/Mensaje, y catálogos (Profesión, Especialidad, Provincia, Ciudad).

### 2.3 Flujo de Autenticación

1. Registro: `authApi.register({nombre, correo, contrasena, rol_id, telefono, cedula})` → `{token, usuario}`
2. Login: `authApi.login({correo, contrasena})` → `{token, usuario}`
3. Token JWT almacenado en `flutter_secure_storage (auth_token)`
4. Todas las llamadas autenticadas incluyen header `Authorization: Bearer {token}`
5. Endpoints adicionales: `cambiarContrasena`, `recuperarContrasena`, `verificarEmail`

**Fuente:** `lib/services/api.dart` (authApi)

---

## 3. Requerimientos Funcionales por Módulo

---

### 3.1 Módulo: Perfil Profesional

**Ruta:** `/professional-dashboard`  
**Componente:** `ProfessionalForm` (wizard multi-paso: 5 pasos base + 1 opcional para plan prioritario)  
**Fuente:** `lib/screens/professional_form.dart`, `lib/services/api.dart`

#### 3.1.1 Descripción General

El módulo de Perfil Profesional permite al usuario con `rol_id = 2` crear y mantener su perfil profesional público mediante un formulario wizard dividido en pasos secuenciales. El perfil incluye datos personales, información profesional, ubicación geográfica, documentos de verificación, preferencias de visibilidad, redes sociales, y —opcionalmente— comprobante de pago para el plan prioritario.

#### 3.1.2 Entidades Involucradas

- **Usuario** (`lib/services/api.dart`): `id`, `nombre`, `correo`, `rol_id`, `foto_url`, `telefono`, `cedula`, `estado`
- **PerfilProfesional** (`lib/services/api.dart`): 28 campos incluyendo `slug`, `profesion_id`, `especialidad_id`, `ciudad_id`, `descripcion`, `tarifa`, `tarifa_hora`, `latitud`, `longitud`, `calle_principal`, `referencia`, `permitir_reagendar`, `show_phone`, `show_email`, `verificado`, `plan`, campos de redes sociales, campos de pago
- **Servicio** (creación en lote durante el paso 1): `descripcion` (máx. 100 caracteres)
- **Horario** (matriz 7×24): `matriz` (boolean[168])
- **Documentos** (paso 3): `cedula_frontal`, `cedula_posterior`, `titulo`, `licencia`
- **Catálogos:** Profesión, Especialidad (filtrada por `profesion_id`), Provincia, Ciudad (filtrada por `provincia_id`)

#### 3.1.3 Historias de Usuario

| ID | Historia |
|----|----------|
| HU-PERF-01 | Como profesional, quiero registrarme en la plataforma proporcionando mis datos personales (nombre, cédula, correo, contraseña, teléfono, foto) para crear mi cuenta. |
| HU-PERF-02 | Como profesional, quiero seleccionar mi profesión y especialidad desde catálogos oficiales para que los clientes me encuentren correctamente. |
| HU-PERF-03 | Como profesional, quiero describir mi perfil (máximo 80 caracteres), indicar mi tarifa, años de experiencia y modalidad de trabajo (presencial/virtual/ambas) para presentar mis servicios. |
| HU-PERF-04 | Como profesional, quiero establecer mi ubicación en el mapa (provincia, ciudad, dirección, punto GPS) para que los clientes me encuentren geográficamente. |
| HU-PERF-05 | Como profesional, quiero elegir si muestro mi teléfono y correo públicamente para controlar mi privacidad y canales de contacto. |

#### 3.1.4 Requerimientos Funcionales Detallados

---

**RF-PERF-001: Registro de Datos Personales (Paso 0)**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Usuario NO autenticado. Formulario de registro visible. |
| **Fuente** | `lib/screens/professional_form.dart` (Step 0 - Personal Data) |

**Flujo Principal:**
1. El sistema muestra el formulario del Paso 0: Datos Personales con los campos: `fullName`, `cedula`, `email`, `password`, `confirmPassword`, `phone`, `profileImage`.
2. El usuario ingresa su nombre completo en el campo `fullName`.
3. El usuario ingresa su cédula (10 dígitos numéricos) en el campo `cedula`. El sistema valida que solo contenga dígitos y tenga exactamente 10 caracteres.
4. El usuario ingresa su correo electrónico en el campo `email`. El sistema valida el formato con expresión regular de correo electrónico (debe contener `@`).
5. El usuario ingresa su contraseña en el campo `password`. El sistema valida: mínimo 8 caracteres, al menos una mayúscula, al menos una minúscula, al menos un carácter especial.
6. El usuario repite la contraseña en el campo `confirmPassword`. El sistema valida que coincida exactamente con `password`.
7. El usuario ingresa su teléfono (10 dígitos numéricos) en el campo `phone`.
8. El usuario opcionalmente selecciona una imagen de perfil (`profileImage`) que se sube a Cloudinary (cloud: `dw4p8pdcz`, preset: `profesionales`).
9. El sistema llama a `authApi.register({nombre: fullName, correo: email, contrasena: password, rol_id: 2, telefono: phone, cedula: cedula})`.
10. El sistema recibe `{token, usuario}`, almacena el token en `flutter_secure_storage (auth_token)`, y avanza al Paso 1.

**Flujos Alternativos:**
- **FA1 (Cédula inválida):** Si la cédula no tiene 10 dígitos numéricos, el sistema muestra mensaje de error y no permite avanzar.
- **FA2 (Correo duplicado):** Si el API devuelve error de correo ya registrado, el sistema muestra mensaje: "Este correo ya está registrado".
- **FA3 (Contraseña débil):** Si la contraseña no cumple las reglas (8+ caracteres, mayúscula, minúscula, especial), el sistema muestra error específico.
- **FA4 (Contraseñas no coinciden):** Si `confirmPassword ≠ password`, el sistema muestra: "Las contraseñas no coinciden".
- **FA5 (Error de red):** Si falla el registro, el sistema muestra mensaje genérico de error y permite reintentar.

**Postcondiciones:** Usuario autenticado con token JWT. Perfil de usuario creado con `rol_id = 2`.

**Criterios de Aceptación:**
- [ ] El formulario del Paso 0 se renderiza con 7 campos (6 texto + 1 archivo).
- [ ] El campo `cedula` rechaza letras, símbolos, y longitudes ≠ 10.
- [ ] El campo `email` rechaza valores sin `@` o con formato inválido.
- [ ] El campo `password` exige 8+ caracteres con mayúscula, minúscula y carácter especial.
- [ ] El campo `confirmPassword` muestra error si no coincide con `password`.
- [ ] El campo `phone` solo acepta 10 dígitos numéricos.
- [ ] La imagen de perfil opcional se sube correctamente a Cloudinary.
- [ ] Al enviar, se llama `POST auth/register` con `rol_id: 2`.
- [ ] Al éxito, el token se guarda y se avanza al Paso 1.

---

**RF-PERF-002: Configuración de Información Profesional (Paso 1)**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Usuario autenticado (Paso 0 completado o sesión existente). Catálogos de Profesión y Especialidad cargados. |
| **Fuente** | `lib/screens/professional_form.dart` (Step 1 - Professional Info) |

**Flujo Principal:**
1. El sistema carga los catálogos desde `GET /catalogos/profesiones` y `GET /catalogos/especialidades?profesion_id=X`.
2. El sistema muestra el formulario del Paso 1 con los campos: `profession` (select), `specialty` (select, filtrado por profesión), `description` (textarea, máx. 80 caracteres), `yearsExperience` (campo solo formulario), `rate` (decimal, opcional), `workMode` (select: "Presencial" / "Virtual" / "Ambas modalidades"), `services` (lista dinámica de strings), `matrix` (grilla de horario booleana 7×24).
3. El usuario selecciona una profesión del catálogo. El sistema filtra las especialidades disponibles para esa profesión.
4. El usuario selecciona una especialidad.
5. El usuario ingresa una descripción profesional (máximo 80 caracteres).
6. El usuario opcionalmente ingresa años de experiencia (campo solo de formulario, no persistido directamente).
7. El usuario opcionalmente ingresa una tarifa (`rate`, número decimal).
8. El usuario selecciona la modalidad de trabajo: "Presencial", "Virtual" o "Ambas modalidades".
9. El usuario agrega uno o más servicios (cada uno máximo 100 caracteres). Cada servicio se añade a una lista dinámica.
10. El usuario configura su horario de disponibilidad mediante una grilla interactiva de 7 días × 24 horas (matriz de 168 booleanos).
11. El sistema llama a `POST /profesionales/crear-perfil` o `PUT /profesionales/actualizar-perfil` con los datos del perfil.
12. Para cada servicio en la lista, el sistema llama a `POST /servicios` con `{perfilId, descripcion}`.
13. El sistema llama a `POST /horarios/actualizar` con `{perfilId, matriz}`.
14. El sistema avanza al Paso 2.

**Flujos Alternativos:**
- **FA1 (Profesión no seleccionada):** El sistema requiere `profesion_id` como campo obligatorio; muestra error si no se selecciona.
- **FA2 (Descripción muy larga):** Si la descripción excede 80 caracteres, el sistema trunca o muestra error.
- **FA3 (Servicio muy largo):** Si un servicio excede 100 caracteres, el sistema muestra error de validación.
- **FA4 (Modalidad no seleccionada):** El sistema requiere selección de modalidad de trabajo.

**Postcondiciones:** Perfil profesional creado/actualizado con `profesion_id`, `especialidad_id`, `descripcion`, `tarifa`, `modalidad`. Servicios asociados creados. Horario (matriz 168) guardado.

**Criterios de Aceptación:**
- [ ] El catálogo de profesiones se carga desde `GET /catalogos/profesiones`.
- [ ] Al seleccionar profesión, el catálogo de especialidades se filtra correctamente.
- [ ] El campo `description` tiene contador de caracteres con máximo 80.
- [ ] Los servicios se agregan/eliminan dinámicamente de la lista.
- [ ] Cada servicio se valida a 100 caracteres máximo.
- [ ] La grilla de horario tiene 7 columnas (días) × 24 filas (horas).
- [ ] La matriz se serializa como `boolean[168]` donde `índice = día × 24 + hora`.
- [ ] El mapeo de días es: matriz día 0 = Lunes, ..., matriz día 6 = Domingo.
- [ ] Al guardar, se envían perfil, servicios y horario en secuencia.

---

**RF-PERF-003: Configuración de Ubicación Geográfica (Paso 2)**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Usuario autenticado. Catálogos de Provincia y Ciudad cargados. |
| **Fuente** | `lib/screens/professional_form.dart` (Step 2 - Location), `LocationMap` |

**Flujo Principal:**
1. El sistema carga catálogos: `GET /catalogos/provincias` y `GET /catalogos/ciudades?provincia_id=X`.
2. El sistema muestra el mapa interactivo (`LocationMap`) y los campos: `province` (select), `city` (select, filtrado), `address` (calle principal), `reference` (referencia), y coordenadas `lat`/`lng`.
3. El usuario selecciona una provincia. El sistema filtra las ciudades disponibles.
4. El usuario selecciona una ciudad.
5. El usuario puede tocar en el mapa para establecer `latitud` y `longitud`, o usar el botón de geolocalización del dispositivo.
6. El usuario ingresa la calle principal (`calle_principal`) y una referencia opcional (`referencia`).
7. El sistema llama a `PUT /profesionales/actualizar-perfil` con `{ciudad_id, calle_principal, referencia, latitud, longitud}` o `POST /profesionales/ubicacion`.
8. El sistema avanza al Paso 3.

**Flujos Alternativos:**
- **FA1 (Geolocalización denegada):** Si el usuario niega el permiso de geolocalización, el sistema muestra mensaje y permite selección manual en el mapa.
- **FA2 (Sin coordenadas):** El sistema permite continuar sin latitud/longitud (campos opcionales).

**Postcondiciones:** Perfil actualizado con `ciudad_id`, `calle_principal`, `referencia`, `latitud`, `longitud`.

**Criterios de Aceptación:**
- [ ] El mapa se renderiza con un marcador arrastrable o clicable.
- [ ] El botón de geolocalización usa la API `Geolocator.getCurrentPosition()`.
- [ ] Las ciudades se filtran correctamente al seleccionar provincia.
- [ ] `latitud` y `longitud` se guardan como tipo `number`.

---

**RF-PERF-004: Subida de Documentos de Verificación (Paso 3)**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Media |
| **Precondiciones** | Usuario autenticado. Pasos 0-2 completados. |
| **Fuente** | `lib/screens/professional_form.dart` (Step 3 - Documents) |

**Flujo Principal:**
1. El sistema muestra el Paso 3 (Opcional) con 4 campos de archivo: `identityFront` (cédula frontal), `identityBack` (cédula posterior), `title` (título profesional), `license` (licencia).
2. El usuario selecciona uno o más archivos (imágenes o PDFs).
3. El sistema sube cada archivo mediante `POST /profesionales/documentos` con tipo correspondiente (`cedula_frontal`, `cedula_posterior`, `titulo`, `licencia`).
4. El sistema avanza al Paso 4.

**Flujos Alternativos:**
- **FA1 (Sin documentos):** El usuario puede omitir este paso completamente (es opcional) y avanzar directamente al Paso 4.
- **FA2 (Error de subida):** Si falla la subida de un documento, el sistema muestra mensaje de error específico y permite reintentar.
- **FA3 (Formato no soportado):** El sistema valida que los archivos sean imágenes (jpg, png) o PDF y rechaza otros formatos.

**Postcondiciones:** Documentos asociados al perfil profesional para verificación.

**Criterios de Aceptación:**
- [ ] El paso se marca como "Opcional" claramente.
- [ ] Se aceptan 4 tipos de documentos: cédula frontal, cédula posterior, título, licencia.
- [ ] Cada documento se envía con su tipo como identificador.
- [ ] Se puede omitir el paso y avanzar sin documentos.

---

**RF-PERF-005: Configuración de Preferencias y Visibilidad (Paso 4)**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Media |
| **Precondiciones** | Usuario autenticado. Perfil profesional creado. |
| **Fuente** | `lib/screens/professional_form.dart` (Step 4 - Preferences) |

**Flujo Principal:**
1. El sistema muestra el Paso 4 con: `showPhone` (checkbox), `showEmail` (checkbox), `tags` (campo de texto, palabras clave separadas por coma), y 6 campos de URL de redes sociales: `facebook_url`, `instagram_url`, `x_url` (Twitter/X), `linkedin_url`, `tiktok_url`, `yt_url` (YouTube).
2. El usuario marca/desmarca los checkboxes de visibilidad (`show_phone`, `show_email`).
3. El usuario ingresa etiquetas/palabras clave separadas por coma en el campo `tags`.
4. El usuario ingresa las URLs de sus redes sociales. El sistema valida cada URL contra el patrón de la plataforma correspondiente:
   - Facebook: `https://facebook.com/...`
   - Instagram: `https://instagram.com/...`
   - TikTok: `https://tiktok.com/@...`
   - LinkedIn: `https://linkedin.com/in/...`
   - X/Twitter: `https://x.com/...` o `https://twitter.com/...`
   - YouTube: `https://youtube.com/@...` o `https://youtu.be/...`
5. El sistema actualiza el perfil con `PUT /profesionales/actualizar-perfil`.
6. Dependiendo del plan, el sistema avanza al Paso 5 (plan prioritario) o finaliza el wizard.

**Flujos Alternativos:**
- **FA1 (URL inválida):** Si una URL no coincide con el patrón de la plataforma, el sistema muestra: "URL de [plataforma] no válida".
- **FA2 (Plan básico):** Si el plan no requiere pago, el wizard finaliza y redirige al dashboard.

**Postcondiciones:** Preferencias de visibilidad, etiquetas y URLs de redes sociales guardadas.

**Criterios de Aceptación:**
- [ ] Los checkboxes `showPhone` y `showEmail` alternan valores booleanos.
- [ ] Cada URL de red social se valida contra su regex de plataforma específico.
- [ ] Las URLs vacías se permiten (campos opcionales).
- [ ] Las etiquetas se guardan como string separado por comas.

---

**RF-PERF-006: Pago de Plan Prioritario (Paso 5)**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Usuario autenticado. Perfil creado. Plan seleccionado requiere pago. |
| **Fuente** | `lib/screens/professional_form.dart` (Step 5 - Payment), `lib/services/api.dart` (PayPhone flow) |

**Flujo Principal:**
1. El sistema muestra el Paso 5 (solo si el plan es prioritario) con: `payment_method` (selector: "bank" o "payphone"), vista previa de cuentas bancarias (desde `GET /bank-accounts`), y campo `paymentProof` (archivo).
2. El usuario selecciona el método de pago:
   - **Transferencia bancaria ("bank"):** El sistema muestra las cuentas bancarias activas (`bank_name`, `account_type`, `account_number`, `holder_name`, `holder_identifier`). El usuario sube el comprobante (`paymentProof`).
   - **PayPhone ("payphone"):** El sistema inicia el flujo PayPhone: prepara la transacción (`PayPhonePriorityPreparePayload`), crea checkout, y redirige al usuario a la pasarela de pago.
3. Para transferencia bancaria, el sistema sube el comprobante mediante `POST /profesionales/comprobante-pago`.
4. El sistema actualiza `payment_method` y `payphone_flow` en el perfil profesional.
5. El sistema finaliza el wizard y muestra mensaje de confirmación con el estado del pago: "aprobado", "en revisión", o "rechazado".

**Flujos Alternativos:**
- **FA1 (PayPhone cancelado):** Si el usuario cancela el pago en PayPhone, el sistema retorna al Paso 5 sin cambios.
- **FA2 (PayPhone error):** Si la pasarela devuelve error, el sistema muestra el mensaje y permite reintentar o cambiar a transferencia.
- **FA3 (Sin cuentas bancarias):** Si no hay `BankAccount` activas, el sistema muestra mensaje "No hay cuentas bancarias disponibles" y solo permite PayPhone.
- **FA4 (Comprobante no subido):** Si el método es "bank" y no se sube comprobante, el sistema muestra error de validación.

**Postcondiciones:** Pago registrado. Perfil actualizado con `payment_method`, `payphone_flow`, `comprobante_pago_url`.

**Criterios de Aceptación:**
- [ ] El Paso 5 solo aparece para planes que requieren pago.
- [ ] Las cuentas bancarias activas se cargan desde `GET /bank-accounts`.
- [ ] El flujo PayPhone maneja estados: `approved`, `reviewRequired`, `rejected`.
- [ ] El archivo de comprobante se sube correctamente al backend.
- [ ] El método de pago se guarda en `payment_method` ("bank" | "payphone").

---

#### 3.1.5 Reglas de Negocio — Perfil Profesional

| ID | Regla | Fuente |
|----|-------|--------|
| RN-PERF-01 | La cédula debe tener exactamente 10 dígitos numéricos. | `professional_form.dart` (Step 0, validación `cedula`) |
| RN-PERF-02 | El correo electrónico debe contener `@` y validarse con regex. | `professional_form.dart` (Step 0, validación `email`) |
| RN-PERF-03 | La contraseña debe tener mínimo 8 caracteres, con al menos una mayúscula, una minúscula y un carácter especial. | `professional_form.dart` (Step 0, validación `password`) |
| RN-PERF-04 | El teléfono debe tener exactamente 10 dígitos numéricos. | `professional_form.dart` (Step 0, validación `phone`) |
| RN-PERF-05 | La descripción profesional tiene un máximo de 80 caracteres. | `professional_form.dart` (Step 1, `descripcion`) |
| RN-PERF-06 | La descripción de cada servicio tiene un máximo de 100 caracteres. | `services_manager.dart` (`maxLength=100`) |
| RN-PERF-07 | La modalidad de trabajo debe ser una de: "Presencial", "Virtual", "Ambas modalidades". | `professional_form.dart` (enum `workModes`) |
| RN-PERF-08 | Las URLs de redes sociales deben validarse contra el patrón regex de su plataforma específica. | `social_media_manager.dart`, `professional_form.dart` (Step 4) |
| RN-PERF-09 | Al crear el perfil, los servicios se crean en lote llamando a `POST /servicios` por cada uno. | `professional_form.dart` (Step 1, submit) |
| RN-PERF-10 | El horario se representa como `boolean[168]` (7 días × 24 horas), índice = `día × 24 + hora`. | `schedule_grid.dart`, `schedule_manager.dart` |
| RN-PERF-11 | La imagen de perfil se sube a Cloudinary (`dw4p8pdcz`, preset `profesionales`). | `professional_form.dart` (Step 0, `profileImage`) |
| RN-PERF-12 | El plan prioritario requiere comprobante de pago si el método es transferencia bancaria. | `professional_form.dart` (Step 5) |
| RN-PERF-13 | Los campos `show_phone` y `show_email` controlan la visibilidad pública del teléfono y correo. | `professional_form.dart` (Step 4) |
| RN-PERF-14 | `permitir_reagendar` controla si los clientes pueden reagendar citas con este profesional. | `lib/services/api.dart` (PerfilProfesional) |

#### 3.1.6 Validaciones de Datos — Perfil Profesional

| Campo | Validación | Mensaje de Error |
|-------|-----------|-----------------|
| `cedula` | 10 dígitos numéricos exactos | "La cédula debe tener 10 dígitos numéricos" |
| `email` | Formato de correo (contiene `@`, regex) | "Ingrese un correo electrónico válido" |
| `password` | Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 especial | "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un carácter especial" |
| `confirmPassword` | Coincide con `password` | "Las contraseñas no coinciden" |
| `phone` / `telefono` | 10 dígitos numéricos exactos | "El teléfono debe tener 10 dígitos numéricos" |
| `descripcion` (perfil) | Máximo 80 caracteres | "La descripción no puede exceder los 80 caracteres" |
| `descripcion` (servicio) | Máximo 100 caracteres | "La descripción del servicio no puede exceder los 100 caracteres" |
| `facebook_url` | Regex: `facebook.com/...` | "URL de Facebook no válida" |
| `instagram_url` | Regex: `instagram.com/...` | "URL de Instagram no válida" |
| `tiktok_url` | Regex: `tiktok.com/@...` | "URL de TikTok no válida" |
| `linkedin_url` | Regex: `linkedin.com/in/...` | "URL de LinkedIn no válida" |
| `x_url` | Regex: `x.com/...` o `twitter.com/...` | "URL de X/Twitter no válida" |
| `yt_url` | Regex: `youtube.com/@...` o `youtu.be/...` | "URL de YouTube no válida" |
| `tarifa` / `tarifa_hora` | Número decimal positivo | "La tarifa debe ser un valor numérico positivo" |
| `profileImage` | Archivo de imagen (jpg, png, webp) | "Seleccione una imagen válida (JPG, PNG, WEBP)" |
| `paymentProof` | Archivo de imagen o PDF | "Seleccione un comprobante válido (imagen o PDF)" |

#### 3.1.7 Integraciones API — Perfil Profesional

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/auth/register` | POST | Registrar nuevo usuario con `rol_id=2` |
| `/auth/login` | POST | Iniciar sesión |
| `/usuarios/perfil` | GET | Obtener perfil de usuario autenticado |
| `/usuarios/perfil` | PUT | Actualizar datos de usuario |
| `/profesionales/crear-perfil` | POST | Crear perfil profesional |
| `/profesionales/actualizar-perfil` | PUT | Actualizar perfil profesional |
| `/profesionales/perfil` | GET | Obtener perfil profesional propio |
| `/profesionales/documentos` | POST | Subir documentos de verificación |
| `/profesionales/comprobante-pago` | POST | Subir comprobante de pago |
| `/profesionales/ubicacion` | POST | Actualizar ubicación geográfica |
| `/catalogos/profesiones` | GET | Listar profesiones |
| `/catalogos/especialidades?profesion_id=` | GET | Listar especialidades filtradas |
| `/catalogos/provincias` | GET | Listar provincias |
| `/catalogos/ciudades?provincia_id=` | GET | Listar ciudades filtradas |
| `/servicios` | POST | Crear servicio |
| `/horarios/actualizar` | POST | Guardar matriz de horario |
| `/bank-accounts` | GET | Listar cuentas bancarias activas |
| `/planes/listar-planes` | GET | Listar planes disponibles |
| `/pagos` | POST | Registrar pago |

---

### 3.2 Módulo: Servicios

**Ruta:** `/professional-dashboard/services`  
**Componente:** `ServicesManager`  
**Fuente:** `lib/screens/services_manager.dart`, `lib/services/api.dart`

#### 3.2.1 Descripción General

El módulo de Servicios permite al profesional gestionar el catálogo de servicios que ofrece. Cada servicio es un texto descriptivo breve (máximo 100 caracteres) que se muestra en el perfil público del profesional. El módulo implementa operaciones CRUD completas (crear, leer, actualizar, eliminar).

#### 3.2.2 Historias de Usuario

| ID | Historia |
|----|----------|
| HU-SERV-01 | Como profesional, quiero agregar servicios a mi perfil para que los clientes conozcan lo que ofrezco. |
| HU-SERV-02 | Como profesional, quiero editar la descripción de un servicio existente para mantener mi oferta actualizada. |
| HU-SERV-03 | Como profesional, quiero eliminar servicios que ya no ofrezco para no confundir a los clientes. |
| HU-SERV-04 | Como profesional, quiero ver todos mis servicios en una lista para revisar mi catálogo completo. |

#### 3.2.3 Requerimientos Funcionales Detallados

---

**RF-SERV-001: Listar Servicios del Profesional**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Usuario autenticado con perfil profesional (`perfilId` existente). |
| **Fuente** | `lib/screens/services_manager.dart` |

**Flujo Principal:**
1. El sistema obtiene el `perfilId` del profesional autenticado.
2. El sistema llama a `GET /servicios/mis-servicios?perfilId={id}`.
3. El sistema renderiza la lista de servicios (`Servicio[]`) con cada item mostrando su `descripcion`.
4. Cada item muestra botones de acción: Editar y Eliminar.

**Flujos Alternativos:**
- **FA1 (Sin servicios):** Si la lista está vacía, el sistema muestra mensaje: "No tienes servicios registrados. Agrega tu primer servicio."
- **FA2 (Error de carga):** Si falla la API, el sistema muestra mensaje de error y botón para reintentar.

**Criterios de Aceptación:**
- [ ] Los servicios se cargan al inicializar la pantalla.
- [ ] Cada servicio muestra su `servicio_id` (oculto) y `descripcion` (visible).
- [ ] Los botones de Editar y Eliminar están presentes en cada fila.

---

**RF-SERV-002: Crear Servicio**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Usuario autenticado con `perfilId`. |
| **Fuente** | `lib/screens/services_manager.dart` |

**Flujo Principal:**
1. El sistema muestra un campo de texto (`Input`) con placeholder y un botón "Agregar".
2. El usuario ingresa la descripción del servicio (máximo 100 caracteres).
3. El sistema valida que la descripción no esté vacía y no exceda 100 caracteres.
4. El usuario hace clic en "Agregar".
5. El sistema llama a `POST /servicios` con `{perfilId, descripcion}`.
6. El sistema agrega el nuevo servicio a la lista local y limpia el campo de entrada.

**Flujos Alternativos:**
- **FA1 (Descripción vacía):** El sistema muestra: "La descripción del servicio es requerida".
- **FA2 (Descripción excede 100 caracteres):** El sistema muestra: "La descripción no puede exceder los 100 caracteres". El `Input` tiene `maxLength=100`.
- **FA3 (Error API):** Si falla la creación, el sistema muestra mensaje de error y no modifica la lista.

**Criterios de Aceptación:**
- [ ] El campo de entrada tiene `maxLength=100`.
- [ ] Validación de campo no vacío antes de enviar.
- [ ] Al crear exitosamente, el servicio aparece inmediatamente en la lista.
- [ ] El campo de entrada se limpia después de crear.

---

**RF-SERV-003: Editar Servicio**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Media |
| **Precondiciones** | Servicio existente en la lista. |
| **Fuente** | `lib/screens/services_manager.dart` |

**Flujo Principal:**
1. El usuario hace clic en el botón "Editar" de un servicio.
2. El sistema transforma la fila en modo edición: reemplaza el texto por un `Input` con el valor actual.
3. El usuario modifica la `descripcion` (máximo 100 caracteres).
4. El usuario confirma la edición (botón "Guardar" o Enter).
5. El sistema llama a `PUT /servicios/{id}` con `{descripcion}`.
6. El sistema actualiza el servicio en la lista local.

**Flujos Alternativos:**
- **FA1 (Cancelar edición):** El usuario hace clic en "Cancelar" y el sistema restaura el valor original.
- **FA2 (Sin cambios):** Si la descripción no cambió, el sistema no llama a la API y sale del modo edición.
- **FA3 (Error API):** Si falla la actualización, el sistema muestra error y mantiene el valor original.

**Criterios de Aceptación:**
- [ ] El modo edición se activa/desactiva por servicio individual.
- [ ] El campo en edición tiene `maxLength=100`.
- [ ] Al guardar, se llama `PUT /servicios/{id}`.
- [ ] La UI se actualiza tras guardar exitosamente.

---

**RF-SERV-004: Eliminar Servicio**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Media |
| **Precondiciones** | Servicio existente en la lista. |
| **Fuente** | `lib/screens/services_manager.dart` |

**Flujo Principal:**
1. El usuario hace clic en el botón "Eliminar" de un servicio.
2. El sistema muestra un diálogo de confirmación: "¿Estás seguro de eliminar este servicio?"
3. El usuario confirma la eliminación.
4. El sistema llama a `DELETE /servicios/{id}`.
5. El sistema remueve el servicio de la lista local.

**Flujos Alternativos:**
- **FA1 (Cancelar):** El usuario cancela el diálogo y no se realiza ninguna acción.
- **FA2 (Error API):** Si falla la eliminación, el sistema muestra mensaje de error y el servicio permanece en la lista.

**Criterios de Aceptación:**
- [ ] Diálogo de confirmación antes de eliminar.
- [ ] Al confirmar, se llama `DELETE /servicios/{id}`.
- [ ] El servicio se remueve visualmente tras eliminación exitosa.

---

#### 3.2.4 Reglas de Negocio — Servicios

| ID | Regla | Fuente |
|----|-------|--------|
| RN-SERV-01 | Cada servicio está asociado a un `perfilId` (relación con PerfilProfesional). | `lib/services/api.dart` |
| RN-SERV-02 | La descripción del servicio no puede exceder 100 caracteres. | `services_manager.dart` |
| RN-SERV-03 | No se puede crear un servicio con descripción vacía. | `services_manager.dart` |
| RN-SERV-04 | Un profesional puede tener múltiples servicios (relación 1:N). | `lib/services/api.dart` |

#### 3.2.5 Validaciones de Datos — Servicios

| Campo | Validación | Mensaje de Error |
|-------|-----------|-----------------|
| `descripcion` | Requerido, máximo 100 caracteres | "La descripción del servicio es requerida" / "Máximo 100 caracteres" |

#### 3.2.6 Integraciones API — Servicios

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/servicios/mis-servicios?perfilId={id}` | GET | Listar servicios del profesional |
| `/servicios` | POST | Crear nuevo servicio (`{perfilId, descripcion}`) |
| `/servicios/{id}` | PUT | Actualizar descripción de servicio |
| `/servicios/{id}` | DELETE | Eliminar servicio |

---

### 3.3 Módulo: Artículos

**Ruta:** `/professional-dashboard/articles`  
**Componente:** `ArticleFormScreen`  
**Fuente:** `lib/screens/article_form_screen.dart`, `lib/services/api.dart`

#### 3.3.1 Descripción General

El módulo de Artículos permite al profesional crear y gestionar contenido editorial (artículos/blog) con portada, resumen, contenido enriquecido y archivo PDF adjunto opcional. Los artículos pasan por un flujo de moderación antes de ser publicados. El estado del artículo se gestiona como: `"borrador"`, `"publicado"`, o `"archivado"`.

**Componentes adicionales:** `ArticleReaderScreen` (pantalla de lectura completa), `ArticlePdfReader` (visor PDF flipbook con visor de PDF nativo), `ArticlePdfPreview` (vista previa/miniatura de documento PDF).

#### 3.3.2 Historias de Usuario

| ID | Historia |
|----|----------|
| HU-ART-01 | Como profesional, quiero crear artículos con título, resumen, contenido e imagen de portada para compartir conocimiento con mis clientes. |
| HU-ART-02 | Como profesional, quiero adjuntar un documento PDF a mi artículo para proporcionar material descargable. |
| HU-ART-03 | Como profesional, quiero ver, editar y eliminar mis artículos desde un listado para gestionar mi contenido. |
| HU-ART-04 | Como profesional, quiero que mis artículos sean revisados por un administrador antes de publicarse para asegurar calidad. |
| HU-ART-05 | Como profesional, quiero archivar artículos antiguos sin eliminarlos para mantener mi perfil organizado. |

#### 3.3.3 Requerimientos Funcionales Detallados

---

**RF-ART-001: Listar Artículos del Profesional**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Usuario autenticado. |
| **Fuente** | `lib/screens/article_form_screen.dart`, página de artículos |

**Flujo Principal:**
1. El sistema llama a `GET /articulos/mios` (requiere token de autenticación).
2. El sistema renderiza una lista/tabla de `Articulo[]` mostrando: `titulo`, `estado` (borrador/publicado/archivado), `fecha_publicacion`, y botones de acción (Editar, Eliminar, Archivar).
3. Cada artículo permite vista previa del PDF si tiene `pdf_url`.
4. El sistema permite filtrar por estado o buscar por título.

**Criterios de Aceptación:**
- [ ] Los artículos se cargan con su `autor` anidado (`{id, nombre, correo?, foto_url?, perfiles_profesionales?}`).
- [ ] El estado se muestra con indicador visual (color/etiqueta): borrador (gris), publicado (verde), archivado (rojo).
- [ ] Si el artículo tiene PDF, se muestra un botón de vista previa.

---

**RF-ART-002: Crear Artículo**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Usuario autenticado. Pantalla de creación abierta. |
| **Fuente** | `lib/screens/article_form_screen.dart` |

**Flujo Principal:**
1. El usuario hace clic en "Nuevo Artículo". Se abre el `ArticleFormScreen`.
2. El sistema muestra el formulario con campos: `titulo` (Input, requerido), `resumen` (Textarea, 2 filas, opcional), `contenido` (Textarea, 10 filas, requerido), `imagen_portada` (File, opcional), `archivo_pdf` (File, opcional).
3. El usuario completa los campos requeridos (`titulo` y `contenido`).
4. El usuario opcionalmente selecciona una imagen de portada (`imagen_portada`).
5. El usuario opcionalmente selecciona un archivo PDF (`archivo_pdf`).
6. El usuario hace clic en "Guardar".
7. El sistema construye un `FormData` con los campos: `titulo`, `contenido`, `resumen`, `imagen_portada` (File), `archivo_pdf` (File), y `estado: "archivado"` (nuevo artículo).
8. El sistema llama a `POST /articulos` enviando el `FormData` (multipart).
9. El sistema cierra la pantalla y refresca la lista de artículos.

**Flujos Alternativos:**
- **FA1 (Campos requeridos vacíos):** Si `titulo` o `contenido` están vacíos, el sistema muestra error y no envía.
- **FA2 (Archivo muy grande):** El sistema debe validar tamaño máximo de archivos (imagen y PDF).
- **FA3 (Error API):** Si falla la creación, el sistema muestra error y mantiene la pantalla abierta con los datos ingresados.

**Postcondiciones:** Artículo creado con estado `"archivado"` (pendiente de moderación). `fecha_publicacion` y `created_at` establecidos por el servidor.

**Criterios de Aceptación:**
- [ ] El formulario en pantalla se renderiza con 5 campos (3 texto + 2 archivo).
- [ ] `titulo` y `contenido` son obligatorios.
- [ ] `resumen` tiene 2 filas de altura.
- [ ] `contenido` tiene 10 filas de altura.
- [ ] Los archivos se envían como `multipart/form-data`.
- [ ] El estado inicial del artículo es `"archivado"`.
- [ ] Tras crear, la lista se actualiza automáticamente.

---

**RF-ART-003: Editar Artículo**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Artículo existente. Usuario es el autor (`usuario_id` coincide). |
| **Fuente** | `lib/screens/article_form_screen.dart` |

**Flujo Principal:**
1. El usuario hace clic en "Editar" en un artículo existente.
2. El sistema abre el `ArticleFormScreen` precargado con los datos del artículo: `titulo`, `resumen`, `contenido`, `imagen_url` (mostrada como vista previa), `pdf_url` (si existe).
3. El usuario modifica los campos deseados.
4. El usuario puede reemplazar la imagen de portada y/o el PDF.
5. El usuario hace clic en "Guardar".
6. El sistema llama a `PUT /articulos/{id}` con el `FormData` actualizado.
7. El sistema cierra la pantalla y refresca la lista.

**Flujos Alternativos:**
- **FA1 (Sin cambios):** Si no se modificó ningún campo, el sistema puede omitir la llamada API.
- **FA2 (Eliminar imagen existente):** El usuario puede quitar la imagen de portada actual; el sistema envía el campo vacío.
- **FA3 (Error API):** Si falla, el sistema muestra error y mantiene la pantalla abierta.

**Criterios de Aceptación:**
- [ ] El formulario se precarga con todos los datos del artículo.
- [ ] La imagen de portada existente se muestra como vista previa.
- [ ] Si hay PDF existente, se muestra su nombre o miniatura.
- [ ] `updated_at` se actualiza automáticamente en el servidor.

---

**RF-ART-004: Eliminar Artículo**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Media |
| **Precondiciones** | Artículo existente. Usuario es el autor. |
| **Fuente** | Página de artículos |

**Flujo Principal:**
1. El usuario hace clic en "Eliminar" en un artículo.
2. El sistema muestra diálogo de confirmación.
3. El usuario confirma.
4. El sistema llama a `DELETE /articulos/{id}`.
5. El sistema remueve el artículo de la lista.

**Criterios de Aceptación:**
- [ ] Confirmación requerida antes de eliminar.
- [ ] Tras eliminar, el artículo desaparece de la lista.

---

**RF-ART-005: Archivar Artículo**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Baja |
| **Precondiciones** | Artículo existente con estado `"publicado"` o `"borrador"`. |
| **Fuente** | Página de artículos |

**Flujo Principal:**
1. El usuario hace clic en "Archivar" en un artículo.
2. El sistema llama a `PUT /articulos/{id}/archivar`.
3. El sistema actualiza el estado del artículo a `"archivado"` en la lista local.

**Criterios de Aceptación:**
- [ ] Solo artículos publicados o en borrador pueden archivarse.
- [ ] El cambio de estado se refleja inmediatamente en la UI.

---

#### 3.3.4 Reglas de Negocio — Artículos

| ID | Regla | Fuente |
|----|-------|--------|
| RN-ART-01 | El estado inicial de un artículo nuevo es `"archivado"` (no publicado automáticamente). | `article_form_screen.dart` |
| RN-ART-02 | Solo el autor (`usuario_id`) puede editar o eliminar sus propios artículos. | `lib/services/api.dart` |
| RN-ART-03 | Un administrador puede moderar artículos (`PUT /articulos/{id}/moderar`). | `lib/services/api.dart` |
| RN-ART-04 | Los estados válidos son: `"borrador"`, `"publicado"`, `"archivado"`. | `lib/services/api.dart` (Articulo.estado) |
| RN-ART-05 | `titulo` y `contenido` son campos obligatorios. | `article_form_screen.dart` |
| RN-ART-06 | Los archivos (imagen de portada y PDF) se envían como `multipart/form-data`. | `article_form_screen.dart`, `lib/services/api.dart` |
| RN-ART-07 | `fecha_publicacion` y `created_at` son establecidos por el servidor. | `lib/services/api.dart` |

#### 3.3.5 Validaciones de Datos — Artículos

| Campo | Validación | Mensaje de Error |
|-------|-----------|-----------------|
| `titulo` | Requerido, no vacío | "El título es requerido" |
| `contenido` | Requerido, no vacío | "El contenido es requerido" |
| `resumen` | Opcional, texto plano | — |
| `imagen_portada` | Archivo de imagen (jpg, png, webp), opcional | "Formato de imagen no soportado" |
| `archivo_pdf` | Archivo PDF, opcional | "Solo se permiten archivos PDF" |

#### 3.3.6 Integraciones API — Artículos

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/articulos/mios` | GET | Listar artículos del usuario autenticado |
| `/articulos` | POST | Crear artículo (FormData multipart) |
| `/articulos/{id}` | GET | Obtener artículo por ID |
| `/articulos/{id}` | PUT | Actualizar artículo |
| `/articulos/{id}` | DELETE | Eliminar artículo |
| `/articulos/{id}/moderar` | PUT | Moderar/aprobar artículo (admin) |
| `/articulos/{id}/archivar` | PUT | Archivar artículo |
| `/articulos/admin/todos` | GET | Listar todos los artículos (admin) |

---

### 3.4 Módulo: Citas

**Ruta:** `/professional-dashboard/appointments`  
**Componentes:** `BookingForm` (público), `BookingBottomSheet` (público simplificado), `RescheduleBottomSheet` (dashboard profesional)  
**Fuente:** `lib/screens/booking_form.dart`, `lib/screens/booking_bottom_sheet.dart`, `lib/screens/reschedule_bottom_sheet.dart`, `lib/services/api.dart`

#### 3.4.1 Descripción General

El módulo de Citas gestiona el agendamiento y administración de citas entre clientes y profesionales. Los clientes (autenticados o públicos) pueden agendar citas con cualquier profesional que tenga disponibilidad en su horario. El profesional puede ver sus citas agendadas, cambiar su estado, y reagendar citas si tiene habilitada la opción `permitir_reagendar`.

#### 3.4.2 Historias de Usuario

| ID | Historia |
|----|----------|
| HU-CIT-01 | Como cliente, quiero agendar una cita con un profesional seleccionando fecha y hora disponible para recibir sus servicios. |
| HU-CIT-02 | Como profesional, quiero ver todas las citas agendadas conmigo para gestionar mi agenda diaria. |
| HU-CIT-03 | Como profesional, quiero cambiar el estado de una cita (confirmada, cancelada, completada) para mantener mi agenda actualizada. |
| HU-CIT-04 | Como profesional, quiero reagendar una cita a otra fecha y hora disponible para ofrecer flexibilidad a mis clientes. |
| HU-CIT-05 | Como cliente, quiero recibir confirmación de mi cita agendada para tener certeza de la reserva. |

#### 3.4.3 Requerimientos Funcionales Detallados

---

**RF-CIT-001: Agendar Cita (Cliente Público)**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Profesional con perfil público y horario configurado. Cliente no necesita autenticación. |
| **Fuente** | `lib/screens/booking_form.dart`, `lib/screens/booking_bottom_sheet.dart` |

**Flujo Principal:**
1. El cliente ve el perfil público de un profesional (vía `BookingForm` o `BookingBottomSheet`).
2. El sistema carga la disponibilidad del profesional desde `GET /horarios/publico/{slug}`.
3. El sistema muestra un calendario con los días disponibles (días sin disponibilidad aparecen deshabilitados) y un selector de horas (bloques de 1 hora).
4. El cliente selecciona una fecha (`fecha_cita`, formato YYYY-MM-DD) que no sea pasada.
5. El sistema muestra las horas disponibles para esa fecha (basado en la matriz de horario `boolean[168]` del profesional).
6. El cliente selecciona una hora (`hora_cita`, formato HH:00, bloques de una hora).
7. El cliente ingresa sus datos:
   - `nombres_completos` (requerido)
   - `correo` (requerido, validado como email)
   - `telefono` (requerido, 10 dígitos numéricos, patrón `[0-9]{10}`, `maxLength=10`)
   - `comentario` (opcional)
8. El cliente hace clic en "Agendar Cita".
9. El sistema llama a `POST /citas/publico` con `{profesional_id, nombres_completos, correo, telefono, fecha_cita, hora_cita, comentario}`.
10. El sistema muestra confirmación con los detalles de la cita.

**Flujos Alternativos:**
- **FA1 (Fecha pasada):** El sistema deshabilita fechas anteriores a hoy en el calendario.
- **FA2 (Hora no disponible):** Si la hora ya fue reservada, el sistema la muestra como no disponible o muestra error al intentar agendar.
- **FA3 (Campos vacíos):** Si `nombres_completos`, `correo`, o `telefono` están vacíos, el sistema muestra errores de validación.
- **FA4 (Teléfono inválido):** Si el teléfono no cumple el patrón `[0-9]{10}`, el sistema muestra: "Ingrese un número de teléfono válido (10 dígitos)".
- **FA5 (Correo inválido):** Si el correo no tiene formato válido, el sistema muestra: "Ingrese un correo electrónico válido".
- **FA6 (Error API):** Si la cita no puede crearse (conflicto de horario, profesional no disponible), el sistema muestra el error del servidor.

**Postcondiciones:** Cita creada con `estado_id` pendiente. `created_at` establecido por el servidor.

**Criterios de Aceptación:**
- [ ] El calendario (`Calendar popover`) deshabilita fechas pasadas y días sin disponibilidad.
- [ ] Las horas disponibles se calculan desde la matriz del profesional (`GET /horarios/publico/{slug}`).
- [ ] Las horas se muestran en bloques de 1 hora (HH:00).
- [ ] `telefono` tiene `maxLength=10` y patrón `[0-9]{10}`.
- [ ] Validación de campos requeridos antes de enviar.
- [ ] `POST /citas/publico` se llama con todos los campos del formulario.
- [ ] Confirmación visible tras agendamiento exitoso.

---

**RF-CIT-002: Listar Citas del Profesional**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Usuario autenticado con perfil profesional. |
| **Fuente** | Página de citas del dashboard |

**Flujo Principal:**
1. El sistema llama a `GET /citas` (requiere token de autenticación).
2. El sistema renderiza una lista de `Cita[]` mostrando: `id`, `nombres_completos` o `usuario.nombre`, `fecha_cita`, `hora_cita`, `estado_id`, `comentario`.
3. Las citas pueden filtrarse por fecha (hoy, semana, mes) o por estado.
4. Cada cita muestra botones de acción según su estado actual.

**Criterios de Aceptación:**
- [ ] Las citas se cargan filtradas por el `profesional_id` del usuario autenticado.
- [ ] Las citas se ordenan por `fecha_cita` y `hora_cita` (más próximas primero).
- [ ] El estado se muestra con etiqueta visual.

---

**RF-CIT-003: Cambiar Estado de Cita**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Cita existente. Usuario es el profesional de la cita. |
| **Fuente** | Página de citas, `lib/services/api.dart` |

**Flujo Principal:**
1. El profesional selecciona una cita y elige un nuevo estado (ej. "Confirmada", "Cancelada", "Completada").
2. El sistema llama a `PUT /citas/{id}/estado` con `{estado_id}`.
3. El sistema actualiza el estado de la cita en la lista local.

**Criterios de Aceptación:**
- [ ] Solo el profesional dueño de la cita puede cambiar su estado.
- [ ] El cambio de estado se refleja inmediatamente en la UI.
- [ ] Estados disponibles según flujo de negocio (ej. pendiente → confirmada → completada).

---

**RF-CIT-004: Reagendar Cita**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Media |
| **Precondiciones** | Cita existente. `permitir_reagendar = true` en el perfil del profesional. |
| **Fuente** | `lib/screens/reschedule_bottom_sheet.dart` |

**Flujo Principal:**
1. El profesional hace clic en "Reagendar" en una cita existente.
2. El sistema abre el `RescheduleBottomSheet` mostrando los datos actuales: `cita.id`, `cita.usuario.nombre`, `cita.fecha_hora` actual.
3. El sistema muestra campos HTML5 `date` (`fecha_cita`) y `time` (`hora_cita`) para seleccionar nueva fecha/hora.
4. El profesional selecciona una nueva fecha y hora disponible.
5. El profesional confirma el reagendamiento.
6. El sistema llama a `PUT /citas/{id}/reagendar` con `{fecha_cita, hora_cita}`.
7. El sistema actualiza la cita en la lista y cierra el bottom sheet.

**Flujos Alternativos:**
- **FA1 (Reagendamiento no permitido):** Si `permitir_reagendar = false`, el botón "Reagendar" no aparece.
- **FA2 (Fecha/hora no disponible):** El sistema valida que la nueva fecha/hora esté dentro del horario del profesional.
- **FA3 (Error API):** Si falla, el sistema muestra error y no modifica la cita.

**Criterios de Aceptación:**
- [ ] El bottom sheet se precarga con `cita.id`, `usuario.nombre`, y `fecha_hora` actual.
- [ ] Solo se muestran fechas/horas disponibles del profesional.
- [ ] `RescheduleBottomSheet` usa `fecha_cita` + `hora_cita` (no `fecha_hora` combinado).
- [ ] Tras reagendar, `fecha_hora` se actualiza en el servidor.

---

#### 3.4.4 Reglas de Negocio — Citas

| ID | Regla | Fuente |
|----|-------|--------|
| RN-CIT-01 | No se pueden agendar citas en fechas pasadas. | `booking_form.dart` (Calendar deshabilita días pasados) |
| RN-CIT-02 | Las horas de cita son bloques fijos de 1 hora (HH:00). | `booking_form.dart` |
| RN-CIT-03 | El teléfono del cliente debe tener 10 dígitos numéricos (patrón `[0-9]{10}`). | `booking_form.dart`, `booking_bottom_sheet.dart` |
| RN-CIT-04 | El reagendamiento solo está disponible si `permitir_reagendar = true` en el perfil. | `lib/services/api.dart` (PerfilProfesional), `reschedule_bottom_sheet.dart` |
| RN-CIT-05 | Las citas públicas no requieren autenticación del cliente. | `lib/services/api.dart` (`POST /citas/publico`) |
| RN-CIT-06 | Las citas privadas requieren token de autenticación del cliente. | `lib/services/api.dart` (`POST /citas`) |
| RN-CIT-07 | Solo el profesional dueño de la cita puede cambiar su estado. | `lib/services/api.dart` (lógica del backend) |
| RN-CIT-08 | La disponibilidad se determina por la matriz `boolean[168]` del profesional. | `schedule_grid.dart`, `schedule_manager.dart` |

#### 3.4.5 Validaciones de Datos — Citas

| Campo | Validación | Mensaje de Error |
|-------|-----------|-----------------|
| `nombres_completos` | Requerido, no vacío | "El nombre es requerido" |
| `correo` | Requerido, formato email | "Ingrese un correo electrónico válido" |
| `telefono` | Requerido, 10 dígitos numéricos, patrón `[0-9]{10}` | "Ingrese un número de teléfono válido (10 dígitos)" |
| `fecha_cita` | Requerido, fecha futura (no pasada) | "Seleccione una fecha válida" |
| `hora_cita` | Requerido, bloque de 1 hora (HH:00), dentro del horario del profesional | "Seleccione una hora disponible" |
| `comentario` | Opcional, texto libre | — |

#### 3.4.6 Integraciones API — Citas

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/citas/publico` | POST | Agendar cita (cliente no autenticado) |
| `/citas` | POST | Agendar cita (cliente autenticado) |
| `/citas` | GET | Listar citas del profesional autenticado |
| `/citas/{id}/estado` | PUT | Cambiar estado de cita |
| `/citas/{id}/reagendar` | PUT | Reagendar cita a nueva fecha/hora |
| `/horarios/publico/{slug}` | GET | Obtener horario público del profesional |

---

### 3.5 Módulo: Horarios

**Ruta:** `/professional-dashboard/schedule`  
**Componentes:** `ScheduleManager`, `ScheduleGrid`  
**Fuente:** `lib/screens/schedule_manager.dart`, `lib/screens/schedule_grid.dart`, `lib/services/api.dart`

#### 3.5.1 Descripción General

El módulo de Horarios permite al profesional definir su disponibilidad semanal mediante una grilla interactiva de 7 días (Lunes a Domingo) × 24 horas. La disponibilidad se representa como una matriz de 168 valores booleanos donde `true` = disponible, `false` = no disponible. Esta matriz determina qué horas pueden reservar los clientes para citas.

#### 3.5.2 Historias de Usuario

| ID | Historia |
|----|----------|
| HU-HOR-01 | Como profesional, quiero marcar las horas en que estoy disponible cada día de la semana para que los clientes sepan cuándo agendar. |
| HU-HOR-02 | Como profesional, quiero ver mi horario semanal en una grilla visual clara para entender mi disponibilidad de un vistazo. |
| HU-HOR-03 | Como profesional, quiero guardar cambios en mi horario y que se reflejen inmediatamente en mi perfil público. |
| HU-HOR-04 | Como profesional, quiero alternar rápidamente bloques de horas (ej. "9 AM a 5 PM") para no marcar hora por hora. |

#### 3.5.3 Requerimientos Funcionales Detallados

---

**RF-HOR-001: Visualizar Horario en Grilla**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Usuario autenticado con `perfilId`. |
| **Fuente** | `lib/screens/schedule_grid.dart`, `lib/screens/schedule_manager.dart` |

**Flujo Principal:**
1. El `ScheduleManager` obtiene el `perfilId` del profesional.
2. El sistema llama a `GET /horarios/perfil/{perfilId}`.
3. El sistema renderiza el `ScheduleGrid` con la matriz `boolean[168]` recibida.
4. La grilla muestra: columnas = días (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo), filas = horas (0-23, mostradas como 12 AM a 11 PM).
5. Cada celda coloreada/activada indica disponibilidad (`true`); celda vacía indica no disponibilidad (`false`).

**Flujos Alternativos:**
- **FA1 (Sin horario previo):** Si el profesional nunca ha configurado horario, la grilla se muestra completamente vacía (`false` en todas las celdas).
- **FA2 (Error de carga):** Si falla la API, el sistema muestra mensaje de error.

**Criterios de Aceptación:**
- [ ] La grilla tiene 7 columnas (días) y 24 filas (horas).
- [ ] El mapeo de días: índice 0 = Lunes, índice 6 = Domingo.
- [ ] Las horas se muestran en formato 12h (AM/PM).
- [ ] Las celdas disponibles e indisponibles se distinguen visualmente (color/fondo).
- [ ] La grilla es interactiva (clic para alternar).

---

**RF-HOR-002: Editar Disponibilidad en Grilla**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Grilla de horario renderizada. |
| **Fuente** | `lib/screens/schedule_grid.dart` (callback `onChange`) |

**Flujo Principal:**
1. El usuario hace clic en una celda para alternar su estado (disponible ↔ no disponible).
2. El `ScheduleGrid` notifica al `ScheduleManager` mediante el callback `onChange` con la matriz actualizada (`boolean[168]`).
3. El usuario puede alternar múltiples celdas.
4. El usuario hace clic en "Guardar Horario".
5. El sistema llama a `POST /horarios/actualizar` con `{perfilId, matriz}`.
6. El sistema muestra confirmación: "Horario guardado exitosamente".

**Flujos Alternativos:**
- **FA1 (Selección por bloques):** El usuario puede hacer clic y arrastrar para seleccionar múltiples celdas contiguas.
- **FA2 (Selección de día completo):** El usuario puede hacer clic en el encabezado del día para marcar/desmarcar todas las 24 horas de ese día.
- **FA3 (Error al guardar):** Si falla la API, el sistema muestra error y mantiene los cambios locales.

**Criterios de Aceptación:**
- [ ] Cada clic en celda alterna su valor booleano individual.
- [ ] El callback `onChange` recibe la matriz completa actualizada.
- [ ] El índice de cada celda se calcula como: `día × 24 + hora`.
- [ ] Al guardar, se envía `POST /horarios/actualizar` con `{perfilId, matriz}`.

---

**RF-HOR-003: Sincronización con Agendamiento Público**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Horario guardado. |
| **Fuente** | `lib/services/api.dart` (`GET /horarios/publico/{slug}`) |

**Flujo Principal:**
1. Cuando un cliente ve el perfil público del profesional, el sistema llama a `GET /horarios/publico/{slug}`.
2. El sistema calcula las horas disponibles para cada día.
3. Las horas ya reservadas (citas existentes) se descuentan de la disponibilidad.
4. Los cambios en el horario del profesional se reflejan inmediatamente en la vista pública.

**Criterios de Aceptación:**
- [ ] El endpoint público retorna la matriz o disponibilidad procesada.
- [ ] Las citas existentes reducen la disponibilidad mostrada al cliente.
- [ ] Cambios en el horario se reflejan en tiempo real (al recargar la página pública).

---

#### 3.5.4 Reglas de Negocio — Horarios

| ID | Regla | Fuente |
|----|-------|--------|
| RN-HOR-01 | La matriz de horario tiene exactamente 168 elementos (7 días × 24 horas). | `schedule_grid.dart` |
| RN-HOR-02 | El índice se calcula como: `índice = día × 24 + hora`. | `schedule_grid.dart` |
| RN-HOR-03 | Mapeo de días: matriz día 0 = Lunes, día 1 = Martes, ..., día 6 = Domingo. | `schedule_grid.dart`, `schedule_manager.dart` |
| RN-HOR-04 | `DateTime.weekday` de Dart: 1 = Lunes mapea a matriz índice 0; 7 = Domingo mapea a 6, etc. | `schedule_grid.dart` |
| RN-HOR-05 | Las citas solo pueden agendarse en horas marcadas como disponibles (`true`). | `booking_form.dart` |
| RN-HOR-06 | El horario público se obtiene por `slug` del profesional, no por `perfilId`. | `lib/services/api.dart` |
| RN-HOR-07 | Cada profesional tiene exactamente un registro de horario (relación 1:1 con PerfilProfesional). | `lib/services/api.dart` |

#### 3.5.5 Validaciones de Datos — Horarios

| Campo | Validación | Mensaje de Error |
|-------|-----------|-----------------|
| `matriz` | Array de exactamente 168 booleanos | "El horario debe tener 168 valores (7 días × 24 horas)" |
| `perfilId` | Requerido, FK a PerfilProfesional | "Perfil no encontrado" |

#### 3.5.6 Integraciones API — Horarios

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/horarios/perfil/{perfilId}` | GET | Obtener horario del profesional (autenticado) |
| `/horarios/actualizar` | POST | Guardar/actualizar matriz de horario |
| `/horarios/publico/{slug}` | GET | Obtener horario público para agendamiento |

---

### 3.6 Módulo: Redes Sociales

**Ruta:** `/professional-dashboard/social-media`  
**Componente:** `SocialMediaManager`  
**Fuente:** `lib/screens/social_media_manager.dart`, `lib/screens/professional_form.dart` (Step 4), `lib/services/api.dart`

#### 3.6.1 Descripción General

El módulo de Redes Sociales permite al profesional gestionar los enlaces a sus 6 perfiles de redes sociales. Cada URL se valida contra el patrón específico de su plataforma. Los enlaces se muestran en el perfil público del profesional.

**Plataformas soportadas:** Facebook, Instagram, TikTok, LinkedIn, X (Twitter), YouTube.

#### 3.6.2 Historias de Usuario

| ID | Historia |
|----|----------|
| HU-RED-01 | Como profesional, quiero agregar enlaces a mis redes sociales para que los clientes me sigan en otras plataformas. |
| HU-RED-02 | Como profesional, quiero editar o eliminar enlaces de redes sociales para mantener mi información actualizada. |
| HU-RED-03 | Como profesional, quiero que el sistema valide que mis URLs sean correctas para evitar enlaces rotos. |

#### 3.6.3 Requerimientos Funcionales Detallados

---

**RF-RED-001: Gestionar Enlaces de Redes Sociales**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Media |
| **Precondiciones** | Usuario autenticado con perfil profesional. |
| **Fuente** | `lib/screens/social_media_manager.dart` |

**Flujo Principal:**
1. El sistema muestra el `SocialMediaManager` con 6 campos de entrada, uno por plataforma:
   - Facebook: `facebook_url`
   - Instagram: `instagram_url`
   - TikTok: `tiktok_url`
   - LinkedIn: `linkedin_url`
   - X (Twitter): `x_url`
   - YouTube: `yt_url`
2. Cada campo muestra un placeholder con el formato esperado (ej. `https://facebook.com/tu-perfil`).
3. El usuario ingresa las URLs en los campos correspondientes.
4. El sistema valida cada URL contra el regex de su plataforma al perder el foco (`onBlur`) o al guardar.
5. El usuario hace clic en "Guardar".
6. El sistema llama a `PUT /profesionales/actualizar-perfil` con los 6 campos de redes sociales.
7. El sistema muestra confirmación.

**Flujos Alternativos:**
- **FA1 (URL inválida):** Si una URL no coincide con el patrón, el sistema muestra error debajo del campo: "URL de [Plataforma] no válida. Formato esperado: [formato]".
- **FA2 (Campo vacío):** Los campos vacíos son permitidos (red social no configurada).
- **FA3 (Error API):** Si falla la actualización, el sistema muestra error y permite reintentar.

**Criterios de Aceptación:**
- [ ] Se muestran exactamente 6 campos de entrada, uno por plataforma.
- [ ] Cada campo valida su URL con regex específico de plataforma.
- [ ] Campos vacíos permitidos.
- [ ] Al guardar, se envían los 6 campos juntos en `PUT /profesionales/actualizar-perfil`.
- [ ] Los cambios se reflejan en el perfil público del profesional.

---

#### 3.6.4 Reglas de Negocio — Redes Sociales

| ID | Regla | Fuente |
|----|-------|--------|
| RN-RED-01 | Seis plataformas soportadas: Facebook, Instagram, TikTok, LinkedIn, X/Twitter, YouTube. | `social_media_manager.dart` |
| RN-RED-02 | Cada URL se valida contra un patrón regex específico de la plataforma. | `social_media_manager.dart`, `professional_form.dart` |
| RN-RED-03 | Las URLs de redes sociales son campos opcionales. | `lib/services/api.dart` (PerfilProfesional) |
| RN-RED-04 | Los cambios en redes sociales se guardan a través del endpoint de actualización de perfil. | `social_media_manager.dart` |
| RN-RED-05 | La validación ocurre tanto en `SocialMediaManager` como en el Paso 4 del `ProfessionalForm`. | Ambos componentes |

#### 3.6.5 Validaciones de Datos — Redes Sociales

| Campo | Validación (Regex/Formato) | Mensaje de Error |
|-------|---------------------------|-----------------|
| `facebook_url` | Debe coincidir con `facebook.com/...` | "URL de Facebook no válida. Formato: https://facebook.com/tu-perfil" |
| `instagram_url` | Debe coincidir con `instagram.com/...` | "URL de Instagram no válida. Formato: https://instagram.com/tu-perfil" |
| `tiktok_url` | Debe coincidir con `tiktok.com/@...` | "URL de TikTok no válida. Formato: https://tiktok.com/@tu-usuario" |
| `linkedin_url` | Debe coincidir con `linkedin.com/in/...` | "URL de LinkedIn no válida. Formato: https://linkedin.com/in/tu-perfil" |
| `x_url` | Debe coincidir con `x.com/...` o `twitter.com/...` | "URL de X/Twitter no válida. Formato: https://x.com/tu-usuario" |
| `yt_url` | Debe coincidir con `youtube.com/@...` o `youtu.be/...` | "URL de YouTube no válida. Formato: https://youtube.com/@tu-canal" |

#### 3.6.6 Integraciones API — Redes Sociales

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/profesionales/actualizar-perfil` | PUT | Guardar URLs de redes sociales (junto con otros datos de perfil) |

---

### 3.7 Módulo: Configuración

**Ruta:** `/professional-dashboard/settings`  
**Componente:** Página de configuración  
**Fuente:** `lib/services/api.dart`, `lib/config/professional_nav.dart`

#### 3.7.1 Descripción General

El módulo de Configuración permite al profesional gestionar los ajustes de su cuenta: cambiar contraseña, actualizar datos personales, configurar preferencias de visibilidad y notificaciones, y eliminar su cuenta.

#### 3.7.2 Historias de Usuario

| ID | Historia |
|----|----------|
| HU-CONF-01 | Como profesional, quiero cambiar mi contraseña por seguridad para proteger mi cuenta. |
| HU-CONF-02 | Como profesional, quiero actualizar mi nombre, correo, teléfono y foto de perfil para mantener mis datos al día. |
| HU-CONF-03 | Como profesional, quiero eliminar mi cuenta permanentemente si ya no deseo usar la plataforma. |
| HU-CONF-04 | Como profesional, quiero ver y gestionar mis preferencias de visibilidad y notificaciones. |

#### 3.7.3 Requerimientos Funcionales Detallados

---

**RF-CONF-001: Cambiar Contraseña**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Usuario autenticado. |
| **Fuente** | `lib/services/api.dart` (`authApi.cambiarContrasena`) |

**Flujo Principal:**
1. El sistema muestra el formulario de cambio de contraseña: `contraseña_actual`, `nueva_contraseña`, `confirmar_nueva_contraseña`.
2. El usuario ingresa su contraseña actual.
3. El usuario ingresa la nueva contraseña (mín. 8 caracteres, mayúscula, minúscula, carácter especial).
4. El usuario confirma la nueva contraseña.
5. El sistema valida: nueva contraseña ≠ contraseña actual, nueva contraseña cumple reglas de seguridad, `confirmar_nueva_contraseña` coincide.
6. El sistema llama a `PUT /auth/cambiar-contrasena` (o endpoint equivalente `authApi.cambiarContrasena`).
7. El sistema muestra: "Contraseña actualizada exitosamente".

**Flujos Alternativos:**
- **FA1 (Contraseña actual incorrecta):** El API devuelve error; el sistema muestra: "La contraseña actual es incorrecta".
- **FA2 (Nueva contraseña débil):** El sistema muestra error de validación antes de enviar.
- **FA3 (Contraseñas no coinciden):** El sistema muestra: "Las contraseñas no coinciden".

**Criterios de Aceptación:**
- [ ] Campo de contraseña actual requerido.
- [ ] Nueva contraseña validada con reglas: 8+ caracteres, 1 mayúscula, 1 minúscula, 1 especial.
- [ ] Confirmación debe coincidir con nueva contraseña.
- [ ] Nueva contraseña no puede ser igual a la actual.

---

**RF-CONF-002: Actualizar Datos de Usuario**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Media |
| **Precondiciones** | Usuario autenticado. |
| **Fuente** | `lib/services/api.dart` (`PUT /usuarios/perfil`) |

**Flujo Principal:**
1. El sistema carga los datos actuales del usuario desde `GET /usuarios/perfil`.
2. El sistema muestra el formulario precargado con: `nombre`, `correo`, `telefono`, `cedula`, `foto_url` (vista previa).
3. El usuario modifica los campos deseados.
4. El usuario puede cambiar su foto de perfil (seleccionar nuevo archivo → Cloudinary).
5. El usuario hace clic en "Guardar".
6. El sistema llama a `PUT /usuarios/perfil` con los datos actualizados.
7. El sistema actualiza la UI y muestra confirmación.

**Flujos Alternativos:**
- **FA1 (Correo duplicado):** Si el nuevo correo ya está en uso, el sistema muestra: "Este correo ya está registrado por otro usuario".
- **FA2 (Cédula duplicada):** Si la nueva cédula ya existe, el sistema muestra error.
- **FA3 (Error de subida de foto):** Si falla Cloudinary, el sistema muestra error y mantiene la foto anterior.

**Criterios de Aceptación:**
- [ ] Formulario precargado con datos actuales del `GET /usuarios/perfil`.
- [ ] `nombre`, `correo` son campos requeridos.
- [ ] `telefono` y `cedula` validados a 10 dígitos numéricos.
- [ ] Foto de perfil se sube a Cloudinary antes de actualizar datos.
- [ ] Los cambios se reflejan en el header/nav del dashboard.

---

**RF-CONF-003: Eliminar Cuenta**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Baja |
| **Precondiciones** | Usuario autenticado. |
| **Fuente** | `lib/services/api.dart` (`DELETE /usuarios/mi-cuenta`) |

**Flujo Principal:**
1. El usuario navega a la sección "Eliminar Cuenta" en Configuración.
2. El sistema muestra una advertencia: "Esta acción es permanente y no se puede deshacer. Todos tus datos, perfil, servicios, artículos y citas serán eliminados."
3. El sistema solicita confirmación: el usuario debe ingresar su contraseña actual para verificar identidad.
4. El usuario ingresa su contraseña y confirma.
5. El sistema llama a `DELETE /usuarios/mi-cuenta`.
6. El sistema cierra la sesión (elimina token de `flutter_secure_storage`) y redirige a la página principal.

**Flujos Alternativos:**
- **FA1 (Contraseña incorrecta):** El sistema muestra: "Contraseña incorrecta. No se pudo eliminar la cuenta."
- **FA2 (Cancelar):** El usuario cancela y permanece en la página de configuración.

**Criterios de Aceptación:**
- [ ] Advertencia clara sobre la irreversibilidad de la acción.
- [ ] Requiere contraseña para confirmar identidad.
- [ ] Tras eliminar, se limpia el token de `flutter_secure_storage (auth_token)`.
- [ ] Redirección a la página principal pública.

---

**RF-CONF-004: Configurar Preferencias y Visibilidad**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Media |
| **Precondiciones** | Usuario autenticado con perfil profesional. |
| **Fuente** | `lib/services/api.dart` (PerfilProfesional) |

**Flujo Principal:**
1. El sistema muestra opciones de configuración:
   - `show_phone` (checkbox): "Mostrar mi teléfono en el perfil público"
   - `show_email` (checkbox): "Mostrar mi correo en el perfil público"
   - `permitir_reagendar` (checkbox): "Permitir que los clientes reagenden citas"
   - `plan` (informativo, solo lectura): Plan actual del profesional
2. El usuario alterna las opciones deseadas.
3. El usuario hace clic en "Guardar Preferencias".
4. El sistema llama a `PUT /profesionales/actualizar-perfil` con los campos modificados.
5. El sistema confirma los cambios.

**Criterios de Aceptación:**
- [ ] Los valores actuales se cargan desde `GET /profesionales/perfil`.
- [ ] `show_phone` y `show_email` controlan visibilidad pública de datos de contacto.
- [ ] `permitir_reagendar` habilita/deshabilita la funcionalidad de reagendamiento.
- [ ] `plan` es informativo de solo lectura.
- [ ] Los cambios se guardan con `PUT /profesionales/actualizar-perfil`.

---

#### 3.7.4 Reglas de Negocio — Configuración

| ID | Regla | Fuente |
|----|-------|--------|
| RN-CONF-01 | La eliminación de cuenta es permanente e irreversible. | `lib/services/api.dart` |
| RN-CONF-02 | Para eliminar la cuenta, el usuario debe confirmar con su contraseña actual. | Página de configuración |
| RN-CONF-03 | La nueva contraseña no puede ser igual a la contraseña actual. | `authApi.cambiarContrasena` |
| RN-CONF-04 | `show_phone` y `show_email` aplican a la vista pública del perfil. | `lib/services/api.dart` |
| RN-CONF-05 | `permitir_reagendar` debe estar activo para que aparezca la opción de reagendar citas. | `reschedule_bottom_sheet.dart` |

#### 3.7.5 Validaciones de Datos — Configuración

| Campo | Validación | Mensaje de Error |
|-------|-----------|-----------------|
| `contraseña_actual` | Requerido para cambio de contraseña y eliminación de cuenta | "Ingrese su contraseña actual" |
| `nueva_contraseña` | Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 especial | "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un carácter especial" |
| `confirmar_nueva_contraseña` | Coincide con `nueva_contraseña` | "Las contraseñas no coinciden" |
| `nombre` | Requerido, no vacío | "El nombre es requerido" |
| `correo` | Requerido, formato email | "Ingrese un correo electrónico válido" |
| `telefono` | 10 dígitos numéricos | "El teléfono debe tener 10 dígitos numéricos" |
| `cedula` | 10 dígitos numéricos | "La cédula debe tener 10 dígitos numéricos" |

#### 3.7.6 Integraciones API — Configuración

| Endpoint | Método | Propósito |
|----------|--------|-----------|
| `/auth/cambiar-contrasena` | PUT | Cambiar contraseña |
| `/auth/recuperar-contrasena` | POST | Solicitar recuperación de contraseña |
| `/usuarios/perfil` | GET | Obtener datos del usuario |
| `/usuarios/perfil` | PUT | Actualizar datos del usuario |
| `/usuarios/mi-cuenta` | DELETE | Eliminar cuenta permanentemente |
| `/profesionales/perfil` | GET | Obtener perfil profesional |
| `/profesionales/actualizar-perfil` | PUT | Actualizar preferencias del perfil profesional |

---

## 4. Requerimientos Transversales

---

### 4.1 Autenticación y Seguridad

**Fuente:** `lib/services/api.dart` (authApi), `flutter_secure_storage (auth_token)`

---

**RF-AUTH-001: Registro de Usuario**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Usuario no autenticado. |
| **Endpoint** | `POST /auth/register` |
| **Payload** | `{nombre, correo, contrasena, rol_id, telefono, cedula}` |
| **Respuesta** | `{token: string, usuario: Usuario}` |

**Flujo Principal:**
1. El usuario completa el formulario de registro con nombre, correo, contraseña, teléfono, cédula.
2. `rol_id` se establece automáticamente como `2` (profesional).
3. El sistema envía `POST /auth/register` con los datos.
4. El sistema recibe `{token, usuario}`, almacena el token JWT en `flutter_secure_storage (auth_token)`.
5. El sistema redirige al dashboard profesional o al wizard de creación de perfil.

**Criterios de Aceptación:**
- [ ] El token JWT se almacena en `flutter_secure_storage` bajo la clave `"auth_token"`.
- [ ] `rol_id = 2` identifica al usuario como profesional.
- [ ] El endpoint retorna tanto el token como los datos básicos del usuario.

---

**RF-AUTH-002: Inicio de Sesión**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Precondiciones** | Usuario registrado, no autenticado. |
| **Endpoint** | `POST /auth/login` |
| **Payload** | `{correo, contrasena}` |
| **Respuesta** | `{token: string, usuario: Usuario}` |

**Flujo Principal:**
1. El usuario ingresa correo y contraseña.
2. El sistema envía `POST /auth/login`.
3. Al éxito, el sistema almacena el token en `flutter_secure_storage (auth_token)`.
4. El sistema verifica `usuario.rol_id` y redirige según el rol.

**Flujos Alternativos:**
- **FA1 (Credenciales inválidas):** El sistema muestra: "Correo o contraseña incorrectos".
- **FA2 (Cuenta no verificada):** El sistema muestra mensaje de verificación pendiente.

**Criterios de Aceptación:**
- [ ] Login exitoso almacena token y datos de usuario.
- [ ] Redirección basada en `rol_id`.

---

**RF-AUTH-003: Token JWT en Peticiones Autenticadas**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |

**Flujo Principal:**
1. Cada petición a endpoints protegidos incluye el header `Authorization: Bearer {token}`.
2. El token se obtiene de `flutter_secure_storage (auth_token)`.
3. Si el token expira o es inválido, el servidor retorna `401 Unauthorized`.
4. El sistema intercepta el `401`, limpia el token de `flutter_secure_storage`, y redirige al login.

**Criterios de Aceptación:**
- [ ] Todas las llamadas autenticadas incluyen `Authorization: Bearer {token}`.
- [ ] El token se lee de `flutter_secure_storage (auth_token)`.
- [ ] `401` provoca cierre de sesión y redirección a login.

---

**RF-AUTH-004: Cierre de Sesión**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |

**Flujo Principal:**
1. El usuario hace clic en "Cerrar Sesión".
2. El sistema elimina `auth_token` de `flutter_secure_storage`.
3. El sistema limpia cualquier estado de usuario en memoria.
4. El sistema redirige a la página principal pública.

**Criterios de Aceptación:**
- [ ] `flutter_secure_storage.delete(key: 'auth_token')` al cerrar sesión.
- [ ] Redirección a página pública.
- [ ] No se requiere llamada API para cerrar sesión (solo limpieza local).

---

**RF-AUTH-005: Recuperación de Contraseña**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Media |
| **Endpoint** | `POST /auth/recuperar-contrasena` |

**Flujo Principal:**
1. El usuario hace clic en "¿Olvidaste tu contraseña?" en el login.
2. El sistema muestra campo para ingresar correo electrónico.
3. El usuario ingresa su correo y envía.
4. El sistema llama a `POST /auth/recuperar-contrasena` con `{correo}`.
5. El sistema muestra: "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña".

---

### 4.2 Subida de Archivos

**Fuente:** Cloudinary (`dw4p8pdcz`, preset `profesionales`), `multimediaApi.subirFotoPerfil`, `profesionalApi.subirDocumento`, `profesionalApi.subirComprobantePago`, `articulosApi.crear`

---

**RF-FILE-001: Subida de Imagen de Perfil**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Infraestructura** | Cloudinary |

**Flujo Principal:**
1. El usuario selecciona una imagen de perfil (jpg, png, webp).
2. El sistema sube la imagen a Cloudinary:
   - Cloud name: `dw4p8pdcz`
   - Upload preset: `profesionales`
3. Cloudinary retorna la URL de la imagen (`secure_url`).
4. El sistema almacena la URL en `foto_url` del usuario o perfil profesional.
5. El sistema puede usar también `multimediaApi.subirFotoPerfil` como alternativa.

**Criterios de Aceptación:**
- [ ] Formatos aceptados: JPG, PNG, WEBP.
- [ ] La imagen se sube a Cloudinary con el preset `profesionales`.
- [ ] La URL retornada se almacena en `foto_url`.

---

**RF-FILE-002: Subida de Documentos de Verificación**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Media |
| **Endpoint** | `POST /profesionales/documentos` |

**Flujo Principal:**
1. El profesional selecciona documentos en el Paso 3 del wizard.
2. Tipos de documentos aceptados: `cedula_frontal`, `cedula_posterior`, `titulo`, `licencia`.
3. El sistema envía cada documento con su tipo al endpoint.
4. Los documentos se almacenan asociados al perfil profesional.

**Criterios de Aceptación:**
- [ ] 4 tipos de documentos soportados.
- [ ] Cada documento se envía individualmente con su `tipo`.
- [ ] Formatos aceptados: imágenes (jpg, png) y PDF.

---

**RF-FILE-003: Subida de Archivos en Artículos**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Media |
| **Endpoint** | `POST /articulos` (multipart FormData) |

**Flujo Principal:**
1. Al crear/editar un artículo, el profesional puede adjuntar:
   - `imagen_portada`: imagen de portada (jpg, png, webp)
   - `archivo_pdf`: documento PDF
2. El sistema envía los archivos como `multipart/form-data` en la misma petición `POST /articulos` o `PUT /articulos/{id}`.
3. Las URLs de los archivos se almacenan en `imagen_url` y `pdf_url`.

**Criterios de Aceptación:**
- [ ] Archivos enviados como `FormData` (multipart).
- [ ] `imagen_portada` solo acepta imágenes.
- [ ] `archivo_pdf` solo acepta PDF.
- [ ] Las URLs se retornan en la respuesta del API.

---

### 4.3 Geolocalización

**Fuente:** `LocationMap` component, `Geolocator`, `lib/services/api.dart`

---

**RF-GEO-001: Selección de Ubicación en Mapa**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Media |
| **Componente** | `LocationMap` |

**Flujo Principal:**
1. El sistema renderiza un mapa interactivo en el Paso 2 del wizard de perfil.
2. El usuario puede hacer clic en cualquier punto del mapa para establecer `latitud` y `longitud`.
3. Un marcador se posiciona en el punto seleccionado.
4. Las coordenadas se reflejan en los campos `lat` y `lng` del formulario.
5. El sistema guarda las coordenadas con `PUT /profesionales/actualizar-perfil` o `POST /profesionales/ubicacion`.

**Flujos Alternativos:**
- **FA1 (Arrastrar marcador):** El usuario puede arrastrar el marcador para ajustar la posición.
- **FA2 (Sin selección):** El usuario puede omitir la ubicación (coordenadas opcionales).

**Criterios de Aceptación:**
- [ ] Mapa interactivo con clic para posicionar marcador.
- [ ] Marcador arrastrable para ajuste fino.
- [ ] `latitud` y `longitud` almacenados como `number`.
- [ ] La ubicación se refleja en búsquedas de "profesionales cercanos" (`GET /profesionales/cercanos`).

---

**RF-GEO-002: Geolocalización Automática**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Baja |
| **API** | `Geolocator.getCurrentPosition()` |

**Flujo Principal:**
1. El usuario toca "Usar mi ubicación actual" en el mapa.
2. El sistema solicita permiso de geolocalización al dispositivo.
3. Si el usuario acepta, `Geolocator.getCurrentPosition()` retorna coordenadas.
4. El sistema posiciona el marcador y autocompleta `latitud`/`longitud`.

**Flujos Alternativos:**
- **FA1 (Permiso denegado):** El sistema muestra: "No se pudo obtener tu ubicación. Selecciona manualmente en el mapa."
- **FA2 (Error de geolocalización):** El sistema muestra mensaje de error y permite selección manual.

**Criterios de Aceptación:**
- [ ] Botón "Usar mi ubicación actual" visible en el mapa.
- [ ] Solicitud de permiso de geolocalización al dispositivo.
- [ ] Fallback a selección manual si la geolocalización falla.

---

### 4.4 Pagos

**Fuente:** `lib/services/api.dart` (PayPhone flow, pagosApi), `lib/screens/professional_form.dart` (Step 5 - Payment), `BankAccount`

---

**RF-PAY-001: Visualización de Planes Disponibles**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Endpoint** | `GET /planes/listar-planes` |

**Flujo Principal:**
1. El sistema carga los planes disponibles desde `GET /planes/listar-planes`.
2. Cada plan incluye: `id`, `nombre`, `precio`, `duracion_dias`, `descripcion`, `activo`.
3. El sistema muestra los planes activos (`activo = true`) al profesional durante el registro o en configuración.

**Criterios de Aceptación:**
- [ ] Solo planes con `activo = true` se muestran.
- [ ] Cada plan muestra nombre, precio, duración y descripción.

---

**RF-PAY-002: Pago por Transferencia Bancaria**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Endpoints** | `GET /bank-accounts`, `POST /profesionales/comprobante-pago` |

**Flujo Principal:**
1. El profesional selecciona "Transferencia Bancaria" como método de pago.
2. El sistema carga las cuentas bancarias activas desde `GET /bank-accounts`.
3. El sistema muestra: `bank_name`, `account_type`, `account_number`, `holder_name`, `holder_identifier`, `email`.
4. El profesional realiza la transferencia y sube el comprobante (`paymentProof`).
5. El sistema envía el comprobante a `POST /profesionales/comprobante-pago`.
6. El sistema actualiza el perfil con `payment_method: "bank"` y `comprobante_pago_url`.
7. El pago queda en estado "pendiente" hasta revisión administrativa.

**Flujos Alternativos:**
- **FA1 (Sin cuentas bancarias):** Si `GET /bank-accounts` retorna lista vacía o sin cuentas activas, el sistema muestra: "No hay cuentas bancarias disponibles en este momento."
- **FA2 (Sin comprobante):** Si no se sube comprobante, el sistema muestra error de validación.

**Criterios de Aceptación:**
- [ ] Cuentas bancarias filtradas por `is_active = true`.
- [ ] Datos bancarios mostrados: nombre del banco, tipo, número, titular, identificación.
- [ ] Comprobante subido como imagen o PDF.
- [ ] `payment_method` se guarda como `"bank"`.

---

**RF-PAY-003: Pago por PayPhone (Pasarela de Pago)**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Endpoints** | PayPhone API (flujo externo) |

**Flujo Principal:**
1. El profesional selecciona "PayPhone" como método de pago.
2. El sistema prepara la transacción:
   - Prepara el payload con `PayPhonePriorityPreparePayload` (datos del perfil, servicios, horario).
   - Crea el checkout con `PayPhonePriorityCheckout`.
   - Guarda un borrador de registro con `PayPhonePriorityRegistrationDraft` que incluye `mode`, `registerData`, `profileData`, `schedule`, `services[]`, `documents[]`.
3. El sistema redirige al usuario a la pasarela de pago de PayPhone.
4. PayPhone procesa el pago y retorna al sistema con el resultado.
5. El sistema recibe `PayPhonePriorityConfirmData`: `{approved: boolean, reviewRequired: boolean, transaction, confirmation}`.
6. Según el resultado:
   - **Aprobado:** `approved = true` — El sistema completa el registro y activa el plan.
   - **En revisión:** `reviewRequired = true` — El sistema registra el pago como pendiente.
   - **Rechazado:** `approved = false, reviewRequired = false` — El sistema muestra mensaje de error y permite reintentar.

**Flujos Alternativos:**
- **FA1 (Cancelado por usuario):** El usuario cierra la pasarela sin completar; el sistema retorna al Paso 5.
- **FA2 (Timeout):** Si la pasarela no responde, el sistema muestra error de conexión.
- **FA3 (Error en pasarela):** Si PayPhone devuelve error, el sistema muestra el mensaje y permite reintentar o cambiar a transferencia.

**Postcondiciones:** `payment_method: "payphone"`, `payphone_flow: true`. Perfil actualizado según resultado.

**Criterios de Aceptación:**
- [ ] PayPhone maneja el flujo completo: prepare → checkout → confirm.
- [ ] `PayPhonePriorityRegistrationDraft` guarda borrador con todos los datos antes del pago.
- [ ] `PayPhonePriorityConfirmData` distingue 3 estados: aprobado, en revisión, rechazado.
- [ ] Si es rechazado, el usuario puede reintentar o cambiar de método.

---

**RF-PAY-004: Confirmación de Pago (Administrador)**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Media |
| **Endpoint** | `PUT /pagos/{id}/confirmar` |

**Flujo Principal:**
1. El administrador revisa los pagos pendientes.
2. Para transferencias bancarias, el administrador verifica el comprobante.
3. El administrador confirma o rechaza el pago mediante `PUT /pagos/{id}/confirmar`.
4. El sistema actualiza el estado del pago y notifica al profesional.

**Criterios de Aceptación:**
- [ ] Solo administradores pueden confirmar/rechazar pagos.
- [ ] El estado del pago se actualiza en la entidad `Pago`.
- [ ] El plan del profesional se activa al confirmar el pago.

---

**RF-PAY-005: Historial de Pagos**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Baja |
| **Endpoint** | `GET /pagos` |

**Flujo Principal:**
1. El profesional puede ver su historial de pagos.
2. El sistema llama a `GET /pagos` (filtrado por `usuario_id` del token).
3. Cada pago muestra: `id`, `plan_id`, `monto`, `metodo`, `referencia`, `estado`, `created_at`.

**Criterios de Aceptación:**
- [ ] Pagos filtrados por usuario autenticado.
- [ ] Cada pago muestra método, monto, estado y fecha.

---

### 4.5 Diseño Adaptativo (Phone vs Tablet)

**Fuente:** `ProfessionalNavigationRail` (tablet), `ProfessionalBottomNav` (teléfono), `lib/config/professional_nav.dart`

---

**RF-RESP-001: NavigationRail en Tablet**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Componente** | `ProfessionalNavigationRail` |

**Flujo Principal:**
1. En tablet (≥600dp), el sistema muestra el `ProfessionalNavigationRail`.
2. El NavigationRail contiene 7 items de navegación (`PROFESSIONAL_NAV_ITEMS`), cada uno con ícono Material Icons y etiqueta.
3. El NavigationRail es colapsable con animación: al colapsar muestra solo íconos; al expandir muestra íconos + etiquetas.
4. El item activo se resalta usando `GoRouter.of(context).location` para comparar la ruta actual.

**Items de navegación:**
| # | Etiqueta | Ruta | Ícono |
|---|----------|------|-------|
| 1 | Dashboard | `/professional-dashboard` | `Icons.dashboard` |
| 2 | Citas | `/professional-dashboard/appointments` | `Icons.calendar_today` |
| 3 | Artículos | `/professional-dashboard/articles` | `Icons.article` |
| 4 | Servicios | `/professional-dashboard/services` | `Icons.work` |
| 5 | Horario | `/professional-dashboard/schedule` | `Icons.schedule` |
| 6 | Redes Soc. | `/professional-dashboard/social-media` | `Icons.share` |
| 7 | Config. | `/professional-dashboard/settings` | `Icons.settings` |

**Criterios de Aceptación:**
- [ ] NavigationRail visible en tablet (≥600dp).
- [ ] Colapsable/expandible con animación.
- [ ] Item activo resaltado basado en `GoRouter.of(context).location`.
- [ ] 7 items con íconos Material Icons correspondientes.

---

**RF-RESP-002: Navegación en Teléfono (BottomNavigationBar)**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Alta |
| **Componente** | `ProfessionalBottomNav` |

**Flujo Principal:**
1. En teléfono (<600dp), el sistema oculta el NavigationRail y muestra un `ProfessionalBottomNav` (BottomNavigationBar) con los mismos 7 items de navegación.
2. Al tocar un item, el sistema navega a la pantalla correspondiente.
3. El item activo se resalta visualmente con el color primario.

**Criterios de Aceptación:**
- [ ] BottomNavigationBar visible en teléfono (<600dp).
- [ ] Mismos 7 items que el NavigationRail de tablet.
- [ ] Cambio de pantalla al seleccionar un item.
- [ ] Barra de navegación accesible y visible.

---

**RF-RESP-003: Grilla de Horario Adaptativa**

| Atributo | Valor |
|----------|-------|
| **Prioridad** | Media |
| **Componente** | `ScheduleGrid` |

**Flujo Principal:**
1. La grilla de 7×24 se adapta a diferentes tamaños de pantalla.
2. En tablet: todas las columnas y filas visibles.
3. En teléfono: scroll horizontal para ver todos los días, etiquetas de hora simplificadas.

**Criterios de Aceptación:**
- [ ] Grilla con scroll horizontal en teléfono.
- [ ] Celdas con tamaño táctil adecuado (mín. 48×48dp en teléfono).
- [ ] Etiquetas de días y horas legibles en todos los tamaños.

---

## 5. Resumen de Requerimientos Funcionales

| ID | Módulo | Descripción | Prioridad |
|----|--------|-------------|-----------|
| RF-PERF-001 | Perfil Profesional | Registro de datos personales (Paso 0) | Alta |
| RF-PERF-002 | Perfil Profesional | Configuración de información profesional (Paso 1) | Alta |
| RF-PERF-003 | Perfil Profesional | Configuración de ubicación geográfica (Paso 2) | Alta |
| RF-PERF-004 | Perfil Profesional | Subida de documentos de verificación (Paso 3) | Media |
| RF-PERF-005 | Perfil Profesional | Configuración de preferencias y visibilidad (Paso 4) | Media |
| RF-PERF-006 | Perfil Profesional | Pago de plan prioritario (Paso 5) | Alta |
| RF-SERV-001 | Servicios | Listar servicios del profesional | Alta |
| RF-SERV-002 | Servicios | Crear servicio | Alta |
| RF-SERV-003 | Servicios | Editar servicio | Media |
| RF-SERV-004 | Servicios | Eliminar servicio | Media |
| RF-ART-001 | Artículos | Listar artículos del profesional | Alta |
| RF-ART-002 | Artículos | Crear artículo | Alta |
| RF-ART-003 | Artículos | Editar artículo | Alta |
| RF-ART-004 | Artículos | Eliminar artículo | Media |
| RF-ART-005 | Artículos | Archivar artículo | Baja |
| RF-CIT-001 | Citas | Agendar cita (cliente público) | Alta |
| RF-CIT-002 | Citas | Listar citas del profesional | Alta |
| RF-CIT-003 | Citas | Cambiar estado de cita | Alta |
| RF-CIT-004 | Citas | Reagendar cita | Media |
| RF-HOR-001 | Horarios | Visualizar horario en grilla | Alta |
| RF-HOR-002 | Horarios | Editar disponibilidad en grilla | Alta |
| RF-HOR-003 | Horarios | Sincronización con agendamiento público | Alta |
| RF-RED-001 | Redes Sociales | Gestionar enlaces de redes sociales | Media |
| RF-CONF-001 | Configuración | Cambiar contraseña | Alta |
| RF-CONF-002 | Configuración | Actualizar datos de usuario | Media |
| RF-CONF-003 | Configuración | Eliminar cuenta | Baja |
| RF-CONF-004 | Configuración | Configurar preferencias y visibilidad | Media |
| RF-AUTH-001 | Auth | Registro de usuario | Alta |
| RF-AUTH-002 | Auth | Inicio de sesión | Alta |
| RF-AUTH-003 | Auth | Token JWT en peticiones autenticadas | Alta |
| RF-AUTH-004 | Auth | Cierre de sesión | Alta |
| RF-AUTH-005 | Auth | Recuperación de contraseña | Media |
| RF-FILE-001 | Archivos | Subida de imagen de perfil | Alta |
| RF-FILE-002 | Archivos | Subida de documentos de verificación | Media |
| RF-FILE-003 | Archivos | Subida de archivos en artículos | Media |
| RF-GEO-001 | Geolocalización | Selección de ubicación en mapa | Media |
| RF-GEO-002 | Geolocalización | Geolocalización automática | Baja |
| RF-PAY-001 | Pagos | Visualización de planes disponibles | Alta |
| RF-PAY-002 | Pagos | Pago por transferencia bancaria | Alta |
| RF-PAY-003 | Pagos | Pago por PayPhone (pasarela) | Alta |
| RF-PAY-004 | Pagos | Confirmación de pago (admin) | Media |
| RF-PAY-005 | Pagos | Historial de pagos | Baja |
| RF-RESP-001 | Adaptativo | NavigationRail en tablet | Alta |
| RF-RESP-002 | Adaptativo | Navegación en teléfono (BottomNavigationBar) | Alta |
| RF-RESP-003 | Adaptativo | Grilla de horario adaptativa | Media |

**Total: 45 requerimientos funcionales**

---

## 6. Glosario de Términos

| Término | Definición |
|---------|------------|
| **Profesional** | Usuario registrado con `rol_id = 2`. Persona que ofrece servicios profesionales en la plataforma (abogado, médico, ingeniero, etc.). |
| **Cliente** | Usuario registrado (cualquier `rol_id`) o usuario público que agenda citas con profesionales. |
| **Dashboard** | Panel de control del profesional con 7 módulos accesibles desde el NavigationRail o BottomNavigationBar. |
| **PerfilProfesional** | Entidad que contiene toda la información pública y configuraciones del profesional (28 campos). |
| **Wizard** | Formulario multi-paso (`ProfessionalForm`) de 5-6 pasos para crear/editar el perfil profesional. |
| **Matriz de Horario** | Array de 168 valores booleanos (`boolean[]`) que representa la disponibilidad semanal: 7 días × 24 horas. Índice = `día × 24 + hora`. |
| **ScheduleGrid** | Componente de grilla interactiva para visualizar y editar la matriz de horario. |
| **Slug** | Identificador único URL-friendly del perfil profesional, usado en rutas públicas (`/profesionales/publico/{slug}`). |
| **Modalidad de Trabajo** | Enum con 3 valores: `"Presencial"`, `"Virtual"`, `"Ambas modalidades"`. Define cómo el profesional atiende a sus clientes. |
| **Cloudinary** | Servicio externo de almacenamiento y entrega de imágenes. Configuración: cloud `dw4p8pdcz`, preset `profesionales`. |
| **JWT (JSON Web Token)** | Token de autenticación almacenado en `flutter_secure_storage (auth_token)` y enviado en el header `Authorization: Bearer {token}`. |
| **PayPhone** | Pasarela de pago externa utilizada para procesar pagos del plan prioritario. |
| **Plan Prioritario** | Plan de suscripción que requiere pago. Incluye paso adicional (Paso 5) en el wizard de registro. |
| **BankAccount** | Entidad que representa una cuenta bancaria para transferencias. Contiene: `bank_name`, `account_type`, `account_number`, `holder_identifier`, `holder_name`. |
| **Comprobante de Pago** | Archivo (imagen o PDF) que el profesional sube como evidencia de transferencia bancaria. |
| **Reagendar** | Acción de cambiar la fecha y hora de una cita existente. Controlado por el flag `permitir_reagendar` en el perfil. |
| **Catálogos** | Entidades de búsqueda (lookup): Profesión, Especialidad (filtrable por `profesion_id`), Provincia, Ciudad (filtrable por `provincia_id`). |
| **Artículo** | Contenido editorial (blog post) creado por el profesional. Tiene estados: `"borrador"`, `"publicado"`, `"archivado"`. |
| **Moderación** | Proceso administrativo de revisión de artículos antes de su publicación (`PUT /articulos/{id}/moderar`). |
| **ProfessionalNavigationRail** | Widget de navegación lateral para tablet (≥600dp). Colapsable con animación. |
| **ProfessionalBottomNav** | Widget de navegación inferior para teléfono (<600dp). BottomNavigationBar. |
| **GoRouter.of(context).location** | Método de GoRouter usado para detectar la ruta activa y resaltar el item de navegación correspondiente (`GoRouter.of(context).location`). |
| **FormData** | Formato `multipart/form-data` usado para enviar archivos (imágenes, PDFs) junto con datos de texto en artículos. |
| **PayPhonePriorityRegistrationDraft** | Borrador que almacena temporalmente todos los datos de registro (perfil, servicios, horario, documentos) antes de completar el pago por PayPhone. |
| **RFC** | Requerimiento Funcional. Identificador único con formato `RF-MODULO-NNN`. |
| **RN** | Regla de Negocio. Identificador único con formato `RN-MODULO-NNN`. |
| **HU** | Historia de Usuario. Identificador único con formato `HU-MODULO-NN`. |

---

## Historial de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-05-26 | SDD Design Agent | Versión inicial — documento completo de requerimientos funcionales basado en exploración de código fuente (`sdd/explore/dashboard-data-models-erd`) |

---

**Documento generado a partir de la exploración de código fuente del frontend Profesionales EC (Flutter).**  
**Trazabilidad:** Cada requerimiento funcional referencia el componente, archivo y/o endpoint API del cual deriva.  
**Fuente de datos:** `lib/services/api.dart`, `lib/screens/professional_form.dart`, `lib/screens/services_manager.dart`, `lib/screens/article_form_screen.dart`, `lib/screens/booking_form.dart`, `lib/screens/booking_bottom_sheet.dart`, `lib/screens/reschedule_bottom_sheet.dart`, `lib/screens/schedule_manager.dart`, `lib/screens/schedule_grid.dart`, `lib/screens/social_media_manager.dart`, `lib/config/professional_nav.dart`, `lib/utils/validators.dart`.
