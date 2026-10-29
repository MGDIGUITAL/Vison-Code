import type { APIRoute } from 'astro';
import { env, json, requireAdmin, META_GRAPH, serviceClient } from '../../../lib/server';

export const prerender = false;

/**
 * Publicador oficial de Instagram (Fotos, Reels y Carruseles) vía Meta Graph API.
 */
export const POST: APIRoute = async ({ request }) => {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.res;

  const token = env('META_PAGE_ACCESS_TOKEN');
  const igUserId = env('INSTAGRAM_ACCOUNT_ID');

  if (!token || !igUserId) {
    return json({
      error: 'Credenciales de Instagram no configuradas en el servidor (faltan META_PAGE_ACCESS_TOKEN o INSTAGRAM_ACCOUNT_ID).',
      help: 'Agrega estas variables en tu archivo .env.local o en Vercel para publicar directamente.',
    }, 400);
  }

  const { mediaType = 'IMAGE', caption = '', mediaUrls = [] } = await request.json().catch(() => ({}));

  if (!Array.isArray(mediaUrls) || mediaUrls.length === 0) {
    return json({ error: 'Debes proporcionar al menos una URL de imagen o video.' }, 400);
  }

  const postGraph = async (endpoint: string, params: Record<string, any>) => {
    const url = new URL(`${META_GRAPH}/${endpoint}`);
    url.searchParams.set('access_token', token);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
      }
    }
    const res = await fetch(url.toString(), { method: 'POST' });
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error.message || 'Error en Meta Graph API');
    }
    return data;
  };

  const checkStatus = async (containerId: string, maxAttempts = 15): Promise<boolean> => {
    for (let i = 0; i < maxAttempts; i++) {
      const url = `${META_GRAPH}/${containerId}?fields=status_code&access_token=${encodeURIComponent(token)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status_code === 'FINISHED') return true;
      if (data.status_code === 'ERROR' || data.status_code === 'EXPIRED') {
        throw new Error(`El procesamiento del video falló con estado: ${data.status_code}`);
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    return false;
  };

  try {
    let creationId: string;

    if (mediaType === 'IMAGE') {
      // 1. Contenedor de Imagen única
      const container = await postGraph(`${igUserId}/media`, {
        image_url: mediaUrls[0],
        caption: caption.trim(),
      });
      creationId = container.id;
    } else if (mediaType === 'REELS') {
      // 2. Contenedor de Reel (Video)
      const container = await postGraph(`${igUserId}/media`, {
        media_type: 'REELS',
        video_url: mediaUrls[0],
        caption: caption.trim(),
        share_to_feed: true,
      });
      creationId = container.id;
      // Esperar a que Meta termine de procesar el video
      await checkStatus(creationId);
    } else if (mediaType === 'CAROUSEL') {
      // 3. Contenedor de Carrusel
      const childIds: string[] = [];
      for (const url of mediaUrls.slice(0, 10)) {
        const isVideo = url.endsWith('.mp4') || url.includes('/video');
        const child = await postGraph(`${igUserId}/media`, {
          is_carousel_item: true,
          ...(isVideo ? { media_type: 'VIDEO', video_url: url } : { image_url: url }),
        });
        childIds.push(child.id);
      }
      const container = await postGraph(`${igUserId}/media`, {
        media_type: 'CAROUSEL',
        children: childIds.join(','),
        caption: caption.trim(),
      });
      creationId = container.id;
    } else {
      return json({ error: 'Tipo de medio no soportado' }, 400);
    }

    // Publicar el contenedor creado
    const publish = await postGraph(`${igUserId}/media_publish`, {
      creation_id: creationId,
    });

    // Guardar registro de la publicación en Supabase si está disponible
    const sb = serviceClient();
    if (sb) {
      await sb.from('events').insert({
        event: 'instagram_publish',
        label: `Publicación ${mediaType}`,
        props: {
          media_type: mediaType,
          creation_id: creationId,
          published_id: publish.id,
          caption: caption.slice(0, 100),
        },
      }).catch(() => {});
    }

    return json({
      ok: true,
      published_id: publish.id,
      message: '¡Publicación realizada con éxito en tu Instagram!',
    });
  } catch (err: any) {
    return json({
      error: err?.message || 'Error al conectar con la API de Instagram',
    }, 500);
  }
};
