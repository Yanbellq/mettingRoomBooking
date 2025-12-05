'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface BookingFormProps {
    onSubmit: (data: {
        title: string;
        description: string;
        date: string;
        startTime: string;
        endTime: string;
    }) => Promise<void>;
}

export function BookingForm({ onSubmit }: BookingFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onSubmit({ title, description, date, startTime, endTime });
            setTitle('');
            setDescription('');
            setDate('');
            setStartTime('');
            setEndTime('');
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Назва зустрічі"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Планерка команди"
                required
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Опис (необов'язково)
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Деталі зустрічі..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    rows={2}
                />
            </div>

            <Input
                label="Дата"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                required
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Початок"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                />
                <Input
                    label="Кінець"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Створення...' : 'Забронювати'}
            </Button>
        </form>
    );
}
