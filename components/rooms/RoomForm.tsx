'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface RoomFormProps {
    onSubmit: (name: string, description: string) => Promise<void>;
    initialName?: string;
    initialDescription?: string;
    submitLabel?: string;
}

export function RoomForm({
    onSubmit,
    initialName = '',
    initialDescription = '',
    submitLabel = 'Створити'
}: RoomFormProps) {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(name, description);
            setName('');
            setDescription('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Назва кімнати"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Переговорна #1"
                required
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Опис
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Опис кімнати..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    rows={3}
                />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Завантаження...' : submitLabel}
            </Button>
        </form>
    );
}
