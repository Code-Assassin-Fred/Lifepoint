'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/context/AuthContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

const MODULES = [
  {
    id: 'church',
    name: 'Church',
    submodules: ['Sunday Livestream', 'Prayer Rooms', 'Past Messages'],
  },
  {
    id: 'bible',
    name: 'Bible Study',
    submodules: ['Bible Study Hub', 'Daily Devotion', 'AI Study Guide'],
  },
  {
    id: 'growth',
    name: 'Personal & Leadership Growth',
    submodules: ['Purpose Discovery', 'Life Skills', 'Leadership Development'],
  },
  {
    id: 'mentorship',
    name: 'Mentorship & Coaching',
    submodules: ['Find a Mentor', 'Book Coaching', 'Youth Mentorship'],
  },
  {
    id: 'community',
    name: 'Community',
    submodules: ['Global Groups', 'Forums', 'Events'],
  },
  {
    id: 'media',
    name: 'Media & Content',
    submodules: ['Videos', 'Podcasts', 'Guest Speakers'],
  },
  {
    id: 'assessments',
    name: 'Assessments',
    submodules: ['Faith Growth', 'Leadership Skills', 'Personal Development'],
  },
  {
    id: 'workshops',
    name: 'Workshops & Events',
    submodules: ['Masterclasses', 'Special Workshops', 'Guest Sessions'],
  },
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

  // Auto-detect country
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

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!user || !dob || selectedModules.length === 0) {
      alert('Please complete all fields');
      return;
    }

    setLoading(true);
    try {
      const age = calculateAge(dob);
      await updateDoc(doc(db, 'users', user.uid), {
        dob,
        age,
        country,
        selectedModules,
        onboarded: true,
        ai_enabled: true,
        onboardingCompletedAt: new Date().toISOString(),
      });

      router.replace('/dashboard/user');
    } catch (err) {
      console.error(err);
      alert('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        {/* Progress */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Welcome to Lifepoint</h1>
          <p className="text-gray-600 mt-2">Step {step} of 2</p>
          <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto mt-4 overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-500"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-800">Tell us about yourself</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={country || 'Detecting...'}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => dob && setStep(2)}
                  disabled={!dob}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Interests */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">What are you interested in?</h2>
                <p className="text-gray-600 mt-2">Choose areas you'd like to grow in (select as many as you want)</p>
              </div>

              <div className="space-y-4">
                {MODULES.map((module) => (
                  <div
                    key={module.id}
                    className={`border-2 rounded-xl overflow-hidden transition-all ${
                      selectedModules.includes(module.id)
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 transition"
                    >
                      <span className="font-semibold text-lg text-gray-800">{module.name}</span>
                      {openDropdown === module.id ? (
                        <ChevronUp className="w-5 h-5 text-red-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    {openDropdown === module.id && (
                      <div className="px-6 pb-4">
                        <div className="text-sm text-gray-600 space-y-1">
                          {module.submodules.map((sub) => (
                            <div key={sub} className="flex items-center">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                              {sub}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === module.id ? null : module.id);
                      }}
                      className="w-full px-6 py-2 text-sm text-red-600 hover:bg-red-100 transition"
                    >
                      {openDropdown === module.id ? 'Hide' : 'Show'} submodules
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Back
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={loading || selectedModules.length === 0}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {loading ? 'Saving...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}