// api/migrar-cliente.ts — v3 con auto-diagnóstico de llaves
import { createClient } from '@supabase/supabase-js'

function refDeLlave(key: string): string {
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString())
    return payload.ref || '(sin ref)'
  } catch {
    return '(ilegible)'
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!URL) return res.status(500).json({ error: 'Config: falta VITE_SUPABASE_URL en Vercel' })
  if (!SERVICE) return res.status(500).json({ error: 'Config: falta SUPABASE_SERVICE_ROLE_KEY en Vercel' })

  // ── AUTO-DIAGNÓSTICO: ¿la llave es de la misma casa que la URL? ──
  const refUrl = (URL.match(/https:\/\/([a-z0-9]+)\.supabase\.co/) || [])[1] || '?'
  const refKey = refDeLlave(SERVICE.trim())
  if (refKey !== '(ilegible)' && refKey !== refUrl) {
    return res.status(500).json({
      error: `LLAVE CRUZADA: la service key pegada en Vercel es del proyecto "${refKey}" pero la app usa "${refUrl}". Copiala de nuevo desde Supabase parado en el branch MAIN (la página debe decir ${refUrl}) y hacé REDEPLOY.`,
    })
  }

  const admin = createClient(URL, SERVICE.trim(), {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Sin sesión (no llegó el token)' })

  const { data: who, error: whoErr } = await admin.auth.getUser(token)
  if (whoErr || !who?.user) {
    return res.status(401).json({
      error: `Sesión inválida (${whoErr?.message}). Llave del proyecto "${refKey}", app en "${refUrl}". Si coinciden y falla, hacé REDEPLOY (las variables solo aplican en deploys nuevos).`,
    })
  }

  const { data: perfil } = await admin.from('profiles').select('rol').eq('id', who.user.id).single()
  if (perfil?.rol !== 'admin') return res.status(403).json({ error: 'Solo admins pueden migrar clientes' })

  const { email, nombre, password } = req.body || {}
  if (!email) return res.status(400).json({ error: 'Falta email' })
  const pass = password || `TCD-${Math.random().toString(36).slice(2, 10)}!`

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: pass,
    email_confirm: true,
    user_metadata: { nombre },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      const { data: list } = await admin.auth.admin.listUsers()
      const existente = list?.users.find(u => u.email === email)
      if (existente) return res.json({ user_id: existente.id, password: '(ya existía)', existia: true })
    }
    return res.status(400).json({ error: error.message })
  }

  return res.json({ user_id: data.user.id, password: pass })
}
