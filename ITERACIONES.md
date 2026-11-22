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
    - **Cambios Aplicados (Programático):** Eliminación de `fbq('track','InitiateCheckout');` de la línea del CTA en `E:\Dev\landings\site\instala-tu-clinica.html` (pendiente de push/deploy).
    - **Objetivo:** Reducir ruido en Meta Pixel y estandarizar el valor de las conversiones de agenda. 

---

## 5. Próximos Pasos y Plan de Acción (Noviembre 2026)

### Diagnóstico GoHighLevel (GHL)

1.  **Refinamiento de Pipelines:**
    *   Revisar la configuración del pipeline `VSL DIRECTO` para asegurar que las oportunidades avancen más allá de la etapa `🗓 Nueva Agenda (Ads)`. Es posible que el problema no sea de tracking sino de automatización en GHL que no mueve el lead al siguiente paso después de la agenda.
    *   Revisar el pipeline `INSTAGRAM` para resolver el estancamiento en `Mensaje Bienvenida Nuevo seguidor`. Esto podría implicar una revisión del flujo de chatbot o de las reglas de asignación de etapas.
2.  **Validación de Atribución:**
    *   Confirmar que `source`, `utm_source`, `utm_campaign` y `utm_content` se están capturando y asociando correctamente a las oportunidades y contactos en GHL.
3.  **Monitoreo de `llamada_agendada`:**
    *   Asegurar que el tag `llamada_agendada` se aplique consistentemente a todas las oportunidades que efectivamente agendan una llamada. Este tag es crucial para el seguimiento de conversiones.

### Diagnóstico Meta Ads

1.  **Corrección de Eventos:**
    *   Asegurar que el evento `InitiateCheckout` *no* se dispare en CTAs que no son de compra. Esto se corrigió manualmente en `instala-tu-clinica.html`.
    *   Eliminar el `value` y `currency` de los eventos `AgendaWeb`, `Contact` y `WhatsAppEnviado` en `instala-tu-clinica.html` para evitar la alerta de divisa en Meta Events Manager. Esto se corrigió manualmente.
    *   Validar en Meta Events Manager que los eventos `Schedule` (`schedule_website`) se estén disparando correctamente y que su número sea coherente con la actividad en el sitio, sin alertas de divisa.
2.  **Análisis de Frecuencia y CPMs:**
    *   Continuar monitoreando la frecuencia de anuncios y los CPMs para identificar posibles fatigas de audiencia o aumentos de costos.

### Diagnóstico Microsoft Clarity

1.  **Mejora del Scroll Promedio:**
    *   Investigar el bajo scroll promedio (30.02%) en `instala-tu-clinica.html`. Esto podría indicar que el contenido inicial no es lo suficientemente atractivo o que el VSL no está funcionando como se espera. Considerar:
        *   Reubicar elementos importantes "above the fold".
        *   Mejorar la intro del VSL.
        *   Añadir elementos interactivos o llamados a la acción tempranos.
2.  **Reducción de Clics Fallidos:**
    *   Analizar los clics fallidos (6.08%) para identificar elementos en la landing page que parecen clicables pero no lo son. Esto puede generar frustración en el usuario. Realizar pruebas de usabilidad y ajustar el diseño.

### Acciones de Integración

1.  **Sincronización de Eventos GHL a Meta (API de Conversiones):**
    *   Investigar la implementación de la API de Conversiones de Meta a través de GHL para enviar eventos `Schedule` y `Contact` directamente desde el servidor. Esto mejoraría la fiabilidad del tracking y reduciría la dependencia del Pixel de Facebook en el navegador.

---