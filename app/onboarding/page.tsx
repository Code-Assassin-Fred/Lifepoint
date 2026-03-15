// Improved styling with checkboxes and dropdowns
// Full updated component

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MODULES = [
  { id: 'home', name: 'Home', submodules: ['Live Sessions', 'Prayer Rooms', 'Recent Insights'] },
  { id: 'wisdom', name: 'The Well', submodules: ['Daily Insights', 'Growth Plans', 'AI Companion'] },
  { id: 'development', name: 'Growth & Mentorship', submodules: ['Purpose Discovery', 'Life Skills', 'Leadership Development', 'Find a Mentor', 'Book Coaching', 'Youth Mentorship'] },
  { id: 'community', name: 'Community', submodules: ['Global Groups', 'Forums', 'Events'] },
  { id: 'media', name: 'Media & Content', submodules: ['Videos', 'Podcasts', 'Guest Speakers'] },
  { id: 'workshops', name: 'Workshops & Events', submodules: ['Masterclasses', 'Special Workshops', 'Guest Sessions'] },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await res.json();
          setCountry(data.address?.country || 'Unknown');
        } catch {
          setCountry('Unknown');
        }
      });
    }
  }, []);

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!user || !dob || selectedModules.length === 0) {
      alert('Please complete all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dob, country: country || 'Unknown', selectedModules }),
      });

      if (res.ok) {
        router.replace('/dashboard');
      } else {
        const error = await res.json();
        alert(error.error || 'Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[3fr_2fr] bg-white">
      {/* Left Column: Onboarding Content */}
      <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-12">
        <div className="max-w-xl w-full mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome to Lifepoint</h1>
            <p className="mt-2 text-gray-600">Let's get you set up and ready to explore.</p>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-500 ease-out"
                  style={{ width: step === 1 ? '50%' : '100%' }}
                />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Step {step} of 2
              </span>
            </div>
          </div>

          <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-8 lg:p-10">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Tell us about yourself</h2>
                  <p className="text-sm text-gray-500">This helps us personalize your experience.</p>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-gray-900 transition-all text-sm outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Country</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={country || 'Detecting...'}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-100/50 border border-transparent rounded-xl text-gray-500 text-sm cursor-not-allowed"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => dob && setStep(2)}
                    disabled={!dob}
                    className="w-full bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-40 transition-all shadow-lg shadow-black/5"
                  >
                    Continue to Interests
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">What are you interested in?</h2>
                  <p className="text-sm text-gray-500">Choose topics that resonate with your goals.</p>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {MODULES.map((module) => (
                    <div
                      key={module.id}
                      className={`group border rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden ${selectedModules.includes(module.id)
                        ? 'border-black bg-white ring-1 ring-black shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      onClick={() => setOpenDropdown(openDropdown === module.id ? null : module.id)}
                    >
                      <div className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedModules.includes(module.id)
                              ? 'bg-black border-black text-white'
                              : 'border-gray-300 group-hover:border-gray-400'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleModule(module.id);
                            }}
                          >
                            {selectedModules.includes(module.id) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span className={`font-bold transition-colors ${selectedModules.includes(module.id) ? 'text-black' : 'text-gray-700'
                            }`}>
                            {module.name}
                          </span>
                        </div>
                        {openDropdown === module.id ? (
                          <ChevronUp size={18} className="text-black" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-400" />
                        )}
                      </div>

                      {openDropdown === module.id && (
                        <div className="px-5 pb-5 pt-0 animate-in fade-in duration-300">
                          <div className="grid grid-cols-1 gap-2 border-t border-gray-50 pt-4">
                            {module.submodules.map((sub) => (
                              <div key={sub} className="flex items-center text-sm text-gray-500 py-1 gap-3">
                                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                {sub}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-8 py-4 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-white hover:border-gray-300 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || selectedModules.length === 0}
                    className="flex-[2] bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-40 transition-all shadow-lg shadow-black/5"
                  >
                    {loading ? 'Finalizing...' : 'Complete Setup'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Image */}
      <div className="hidden lg:block relative overflow-hidden bg-gray-100">
        <img
          src="/auth-bg.png"
          alt="Abstract Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-black/20" />
        <div className="absolute top-12 left-12">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center justify-center">
            <span className="text-white font-black text-xl">L</span>
          </div>
        </div>
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <p className="text-3xl font-bold mb-4 leading-tight">Your transformation begins here.</p>
          <div className="h-1 w-20 bg-white/50 rounded-full" />
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}
