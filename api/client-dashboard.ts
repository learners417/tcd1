import { getAdminClient } from './_lib/credits-server.js';
import { fetchProfileV2 } from '../src/lib/supabase';
import { getClientDashboardData, getPartialDiagnosis } from '../src/lib/client-dashboard';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  // In a real application, userId would come from an authenticated session.
  // For now, let's use a placeholder or assume it's passed as a query param for testing.
  // const userId = req.headers['x-user-id'] || req.query.userId;
  // For demonstration, let's assume a hardcoded admin client or a test user ID.
  // THIS IS FOR DEMONSTRATION/TESTING PURPOSES. REAL AUTH IS REQUIRED.
  const admin = getAdminClient(); // Using admin client to fetch profile, adjust for user-specific RLS if needed
  const { data: usersData, error: usersError } = await admin.auth.admin.listUsers();
  if (usersError || !usersData?.users || usersData.users.length === 0) {
    return res.status(500).json({ error: 'Could not fetch users for demo' });
  }
  const userId = usersData.users[0].id; // Taking the first user for demo

  if (!userId) {
    return res.status(401).json({ error: 'UNAUTHORIZED: User ID required.' });
  }

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
