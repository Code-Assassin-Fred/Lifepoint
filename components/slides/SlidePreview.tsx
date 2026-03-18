'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { SlideData } from '@/lib/utils/pptGenerator';

interface SlidePreviewProps {
    slides: SlideData[];
    title: string;
    subtitle?: string;
    onUpdateSlide: (index: number, field: keyof SlideData, value: string) => void;
}

const BG_PATTERNS = {
    dots: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
    waves: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'20\' viewBox=\'0 0 100 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 13 50 13s16.36 2.347 25.96 5.937l1.768.661c.368.138.731.272 1.088.402H21.184z\' fill=\'%23ffffff\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
    none: 'none'
};

export default function SlidePreview({ slides, title, subtitle, onUpdateSlide }: SlidePreviewProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, duration: 30 });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
    }, [emblaApi, onSelect]);

    const scrollTo = (index: number) => emblaApi && emblaApi.scrollTo(index);

    const renderSlide = (slide: SlideData, index: number) => {
        const variant = slide.layoutVariant || 'standard_bullets';
        const accentColor = slide.accentColor || '#CCF381';
        const bgPattern = slide.bgPattern === 'dots' ? BG_PATTERNS.dots : slide.bgPattern === 'waves' ? BG_PATTERNS.waves : 'none';

        const slideStyle: React.CSSProperties = {
            backgroundColor: '#0F172A',
            backgroundImage: bgPattern,
            backgroundSize: slide.bgPattern === 'dots' ? '30px 30px' : 'auto',
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden'
        };

        // RENDER LOGIC PER VARIANT
        switch (variant) {
            case 'hero_centered':
                return (
                    <div style={slideStyle} className="flex flex-col items-center justify-center p-20 text-center">
                        <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: accentColor }} />
                        <h1 className="text-6xl font-black uppercase tracking-tighter mb-6" style={{ color: accentColor }}>
                            {slide.title}
                        </h1>
                        <p className="text-2xl text-white italic opacity-80 font-medium max-w-3xl leading-relaxed">
                            {slide.body}
                        </p>
                    </div>
                );

            case 'hero_split':
                return (
                    <div style={slideStyle} className="flex h-full">
                        <div className="w-1/2 p-16 flex flex-col justify-center border-r border-white/5">
                            <h1 className="text-5xl font-black uppercase tracking-tight mb-6 text-white leading-[1.1]">
                                {slide.title}
                            </h1>
                            <div className="w-20 h-2 mb-6" style={{ backgroundColor: accentColor }} />
                        </div>
                        <div className="w-1/2 p-16 flex items-center justify-center bg-white/5">
                            <p className="text-2xl text-white italic opacity-90 font-medium leading-relaxed">
                                {slide.body}
                            </p>
                        </div>
                    </div>
                );

            case 'split_content':
                return (
                    <div style={slideStyle} className="flex h-full">
                        <div className="w-2/5 p-12 flex flex-col justify-start">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1.5 h-10" style={{ backgroundColor: accentColor }} />
                                <h2 className="text-3xl font-black text-white uppercase">{slide.title}</h2>
                            </div>
                            {slide.scripture && (
                                <div className="mt-auto p-6 rounded-lg bg-white/5 border border-white/10 italic text-sm" style={{ color: accentColor }}>
                                    {slide.scripture}
                                </div>
                            )}
                        </div>
                        <div className="w-3/5 p-12 flex flex-col justify-center bg-white/[0.02] border-l border-white/5">
                            <ul className="space-y-6">
                                {String(slide.body || '').split('\n').filter(l => l.trim()).map((line, i) => (
                                    <li key={i} className="text-xl text-white font-medium flex gap-4">
                                        <span style={{ color: accentColor }}>▸</span>
                                        <span>{line.replace(/^[•\-\d\.]\s*/, '')}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                );

            case 'key_points_grid':
                return (
                    <div style={slideStyle} className="flex flex-col p-12">
                        <h2 className="text-3xl font-black text-white uppercase mb-10 text-center tracking-widest">{slide.title}</h2>
                        <div className="grid grid-cols-2 gap-6 flex-1">
                            {String(slide.body || '').split('\n').filter(l => l.trim()).map((line, i) => (
                                <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-center">
                                    <div className="text-3xl font-black mb-2 opacity-20" style={{ color: accentColor }}>0{i + 1}</div>
                                    <p className="text-lg text-white font-bold leading-snug">{line.replace(/^[•\-\d\.]\s*/, '')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'centered_quote':
                return (
                    <div style={slideStyle} className="flex flex-col items-center justify-center p-20 text-center relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ backgroundColor: accentColor }} />
                        <span className="text-9xl absolute top-10 left-20 opacity-10 font-serif" style={{ color: accentColor }}>"</span>
                        <p className="text-4xl text-white italic leading-[1.4] font-medium z-10 max-w-4xl">
                            {slide.scripture || slide.body}
                        </p>
                        <div className="mt-12 h-0.5 w-24" style={{ backgroundColor: accentColor }} />
                        <p className="mt-8 text-2xl font-black uppercase tracking-[0.3em] z-10" style={{ color: accentColor }}>
                            — {slide.title}
                        </p>
                    </div>
                );

            case 'numbered_steps':
                return (
                    <div style={slideStyle} className="flex flex-col p-12">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{slide.title}</h2>
                            <div className="px-4 py-1 rounded-full text-[10px] font-black tracking-widest text-black" style={{ backgroundColor: accentColor }}>ACTION PLAN</div>
                        </div>
                        <div className="space-y-4 flex-1">
                            {String(slide.body || '').split('\n').filter(l => l.trim()).map((line, i) => (
                                <div key={i} className="flex gap-6 items-center p-5 rounded-lg bg-white/5 border-l-4" style={{ borderLeftColor: accentColor }}>
                                    <div className="text-3xl font-black w-12 text-center" style={{ color: accentColor }}>{i + 1}</div>
                                    <p className="text-xl text-white font-medium">{line.replace(/^[•\-\d\.]\s*/, '')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'bold_full':
                return (
                    <div style={slideStyle} className="flex flex-col items-center justify-center p-12 text-center" >
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(45deg, ${accentColor} 25%, transparent 25%, transparent 50%, ${accentColor} 50%, ${accentColor} 75%, transparent 75%, transparent)`, backgroundSize: '40px 40px' }} />
                        <h2 className="text-7xl font-black text-white uppercase tracking-tight z-10 drop-shadow-2xl">
                            {slide.title}
                        </h2>
                        <div className="w-1/2 h-2 mt-8 z-10" style={{ backgroundColor: accentColor }} />
                    </div>
                );

            default: // standard_bullets
                return (
                    <div style={slideStyle} className="flex flex-col p-14 text-left">
                        <div className="flex items-center gap-5 mb-10">
                            <div className="w-3 h-12" style={{ backgroundColor: accentColor }} />
                            <h2 className="text-4xl font-black text-white uppercase tracking-tight">
                                {slide.title}
                            </h2>
                        </div>
                        <div className="flex-1">
                            <ul className="space-y-6">
                                {String(slide.body || '').split('\n').filter(l => l.trim()).map((line, i) => (
                                    <li key={i} className="text-2xl text-white font-medium flex gap-5 items-start">
                                        <span className="mt-2.5 flex-shrink-0 w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
                                        <span>{line.replace(/^[•\-\d\.]\s*/, '')}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {slide.scripture && (
                            <div className="mt-auto bg-white/5 border border-white/10 p-6 rounded-xl flex items-center gap-4">
                                <span className="text-2xl opacity-30" style={{ color: accentColor }}>📖</span>
                                <p className="text-lg text-white italic font-medium opacity-90">
                                    {slide.scripture}
                                </p>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className={`flex flex-col gap-8 ${isFullscreen ? 'fixed inset-0 z-[100] bg-black p-8' : ''}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Slide {selectedIndex + 1} of {slides.length}</span>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                        {slides[selectedIndex]?.layoutVariant?.replace('_', ' ') || 'standard bullets'}
                    </div>
                </div>
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 hover:bg-white/5 rounded-full transition-all text-zinc-400 hover:text-white"
                >
                    {isFullscreen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    )}
                </button>
            </div>

            {/* Main Stage */}
            <div className="relative group flex-1 min-h-0">
                <div className="embla overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-[#0F172A]" ref={emblaRef}>
                    <div className="embla__container flex">
                        {slides.map((slide, index) => (
                            <div key={index} className="embla__slide flex-[0_0_100%] min-w-0 aspect-[16/9] relative">
                                {renderSlide(slide, index)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Overlays */}
                <button
                    onClick={() => emblaApi?.scrollPrev()}
                    className="absolute left -6 top-1/2 -translate-y-1/2 p-4 bg-black/60 hover:bg-black/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all border border-white/10 z-10 shadow-xl translate-x-12 group-hover:translate-x-0"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                    onClick={() => emblaApi?.scrollNext()}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-black/60 hover:bg-black/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all border border-white/10 z-10 shadow-xl -translate-x-12 group-hover:translate-x-0"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            {/* Thumbnail Strip */}
            <div className={`flex gap-4 overflow-x-auto pb-6 scroll-smooth px-1 custom-scrollbar ${isFullscreen ? 'hidden' : ''}`}>
                {slides.map((slide, i) => (
                    <button
                        key={i}
                        onClick={() => scrollTo(i)}
                        className={`flex-shrink-0 w-44 aspect-[16/9] bg-[#0F172A] rounded-xl border-2 transition-all overflow-hidden relative group/thumb ${selectedIndex === i ? 'border-[#CCF381] ring-4 ring-[#CCF381]/10 scale-105 z-10' : 'border-white/5 opacity-50 hover:opacity-100 grayscale-[0.2]'
                            }`}
                    >
                        <div className="scale-[0.275] origin-top-left w-[364%] h-[364%] pointer-events-none">
                            {renderSlide(slide, i)}
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-all flex items-center justify-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{i + 1}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Contextual Edit Panel */}
            <div className={`bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 space-y-6 ${isFullscreen ? 'hidden' : ''}`}>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Editor Stage: Card {selectedIndex + 1}</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-zinc-500 uppercase">Layout:</span>
                        <span className="text-[10px] font-black text-[#CCF381] uppercase px-2 py-0.5 bg-[#CCF381]/10 rounded border border-[#CCF381]/20">
                            {slides[selectedIndex]?.layoutVariant || 'standard_bullets'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Headline</label>
                            <input
                                type="text"
                                value={slides[selectedIndex]?.title || ''}
                                onChange={(e) => onUpdateSlide(selectedIndex, 'title', e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-[#CCF381] focus:ring-1 focus:ring-[#CCF381] outline-none transition-all font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Body Insight</label>
                            <textarea
                                value={slides[selectedIndex]?.body || ''}
                                onChange={(e) => onUpdateSlide(selectedIndex, 'body', e.target.value)}
                                rows={6}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-sm text-white/80 focus:border-[#CCF381] focus:ring-1 focus:ring-[#CCF381] outline-none resize-none transition-all leading-relaxed"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Scripture Reference / Focus</label>
                            <input
                                type="text"
                                value={slides[selectedIndex]?.scripture || ''}
                                onChange={(e) => onUpdateSlide(selectedIndex, 'scripture', e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-sm text-[#CCF381] focus:border-[#CCF381] focus:ring-1 focus:ring-[#CCF381] outline-none transition-all font-serif italic"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Internal Speaker Notes</label>
                            <textarea
                                value={slides[selectedIndex]?.speakerNotes || ''}
                                onChange={(e) => onUpdateSlide(selectedIndex, 'speakerNotes', e.target.value)}
                                rows={4}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-xs text-zinc-500 focus:border-[#CCF381] focus:ring-1 focus:ring-[#CCF381] outline-none resize-none transition-all italic"
                                placeholder="Guidance for the pulpit..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .embla {
                    --slide-spacing: 0px;
                    --slide-size: 100%;
                }
                .embla__container {
                    backface-visibility: hidden;
                    display: flex;
                    touch-action: pan-y;
                    margin-left: calc(var(--slide-spacing) * -1);
                }
                .embla__slide {
                    flex: 0 0 var(--slide-size);
                    padding-left: var(--slide-spacing);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
