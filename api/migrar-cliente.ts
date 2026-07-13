// api/migrar-cliente.ts — v2 con diagnóstico claro
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  // ── Chequeo de variables de entorno (te dice cuál falta) ──
  const URL =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ''
  const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!URL) return res.status(500).json({ error: 'Config: falta VITE_SUPABASE_URL en Vercel' })
  if (!SERVICE) return res.status(500).json({ error: 'Config: falta SUPABASE_SERVICE_ROLE_KEY en Vercel' })

  const admin = createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // ── Seguridad: solo un admin logueado ──
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'Sin sesión (no llegó el token)' })

  const { data: who, error: whoErr } = await admin.auth.getUser(token)
  if (whoErr || !who?.user) {
    return res.status(401).json({
      error: `Sesión inválida: ${whoErr?.message || 'token no reconocido'} — revisá que la service key en Vercel sea del MISMO proyecto que ${URL}`,
    })
  }

  const { data: perfil } = await admin.from('profiles').select('rol').eq('id', who.user.id).single()
  if (perfil?.rol !== 'admin') return res.status(403).json({ error: 'Solo admins pueden migrar clientes' })

  // ── Crear la credencial, confirmada, sin emails ──
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
