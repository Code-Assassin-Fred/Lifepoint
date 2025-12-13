'use client';

interface HeaderProps {
    userName: string;
    userPhoto?: string | null;
    role: string | null;
}

export default function Header({ userName, userPhoto, role }: HeaderProps) {
    const firstName = userName.split(' ')[0];

    return (
        <header className="h-16 lg:h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-8">
            {/* Welcome Message */}
            <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                    Welcome back, {firstName}
                </h1>
                <p className="text-sm text-gray-500">Let&apos;s grow in faith together</p>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                {/* Admin Badge */}
                {role === 'admin' && (
                    <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        Admin
                    </span>
                )}

                {/* User Avatar */}
                {userPhoto ? (
                    <img
                        src={userPhoto}
                        alt={userName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold ring-2 ring-gray-100">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
        </header>
    );
}
