import type { APIRoute } from 'astro';
import { getFlowPaymentStatus } from '../../../lib/flow';
import { json } from '../../../lib/server';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const token = url.searchParams.get('token');
    if (!token) {
      return json({ success: false, error: 'Token requerido' }, 400);
    }

    const data = await getFlowPaymentStatus(token);
    return json({ success: true, data });
  } catch (err: any) {
    return json({ success: false, error: err.message || 'Error al obtener estado' }, 500);
  }
};
