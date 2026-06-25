# 📘 Guía del Panel de Administración

**Sitio:** valentinacenteno.com.ec
**Panel admin:** valentinacenteno.com.ec/admin

---

## 1. Cómo entrar

1. Andá a `valentinacenteno.com.ec/admin`
2. Ingresá la contraseña que se te entregó
3. Vas a ver el panel con varias pestañas en la parte superior

> ⚠️ **No compartas la contraseña por canales abiertos.** Si necesitás darle acceso a alguien más del equipo, pedila por canal privado.

---

## 2. Pestañas del panel

### 📬 BUZÓN
Aquí se ven todos los mensajes que los ciudadanos envían desde el formulario público del sitio.

**Qué podés hacer:**
- **Ver el mensaje completo** con nombre, cantón, correo, WhatsApp, asunto y archivo adjunto si lo subieron.
- **Cambiar el estado** del caso:
  - `Nuevo` — apenas llegó, sin abrir
  - `En revisión` — alguien del equipo ya lo vio
  - `En seguimiento` — se contactó al ciudadano
  - `Resuelto` — caso cerrado
  - `Descartado` — no requiere acción
- **Asignar un responsable** (nombre de la persona del equipo que se encarga)
- **Agregar notas de seguimiento** privadas (no las ve el ciudadano)
- **Exportar a CSV** todos los mensajes filtrados, para reportes mensuales.

**KPIs visibles arriba:** total de mensajes, abiertos hoy, en seguimiento, resueltos.

---

### 🎓 BECAS IA (inscripciones del concurso)
Aquí se ve toda persona que se inscribió en el formulario `/becas`.

**Qué podés hacer:**
- **Filtrar** por colegio, ciudad, fecha, género, edad
- **Buscar** por nombre o cédula
- **Ver detalles** completos de la inscripción y descargar la autorización del representante (PDF/imagen)
- **Exportar a CSV** para enviarlo al evaluador del jurado o a quien organice el concurso
- **KPIs visibles:** total inscritos, inscritos hoy, distribución por colegio, edad promedio

> 💡 **Tip:** El sistema valida automáticamente las cédulas ecuatorianas. Si alguien intenta inscribirse con una cédula falsa, el formulario la rechaza. También evita duplicados — si la misma cédula intenta inscribirse 2 veces, le avisa.

---

### 📝 CONTENIDO
Acá podés editar **el contenido visible del sitio** sin tener que tocar código.

Sub-pestañas:

#### Hero (slider del inicio)
- Cambiar las imágenes del carousel principal
- Agregar nuevos slides
- Cambiar el link al que va cada slide (cuando se clickea)

#### Acerca de mí (AboutBio)
- Cambiar la frase principal
- Cambiar el video (link directo o URL)
- Editar los párrafos

#### Iniciativas Legislativas
- Galería de imágenes
- Video destacado
- Texto principal

#### Logros Manabí
- Tarjetas con título, imagen e icono
- Se reordenan automáticamente

#### Agenda Internacional
- Tag, título, subtítulo, descripción
- Bullets (lista de puntos)
- Quote (cita destacada)
- Imagen

#### Becas IA (página /becas)
- Banner del concurso
- Título y subtítulo
- Texto introductorio
- Reglas/bases (acepta numeración 1) 2) 3) y bullets •)
- Fechas clave

#### Noticias / Corcho
- Agregar / editar / eliminar tarjetas
- Cada tarjeta: imagen, título, fecha, link opcional
- Si la tarjeta tiene link → al hacer click, va directo
- Si NO tiene link → abre un modal con más info

---

## 3. Cómo subir imágenes

Las imágenes se suben a **Supabase Storage**. Cuando editás cualquier sección con imagen:

1. Click en "Subir imagen" o "Cambiar imagen"
2. Seleccioná el archivo desde tu computadora
3. La URL queda guardada automáticamente

**Formatos aceptados:** JPG, PNG, WEBP
**Tamaño recomendado:** menos de 1 MB por imagen (para que cargue rápido)

> ⚠️ **NUNCA pegues URLs de Google Drive, Imgur, ni hosting externos** — usá siempre el botón de subir imagen del panel. Si pegás una URL externa, puede dejar de funcionar de un día para otro.

---

## 4. Casos comunes

### "Quiero cambiar la foto principal del slider"
1. Pestaña `Contenido` → sub-pestaña `Hero`
2. Click en el slide que querés cambiar
3. Botón `Cambiar imagen` → seleccionar archivo
4. Guardar

Cambia en producción en menos de 1 minuto.

### "Tengo un mensaje urgente del buzón y quiero responderlo"
1. Pestaña `Buzón`
2. Filtrá por estado `Nuevo`
3. Abrí el mensaje, copiá el WhatsApp o correo
4. Respondé por fuera del sistema (WhatsApp, llamada, email)
5. Volvé al panel, asignate como responsable, cambiá estado a `En seguimiento`, dejá nota
6. Cuando esté resuelto → estado `Resuelto`

### "Necesito el listado de todos los inscritos al concurso para una reunión"
1. Pestaña `Becas IA`
2. Filtros que necesites (ej: solo de Manabí, solo de un colegio específico)
3. Click en `Exportar CSV`
4. Te baja un Excel listo para mandar al jurado

### "Cambié algo pero no se ve en el sitio público"
- Esperá 1-2 minutos (los cambios se cachean)
- Refrescá la página con **Ctrl+Shift+R** (Windows) o **Cmd+Shift+R** (Mac)
- Si sigue sin verse, contactá a Pancho (devprezec@gmail.com)

---

## 5. Buenas prácticas

- ✅ **Hacé un cambio a la vez** y verificá que se vea bien antes del siguiente
- ✅ **Probá en mobile** después de editar (la mayoría de visitas son desde celular)
- ✅ **No borres mensajes del buzón** — siempre marcalos como `Descartado` en vez de eliminar. Mantiene auditoría.
- ❌ **No compartas la URL del admin** (`/admin`) ni la contraseña por redes sociales o canales abiertos
- ❌ **No subas imágenes con derechos de autor** que no tengas autorización para usar

---

## 6. Contacto técnico

Para cualquier problema, error, o pedido de mejora:

- **Email:** devprezec@gmail.com
- **Asunto:** "Soporte sitio Valentina Centeno — [descripción breve]"

---

**Última actualización:** Junio 2026
**Versión del sitio:** Producción (post-Fase 1)
