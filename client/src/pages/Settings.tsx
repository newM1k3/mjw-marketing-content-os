// Settings — Brand management, user management, and configuration
import { useState } from "react";
import { store, type Brand, type User } from "@/lib/store";
import { brandClass } from "@/lib/utils";
import { Plus, X, Edit2, Trash2, Save, Users, Building2, Key } from "lucide-react";
import { toast } from "sonner";

type Tab = 'brands' | 'users' | 'integrations';

function BrandForm({ brand, onSave, onCancel }: {
  brand?: Brand;
  onSave: (b: Omit<Brand, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    id: brand?.id,
    name: brand?.name ?? '',
    url: brand?.url ?? '',
    toneOfVoice: brand?.toneOfVoice ?? '',
    targetAudience: brand?.targetAudience ?? '',
    defaultCta: brand?.defaultCta ?? '',
    locationKeyword: brand?.locationKeyword ?? '',
    color: brand?.color ?? '#6ee7f7',
  });

  return (
    <div className="rounded-xl border p-5 space-y-3" style={{ background: '#252d3d', borderColor: '#2d3748' }}>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Brand Name *', key: 'name' },
          { label: 'Website URL', key: 'url' },
          { label: 'Default CTA', key: 'defaultCta' },
          { label: 'Location Keyword', key: 'locationKeyword' },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="block text-xs mb-1" style={{ color: '#64748b' }}>{label}</label>
            <input value={(form as Record<string, string>)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }} />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Tone of Voice</label>
        <textarea value={form.toneOfVoice} onChange={e => setForm(f => ({ ...f, toneOfVoice: e.target.value }))}
          rows={2} className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
          style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }} />
      </div>
      <div>
        <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Target Audience</label>
        <textarea value={form.targetAudience} onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value }))}
          rows={2} className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
          style={{ background: '#1a1f2e', borderColor: '#2d3748', color: '#e2e8f0' }} />
      </div>
      <div>
        <label className="block text-xs mb-1" style={{ color: '#64748b' }}>Brand Color</label>
        <div className="flex items-center gap-2">
          <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
            className="w-10 h-8 rounded border cursor-pointer" style={{ borderColor: '#2d3748' }} />
          <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{form.color}</span>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg text-sm border" style={{ borderColor: '#2d3748', color: '#64748b' }}>Cancel</button>
        <button onClick={() => {
          if (!form.name.trim()) { toast.error('Brand name required'); return; }
          onSave(form);
        }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium"
          style={{ background: '#6ee7f7', color: '#0f1117' }}>
          <Save size={13} /> Save Brand
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('brands');
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const brands = store.getBrands();
  const users = store.getUsers();

  const handleSaveBrand = (b: Omit<Brand, 'id'> & { id?: string }) => {
    if (b.id) {
      store.updateBrand(b.id, b);
      setEditingBrandId(null);
    } else {
      store.addBrand(b as Omit<Brand, 'id'>);
      setShowAddBrand(false);
    }
    toast.success('Brand saved');
    refresh();
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'brands', label: 'Brands', icon: Building2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Key },
  ];

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Manage brands, users, and integrations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: '#2d3748' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all"
            style={activeTab === id
              ? { color: '#6ee7f7', borderColor: '#6ee7f7' }
              : { color: '#64748b', borderColor: 'transparent' }
            }>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Brands Tab */}
      {activeTab === 'brands' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddBrand(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(110,231,247,0.1)', color: '#6ee7f7', border: '1px solid rgba(110,231,247,0.25)' }}>
              <Plus size={14} /> Add Brand
            </button>
          </div>

          {showAddBrand && (
            <BrandForm onSave={handleSaveBrand} onCancel={() => setShowAddBrand(false)} />
          )}

          {brands.map(brand => (
            <div key={brand.id}>
              {editingBrandId === brand.id ? (
                <BrandForm brand={brand} onSave={handleSaveBrand} onCancel={() => setEditingBrandId(null)} />
              ) : (
                <div className="rounded-xl border p-5" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: brand.color }} />
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>{brand.name}</h3>
                        <a href={brand.url} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: '#64748b' }}>{brand.url}</a>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingBrandId(brand.id)} className="p-1.5 rounded hover:bg-white/5">
                        <Edit2 size={13} style={{ color: '#64748b' }} />
                      </button>
                      <button onClick={() => { store.deleteBrand(brand.id); toast.success('Brand deleted'); refresh(); }}
                        className="p-1.5 rounded hover:bg-red-500/10">
                        <Trash2 size={13} style={{ color: '#64748b' }} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: '#64748b' }}>Default CTA</p>
                      <p style={{ color: '#94a3b8' }}>{brand.defaultCta || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: '#64748b' }}>Location Keyword</p>
                      <p style={{ color: '#94a3b8' }}>{brand.locationKeyword || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs mb-0.5" style={{ color: '#64748b' }}>Tone of Voice</p>
                      <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>{brand.toneOfVoice || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs mb-0.5" style={{ color: '#64748b' }}>Target Audience</p>
                      <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>{brand.targetAudience || '—'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => toast.info('User management requires PocketBase auth — coming in Tier 2')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(110,231,247,0.1)', color: '#6ee7f7', border: '1px solid rgba(110,231,247,0.25)' }}>
              <Plus size={14} /> Invite User
            </button>
          </div>
          {users.map(user => (
            <div key={user.id} className="flex items-center gap-4 rounded-xl border p-4"
              style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg, #6ee7f7 0%, #a78bfa 100%)', color: '#0f1117' }}>
                {user.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{user.name}</p>
                <p className="text-xs" style={{ color: '#64748b' }}>{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: user.role === 'Admin' ? 'rgba(167,139,250,0.12)' : 'rgba(110,231,247,0.12)',
                    color: user.role === 'Admin' ? '#a78bfa' : '#6ee7f7',
                    border: `1px solid ${user.role === 'Admin' ? 'rgba(167,139,250,0.3)' : 'rgba(110,231,247,0.3)'}` }}>
                  {user.role}
                </span>
                <div className="flex flex-wrap gap-1">
                  {user.brandIds.map(bid => {
                    const brand = brands.find(b => b.id === bid);
                    return brand ? (
                      <span key={bid} className={`text-xs px-1.5 py-0.5 rounded-full ${brandClass(bid)}`}>{brand.name}</span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-xl border p-4 mt-2" style={{ background: 'rgba(167,139,250,0.05)', borderColor: 'rgba(167,139,250,0.2)' }}>
            <p className="text-xs" style={{ color: '#a78bfa' }}>
              Full user management (invite, roles, brand access) will be enabled when connected to PocketBase at{' '}
              <span className="font-mono">https://mjwdesign-core.pockethost.io</span>
            </p>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-4">
          {[
            {
              name: 'PocketBase',
              description: 'Backend database and authentication',
              status: 'Configured',
              url: 'https://mjwdesign-core.pockethost.io',
              color: '#34d399',
              note: 'Tier 2 upgrade required to activate'
            },
            {
              name: 'OpenAI',
              description: 'AI content generation (GPT-4o-mini)',
              status: 'Requires API Key',
              url: 'https://platform.openai.com',
              color: '#fbbf24',
              note: 'Set your API key in AI Studio'
            },
            {
              name: 'Google Business Profile',
              description: 'Auto-publish GBP posts',
              status: 'Not Connected',
              url: 'https://business.google.com',
              color: '#f87171',
              note: 'Requires OAuth setup in Tier 2'
            },
          ].map(integration => (
            <div key={integration.name} className="rounded-xl border p-5" style={{ background: '#1a1f2e', borderColor: '#2d3748' }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold" style={{ color: '#e2e8f0', fontFamily: "'Space Grotesk', sans-serif" }}>{integration.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${integration.color}18`, color: integration.color }}>
                      {integration.status}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: '#64748b' }}>{integration.description}</p>
                  <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{integration.note}</p>
                </div>
                <a href={integration.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid #2d3748' }}>
                  Configure
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
