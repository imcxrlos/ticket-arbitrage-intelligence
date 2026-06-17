import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import GhostNav from "@/components/GhostNav";
import { Bell, Plus, Trash2, Lock, ToggleLeft, ToggleRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const defaultConfig = {
  match_filter: "",
  city_filter: "",
  category_filter: "",
  max_price: "",
  min_score: 70,
  min_discount: 15,
  alert_email: true,
  alert_sms: false,
  alert_push: true,
  phone_number: "",
  is_active: true,
};

export default function Alerts() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultConfig);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUser(u); loadAlerts(u.id); })
      .catch(() => setLoading(false));
  }, []);

  const loadAlerts = async (userId) => {
    setLoading(true);
    try {
      const data = await base44.entities.AlertConfig.filter({ user_id: userId }, "-created_date");
      setAlerts(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const created = await base44.entities.AlertConfig.create({ ...form, user_id: user.id, max_price: form.max_price ? Number(form.max_price) : undefined });
      setAlerts(prev => [created, ...prev]);
      setShowForm(false);
      setForm(defaultConfig);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await base44.entities.AlertConfig.delete(id);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleToggle = async (alert) => {
    const updated = await base44.entities.AlertConfig.update(alert.id, { is_active: !alert.is_active });
    setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, is_active: !a.is_active } : a));
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <GhostNav user={null} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Lock className="w-8 h-8 text-white/20 mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-white mb-2">Sign in to manage alerts</h2>
            <p className="text-sm text-white/35 mb-6">Get notified the instant an opportunity appears</p>
            <Link to="/login" className="h-10 px-6 bg-white text-black text-sm font-semibold rounded hover:bg-white/90 transition-all inline-flex items-center">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <GhostNav user={user} />
      <div className="pt-20 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end justify-between mb-8 pt-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-white mb-1">Alerts</h1>
              <p className="text-sm text-white/30 font-mono">{alerts.length} active alert {alerts.length !== 1 ? "configs" : "config"}</p>
            </div>
            <button
              onClick={() => setShowForm(v => !v)}
              className={`h-8 px-4 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${showForm ? "bg-white text-black" : "glass border border-white/10 text-white/60 hover:text-white"}`}
            >
              <Plus className="w-3.5 h-3.5" />
              New Alert
            </button>
          </div>

          {/* Alert form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass-card rounded-lg p-5 mb-5 border border-white/8">
                  <h3 className="font-display text-sm font-semibold text-white mb-4">Configure Alert</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="col-span-2">
                      <label className="text-[10px] text-white/25 font-mono uppercase tracking-wider block mb-1.5">Match filter (optional)</label>
                      <input value={form.match_filter} onChange={e => setForm(f => ({ ...f, match_filter: e.target.value }))}
                        placeholder="e.g. Argentina, Brazil, USA..."
                        className="w-full h-9 px-3 bg-black/40 border border-white/8 rounded text-sm text-white placeholder:text-white/20 font-mono outline-none focus:border-white/20 transition-colors" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/25 font-mono uppercase tracking-wider block mb-1.5">City</label>
                      <input value={form.city_filter} onChange={e => setForm(f => ({ ...f, city_filter: e.target.value }))}
                        placeholder="Any city"
                        className="w-full h-9 px-3 bg-black/40 border border-white/8 rounded text-sm text-white placeholder:text-white/20 font-mono outline-none focus:border-white/20 transition-colors" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/25 font-mono uppercase tracking-wider block mb-1.5">Max Price ($)</label>
                      <input type="number" value={form.max_price} onChange={e => setForm(f => ({ ...f, max_price: e.target.value }))}
                        placeholder="Any"
                        className="w-full h-9 px-3 bg-black/40 border border-white/8 rounded text-sm text-white placeholder:text-white/20 font-mono outline-none focus:border-white/20 transition-colors" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/25 font-mono uppercase tracking-wider block mb-1.5">Min Score (0–100)</label>
                      <input type="number" min={0} max={100} value={form.min_score} onChange={e => setForm(f => ({ ...f, min_score: Number(e.target.value) }))}
                        className="w-full h-9 px-3 bg-black/40 border border-white/8 rounded text-sm text-white font-mono outline-none focus:border-white/20 transition-colors" />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/25 font-mono uppercase tracking-wider block mb-1.5">Min Discount (%)</label>
                      <input type="number" min={0} max={100} value={form.min_discount} onChange={e => setForm(f => ({ ...f, min_discount: Number(e.target.value) }))}
                        className="w-full h-9 px-3 bg-black/40 border border-white/8 rounded text-sm text-white font-mono outline-none focus:border-white/20 transition-colors" />
                    </div>
                  </div>

                  {/* Alert channels */}
                  <div className="border-t border-white/6 pt-4 mb-4">
                    <p className="text-[10px] text-white/25 font-mono uppercase tracking-wider mb-3">Alert Channels</p>
                    <div className="flex gap-4">
                      {[
                        { key: "alert_email", label: "Email" },
                        { key: "alert_push", label: "In-App" },
                        { key: "alert_sms", label: "SMS" },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <div className={`w-8 h-4 rounded-full transition-colors relative ${form[key] ? "bg-white" : "bg-white/10"}`}
                            onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}>
                            <div className={`w-3 h-3 bg-black rounded-full absolute top-0.5 transition-transform ${form[key] ? "translate-x-4.5 left-0.5" : "left-0.5"}`} />
                          </div>
                          <span className="text-xs text-white/50 font-mono">{label}</span>
                        </label>
                      ))}
                    </div>
                    {form.alert_sms && (
                      <div className="mt-3">
                        <label className="text-[10px] text-white/25 font-mono uppercase tracking-wider block mb-1.5">Phone Number</label>
                        <input value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))}
                          placeholder="+1 555 000 0000"
                          className="w-full h-9 px-3 bg-black/40 border border-white/8 rounded text-sm text-white placeholder:text-white/20 font-mono outline-none focus:border-white/20 transition-colors" />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className="h-9 px-5 bg-white text-black text-xs font-semibold rounded hover:bg-white/90 transition-all disabled:opacity-50">
                      {saving ? "Saving..." : "Create Alert"}
                    </button>
                    <button onClick={() => { setShowForm(false); setForm(defaultConfig); }}
                      className="h-9 px-4 glass border border-white/10 rounded text-xs text-white/50 hover:text-white transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Alert list */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 glass-card rounded-lg shimmer" />)}
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-24 text-center">
              <Bell className="w-8 h-8 text-white/15 mx-auto mb-4" />
              <p className="text-sm text-white/30 font-mono mb-1">No alerts configured</p>
              <p className="text-xs text-white/15 font-mono">Create an alert to get notified when opportunities appear</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <motion.div key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className={`glass-card rounded-lg p-4 flex items-center gap-4 transition-all ${!alert.is_active ? "opacity-50" : ""}`}
                  >
                    <div className={`w-1 h-10 rounded-full shrink-0 ${alert.is_active ? "bg-ghost-green" : "bg-white/15"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-sm font-semibold text-white mb-1">
                        {alert.match_filter || "All Matches"}
                        {alert.city_filter ? ` · ${alert.city_filter}` : ""}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-white/30 font-mono">
                        {alert.max_price && <span>Max ${alert.max_price}</span>}
                        <span>Score ≥{alert.min_score}</span>
                        <span>Discount ≥{alert.min_discount}%</span>
                        <div className="flex items-center gap-1.5">
                          {alert.alert_email && <span className="text-white/40">Email</span>}
                          {alert.alert_push && <span className="text-white/40">In-App</span>}
                          {alert.alert_sms && <span className="text-white/40">SMS</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleToggle(alert)}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 transition-colors">
                      {alert.is_active
                        ? <ToggleRight className="w-5 h-5 text-white/50" />
                        : <ToggleLeft className="w-5 h-5 text-white/20" />
                      }
                    </button>
                    <button onClick={() => handleDelete(alert.id)}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/5 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-white/20 hover:text-white/50 transition-colors" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}