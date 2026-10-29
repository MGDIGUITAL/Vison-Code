import type { APIRoute } from 'astro';
import { env, json, createAdminToken } from '../../../lib/server';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const username = String(body.username || '').trim();
    const password = String(body.password || '').trim();

    const expectedUser = env('ADMIN_USER') || 'VisionCode2026';
    const expectedPass = env('ADMIN_PASSWORD') || 'VisionPlata2026';

    if (username === expectedUser && password === expectedPass) {
      const token = createAdminToken(username);
      return json({
        ok: true,
        token,
        user: {
          id: 'admin-master',
          email: 'admin@vision-code.cl',
          name: 'Vision Code Admin',
        },
      });
    }

    return json({ ok: false, error: 'Usuario o contraseña incorrectos' }, 401);
  } catch (err: any) {
    return json({ ok: false, error: 'Error procesando solicitud de acceso' }, 500);
  }
};
