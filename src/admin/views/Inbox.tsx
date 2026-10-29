import React, { useEffect, useState, useRef } from 'react';
import { supabase, authFetch, fmt, waLink } from '../lib';
import { Card, I, Empty, Skeleton } from '../ui';

interface Conversation {
  id: string;
  channel: 'whatsapp' | 'instagram';
  external_id: string;
  name: string | null;
  contact_id: string | null;
  last_message: string | null;
  last_message_at: string;
  unread: number;
}

interface Message {
  id: number;
  conversation_id: string;
  direction: 'in' | 'out';
  body: string;
  created_at: string;
}

export default function Inbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'instagram'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false });
    if (data) {
      setConversations(data as Conversation[]);
      if (!activeConv && data.length > 0) {
        setActiveConv(data[0] as Conversation);
      }
    }
    setLoading(false);
  };

  const fetchMessages = async (convId: string) => {
    setLoadingMessages(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    if (data) {
      setMessages(data as Message[]);
    }
    setLoadingMessages(false);
  };

  useEffect(() => {
    fetchConversations();

    const convSub = supabase
      .channel('inbox_convs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(convSub); };
  }, []);

  useEffect(() => {
    if (!activeConv?.id) {
      setMessages([]);
      return;
    }
    fetchMessages(activeConv.id);

    // Clear unread in DB
    if (activeConv.unread > 0) {
      supabase.from('conversations').update({ unread: 0 }).eq('id', activeConv.id);
      setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, unread: 0 } : c));
    }

    const msgSub = supabase
      .channel(`inbox_msg_${activeConv.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConv.id}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(msgSub); };
  }, [activeConv?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv?.id || !replyText.trim()) return;
    setSending(true);

    try {
      const res = await authFetch('/api/admin/send-message', {
        method: 'POST',
        body: JSON.stringify({
          conversation_id: activeConv.id,
          text: replyText.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Fallback: If Meta API credentials aren't set up yet, add directly to DB so chat history works
        await supabase.from('messages').insert({
          conversation_id: activeConv.id,
          direction: 'out',
          body: replyText.trim(),
        });
        await supabase.from('conversations').update({
          last_message: replyText.trim().slice(0, 200),
          last_message_at: new Date().toISOString(),
        }).eq('id', activeConv.id);
      }
      setReplyText('');
    } catch {
      // Local fallback
      await supabase.from('messages').insert({
        conversation_id: activeConv.id,
        direction: 'out',
        body: replyText.trim(),
      });
      setReplyText('');
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter(c => {
    if (channelFilter === 'all') return true;
    return c.channel === channelFilter;
  });

  const activeWaLink = activeConv?.channel === 'whatsapp' ? waLink(activeConv.external_id, replyText || '') : null;

  const CATALOG_RESPONSES = [
    {
      label: 'Empresa en 1 Día ($100.000)',
      text: '¡Hola! Te ayudamos a formalizar tu negocio con nuestro servicio Empresa en un Día por $100.000 CLP: Constitución SpA/EIRL, obtención de RUT en el SII, inicio de actividades y certificado digital listos para facturar.',
    },
    {
      label: 'Landing Express ($180.000)',
      text: '¡Hola! Nuestro plan Landing Page Express tiene un valor de $180.000 CLP: diseño de alta conversión ultrarrápido, 1 año de hosting + dominio .CL, formulario y botón directo a WhatsApp. Entrega en 5 a 7 días hábiles.',
    },
    {
      label: 'Portal Corporativo ($250.000)',
      text: '¡Hola! Nuestro Portal Web Corporativo tiene un valor de $250.000 CLP: hasta 6 secciones completas (Inicio, Nosotros, Servicios, Blog, Contacto), optimización SEO para Google, analíticas y diseño exclusivo.',
    },
    {
      label: 'E-Commerce Básico ($260.000)',
      text: '¡Hola! Nuestra Tienda Online E-Commerce Básico tiene un valor de $260.000 CLP: hasta 20 productos simples, pasarelas de pago Webpay Plus y Mercado Pago, carrito de compras y hosting/dominio .CL por 1 año.',
    },
    {
      label: 'E-Commerce Intermedio ($280.000)',
      text: '¡Hola! Nuestra Tienda Online E-Commerce Intermedio tiene un valor de $280.000 CLP: catálogo de hasta 40 productos, control de stock con alertas, cálculo de envíos por región, pagos Webpay y panel autogestionable.',
    },
    {
      label: 'E-Commerce Pro ($390.000)',
      text: '¡Hola! Nuestro E-Commerce Profesional tiene un valor de $390.000 CLP: catálogo sin límites, matriz de tallas/colores, seguimiento de envíos Starken/Chilexpress, cupones y sincronización con Píxel de Meta.',
    },
    {
      label: 'Pack Emprendimiento ($210.000)',
      text: '¡Hola! Te recomiendo nuestro Pack Promocional Emprendimiento por solo $210.000 CLP: incluye tu Landing Corporativa + Sistema SaaS de flujo de visitas en vivo + 1er mes de regalo del Plan Vision Core.',
    },
    {
      label: 'Pack Pyme ($260.000)',
      text: '¡Hola! Nuestro Pack Promocional Pyme tiene un valor de $260.000 CLP: incluye a tu elección E-Commerce Intermedio O Portal Corporativo + Configuración de Píxel de Meta + SaaS de administración + 1er mes de Plan Vision Scale.',
    },
    {
      label: 'Pack Corporativo ($310.000)',
      text: '¡Hola! Nuestro Pack Promocional Corporativo tiene un valor de $310.000 CLP: incluye E-Commerce Pro ilimitado + Campaña en Meta Ads 100% montada y gestionada + Sistema SaaS & ERP de stock + 1er mes de Plan Partner Pro.',
    },
    {
      label: 'Agente IA WhatsApp (A Cotizar)',
      text: '¡Hola! Nuestros agentes de Inteligencia Artificial para WhatsApp 24/7 se cotizan a medida según el flujo y volumen de tu empresa. ¿Te gustaría coordinar una videollamada para diagnosticar tu negocio?',
    },
    {
      label: 'Apps & Software (A Cotizar)',
      text: '¡Hola! El desarrollo de aplicaciones móviles (iOS y Android) y software a medida se cotizan según los requerimientos técnicos de tu proyecto. Cuéntanos qué funcionalidad necesitas.',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-230px)] min-h-[580px]">
      {/* Conversations Sidebar (4 cols) */}
      <Card className="lg:col-span-4 !p-0 flex flex-col h-full overflow-hidden border border-neutral-200">
        {/* Header and Filter */}
        <div className="p-3.5 border-b border-neutral-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-xs text-neutral-800 flex items-center gap-2">
              <I name="chat" className="w-4 h-4 text-lime" />
              <span>Bandeja Omnicanal</span>
            </h3>
            <span className="vc-tag">{filteredConvs.length} chats</span>
          </div>
          <div className="flex gap-1.5">
            {(['all', 'whatsapp', 'instagram'] as const).map(ch => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`flex-1 py-1 px-2 rounded-full text-[11px] font-medium transition-all ${channelFilter === ch ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
              >
                {ch === 'all' ? 'Todos' : ch === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
              </button>
            ))}
          </div>
        </div>

        {/* List of Chats */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {loading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400">
              No hay conversaciones en esta bandeja aún. Cuando un cliente escriba vía webhook de Meta o WhatsApp Cloud API aparecerá de inmediato.
            </div>
          ) : (
            filteredConvs.map(c => {
              const isActive = activeConv?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConv(c)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${isActive ? 'bg-white shadow-sm' : 'hover:bg-neutral-100/70'}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${c.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-700' : 'bg-pink-100 text-pink-600'}`}>
                    <I name={c.channel === 'whatsapp' ? 'whatsapp' : 'instagram'} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-neutral-900 truncate">
                        {c.name || (c.channel === 'whatsapp' ? `+${c.external_id}` : `@${c.external_id}`)}
                      </span>
                      <span className="text-[10px] text-neutral-400 shrink-0">
                        {fmt.ago(c.last_message_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                      {c.last_message || 'Sin mensajes'}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-lime text-black font-bold text-[9px] flex items-center justify-center shrink-0">
                      {c.unread}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Chat Area (8 cols) */}
      <Card className="lg:col-span-8 !p-0 flex flex-col h-full overflow-hidden bg-white border border-neutral-200">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="p-3.5 border-b border-neutral-200 bg-[#f9fafb] flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${activeConv.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-700' : 'bg-pink-100 text-pink-600'}`}>
                  <I name={activeConv.channel === 'whatsapp' ? 'whatsapp' : 'instagram'} className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-neutral-900">
                    {activeConv.name || (activeConv.channel === 'whatsapp' ? `+${activeConv.external_id}` : `@${activeConv.external_id}`)}
                  </h4>
                  <div className="text-[10.5px] text-neutral-400 flex items-center gap-1.5">
                    <span className="capitalize">{activeConv.channel}</span> · ID: {activeConv.external_id}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeWaLink && (
                  <a
                    href={activeWaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vc-btn ghost !h-8 text-xs !px-3 text-emerald-700"
                    title="Abrir en WhatsApp Web / App"
                  >
                    <I name="whatsapp" className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Abrir en WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f5f6f7]/60">
              {loadingMessages ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-10 w-2/3 rounded-2xl" />
                  <Skeleton className="h-10 w-1/2 ml-auto rounded-2xl" />
                  <Skeleton className="h-12 w-3/4 rounded-2xl" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400">
                  Inicia la conversación escribiendo un mensaje abajo.
                </div>
              ) : (
                messages.map((m: any) => {
                  const isOut = m.direction === 'out';
                  const isAi = isOut && (Boolean(m.raw?.is_ai) || m.body.includes('🤖') || m.body.startsWith('[IA]') || m.external_id?.startsWith('bot_'));
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isOut ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                          isOut
                            ? 'bg-neutral-900 text-white rounded-br-sm'
                            : 'bg-white text-neutral-800 rounded-bl-sm border border-neutral-200'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 px-1 text-[9.5px] text-neutral-400">
                        {isOut && (
                          isAi ? (
                            <span className="font-bold text-lime bg-neutral-900 px-1.5 py-0.2 rounded text-[9px] inline-flex items-center gap-1">
                              <I name="spark" className="w-2.5 h-2.5" />
                              <span>IA Bot</span>
                            </span>
                          ) : (
                            <span className="font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.2 rounded text-[9px] inline-flex items-center gap-1">
                              <I name="user" className="w-2.5 h-2.5" />
                              <span>Asesor</span>
                            </span>
                          )
                        )}
                        <span>{fmt.dateTime(m.created_at)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Branded Catalog Toolbar */}
            <div className="px-3 py-2 border-t border-neutral-100 bg-[#fbfbfc] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
                Catálogo VC:
              </span>
              {CATALOG_RESPONSES.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReplyText(item.text)}
                  className="shrink-0 text-[10.5px] font-semibold bg-white hover:bg-neutral-900 hover:text-white text-neutral-700 px-2.5 py-1 rounded-full border border-neutral-200 transition-all shadow-xs"
                  title="Haz clic para cargar este mensaje en el chat"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Chat Send Input Box */}
            <form onSubmit={handleSend} className="p-3 border-t border-neutral-200 bg-white flex gap-2">
              <input
                type="text"
                placeholder={`Responder vía ${activeConv.channel === 'whatsapp' ? 'WhatsApp' : 'Instagram'}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="vc-input flex-1 !py-2.5 text-xs"
              />
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="vc-btn lime !h-10 !px-4 text-xs"
              >
                <I name="send" className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{sending ? 'Enviando...' : 'Enviar'}</span>
              </button>
            </form>
          </>
        ) : (
          <Empty title="Selecciona una conversación" icon="chat">
            Elige una conversación de la lista para leer y responder mensajes de clientes.
          </Empty>
        )}
      </Card>
    </div>
  );
}
