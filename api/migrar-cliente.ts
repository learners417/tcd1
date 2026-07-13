// api/migrar-cliente.ts  ← va en la carpeta api/ de la RAÍZ del repo (junto a tus otras functions)
// Crea la credencial del cliente SIN enviar emails (adiós rate limit).
// Protegida: solo la puede usar un admin logueado en la app.

import { createClient } from '@supabase/supabase-js'

const URL = process.env.VITE_SUPABASE_URL!            // la misma URL que ya usa tu app
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY! // la que ya cargaste en Vercel

const admin = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  // ── Seguridad: solo un admin logueado puede crear clientes ──
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Sin sesión' })
  const { data: who } = await admin.auth.getUser(token)
  if (!who?.user) return res.status(401).json({ error: 'Sesión inválida' })
  const { data: perfil } = await admin.from('profiles').select('rol').eq('id', who.user.id).single()
  if (perfil?.rol !== 'admin') return res.status(403).json({ error: 'Solo admins' })

  // ── Crear la credencial, confirmada, sin email ──
  const { email, nombre, password } = req.body || {}
  if (!email) return res.status(400).json({ error: 'Falta email' })
  const pass = password || `TCD-${Math.random().toString(36).slice(2, 10)}!`

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: pass,
    email_confirm: true, // ← confirmado SIN enviar correo
    user_metadata: { nombre },
  })

  if (error) {
    // Si ya existía (reintento), devolvemos su id igual y seguimos
    if (error.message.toLowerCase().includes('already')) {
      const { data: list } = await admin.auth.admin.listUsers()
      const existente = list?.users.find(u => u.email === email)
      if (existente) return res.json({ user_id: existente.id, password: '(ya existía)', existia: true })
    }
    return res.status(400).json({ error: error.message })
  }

  return res.json({ user_id: data.user.id, password: pass })
}
