# Bitácora de Iteraciones de Tu Clínica Digital

Este documento registra la evolución del sistema de captación, cualificación y agendas de Tu Clínica Digital.

---

## 1. KPIs Clave por Etapa del Funnel

Definición de las métricas clave para rastrear el rendimiento en cada etapa del embudo:

### Meta Ads
- **CPM (Costo por mil impresiones):** Cuánto cuesta que te vean (Gasto ÷ Impresiones × 1000).
- **Frecuencia:** Cuántas veces vio cada uno el mismo anuncio (Impresiones ÷ Alcance).
  - *Regla de Alerta:* Frecuencia > 3 en una semana = audiencia agotada.
- **CTR (Click-Through Rate):** Porcentaje de clics en el enlace (Clics en Enlace ÷ Impresiones × 100).
- **CPC (Costo por Clic):** Cuánto cuesta cada clic en el enlace (Gasto ÷ Clics en Enlace).
- **Clics en Enlace:** Tráfico saliente de Meta.
- **Landing Page View:** Páginas de aterrizaje vistas.
- **VSL25, VSL50, VSL75, VSL95:** Porcentaje de reproducción del Video Sales Letter.
- **AgendaWeb:** Evento personalizado de Meta, disparado desde la landing al agendar.
- **Contact:** Evento estándar de Meta, disparado al completar el flujo de WhatsApp.
- **Schedule:** Evento estándar/server-side de Meta, disparado desde GHL.

### Microsoft Clarity
- **Scroll promedio:** Engagement general con la página.
- **Clics fallidos:** Indicador de frustración del usuario.
- **VSL25, VSL50, VSL75, VSL95:** Engagement con el video.
- **CalendarioVisto:** Usuario vio el calendario.
- **CalendarioTocado:** Usuario interactuó con el calendario.
- **AgendaWeb:** Evento custom, agenda completada desde el calendario en la landing.
- **WhatsAppAbierto:** Usuario abrió el modal de WhatsApp.
- **WhatsAppEnviado:** Usuario completó el flujo y envió el mensaje de WhatsApp.
- **WhatsAppNoCalifica:** Usuario fue filtrado por el flujo de WhatsApp.
- **CTA (por ubicación):** Clics en los diferentes Call-to-Action de la página.

### GoHighLevel
- **Oportunidades por Pipeline y Etapa:** Conteo de leads en cada paso del funnel en GHL.
- **Tasa de Avance entre Etapas:** Porcentaje de oportunidades que pasan de una etapa a la siguiente.
- **Oportunidades con Email/Teléfono:** Calidad de los datos de contacto.
- **Oportunidades con Tag 'llamada_agendada':** Leads que efectivamente agendaron.
- **Top Sources/Campaigns/Tags:** Atribución de los leads en GHL.

---

## 2. Reglas de Testeo y Optimización

Estas reglas guiarán la experimentación para asegurar resultados fiables:

- **Enfoque de Campaña en Meta:** Un solo conjunto de anuncios con múltiples piezas adentro. El algoritmo de Meta optimiza sobre el total.
- **Segmentación de Audiencia:** Público amplio: país, edad y sexo. Nada más (con presupuesto reducido).
- **Duración del Testeo:** No tocar campañas por al menos catorce días para permitir que el algoritmo aprenda.
- **A/B Testing:** Testear un solo elemento a la vez (creativo, copy, ángulo, oferta, filtro).
- **Diagnóstico Priorizado:** El diagnóstico va de arriba hacia abajo (Meta -> Landing -> GHL) y se detiene en el primer cuello de botella que falla.

---

## 3. Diagnóstico Actual (Noviembre 2026)

### GoHighLevel
- **Total Oportunidades Deduplicadas:** 100
- **Pipelines con Estancamiento Crítico:**
    - `VSL DIRECTO` (53 oportunidades): Todas en `🗓 Nueva Agenda (Ads)`, 0 en etapas siguientes.
    - `INSTAGRAM` (42 oportunidades): Todas en `Mensaje Bienvenida Nuevo seguidor`, 0 en etapas siguientes.
- `Meta · Instalación` (5 oportunidades): Muestra algún movimiento en etapas ("Agendó", "Vino a la llamada", "Compró").
- **Atribución en GHL:** Se capturan `source`/`utm_source`, `utm_campaign`, `utm_content` y `tags` como `llamada_agendada`.
- **Rango de Datos:** 2025-12-08 a 2026-11-07 (333 días).

### Meta Events Manager (`1306012398373458` / `858332333990895`)
- **Eventos `Schedule`:** Alerta de divisa y valor en 100% de eventos `Schedule` (del sitio web, Píxel y API de Conversiones).
    - `TCD · Instalación` (30D): 4 `schedule_website`.
    - `TCD · Definitiva · Agenda · nov` (30D): 1 `schedule_website`.
- **Eventos `Contact`:** `TCD · Instalación` (30D): 12 `contact_website`. `TCD · Definitiva · Agenda · nov` (30D): 2 `contact_website`.
- **Eventos `InitiateCheckout`:** Se disparan en CTAs que no son de compra directa.
- **Frecuencia y CPMs:** Generalmente saludables (frecuencia < 2.5), CPMs/CPCs variados pero aceptables.

### Microsoft Clarity
- **Sesiones:** 296 sesiones (últimos 7 días).
- **Scroll Promedio:** 30.02% (bajo, indica baja interacción o contenido que no engancha).
- **Clics Fallidos:** 6.08% (alto, sugiere elementos no clicables que parecen serlo, o confusión).

---

## 4. Bitácora de Iteraciones

- **Noviembre 2026 - Diagnóstico Inicial:**
    - **Hallazgos GHL:** Fuga masiva en etapas iniciales de VSL DIRECTO e INSTAGRAM.
    - **Hallazgos Meta:** Discrepancia entre eventos `Schedule` registrados y avance en GHL. Alerta de divisa/valor. `InitiateCheckout` usado incorrectamente.
    - **Hallazgos Landing:** Excelente instrumentación de tracking, paso de UTMs a GHL.
    - **Problema Principal:** Desconexión entre la captura de "agendas" en frontend/Meta y el avance de oportunidades en GHL.

- **Noviembre 2026 - Ajuste de Tracking (Landing Page):**
    - **Cambios Aplicados (Manuales):** Eliminación de `InitiateCheckout` en CTAs de agenda. Adición de `{value: 0, currency: 'USD'}` a los eventos `AgendaWeb`, `Contact` y `WhatsAppEnviado` en `instala-tu-clinica.html`.
    - **Objetivo:** Reducir ruido en Meta Pixel y estandarizar el valor de las conversiones de agenda. 

---
