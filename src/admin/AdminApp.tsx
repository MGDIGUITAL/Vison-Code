import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import './admin.css';
import { supabase, makeRange, type RangeKey } from './lib';
import { I, Icon } from './ui';
import Overview from './views/Overview';
import Crm from './views/Crm';
import Campaigns from './views/Campaigns';
import Inbox from './views/Inbox';
import InstagramPublisher from './views/InstagramPublisher';
import Traffic from './views/Traffic';
import Settings from './views/Settings';
import Products from './views/Products';
import Clients from './views/Clients';
import Remuneraciones from './views/Remuneraciones';
import Facturacion from './views/Facturacion';
import Cotizaciones from './views/Cotizaciones';

type View = 'overview' | 'products' | 'clients' | 'crm' | 'cotizaciones' | 'campaigns' | 'inbox' | 'instagram' | 'traffic' | 'remuneraciones' | 'facturacion' | 'settings';
const NAV: { id: View; label: string; icon: keyof typeof Icon }[] = [
  { id: 'overview', label: 'Resumen', icon: 'grid' },
  { id: 'products', label: 'Productos & Planes', icon: 'box' },
  { id: 'clients', label: 'Clientes', icon: 'briefcase' },
  { id: 'crm', label: 'CRM Leads', icon: 'users' },
  { id: 'cotizaciones', label: 'Cotizaciones', icon: 'quote' },
  { id: 'campaigns', label: 'Campañas', icon: 'megaphone' },
  { id: 'inbox', label: 'Bandeja', icon: 'chat' },
  { id: 'instagram', label: 'Publicador IG', icon: 'instagram' },
  { id: 'traffic', label: 'Tráfico', icon: 'chart' },
  { id: 'remuneraciones', label: 'Remuneraciones & RRHH', icon: 'receipt' },
  { id: 'facturacion', label: 'Facturación Electrónica', icon: 'invoice' },
  { id: 'settings', label: 'Ajustes', icon: 'settings' },
];
const TITLES: Record<View, [string, string]> = {
  overview: ['Vision Code', 'Dashboard'],
  products: ['Catálogo, Precios & Pasarelas', 'Productos & Planes'],
  clients: ['Cartera & Suscripciones', 'Clientes Activos'],
  crm: ['Pipeline de ventas', 'CRM Leads'],
  cotizaciones: ['Propuestas Comerciales & Contratos', 'Cotizaciones Vision Code'],
  campaigns: ['Meta Ads & atribución', 'Campañas'],
  inbox: ['WhatsApp · Instagram', 'Bandeja'],
  instagram: ['Contenido & Reels', 'Publicador IG'],
  traffic: ['Comportamiento del sitio', 'Tráfico'],
  remuneraciones: ['Gestión Laboral, Nóminas & Previred', 'Remuneraciones & RRHH'],
  facturacion: ['DTEs, Boletas & Facturas SII', 'Facturación Electrónica'],
  settings: ['Integraciones & Seguridad', 'Ajustes'],
};

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // Check master session in localStorage first
    try {
      const savedMaster = localStorage.getItem('vc_master_auth');
      if (savedMaster) {
        const user = JSON.parse(savedMaster);
        setSession({ user } as any);
        setIsAdmin(true);
        setReady(true);
        return;
      }
    } catch {}

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!localStorage.getItem('vc_master_auth')) {
        setSession(s);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    if (localStorage.getItem('vc_master_auth')) {
      setIsAdmin(true);
      return;
    }
    supabase.rpc('is_admin').then(({ data, error }) => setIsAdmin(error ? false : Boolean(data)));
  }, [session?.user?.id]);

  if (!ready) return <Splash />;
  if (!session) return <Login onMasterLogin={(u) => { setSession({ user: u } as any); setIsAdmin(true); }} />;
  if (isAdmin === null) return <Splash />;
  if (!isAdmin) return <NoAccess email={session.user.email || ''} />;
  return <Shell session={session} onLogout={() => { localStorage.removeItem('vc_master_auth'); supabase.auth.signOut(); setSession(null); setIsAdmin(null); }} />;
}

function Splash() {
  return (
    <div className="vc-admin min-h-screen flex items-center justify-center bg-[#e9eaec]">
      <div className="w-10 h-10 rounded-full border-[3px] border-neutral-300 border-t-neutral-900 animate-spin" />
    </div>
  );
}

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center p-1.5 shadow-xs transition-transform hover:scale-105 border ${dark ? 'bg-white border-neutral-200' : 'bg-black border-neutral-800'}`}>
        <img
          src={dark ? "/images/vc-icon-black.png" : "/images/vc-logo-white-symbol.png"}
          alt="Vision Code"
          className="w-full h-full object-contain"
        />
      </div>
      <span className={`text-[9.5px] font-bold tracking-wider font-mono ${dark ? 'text-white' : 'text-neutral-900'}`}>VC·OS</span>
    </div>
  );
}

function Login({ onMasterLogin }: { onMasterLogin: (user: any) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'err' | 'ok'; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMsg(null);

    // 1. Intentar autenticación segura contra el backend (Vercel ADMIN_USER / ADMIN_PASSWORD)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        const sessionUser = {
          ...data.user,
          token: data.token,
        };
        localStorage.setItem('vc_master_auth', JSON.stringify(sessionUser));
        onMasterLogin(sessionUser);
        setLoading(false);
        return;
      }
    } catch {}

    // 2. Fallback a Supabase Auth
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: username.trim(), password });
      setLoading(false);
      if (error) {
        setMsg({ type: 'err', text: 'Credenciales inválidas. Por favor verifica tu usuario y contraseña.' });
      }
    } catch {
      setLoading(false);
      setMsg({ type: 'err', text: 'Error al conectar con el servidor de autenticación.' });
    }
  };
  const reset = async () => {
    if (!username) return setMsg({ type: 'err', text: 'Escribe tu usuario o correo primero.' });
    const { error } = await supabase.auth.resetPasswordForEmail(username, { redirectTo: `${location.origin}/admin` });
    setMsg(error ? { type: 'err', text: error.message } : { type: 'ok', text: 'Te enviamos un enlace para restablecer la contraseña.' });
  };

  return (
    <div className="vc-admin min-h-screen bg-[#e9eaec] flex items-center justify-center p-4">
      <div className="w-full max-w-[980px] grid md:grid-cols-[1.05fr_1fr] bg-white rounded-[30px] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] vc-fade">
        <div className="relative bg-neutral-950 text-white p-10 flex flex-col justify-between min-h-[520px] overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-lime/25 blur-3xl" />
          <div className="absolute -left-10 bottom-10 w-64 h-64 rounded-full bg-lime/10 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <img src="/images/NAVAR TITULO.png" alt="Vision Code" className="h-8 w-auto" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-mono text-white/60 mb-4 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse"></span>
              Conexión Cifrada SSL
            </div>
            <h1 className="text-[34px] leading-[1.1] font-semibold tracking-tight">
              Portal de Gestión <br /><span className="text-lime">Corporativa.</span>
            </h1>
            <p className="mt-4 text-xs text-white/50 leading-relaxed max-w-sm">
              Acceso restringido para personal autorizado de Vision Code SpA. Toda actividad dentro del sistema es confidencial y sujeta a protocolos de seguridad.
            </p>
          </div>
          <div className="relative text-[11px] text-white/30 font-mono tracking-wider">
            © {new Date().getFullYear()} Vision Code SpA · Confidencial
          </div>
        </div>

        <form onSubmit={submit} className="p-10 flex flex-col justify-center">
          <Logo />
          <h2 className="mt-6 text-2xl font-semibold text-center">Ingresar al panel</h2>
          <p className="text-center text-sm text-neutral-500 mt-1 mb-8">Acceso exclusivo para el equipo de Vision Code</p>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Usuario</label>
              <input
                className="vc-input !py-3 font-medium"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Contraseña</label>
              <input
                className="vc-input !py-3"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>
          {msg && <div className={`mt-3 text-xs rounded-xl px-3 py-2 ${msg.type === 'err' ? 'bg-red-50 text-red-600 font-medium' : 'bg-lime-soft text-neutral-800'}`}>{msg.text}</div>}
          <button className="vc-btn mt-6 w-full !h-12" disabled={loading}>
            <span className="flex-1 text-center font-bold">{loading ? 'Ingresando…' : 'Ingresar'}</span>
            <span className="vc-btn-dot !w-9 !h-9"><I name="arrowRight" className="w-4 h-4" /></span>
          </button>
          <a href="/" className="mt-8 text-center text-xs text-neutral-400 hover:text-neutral-700">← Volver al sitio</a>
        </form>
      </div>
    </div>
  );
}

function NoAccess({ email }: { email: string }) {
  return (
    <div className="vc-admin min-h-screen bg-[#e9eaec] flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] p-10 max-w-md text-center shadow-xl">
        <Logo />
        <h2 className="mt-5 text-xl font-semibold">Sin permisos de administrador</h2>
        <p className="mt-2 text-sm text-neutral-500">La cuenta <b>{email}</b> no está en la tabla <code>admin_users</code>. Agrégala en Supabase o ejecuta la migración <code>001_crm_saas.sql</code>.</p>
        <button className="vc-btn plain mt-6" onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
      </div>
    </div>
  );
}

interface ProjectItem {
  id: string;
  name: string;
  domain: string;
  pixelId?: string;
  phone?: string;
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'vision-code',
    name: 'Vision Code SpA',
    domain: 'https://www.vision-code.cl',
    pixelId: '2153421501952376',
    phone: '+56 9 6455 2200',
  },
];

function Shell({ session, onLogout }: { session: Session; onLogout?: () => void }) {
  const initial = (typeof location !== 'undefined' && (location.hash.slice(1) as View)) || 'overview';
  const [view, setView] = useState<View>(NAV.some((n) => n.id === initial) ? initial : 'overview');
  const [rangeKey, setRangeKey] = useState<RangeKey>('30d');
  const [mobileNav, setMobileNav] = useState(false);
  const [unread, setUnread] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fluidWidth, setFluidWidth] = useState(true);
  const range = React.useMemo(() => makeRange(rangeKey), [rangeKey]);

  // Multi-tenant Projects / Clients State
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem('vc_client_projects');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PROJECTS;
  });
  const [activeProject, setActiveProject] = useState<ProjectItem>(() => projects[0] || DEFAULT_PROJECTS[0]);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDomain, setNewProjDomain] = useState('');
  const [newProjPixel, setNewProjPixel] = useState('');
  const [newProjPhone, setNewProjPhone] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    const newP: ProjectItem = {
      id: `proj_${Date.now()}`,
      name: newProjName.trim(),
      domain: newProjDomain.trim() || 'https://',
      pixelId: newProjPixel.trim(),
      phone: newProjPhone.trim(),
    };
    const updated = [...projects, newP];
    setProjects(updated);
    setActiveProject(newP);
    localStorage.setItem('vc_client_projects', JSON.stringify(updated));
    setShowNewProjectModal(false);
    setNewProjName('');
    setNewProjDomain('');
    setNewProjPixel('');
    setNewProjPhone('');
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  useEffect(() => { location.hash = view; setMobileNav(false); }, [view]);
  useEffect(() => {
    const load = () => supabase.from('conversations').select('unread').gt('unread', 0).then(({ data }) => setUnread((data || []).reduce((s, r: any) => s + (r.unread || 0), 0)));
    load();
    const ch = supabase.channel('unread').on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const name = (session.user.email || '').split('@')[0];
  const today = new Date().toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
  const [sub, title] = TITLES[view];

  return (
    <div className={`vc-admin min-h-screen ${fluidWidth ? 'bg-[#fbfbfb] p-0' : 'bg-[#e9eaec] p-0 sm:p-4 lg:p-6'}`}>
      <div className={`mx-auto bg-white flex min-h-screen overflow-hidden ${fluidWidth ? 'w-full' : 'max-w-[1520px] sm:rounded-[28px] shadow-[0_25px_70px_-25px_rgba(0,0,0,0.2)] min-h-[calc(100vh-3rem)] border border-neutral-200/80'}`}>
        {/* Sidebar */}
        <aside className={`${mobileNav ? 'flex' : 'hidden'} md:flex fixed md:sticky top-0 h-screen z-50 w-[76px] shrink-0 flex-col items-center py-4 px-2 bg-[#f8f9fa] border-r border-neutral-200 overflow-y-auto no-scrollbar`}>
          <a href="/" title="Ir al sitio" className="shrink-0 mb-1"><Logo /></a>
          <nav className="flex flex-col items-center gap-1.5 mt-2 shrink-0">
            {NAV.map((n) => (
              <button
                key={n.id}
                title={n.label}
                onClick={() => setView(n.id)}
                className={`group relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  view === n.id
                    ? 'bg-black text-white shadow-md ring-1 ring-black'
                    : 'bg-white text-neutral-500 border border-neutral-200/80 hover:text-black hover:border-neutral-400'
                }`}
              >
                <I name={n.icon} className="w-4 h-4" />
                {n.id === 'inbox' && unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center border border-white">
                    {unread}
                  </span>
                )}
                <span className="pointer-events-none absolute left-14 rounded-xl bg-neutral-900 text-white text-[11px] font-medium px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                  {n.label}
                </span>
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-3 flex flex-col items-center gap-2 shrink-0">
            <div className="text-[10px] font-mono font-medium text-neutral-500 bg-white border border-neutral-200 rounded-full px-2 py-0.5 shadow-2xs">
              {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <button
              title="Cerrar sesión"
              onClick={() => onLogout ? onLogout() : supabase.auth.signOut()}
              className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center hover:bg-black transition-colors shadow-xs"
            >
              <I name="logout" className="w-4 h-4" />
            </button>
          </div>
        </aside>
        {mobileNav && <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" onClick={() => setMobileNav(false)} />}

        {/* Main */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 overflow-x-hidden bg-[#fafafa]">
          <div className="w-full max-w-[1400px] mx-auto space-y-5">
            {/* Top bar */}
            <div className="flex flex-wrap items-center gap-2.5 bg-white p-2.5 rounded-2xl border border-neutral-200/80 shadow-2xs">
              <button className="vc-icon-btn md:hidden" onClick={() => setMobileNav(true)}><I name="menu" /></button>
              <div className="hidden sm:flex items-center gap-1 rounded-xl border border-neutral-200 p-0.5 bg-neutral-50">
                {NAV.slice(0, 3).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setView(n.id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      view === n.id ? 'bg-black text-white shadow-xs' : 'text-neutral-500 hover:text-black hover:bg-white'
                    }`}
                    title={n.label}
                  >
                    <I name={n.icon} className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <div className="hidden lg:flex items-center gap-2.5 rounded-xl border border-neutral-200 pl-1 pr-3 py-1 bg-neutral-50">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold uppercase">{name.slice(0, 1)}</div>
                <div className="leading-tight">
                  <div className="text-[11.5px] font-bold capitalize text-neutral-900">{name}</div>
                  <div className="text-[10px] text-neutral-400 font-mono truncate max-w-[150px]">{session.user.email}</div>
                </div>
              </div>

              {/* Project / Workspace Switcher */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                  className="flex items-center gap-2 bg-[#f4f5f6] hover:bg-neutral-200 border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-800 transition-all shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  <span className="truncate max-w-[120px] sm:max-w-[180px]">{activeProject.name}</span>
                  <I name="arrowDownRight" className="w-3 h-3 text-neutral-500" />
                </button>
                {projectMenuOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-2 z-50 vc-fade">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 py-1.5 font-mono">
                      Proyectos &amp; Clientes
                    </div>
                    <div className="space-y-1 max-h-56 overflow-y-auto">
                      {projects.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setActiveProject(p);
                            setProjectMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                            activeProject.id === p.id ? 'bg-neutral-900 text-white font-bold' : 'hover:bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          <div className="truncate">
                            <div>{p.name}</div>
                            <div className={`text-[10px] font-normal truncate ${activeProject.id === p.id ? 'text-neutral-300' : 'text-neutral-400'}`}>
                              {p.domain}
                            </div>
                          </div>
                          {activeProject.id === p.id && <I name="check" className="w-3.5 h-3.5 text-white shrink-0" />}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-neutral-100 mt-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setProjectMenuOpen(false);
                          setShowNewProjectModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold bg-neutral-950 text-white hover:bg-black transition-colors shadow-xs"
                      >
                        <I name="plus" className="w-3.5 h-3.5" />
                        <span>+ Nuevo Proyecto / Cliente</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="hidden md:block text-right leading-tight mr-1">
                  <div className="text-xs font-bold text-neutral-800">Hola, <span className="capitalize">{name}</span></div>
                  <div className="text-[10px] text-neutral-400 font-mono">VC·OS Executive</div>
                </div>
                <button className="vc-pill !h-9 text-xs" onClick={() => setView('inbox')}>
                  <I name="bell" className="w-3.5 h-3.5" />
                  <span className="capitalize hidden sm:inline">{today}</span>
                  {unread > 0 && <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[9.5px] font-bold flex items-center justify-center">{unread}</span>}
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className={`vc-icon-btn !w-9 !h-9 ${isFullscreen ? 'active' : ''}`}
                  title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa (F11)'}
                >
                  <I name={isFullscreen ? 'minimize' : 'maximize'} className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setFluidWidth(!fluidWidth)}
                  className={`vc-icon-btn !w-9 !h-9 ${fluidWidth ? 'active' : ''}`}
                  title={fluidWidth ? 'Modo normal (1400px)' : 'Modo ancho completo (100%)'}
                >
                  <I name="spark" className="w-4 h-4" />
                </button>
                <a href="/" className="vc-icon-btn !w-9 !h-9" title="Ver sitio web"><I name="eye" className="w-4 h-4" /></a>
              </div>
            </div>

            {/* Title + range */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center p-2 shadow-xs shrink-0 border border-neutral-800">
                  <img src="/images/vc-logo-white-symbol.png" alt="Vision Code" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400 font-mono leading-none">{sub}</div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 mt-1 leading-tight">{title}</h1>
                </div>
              </div>
              {['overview', 'campaigns', 'traffic'].includes(view) && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="vc-pill !h-8 text-[11px]"><I name="calendar" className="w-3.5 h-3.5" />{range.from.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} – {new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}</div>
                  <div className="flex items-center gap-1 rounded-full bg-[#f0f0f1] border border-neutral-200 p-0.5">
                    {(['today', '7d', '30d', '90d'] as RangeKey[]).map((k) => (
                      <button key={k} onClick={() => setRangeKey(k)}
                        className={`h-7 px-3 rounded-full text-[11px] font-semibold transition-all ${rangeKey === k ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'}`}>
                        {k === 'today' ? 'Hoy' : k === '7d' ? '7 días' : k === '30d' ? '30 días' : '90 días'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div key={view} className="vc-fade">
              {view === 'overview' && <Overview range={range} go={setView} />}
              {view === 'products' && <Products />}
              {view === 'clients' && <Clients />}
              {view === 'crm' && <Crm />}
              {view === 'cotizaciones' && <Cotizaciones activeProject={activeProject} />}
              {view === 'campaigns' && <Campaigns range={range} />}
              {view === 'inbox' && <Inbox />}
              {view === 'instagram' && <InstagramPublisher />}
              {view === 'traffic' && <Traffic range={range} />}
              {view === 'remuneraciones' && <Remuneraciones activeProject={activeProject} />}
              {view === 'facturacion' && <Facturacion activeProject={activeProject} />}
              {view === 'settings' && <Settings />}
            </div>
          </div>
        </main>
      </div>

      {/* Modal para Crear Nuevo Proyecto / Cliente */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-neutral-200 vc-fade">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime animate-pulse" />
                Agregar Nuevo Proyecto / Cliente
              </h3>
              <button
                type="button"
                onClick={() => setShowNewProjectModal(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
              >
                <I name="close" className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Configura un nuevo cliente con su sitio web, píxel de Meta y WhatsApp para gestionarlo directamente desde aquí.
            </p>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Nombre de la Empresa o Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="Ej. Tienda Streetwear / Clínica Dental"
                  className="vc-input w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  Sitio Web o Landing Page
                </label>
                <input
                  type="url"
                  value={newProjDomain}
                  onChange={(e) => setNewProjDomain(e.target.value)}
                  placeholder="https://cliente.cl"
                  className="vc-input w-full text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  ID del Píxel de Meta (Opcional)
                </label>
                <input
                  type="text"
                  value={newProjPixel}
                  onChange={(e) => setNewProjPixel(e.target.value)}
                  placeholder="Ej. 1234567890123456"
                  className="vc-input w-full text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  WhatsApp de Ventas
                </label>
                <input
                  type="text"
                  value={newProjPhone}
                  onChange={(e) => setNewProjPhone(e.target.value)}
                  placeholder="+56 9 XXXX XXXX"
                  className="vc-input w-full text-xs"
                />
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="vc-btn plain flex-1 !h-10 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="vc-btn flex-1 !h-10 text-xs font-bold bg-black text-white hover:bg-neutral-800"
                >
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
