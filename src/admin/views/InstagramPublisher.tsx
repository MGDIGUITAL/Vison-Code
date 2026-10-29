import React, { useState } from 'react';
import { supabase, authFetch } from '../lib';
import { Card, I } from '../ui';

type MediaType = 'IMAGE' | 'REELS' | 'CAROUSEL';

export default function InstagramPublisher() {
  const [mediaType, setMediaType] = useState<MediaType>('IMAGE');
  const [caption, setCaption] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const HASHTAG_PRESETS = [
    '#DesarrolloWeb',
    '#MarketingDigital',
    '#MetaAds',
    '#AutomatizacionIA',
    '#VisionCode',
    '#EcommerceChile',
    '#AppsMoviles',
  ];

  const CTA_PRESETS = [
    '👉 Escribe "INFO" en comentarios para enviarte el catálogo por mensaje privado.',
    '🚀 Visita el link de nuestra bio para cotizar tu proyecto en 1 minuto.',
    '📲 Escríbenos al WhatsApp para agendar una consultoría gratuita.',
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setResult(null);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `ig_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('instagram-media')
          .upload(filePath, file, { cacheControl: '3600', upsert: true });

        if (uploadError) {
          throw new Error(`Error subiendo a Supabase Storage: ${uploadError.message}. ¿Aseguraste crear el bucket 'instagram-media' público?`);
        }

        const { data: publicData } = supabase.storage
          .from('instagram-media')
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          newUrls.push(publicData.publicUrl);
        }
      }

      if (mediaType === 'CAROUSEL') {
        setMediaUrls((prev) => [...prev, ...newUrls].slice(0, 10));
      } else {
        setMediaUrls(newUrls.slice(0, 1));
      }
    } catch (err: any) {
      setResult({ ok: false, msg: err?.message || 'Error al procesar el archivo.' });
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (mediaUrls.length === 0) {
      setResult({ ok: false, msg: 'Debes subir al menos una foto o video antes de publicar.' });
      return;
    }

    setPublishing(true);
    setResult(null);

    try {
      const res = await authFetch('/api/admin/publish-instagram', {
        method: 'POST',
        body: JSON.stringify({
          mediaType,
          caption,
          mediaUrls,
        }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setResult({
          ok: true,
          msg: '¡Publicado con éxito en tu Instagram! 🎉 ID de post: ' + data.published_id,
        });
        setCaption('');
        setMediaUrls([]);
      } else {
        setResult({
          ok: false,
          msg: data.error || 'No se pudo publicar. Revisa las credenciales en Ajustes.',
        });
      }
    } catch (err: any) {
      setResult({
        ok: false,
        msg: err?.message || 'Error de conexión con el servidor.',
      });
    } finally {
      setPublishing(false);
    }
  };

  const appendText = (text: string) => {
    setCaption((prev) => (prev ? `${prev}\n\n${text}` : text));
  };

  return (
    <div className="space-y-5">
      {/* Barra superior de estado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200">
        <div>
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
            Publicador &amp; Automatizador de Contenidos Instagram
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Sube fotos, carruseles y Reels directo a tu cuenta comercial de Instagram sin apps intermedias.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200">
            Bucket: <strong className="text-neutral-800">instagram-media</strong>
          </span>
        </div>
      </div>

      {result && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            result.ok
              ? 'bg-lime/20 text-neutral-950 border-lime'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{result.msg}</span>
          <button onClick={() => setResult(null)} className="p-1 hover:opacity-75 transition-opacity">
            <I name="close" className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid: Formulario a la izquierda (7 cols) y Mockup de celular a la derecha (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor de Contenido (Columna Izquierda) */}
        <div className="lg:col-span-7 space-y-4">
          <Card title="1. Formato de Publicación">
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'IMAGE', label: 'Foto Única', desc: '1 imagen cuadrada o vertical' },
                { id: 'REELS', label: 'Reel / Video', desc: 'Video vertical 9:16 hasta 60s' },
                { id: 'CAROUSEL', label: 'Carrusel', desc: 'Hasta 10 fotos deslizables' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => {
                    setMediaType(fmt.id as MediaType);
                    setMediaUrls([]);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    mediaType === fmt.id
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-800'
                  }`}
                >
                  <div className="font-bold text-xs">{fmt.label}</div>
                  <div className={`text-[10px] mt-0.5 ${mediaType === fmt.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {fmt.desc}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card title="2. Archivo Multimedia">
            <div className="space-y-3">
              <label className="border-2 border-dashed border-neutral-300 hover:border-neutral-900 transition-colors rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-neutral-50/50">
                <input
                  type="file"
                  accept={mediaType === 'REELS' ? 'video/mp4,video/quicktime' : 'image/jpeg,image/png,image/webp,video/mp4'}
                  multiple={mediaType === 'CAROUSEL'}
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 mb-2 shadow-sm">
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin" />
                  ) : (
                    <I name="image" className="w-5 h-5" />
                  )}
                </div>
                <div className="text-xs font-bold text-neutral-800">
                  {uploading ? 'Subiendo archivo a Supabase Storage...' : 'Haz clic para seleccionar o arrastra aquí'}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  {mediaType === 'REELS'
                    ? 'Formato recomendado: MP4 vertical (1080x1920)'
                    : 'Formatos: JPG, PNG o WebP (hasta 50 MB)'}
                </div>
              </label>

              {/* Lista de archivos cargados */}
              {mediaUrls.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {mediaUrls.map((url, i) => (
                    <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 bg-black">
                      {url.endsWith('.mp4') || mediaType === 'REELS' ? (
                        <video src={url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={url} alt={`Media ${i}`} className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => setMediaUrls(mediaUrls.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <I name="close" className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card title="3. Pie de Foto &amp; Ganchos (Copy)">
            <div className="space-y-3">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={5}
                placeholder="Escribe el texto de tu publicación, gancho, llamada a la acción y hashtags..."
                className="vc-input w-full !text-xs leading-relaxed resize-y font-normal"
                maxLength={2200}
              />
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>{caption.length} / 2200 caracteres</span>
                {caption.length > 2000 && <span className="text-amber-500 font-semibold">Cerca del límite</span>}
              </div>

              {/* Atajos de llamada a la acción */}
              <div>
                <div className="text-[11px] font-bold text-neutral-700 mb-1.5">Llamadas a la acción (CTAs rápidos):</div>
                <div className="flex flex-col gap-1.5">
                  {CTA_PRESETS.map((cta, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => appendText(cta)}
                      className="text-left text-[11px] text-neutral-600 bg-neutral-100 hover:bg-neutral-200 p-2 rounded-lg transition-colors border border-neutral-200"
                    >
                      + {cta}
                    </button>
                  ))}
                </div>
              </div>

              {/* Atajos de Hashtags */}
              <div>
                <div className="text-[11px] font-bold text-neutral-700 mb-1.5">Hashtags recomendados de Vision Code:</div>
                <div className="flex flex-wrap gap-1.5">
                  {HASHTAG_PRESETS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setCaption((prev) => (prev ? `${prev} ${tag}` : tag))}
                      className="text-[10.5px] font-medium bg-neutral-100 hover:bg-neutral-900 hover:text-white px-2.5 py-1 rounded-full transition-colors border border-neutral-200"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Botón de Publicación */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing || uploading || mediaUrls.length === 0}
              className="vc-btn lime w-full !h-12 text-sm font-bold shadow-lg disabled:opacity-50"
            >
              <I name="send" className="w-4 h-4" />
              <span>{publishing ? 'Publicando en Instagram...' : 'Publicar en Instagram Ahora'}</span>
            </button>
            <p className="text-[11px] text-center text-neutral-400 mt-2">
              Se enviará a través de Meta Graph API a tu cuenta conectada.
            </p>
          </div>
        </div>

        {/* Mockup Previsualización Móvil (Columna Derecha) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-6 w-full max-w-[340px]">
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest text-center mb-3">
              Vista Previa en Celular
            </div>

            {/* Chasis de Teléfono */}
            <div className="w-full rounded-[40px] border-[6px] border-neutral-900 bg-black p-3 shadow-2xl relative overflow-hidden">
              {/* Notch */}
              <div className="w-24 h-4 bg-neutral-900 rounded-b-xl mx-auto mb-2" />

              {/* Pantalla Interna de la App */}
              <div className="bg-white rounded-[28px] overflow-hidden flex flex-col min-h-[520px]">
                {/* Header Instagram */}
                <div className="p-3 border-b border-neutral-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600 p-[1.5px]">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-[9px] font-black">
                        VC
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-neutral-900 leading-none">visioncode.cl</div>
                      <div className="text-[9px] text-neutral-400">Audio original</div>
                    </div>
                  </div>
                  <div className="text-neutral-400 font-bold text-xs">•••</div>
                </div>

                {/* Área de Medio (Foto o Video) */}
                <div className="w-full aspect-square bg-neutral-950 flex items-center justify-center relative overflow-hidden">
                  {mediaUrls.length > 0 ? (
                    mediaUrls[0].endsWith('.mp4') || mediaType === 'REELS' ? (
                      <video src={mediaUrls[0]} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                    ) : (
                      <img src={mediaUrls[0]} alt="Preview" className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="text-center p-6 text-neutral-500">
                      <I name="image" className="w-8 h-8 mx-auto mb-2 opacity-30 text-white" />
                      <div className="text-[11px]">Sube una foto o Reel para ver la vista previa</div>
                    </div>
                  )}

                  {mediaType === 'CAROUSEL' && mediaUrls.length > 1 && (
                    <div className="absolute top-2.5 right-2.5 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      1/{mediaUrls.length}
                    </div>
                  )}
                </div>

                {/* Acciones (Likes, Comentarios, Compartir) */}
                <div className="p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between text-neutral-800">
                    <div className="flex items-center gap-3">
                      <button type="button" className="text-neutral-700 hover:text-red-500 transition-colors">
                        <I name="heart" className="w-5 h-5" />
                      </button>
                      <button type="button" className="text-neutral-700 hover:text-black transition-colors">
                        <I name="chat" className="w-5 h-5" />
                      </button>
                      <button type="button" className="text-neutral-700 hover:text-black transition-colors">
                        <I name="send" className="w-5 h-5" />
                      </button>
                    </div>
                    <button type="button" className="text-neutral-700 hover:text-black transition-colors">
                      <I name="bookmark" className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Caption y Comentarios */}
                  <div className="text-[10.5px] leading-snug">
                    <span className="font-bold text-neutral-900 mr-1.5">visioncode.cl</span>
                    <span className="text-neutral-700 whitespace-pre-wrap">
                      {caption || 'Aquí se verá el pie de foto de tu publicación con los hashtags y llamadas a la acción...'}
                    </span>
                  </div>
                  <div className="text-[9px] text-neutral-400 uppercase tracking-wider">
                    HACE 1 MINUTO
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
