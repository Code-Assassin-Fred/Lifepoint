'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import {
    Heart,
    ShieldCheck,
    Gift,
    History,
    TrendingUp,
    ChevronRight,
    CreditCard,
    Zap,
    Users,
    Globe
} from 'lucide-react';

export default function GivePage() {
    const { user } = useAuth();
    const [amount, setAmount] = useState('50');
    const [frequency, setFrequency] = useState('One-time');
    const [projects, setProjects] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ raisedThisMonth: '$0', familiesHelped: '0' });
    const [loading, setLoading] = useState(true);

    const suggestedAmounts = ['10', '25', '50', '100', '250', 'Custom'];

    useEffect(() => {
        const fetchSupport = async () => {
            try {
                const url = user ? `/api/user/support?userId=${user.uid}` : '/api/user/support';
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data.projects);
                    setHistory(data.history);
                    setStats({
                        raisedThisMonth: `$${(data.stats.raisedThisMonth / 1000).toFixed(0)}k+`,
                        familiesHelped: data.stats.familiesHelped.toLocaleString()
                    });
                }
            } catch (error) {
                console.error('Failed to fetch support data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSupport();
    }, [user]);

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-20 pt-4">
            {/* Hero Section */}
            <div className="bg-zinc-900 rounded-[3rem] p-12 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ccf381]/5 rounded-full blur-[120px] -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-[#ccf381]/10" />

                <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="w-16 h-16 bg-[#ccf381] text-black rounded-3xl flex items-center justify-center mb-10 rotate-3 shadow-xl shadow-[#ccf381]/20">
                            <Heart size={32} fill="currentColor" />
                        </div>
                        <h1 className="text-5xl font-black mb-6 leading-[1.1]">Your Generosity <br />Changes Lives.</h1>
                        <p className="text-zinc-400 font-bold text-lg leading-relaxed mb-10 max-w-md">
                            Together, we can fulfill the mission of Lifepoint and reach our community with the love of Christ.
                        </p>

                        <div className="flex flex-wrap gap-8">
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-[#ccf381]">{stats.raisedThisMonth}</span>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Raised this month</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-[#ccf381]">{stats.familiesHelped}</span>
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Families Helped</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 text-zinc-900 shadow-2xl">
                        <div className="flex gap-2 p-1 bg-zinc-50 rounded-2xl mb-8">
                            {['One-time', 'Monthly', 'Annual'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFrequency(f)}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${frequency === f ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {suggestedAmounts.map(a => (
                                <button
                                    key={a}
                                    onClick={() => setAmount(a)}
                                    className={`py-6 rounded-2xl border-2 font-black transition-all ${amount === a
                                            ? 'bg-[#ccf381]/10 border-[#ccf381] text-black'
                                            : 'border-zinc-50 text-zinc-400 hover:border-zinc-200'
                                        }`}
                                >
                                    {a === 'Custom' ? 'OTHER' : `$${a}`}
                                </button>
                            ))}
                        </div>

                        {amount === 'Custom' && (
                            <div className="relative mb-8">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-2xl group-focus-within:text-black">$</span>
                                <input
                                    type="number"
                                    className="w-full pl-12 pr-6 py-6 bg-zinc-50 border border-zinc-100 rounded-3xl text-2xl font-black outline-none focus:ring-4 focus:ring-[#ccf381]/20 focus:border-[#ccf381] transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                        )}

                        <button className="w-full py-6 bg-zinc-900 text-white rounded-[2.5rem] font-black text-sm tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#0d9488] transition-all shadow-xl shadow-zinc-200">
                            <CreditCard size={20} />
                            CONTINUE TO GIVE
                        </button>

                        <div className="mt-6 flex items-center justify-center gap-2 text-zinc-400">
                            <ShieldCheck size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">SECURE SSL ENCRYPTED</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Impact Projects */}
            <div className="px-4 space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-zinc-900 mb-2">Ongoing Projects</h2>
                        <p className="text-zinc-500 font-bold text-sm">Where your contributions are making a difference today.</p>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project, i) => {
                        const Icon = project.icon === 'Globe' ? Globe : project.icon === 'Zap' ? Zap : Users;
                        return (
                            <div key={i} className="bg-white rounded-[3rem] p-10 border border-zinc-100 shadow-sm group hover:-translate-y-2 transition-all duration-500">
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`w-14 h-14 ${project.color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                        <Icon size={24} />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{project.progress}% FUNDED</span>
                                </div>

                                <h3 className="text-xl font-black text-zinc-900 mb-3">{project.title}</h3>

                                <div className="space-y-4">
                                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${project.color} transition-all duration-1000`}
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center font-black text-[10px] uppercase tracking-widest">
                                        <div className="flex flex-col">
                                            <span className="text-zinc-400">Raised</span>
                                            <span className="text-zinc-900 text-sm">${(project.raised / 1000).toFixed(0)}k</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-zinc-400">Goal</span>
                                            <span className="text-zinc-900 text-sm">${(project.goal / 1000000).toFixed(1)}M</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* History Section */}
            <div className="px-4">
                <div className="bg-white rounded-[3rem] p-10 border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400">
                                <History size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-zinc-900">Recent Contributions</h3>
                        </div>
                        <button className="text-[10px] font-black text-[#0d9488] hover:text-zinc-900 uppercase tracking-widest">Download statement</button>
                    </div>

                    <div className="space-y-4">
                        {history.length === 0 ? (
                            <div className="py-20 text-center text-zinc-400 font-bold border border-dashed border-zinc-200 rounded-3xl">
                                No contribution history yet.
                            </div>
                        ) : (
                            history.map((tx) => (
                                <div key={tx.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-zinc-50 rounded-3xl border border-zinc-100 group transition-all hover:bg-white hover:shadow-xl">
                                    <div className="flex items-center gap-6 mb-4 md:mb-0">
                                        <span className="text-sm font-black text-zinc-900">${tx.amount}</span>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900">{tx.method || 'Contribution'}</p>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Reference {tx.id.slice(0, 5)} • {tx.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Succeeded</span>
                                        <ChevronRight size={18} className="text-zinc-200 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
