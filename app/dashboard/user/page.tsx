'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { getModulesForUser, getModuleRoute } from '@/config/modules';
import { ArrowRight } from 'lucide-react';

export default function UserDashboardPage() {
    const { selectedModules, role } = useAuth();
    const modules = getModulesForUser(selectedModules);

    return (
        <div className="max-w-5xl">
            {/* Page Title */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-black">Your Modules</h2>
                <p className="text-black/60 text-sm mt-1">
                    Quick access to your selected spiritual growth areas
                </p>
            </div>

            {/* Empty State */}
            {modules.length === 0 && (
                <div className="bg-gray-50 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📚</span>
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">No Modules Selected</h3>
                    <p className="text-black/60 max-w-md mx-auto">
                        Complete onboarding to select the modules that interest you.
                    </p>
                </div>
            )}

            {/* Module Grid - Editorial Style */}
            {modules.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                    {modules.map((module) => {
                        const Icon = module.icon;
                        const route = getModuleRoute(module.id, role);
                        return (
                            <Link
                                key={module.id}
                                href={route}
                                className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-red-200 hover:shadow-lg transition-all duration-300"
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                                    <Icon size={24} />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-semibold text-black mb-1 group-hover:text-red-600 transition-colors">
                                    {module.label}
                                </h3>
                                <p className="text-sm text-black/60">{module.description}</p>

                                {/* Arrow */}
                                <div className="absolute top-6 right-6 text-black/30 group-hover:text-red-500 group-hover:translate-x-1 transition-all">
                                    <ArrowRight size={20} />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Daily Encouragement */}
            <div className="mt-10 p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">
                        🙏
                    </div>
                    <div>
                        <h4 className="font-semibold text-black text-sm">Daily Encouragement</h4>
                        <p className="text-black/70 mt-1 text-sm leading-relaxed">
                            &ldquo;For I know the plans I have for you,&rdquo; declares the LORD,
                            &ldquo;plans to prosper you and not to harm you, plans to give you hope and a future.&rdquo;
                        </p>
                        <p className="text-xs text-black/50 mt-2">— Jeremiah 29:11</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
