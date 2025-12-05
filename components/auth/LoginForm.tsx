'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { setPersistence, browserSessionPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Встановлюємо persistence залежно від чекбокса
            await setPersistence(
                auth,
                rememberMe ? browserLocalPersistence : browserSessionPersistence
            );

            await login(email, password);
            toast.success('Успішний вхід!');
            router.push('/rooms');
        } catch (error: any) {
            toast.error(error.message || 'Помилка входу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-6">Вхід</h1>

            <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <div className="flex items-center">
                <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                    Запам'ятати мене
                </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Завантаження...' : 'Увійти'}
            </Button>

            <p className="text-center text-gray-600">
                Немає акаунту?{' '}
                <Link href="/register" className="text-blue-600 hover:underline">
                    Зареєструватися
                </Link>
            </p>
        </form>
    );
}
