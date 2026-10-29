import React, { useEffect, useState } from 'react';
import { authFetch, fmt } from '../lib';
import { Card, I, Chip } from '../ui';
import type { ProductConfig } from '../../pages/api/admin/products';

export default function Products() {
  const [products, setProducts] = useState<ProductConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<ProductConfig | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);

  // Load products from API and local cache
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/admin/products');
      const data = await res.json();
      if (data.ok && Array.isArray(data.catalog)) {
        setProducts(data.catalog);
        localStorage.setItem('vc_products_config', JSON.stringify(data.catalog));
      } else {
        const saved = localStorage.getItem('vc_products_config');
        if (saved) setProducts(JSON.parse(saved));
      }
    } catch {
      const saved = localStorage.getItem('vc_products_config');
      if (saved) setProducts(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const showNotification = (type: 'ok' | 'err', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Save product changes
  const handleSaveProduct = async (productToSave: ProductConfig) => {
    setSaving(true);
    try {
      const updatedList = products.map(p => p.id === productToSave.id ? productToSave : p);
      if (!products.some(p => p.id === productToSave.id)) {
        updatedList.unshift(productToSave);
      }
      setProducts(updatedList);
      localStorage.setItem('vc_products_config', JSON.stringify(updatedList));

      const res = await authFetch('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({ product: productToSave })
      });
      const data = await res.json();
      if (data.ok) {
        showNotification('ok', `"${productToSave.name}" actualizado exitosamente.`);
      } else {
        showNotification('ok', 'Guardado localmente (modo offline).');
      }
    } catch {
      showNotification('ok', 'Guardado en la sesión local.');
    } finally {
      setSaving(false);
      setEditingProduct(null);
      setIsNewModalOpen(false);
    }
  };

  // Toggle active/paused
  const handleToggleActive = (id: string) => {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    const updated = { ...p, isActive: !p.isActive };
    handleSaveProduct(updated);
  };

  // Quick 2x price inflator helper for 50% discount strategy
  const handleInflateDouble = (p: ProductConfig) => {
    const updated = {
      ...p,
      originalPrice: p.price * 2,
      discount: "50% OFF"
    };
    handleSaveProduct(updated);
  };

  const filtered = products.filter(p => {
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      p.badge.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeCount = products.filter(p => p.isActive).length;
  const categories = [
    { id: 'all', label: 'Todos los Servicios' },
    { id: 'web', label: 'Desarrollo Web' },
    { id: 'legal', label: 'Constitución & Legal' },
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'software-ia', label: 'Software & IA' },
    { id: 'mensuales', label: 'Planes Mensuales (MRR)' },
    { id: 'promociones', label: 'Packs Promocionales' }
  ];

  return (
    <div className="space-y-4 vc-fade pb-16">
      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between shadow-lg text-xs font-bold ${
          notification.type === 'ok' ? 'bg-lime text-neutral-900 border border-neutral-900/10' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neutral-900 animate-ping" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100 flex items-center justify-center">
            <I name="close" className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── FILA 1: MÉTRICAS (Estilo VC·OS Dashboard) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Catálogo de Soluciones" action={<span className="vc-tag">En Línea</span>}>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-[34px] leading-none font-medium tracking-tight text-neutral-900">{products.length}</div>
              <div className="mt-1.5 text-[10.5px] uppercase tracking-wide text-neutral-500 font-medium">Servicios &amp; Planes Totales</div>
              <div className="mt-1 text-[11px] text-neutral-400">{activeCount} activos para venta y cotización</div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-200/80 flex items-center justify-between text-xs">
              <span className="text-neutral-500 text-[11px]">Disponibilidad:</span>
              <span className="font-bold text-neutral-800">{Math.round((activeCount / Math.max(products.length, 1)) * 100)}% operativo</span>
            </div>
          </div>
        </Card>

        <Card title="Estrategia Comercial Ancla" action={<span className="vc-tag bg-lime/40 border-lime/60 text-neutral-900 font-bold">50% DCTO</span>}>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-[34px] leading-none font-medium tracking-tight text-neutral-900">50% OFF</div>
              <div className="mt-1.5 text-[10.5px] uppercase tracking-wide text-neutral-500 font-medium">Anclaje de Valor al Doble</div>
              <div className="mt-1 text-[11px] text-emerald-600 font-semibold">Precios lista tachados activos</div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-200/80 flex items-center justify-between text-xs">
              <span className="text-neutral-500 text-[11px]">Conversión esperada:</span>
              <span className="font-bold text-neutral-800">Alta atracción cliente</span>
            </div>
          </div>
        </Card>

        <Card title="Pasarela Webpay Plus" action={<span className="vc-tag font-mono">1.49% + IVA</span>}>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-[28px] leading-none font-medium tracking-tight text-neutral-900">Transbank</div>
              <div className="mt-1.5 text-[10.5px] uppercase tracking-wide text-neutral-500 font-medium">Débito, Prepago &amp; Crédito</div>
              <div className="mt-1 text-[11px] text-emerald-600 font-semibold">Integración Webpay oficial lista</div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-200/80 flex items-center justify-between text-xs">
              <span className="text-neutral-500 text-[11px]">Liquidación:</span>
              <span className="font-bold text-neutral-800">24 a 48 hrs hábiles</span>
            </div>
          </div>
        </Card>

        <Card title="Mercado Pago Checkout" action={<span className="vc-tag font-mono">3.19% + IVA</span>}>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-[28px] leading-none font-medium tracking-tight text-neutral-900">Checkout Pro</div>
              <div className="mt-1.5 text-[10.5px] uppercase tracking-wide text-neutral-500 font-medium">Cuotas &amp; Dinero en Cuenta</div>
              <div className="mt-1 text-[11px] text-emerald-600 font-semibold">Cobros QR y links de pago</div>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-200/80 flex items-center justify-between text-xs">
              <span className="text-neutral-500 text-[11px]">Disponibilidad:</span>
              <span className="font-bold text-neutral-800">Inmediata</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── FILA 2: BARRA SISTEMÁTICA DE FILTROS ── */}
      <Card title="Configuración de Catálogo &amp; Precios" action={
        <button
          type="button"
          onClick={() => setIsNewModalOpen(true)}
          className="vc-btn plain !h-8 text-xs font-bold bg-lime text-neutral-900 hover:bg-lime/80 flex items-center gap-1.5 shadow-xs"
        >
          <I name="plus" className="w-3.5 h-3.5" />
          <span>+ Nuevo Servicio</span>
        </button>
      }>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-1">
          {/* Categories Pill Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map(cat => (
              <Chip
                key={cat.id}
                active={filterCategory === cat.id}
                onClick={() => setFilterCategory(cat.id)}
              >
                {cat.label}
              </Chip>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Buscar servicio o cupo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="vc-input !py-2 !pl-8 text-xs w-full bg-white"
            />
            <span className="absolute left-2.5 top-2.5 text-neutral-400">
              <I name="search" className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Card>

      {/* ── FILA 3: GRID DE PRODUCTOS SISTEMÁTICO ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(product => {
          const webpayFee = product.price > 0 ? Math.round(product.price * 0.0149 * 1.19) : 0;
          const netReceipt = product.price > 0 ? product.price - webpayFee : 0;

          return (
            <div
              key={product.id}
              className={`p-5 rounded-[22px] border transition-all duration-300 flex flex-col justify-between bg-white shadow-xs ${
                product.isActive
                  ? 'border-neutral-200/90 hover:border-neutral-400 hover:shadow-md'
                  : 'border-neutral-200/60 opacity-60 bg-neutral-50'
              }`}
            >
              <div>
                {/* Header Card */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    {product.categoryLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#f5f6f7] text-neutral-700 border border-neutral-200">
                      {product.badge || product.cupos}
                    </span>
                    <button
                      type="button"
                      title={product.isActive ? "Desactivar venta" : "Activar venta"}
                      onClick={() => handleToggleActive(product.id)}
                      className={`w-7 h-4 rounded-full transition-colors relative p-0.5 ${
                        product.isActive ? 'bg-lime' : 'bg-neutral-300'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full bg-neutral-900 transition-transform ${
                        product.isActive ? 'translate-x-3' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                <h3 className="text-[15px] font-bold text-neutral-900 tracking-tight leading-snug">
                  {product.name}
                </h3>
                <p className="text-xs text-neutral-500 mb-3.5 line-clamp-1">
                  {product.subtitle}
                </p>

                {/* Price Box */}
                <div className="p-3.5 rounded-xl bg-[#f5f6f7] border border-neutral-200/60 mb-3.5">
                  {product.originalPrice > 0 && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-neutral-400 line-through font-bold">
                        ${fmt.n(product.originalPrice)} CLP
                      </span>
                      <span className="px-2 py-0.2 rounded-full bg-lime text-neutral-900 text-[9px] font-black uppercase">
                        {product.discount || "50% OFF"}
                      </span>
                    </div>
                  )}

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-neutral-900 tracking-tight">
                      {product.price > 0 ? `$${fmt.n(product.price)}` : 'A Cotizar'}
                    </span>
                    <span className="text-[11px] font-bold text-neutral-500 uppercase">
                      {product.unit}
                    </span>
                  </div>

                  {product.price > 0 && (
                    <div className="text-[10px] text-neutral-400 mt-2 pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                      <span>Neto estimado Webpay:</span>
                      <span className="font-bold text-neutral-700">${fmt.n(netReceipt)} CLP</span>
                    </div>
                  )}
                </div>

                {/* Details & Specs */}
                <div className="space-y-1 text-xs text-neutral-600 mb-4 px-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Cupos / Disponibilidad:</span>
                    <span className="font-bold text-neutral-800">{product.cupos || "Sin límite"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Tiempo de Entrega:</span>
                    <span className="font-bold text-neutral-800">{product.delivery}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(product)}
                  className="flex-1 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all text-center"
                >
                  Configurar Valores
                </button>
                <button
                  type="button"
                  title="Duplicar precio original y fijar 50% OFF"
                  onClick={() => handleInflateDouble(product)}
                  className="px-2.5 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <I name="zap" className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.4} />
                  <span>2x OFF</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Product Modal */}
      {(editingProduct || isNewModalOpen) && (
        <ProductEditModal
          product={editingProduct || {
            id: `service_${Date.now()}`,
            name: '',
            subtitle: '',
            category: 'web',
            categoryLabel: 'Desarrollo Web',
            price: 150000,
            originalPrice: 300000,
            discount: '50% OFF',
            unit: 'CLP',
            badge: 'CUPOS LIMITADOS',
            isRecommended: false,
            isActive: true,
            cupos: 'Cupos Limitados',
            delivery: '5 a 7 días hábiles',
            desc: '',
            features: [],
            waMessage: 'Hola Vision Code, me interesa cotizar este servicio.'
          }}
          isNew={isNewModalOpen}
          saving={saving}
          onClose={() => {
            setEditingProduct(null);
            setIsNewModalOpen(false);
          }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}

// Modal Component for Editing Products
function ProductEditModal({
  product,
  isNew,
  saving,
  onClose,
  onSave
}: {
  product: ProductConfig;
  isNew: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (p: ProductConfig) => void;
}) {
  const [formData, setFormData] = useState<ProductConfig>({ ...product });

  const handleChange = (field: keyof ProductConfig, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'price' && typeof value === 'number') {
        updated.originalPrice = value * 2;
      }
      return updated;
    });
  };

  const webpayFee = formData.price > 0 ? Math.round(formData.price * 0.0149 * 1.19) : 0;
  const netReceipt = formData.price > 0 ? formData.price - webpayFee : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto vc-fade">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-lg font-black text-neutral-900">
              {isNew ? 'Nuevo Producto / Servicio' : `Editar: ${formData.name}`}
            </h3>
            <p className="text-xs text-neutral-500">
              Configura precios finales, precio regular inflado, cupos y pasarelas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors"
          >
            <I name="close" className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">Nombre del Servicio *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="vc-input w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">Subtítulo Comercial</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="vc-input w-full text-xs"
              />
            </div>
          </div>

          {/* Pricing Controls: The 50% Strategy Engine */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-lime" />
                Valores Comerciales &amp; Descuento
              </span>
              <button
                type="button"
                onClick={() => handleChange('originalPrice', formData.price * 2)}
                className="text-[10px] font-bold text-neutral-600 hover:text-black underline"
              >
                Duplicar Regular (2x)
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-600 mb-1">Precio Cobrado ($ CLP)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  className="vc-input w-full text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-600 mb-1">Precio Inflado Lista ($)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.originalPrice}
                  onChange={(e) => handleChange('originalPrice', parseFloat(e.target.value) || 0)}
                  className="vc-input w-full text-xs line-through text-neutral-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-600 mb-1">Badge Descuento</label>
                <input
                  type="text"
                  value={formData.discount}
                  onChange={(e) => handleChange('discount', e.target.value)}
                  placeholder="50% OFF"
                  className="vc-input w-full text-xs font-black text-lime-800"
                />
              </div>
            </div>

            {/* Gateway Calculator */}
            {formData.price > 0 && (
              <div className="text-[11px] bg-white p-2.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                <span className="text-neutral-500">Comisión Webpay (1.49% + IVA): <b>${fmt.n(webpayFee)} CLP</b></span>
                <span className="text-neutral-800 font-bold">Neto recibido: <b className="text-emerald-700">${fmt.n(netReceipt)} CLP</b></span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">Badge de Cupos / Estado</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => handleChange('badge', e.target.value)}
                placeholder="CUPOS LIMITADOS"
                className="vc-input w-full text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">Cupos / Disponibilidad</label>
              <input
                type="text"
                value={formData.cupos}
                onChange={(e) => handleChange('cupos', e.target.value)}
                placeholder="Ej. Cupos Limitados / 5 Cupos"
                className="vc-input w-full text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const cat = e.target.value as any;
                  const labels: Record<string, string> = {
                    'web': 'Desarrollo Web',
                    'legal': 'Constitución & Legal',
                    'ecommerce': 'E-Commerce',
                    'software-ia': 'Software & IA',
                    'mensuales': 'Suscripción',
                    'promociones': 'Pack Oferta'
                  };
                  handleChange('category', cat);
                  handleChange('categoryLabel', labels[cat] || cat);
                }}
                className="vc-input w-full text-xs"
              >
                <option value="web">Desarrollo Web</option>
                <option value="legal">Constitución &amp; Legal (SII)</option>
                <option value="ecommerce">Tiendas E-Commerce</option>
                <option value="software-ia">Software &amp; Agentes IA</option>
                <option value="mensuales">Planes Mensuales (MRR)</option>
                <option value="promociones">Packs Promocionales</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">Tiempo de Entrega</label>
              <input
                type="text"
                value={formData.delivery}
                onChange={(e) => handleChange('delivery', e.target.value)}
                placeholder="Ej. 5 a 7 días hábiles"
                className="vc-input w-full text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-700 mb-1">Descripción del Servicio</label>
            <textarea
              rows={2}
              value={formData.desc}
              onChange={(e) => handleChange('desc', e.target.value)}
              className="vc-input w-full text-xs"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="w-4 h-4 rounded text-lime focus:ring-0"
              />
              <span>Producto Activo para Venta</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800 ml-4">
              <input
                type="checkbox"
                checked={formData.isRecommended}
                onChange={(e) => handleChange('isRecommended', e.target.checked)}
                className="w-4 h-4 rounded text-lime focus:ring-0"
              />
              <span>Destacado (Recomendado)</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-lime text-neutral-900 hover:bg-lime/90 flex items-center gap-2 shadow-xs"
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
