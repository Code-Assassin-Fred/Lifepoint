'use client';

interface HeaderProps {
    userName: string;
    userPhoto?: string | null;
    role: string | null;
}

export default function Header({ userName, userPhoto, role }: HeaderProps) {
    const firstName = userName.split(' ')[0];

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-8">
            {/* Welcome Message - Reduced font size */}
            <div>
                <h1 className="text-lg font-semibold text-black">
                    Welcome back, {firstName}
                </h1>
                <p className="text-xs text-black/60">Let&apos;s grow in faith together</p>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
                {/* Admin Badge */}
                {role === 'admin' && (
                    <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Admin
                    </span>
                )}

                {/* User Avatar */}
                {userPhoto ? (
                    <img
                        src={userPhoto}
                        alt={userName}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-gray-100">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
        </header>
    );
}
