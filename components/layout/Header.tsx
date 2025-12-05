'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { LogOut, Calendar } from 'lucide-react';

export function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/rooms" className="flex items-center gap-2">
                        <Calendar className="text-blue-600" size={28} />
                        <span className="text-xl font-bold text-gray-900">
                            Meeting Rooms
                        </span>
                    </Link>

                    {user && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {user.email}
                            </span>
                            <Button
                                variant="secondary"
                                onClick={logout}
                                className="flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                Вийти
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
