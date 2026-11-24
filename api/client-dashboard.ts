import { createClient } from '@supabase/supabase-js';
import { fetchProfileV2 } from '../src/lib/supabase';
import { getClientDashboardData, getPartialDiagnosis } from '../src/lib/client-dashboard';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED: Bearer token required.' });
  }

  const token = authHeader.split(' ')[1];

  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return res.status(500).json({ error: 'Internal Server Error: Supabase configuration missing.' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: userData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !userData?.user) {
    console.error('Supabase authentication error:', authError?.message);
    return res.status(401).json({ error: 'UNAUTHORIZED: Invalid or expired token.' });
  }

  const authenticatedUserId = userData.user.id;

  const requestedUserId = req.query.userId;
  if (requestedUserId && requestedUserId !== authenticatedUserId) {
    return res.status(403).json({ error: 'FORBIDDEN: You can only access your own dashboard.' });
  }

  const userIdToFetch = requestedUserId || authenticatedUserId;

  try {
    const profile = await fetchProfileV2(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const dashboardData = getClientDashboardData(profile);
    const partialDiagnosis = getPartialDiagnosis(dashboardData);

    return res.status(200).json({
      ok: true,
      dashboard: dashboardData,
      diagnosis: partialDiagnosis,
    });
  } catch (e: any) {
    console.error('Error in client-dashboard API:', e);
    return res.status(500).json({ ok: false, motivo: e?.message ?? 'error' });
  }
}
