'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await register(name, email, password);
            toast.success('Реєстрація успішна!');
            router.push('/rooms');
        } catch (error: any) {
            toast.error(error.message || 'Помилка реєстрації');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
            <h1 className="text-2xl font-bold text-center mb-6">Реєстрація</h1>

            <Input
                type="text"
                placeholder="Ім'я"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />

            <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <Input
                type="password"
                placeholder="Пароль (мін. 6 символів)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
            />

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Завантаження...' : 'Зареєструватися'}
            </Button>

            <p className="text-center text-gray-600">
                Вже є акаунт?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                    Увійти
                </Link>
            </p>
        </form>
    );
}
