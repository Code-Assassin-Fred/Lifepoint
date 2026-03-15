'use client';

import { useState } from 'react';

export default function GivePage() {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-20 pt-4">
            {/* Hero Section */}
            <div className="bg-zinc-900 rounded-md p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ccf381]/5 rounded-full blur-[120px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0d9488]/10 rounded-full blur-[100px] -ml-32 -mb-32" />

                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-5xl font-black mb-6 leading-[1.1]">Your Generosity <br />Changes Lives.</h1>
                    <p className="text-zinc-400 font-bold text-lg leading-relaxed max-w-md">
                        Together, we can fulfill the mission of Lifepoint and reach our community with the love of Christ. Choose your preferred giving method below.
                    </p>
                </div>
            </div>

            {/* Giving Methods Grid */}
            <div className="grid gap-8 md:grid-cols-2 px-2">
                {/* M-Pesa Paybill Card */}
                <div className="bg-white rounded-md p-10 border border-zinc-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#ccf381]/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-[#ccf381]/20 transition-all duration-700" />

                    <div className="relative z-10">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-zinc-900">M-Pesa Paybill</h2>
                            <p className="text-xs font-black text-[#0d9488] uppercase tracking-widest mt-1">Mobile Payment</p>
                        </div>

                        {/* Paybill Details */}
                        <div className="space-y-4 mb-8">
                            <div className="bg-zinc-50 rounded-md p-6 border border-zinc-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Paybill Number</p>
                                        <p className="text-3xl font-black text-zinc-900 tracking-tight">124553</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard('124553', 'paybill')}
                                        className="px-4 py-2 bg-white rounded-md border border-zinc-200 hover:bg-[#ccf381] hover:border-[#ccf381] transition-all shadow-sm text-xs font-bold text-zinc-600 hover:text-black"
                                    >
                                        {copiedField === 'paybill' ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-zinc-50 rounded-md p-6 border border-zinc-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Account Name</p>
                                        <p className="text-3xl font-black text-zinc-900 tracking-tight">LifePoint V</p>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard('LifePoint V', 'account')}
                                        className="px-4 py-2 bg-white rounded-md border border-zinc-200 hover:bg-[#ccf381] hover:border-[#ccf381] transition-all shadow-sm text-xs font-bold text-zinc-600 hover:text-black"
                                    >
                                        {copiedField === 'account' ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="bg-[#0d9488]/5 rounded-md p-6 border border-[#0d9488]/10">
                            <h4 className="text-xs font-black text-[#0d9488] uppercase tracking-widest mb-4">How to Give via M-Pesa</h4>
                            <div className="space-y-3">
                                {[
                                    'Go to M-Pesa on your phone',
                                    'Select Lipa na M-Pesa → Pay Bill',
                                    'Enter Business Number: 124553',
                                    'Enter Account Number: LifePoint V',
                                    'Enter amount and confirm'
                                ].map((step, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-[#0d9488] text-white rounded-md flex items-center justify-center text-xs font-black">
                                            {i + 1}
                                        </span>
                                        <p className="text-sm font-bold text-zinc-700 pt-0.5">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Denari Online Card */}
                <div className="bg-white rounded-md p-10 border border-zinc-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#0d9488]/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-[#0d9488]/20 transition-all duration-700" />

                    <div className="relative z-10">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-zinc-900">Give Online</h2>
                            <p className="text-xs font-black text-[#0d9488] uppercase tracking-widest mt-1">Denari Online</p>
                        </div>

                        {/* Description */}
                        <div className="mb-8">
                            <p className="text-zinc-600 font-bold leading-relaxed mb-6">
                                Give securely online through our Denari Online portal. You can make one-time or recurring donations using various payment methods.
                            </p>

                            <div className="bg-zinc-50 rounded-md p-8 border border-zinc-100 text-center">
                                <h3 className="text-xl font-black text-zinc-900 mb-2">Denari Online Portal</h3>
                                <p className="text-sm font-bold text-zinc-500 mb-6">Secure online giving platform</p>
                                <a
                                    href="https://cmnetwork.denarionline.com/Donate/?missionary=LifePoin"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#0d9488] text-white rounded-md font-black text-sm tracking-widest hover:bg-[#0d9488]/90 transition-all shadow-xl shadow-[#0d9488]/20"
                                >
                                    DONATE NOW
                                </a>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="bg-[#ccf381]/10 rounded-md p-6 border border-[#ccf381]/20">
                            <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest mb-4">Online Giving Benefits</h4>
                            <div className="space-y-3">
                                {[
                                    'Secure SSL encrypted transactions',
                                    'Set up recurring donations',
                                    'Instant confirmation receipt',
                                    'Multiple payment methods accepted'
                                ].map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] flex-shrink-0" />
                                        <p className="text-sm font-bold text-zinc-700">{benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="mx-2 p-12 bg-zinc-900 rounded-md text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ccf381]/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                <div className="relative z-10 text-center max-w-xl mx-auto">
                    <h2 className="text-3xl font-black mb-4">Every Gift Makes an Impact</h2>
                    <p className="text-zinc-400 font-bold leading-relaxed mb-8">
                        Your generosity funds community outreach, youth programs, and supports families in need. Thank you for being part of the Lifepoint mission.
                    </p>
                    <span className="text-sm font-black uppercase tracking-widest text-[#ccf381]">God Loves a Cheerful Giver — 2 Corinthians 9:7</span>
                </div>
            </div>
        </div>
    );
}
