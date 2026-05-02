'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Zap, LayoutDashboard, History,
  MessageSquare, Settings, Plus, ChevronRight, Fuel, UtensilsCrossed,
  Car, Package, ArrowUpRight, ArrowDownRight, Target, Bell,
  RefreshCw, Loader2, BarChart2, Wallet, LogOut
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, PieChart, Pie, Cell } from 'recharts';
import { createClient } from '@/lib/supabase';
import TransactionModal from '@/components/TransactionModal';
import { useRouter } from 'next/navigation';

// ────────────────────────────────
// Helpers
// ────────────────────────────────
const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Combustível': <Fuel size={16} />,
  'Alimentação': <UtensilsCrossed size={16} />,
  'Manutenção': <Car size={16} />,
  'Corrida': <Zap size={16} />,
  'Outros': <Package size={16} />,
};

const PIE_COLORS = ['#CCFF00', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];

type Transaction = {
  id: string;
  tipo: string;
  valor: number;
  categoria: string;
  descricao: string;
  contexto: string;
  ocorrencia_em: string;
};

// ────────────────────────────────
// Main Component
// ────────────────────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'extrato' | 'zap'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const supabase = createClient();

  const [userProfile, setUserProfile] = useState<{ id: string; nome: string } | null>(null);
  const router = useRouter();

  const fetchTransactions = async (userId: string, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('ocorrencia_em', { ascending: false })
      .limit(50);
    setTransactions((data as Transaction[]) || []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // Busca perfil na tabela users
      const { data: profile } = await supabase
        .from('users')
        .select('id, nome')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
        fetchTransactions(profile.id);
      } else {
        // Busca o nome nos metadados do Auth (salvo pela Kathy)
        const fullName = user.user_metadata?.full_name || 'Motorista';
        setUserProfile({ id: '', nome: fullName });
        fetchTransactions('');
      }
    };
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Aggregations
  const totalGanhos = transactions.filter(t => t.tipo === 'ganho').reduce((s, t) => s + Number(t.valor), 0);
  const totalGastos = transactions.filter(t => t.tipo === 'gasto').reduce((s, t) => s + Number(t.valor), 0);
  const saldo = totalGanhos - totalGastos;
  const metaDia = 300;
  const progressPct = Math.min((totalGanhos / metaDia) * 100, 100);

  // Chart data - last 7 days
  const chartData = (() => {
    const days: Record<string, { ganho: number; gasto: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      days[key] = { ganho: 0, gasto: 0 };
    }
    transactions.forEach(t => {
      const key = new Date(t.ocorrencia_em).toLocaleDateString('pt-BR', { weekday: 'short' });
      if (days[key]) days[key][t.tipo === 'ganho' ? 'ganho' : 'gasto'] += Number(t.valor);
    });
    return Object.entries(days).map(([name, v]) => ({ name, ...v }));
  })();

  // Pie chart data por categoria
  const catMap: Record<string, number> = {};
  transactions.filter(t => t.tipo === 'gasto').forEach(t => {
    catMap[t.categoria || 'Outros'] = (catMap[t.categoria || 'Outros'] || 0) + Number(t.valor);
  });
  const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-outfit select-none">
      {/* ── Status Bar ── */}
      <div className="h-safe-top bg-transparent" />

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 px-5 pt-5 pb-4 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#CCFF00] to-emerald-400 p-[2px]">
              <div className="w-full h-full rounded-[14px] bg-[#050505] flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Driver42" alt="avatar" />
              </div>
            </div>
            <div>
              <p className="text-[11px] text-white/40 font-medium uppercase tracking-widest">Bem-vindo de volta</p>
              <p className="text-[15px] font-bold leading-tight">{userProfile?.nome || 'Motorista'} 🚗</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { const uid = userProfile?.id || ''; fetchTransactions(uid, true); }}
              className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] active:scale-90 transition-all cursor-pointer"
            >
              <RefreshCw size={16} className={`text-white/50 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 active:scale-90 transition-all cursor-pointer group"
              title="Sair"
            >
              <LogOut size={16} className="text-rose-400 group-hover:text-rose-300" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-lg mx-auto px-5 pb-32 pt-5 space-y-5">

        {/* ── Lucro Real Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[28px] overflow-hidden p-6"
          style={{ background: 'linear-gradient(135deg, rgba(204,255,0,0.12) 0%, rgba(59,130,246,0.08) 100%)', border: '1px solid rgba(204,255,0,0.15)' }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#CCFF00]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest mb-1">Lucro Real do Mês</p>
          {loading ? (
            <div className="h-12 w-40 bg-white/5 rounded-xl animate-pulse mb-3" />
          ) : (
            <motion.h2
              key={saldo}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-4xl font-bold tracking-tight mb-3 ${saldo >= 0 ? 'text-[#CCFF00]' : 'text-rose-400'}`}
            >
              {fmt(saldo)}
            </motion.h2>
          )}

          {/* Meta Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] text-white/40 font-medium flex items-center gap-1.5">
                <Target size={11} /> Meta do dia: {fmt(metaDia)}
              </p>
              <p className="text-[11px] font-bold text-[#CCFF00]">{Math.round(progressPct)}%</p>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full bg-[#CCFF00] rounded-full"
              />
            </div>
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Ganhos" value={totalGanhos} up loading={loading} />
            <MiniStat label="Gastos" value={totalGastos} loading={loading} />
          </div>
        </motion.div>

        {/* ── Area Chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[24px] bg-white/[0.025] border border-white/[0.06] p-5"
        >
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-[#CCFF00]" />
              <p className="text-[13px] font-bold">Ganhos vs Gastos</p>
            </div>
            <p className="text-[11px] text-white/30 font-medium">Últimos 7 dias</p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gGanho" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#CCFF00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gGasto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                formatter={(v: number, n: string) => [fmt(v), n === 'ganho' ? 'Ganhos' : 'Gastos']}
              />
              <Area type="monotone" dataKey="ganho" stroke="#CCFF00" strokeWidth={2} fill="url(#gGanho)" />
              <Area type="monotone" dataKey="gasto" stroke="#ef4444" strokeWidth={2} fill="url(#gGasto)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Category Breakdown ── */}
        {pieData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-[24px] bg-white/[0.025] border border-white/[0.06] p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={16} className="text-[#3b82f6]" />
              <p className="text-[13px] font-bold">Onde foi o dinheiro?</p>
            </div>
            <div className="flex gap-4 items-center">
              <PieChart width={110} height={110}>
                <Pie data={pieData} cx={50} cy={50} innerRadius={28} outerRadius={50} dataKey="value" strokeWidth={0}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
              <div className="flex-1 space-y-2.5">
                {pieData.slice(0, 4).map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-[12px] text-white/60">{item.name}</span>
                    </div>
                    <span className="text-[12px] font-bold">{fmt(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Recent Transactions ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[24px] bg-white/[0.025] border border-white/[0.06] overflow-hidden"
        >
          <div className="flex justify-between items-center px-5 pt-5 pb-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <History size={16} className="text-[#CCFF00]" />
              <p className="text-[13px] font-bold">Últimos Lançamentos</p>
            </div>
            <button className="text-[11px] text-[#CCFF00] font-bold flex items-center gap-1 cursor-pointer">
              Ver todos <ChevronRight size={12} />
            </button>
          </div>

          {loading ? (
            <div className="p-5 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/5 rounded-full w-3/4 animate-pulse" />
                    <div className="h-2.5 bg-white/5 rounded-full w-1/2 animate-pulse" />
                  </div>
                  <div className="h-4 w-16 bg-white/5 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 px-5">
              <div className="w-14 h-14 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <MessageSquare size={22} className="text-white/20" />
              </div>
              <p className="text-[13px] text-white/30 text-center font-medium">
                Nenhum lançamento ainda.<br />Mande uma mensagem no WhatsApp! 🚀
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {transactions.slice(0, 8).map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3.5 px-5 py-4 active:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    tx.tipo === 'ganho'
                      ? 'bg-[#CCFF00]/10 text-[#CCFF00]'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {tx.tipo === 'ganho'
                      ? <ArrowUpRight size={18} />
                      : (CATEGORY_ICONS[tx.categoria] || <ArrowDownRight size={18} />)
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate">
                      {tx.descricao || tx.categoria || 'Lançamento'}
                    </p>
                    <p className="text-[11px] text-white/30 flex items-center gap-1.5 mt-0.5">
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        tx.contexto === 'trabalho' ? 'bg-blue-500/15 text-blue-400' : 'bg-white/10 text-white/40'
                      }`}>
                        {tx.contexto}
                      </span>
                      {new Date(tx.ocorrencia_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>

                  {/* Value */}
                  <p className={`text-[14px] font-bold flex-shrink-0 ${tx.tipo === 'ganho' ? 'text-[#CCFF00]' : 'text-rose-400'}`}>
                    {tx.tipo === 'ganho' ? '+' : '-'}{fmt(Number(tx.valor))}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── WhatsApp CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-[24px] p-5 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
          style={{ background: 'linear-gradient(135deg, rgba(37,211,102,0.12), rgba(37,211,102,0.05))', border: '1px solid rgba(37,211,102,0.2)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 flex items-center justify-center flex-shrink-0">
            <MessageSquare size={22} className="text-[#25D366]" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-bold mb-0.5">Registrar pelo WhatsApp</p>
            <p className="text-[11px] text-white/40">Mande "ganhei 80 reais" e pronto!</p>
          </div>
          <ChevronRight size={18} className="text-white/30" />
        </motion.div>

      </main>

      {/* ── FAB ── */}
      <motion.button
        onClick={() => setIsModalOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#CCFF00] text-[#050505] rounded-[20px] shadow-2xl shadow-[#CCFF00]/25 flex items-center justify-center z-50 cursor-pointer active:scale-90 transition-transform"
      >
        <Plus size={26} strokeWidth={3} />
      </motion.button>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-t border-white/[0.06] pb-safe">
        <div className="flex max-w-lg mx-auto">
          <NavTab icon={<LayoutDashboard size={20} />} label="Painel" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavTab icon={<History size={20} />} label="Extrato" active={activeTab === 'extrato'} onClick={() => setActiveTab('extrato')} />
          <div className="w-14 flex-shrink-0" /> {/* FAB space */}
          <NavTab icon={<MessageSquare size={20} />} label="Zap" active={activeTab === 'zap'} onClick={() => setActiveTab('zap')} />
          <NavTab icon={<Settings size={20} />} label="Config" onClick={() => {}} />
        </div>
      </nav>

      {/* ── Modal ── */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userProfile?.id}
        onSuccess={() => {
          if (userProfile?.id) {
            fetchTransactions(userProfile.id, true);
          }
        }}
      />
    </div>
  );
}

// ────────────────────────────────
// Sub-Components
// ────────────────────────────────
function MiniStat({ label, value, up, loading }: { label: string; value: number; up?: boolean; loading: boolean }) {
  return (
    <div className="bg-white/[0.04] rounded-2xl p-3.5 border border-white/[0.06]">
      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1.5">{label}</p>
      {loading ? (
        <div className="h-5 w-20 bg-white/10 rounded-lg animate-pulse" />
      ) : (
        <div className="flex items-center gap-1.5">
          {up
            ? <TrendingUp size={13} className="text-[#CCFF00]" />
            : <TrendingDown size={13} className="text-rose-400" />
          }
          <p className={`text-[15px] font-bold ${up ? 'text-[#CCFF00]' : 'text-rose-400'}`}>
            {fmt(value)}
          </p>
        </div>
      )}
    </div>
  );
}

function NavTab({ icon, label, active = false, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-1 py-3 cursor-pointer transition-colors"
    >
      <div className={`transition-colors ${active ? 'text-[#CCFF00]' : 'text-white/30'}`}>{icon}</div>
      <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${active ? 'text-[#CCFF00]' : 'text-white/20'}`}>
        {label}
      </span>
      {active && <div className="absolute bottom-0 w-8 h-0.5 bg-[#CCFF00] rounded-full" />}
    </button>
  );
}
