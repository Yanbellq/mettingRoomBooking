'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { bookingService } from '@/services/bookingService';
import { AlertCircle } from 'lucide-react';

interface BookingFormWithValidationProps {
    roomId: string;
    onSubmit: (data: {
        title: string;
        description: string;
        date: string;
        startTime: string;
        endTime: string;
    }) => Promise<void>;
    initialData?: {
        title: string;
        description: string;
        date: string;
        startTime: string;
        endTime: string;
    };
    excludeBookingId?: string;
}

export function BookingFormWithValidation({
    roomId,
    onSubmit,
    initialData,
    excludeBookingId
}: BookingFormWithValidationProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [date, setDate] = useState(initialData?.date || '');
    const [startTime, setStartTime] = useState(initialData?.startTime || '');
    const [endTime, setEndTime] = useState(initialData?.endTime || '');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [hasConflict, setHasConflict] = useState(false);
    const [conflictMessage, setConflictMessage] = useState('');

    // Динамічна перевірка конфліктів
    useEffect(() => {
        const checkConflict = async () => {
            if (!date || !startTime || !endTime) {
                setHasConflict(false);
                return;
            }

            // Перевірка коректності часу
            if (endTime <= startTime) {
                setHasConflict(true);
                setConflictMessage('Час закінчення має бути пізніше за час початку');
                return;
            }

            setChecking(true);
            try {
                const startDateTime = new Date(`${date}T${startTime}`);
                const endDateTime = new Date(`${date}T${endTime}`);

                const conflict = await bookingService.checkConflict(
                    roomId,
                    startDateTime,
                    endDateTime,
                    excludeBookingId
                );

                setHasConflict(conflict);
                setConflictMessage(conflict ? 'Цей час вже заброньовано' : '');
            } catch (error) {
                console.error('Error checking conflict:', error);
            } finally {
                setChecking(false);
            }
        };

        const timeoutId = setTimeout(checkConflict, 300);
        return () => clearTimeout(timeoutId);
    }, [date, startTime, endTime, roomId, excludeBookingId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (hasConflict) return;

        setLoading(true);
        try {
            await onSubmit({ title, description, date, startTime, endTime });
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

            {/* Повідомлення про конфлікт */}
            {(hasConflict || checking) && (
                <div className={`flex items-start gap-2 p-3 rounded-lg ${hasConflict ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'
                    }`}>
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                        {checking ? 'Перевірка доступності...' : conflictMessage}
                    </span>
                </div>
            )}

            <Button
                type="submit"
                className="w-full"
                disabled={loading || hasConflict || checking}
            >
                {loading ? 'Збереження...' : initialData ? 'Зберегти зміни' : 'Забронювати'}
            </Button>
        </form>
    );
}
