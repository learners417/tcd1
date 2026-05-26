<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Sanar OS

App del Método CLÍNICA para sanadores. React + Vite (cliente) + Vercel Serverless Functions (backend).

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set env vars in `.env.local` (ver sección siguiente).
3. Run the app:
   `npm run dev`

## Environment variables

Configurar en `.env.local` (dev) y en **Vercel Dashboard → Settings → Environment Variables** (prod).

### Texto / IA (backend)
| Var | Requerida | Para qué |
|---|---|---|
| `ANTHROPIC_API_KEY` | Sí | Claude · proveedor primario de texto (Coach, agentes, herramientas). |
| `DEEPSEEK_API_KEY` | Recomendada | DeepSeek · fallback transparente si Claude falla por crédito agotado, rate limit, server error o timeout. ~10x más barato que Sonnet 4.6. |
| `DEEPSEEK_MODEL` | Opcional | Override del modelo DeepSeek. Default: `deepseek-chat` (la versión estable más reciente de DeepSeek). |
| `DEEPSEEK_MAX_TOKENS` | Opcional | Override del max_tokens enviado a DeepSeek. Default: 8192. |

### Imágenes (independiente del fallback de texto)
| Var | Requerida | Para qué |
|---|---|---|
| `VITE_GEMINI_API_KEY` | Sí (cliente) | Gemini · usado para generación de imágenes en campañas. La describe-image (visión) usa Claude. |

### Supabase / DB
| Var | Requerida | Para qué |
|---|---|---|
| `VITE_SUPABASE_URL` | Sí | URL del proyecto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Sí | Anon key del proyecto. |

### PayPal (créditos)
Ver `src/lib/credits.ts` y `api/_lib/paypal.ts`.

## Arquitectura del fallback de IA

```
Frontend (aiProvider.ts)
        │
        ▼
   /api/ai/generate  ──►  Claude (Anthropic)  ──►  OK
                              │
                              ▼ (credit/rate/timeout)
                          DeepSeek  ──►  OK ó error final
   /api/ai/stream     ──►  (misma cadena, devuelve SSE)
```

El fallback es **transparente** para el frontend. La respuesta JSON incluye `provider: 'claude' | 'deepseek'` para debugging.

## Migraciones SQL

Correr una sola vez en Supabase SQL editor:
- `pais-migration.sql` — agrega columna `pais` a `profiles` (selector de país por sanador).
- `v2-migration.sql`, `videos-migration.sql`, `media-migration.sql`, `pilar-id-migration.sql` — migraciones históricas del esquema v2.
