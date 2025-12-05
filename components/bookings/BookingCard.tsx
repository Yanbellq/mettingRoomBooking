'use client';

import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Booking } from '@/types';
import { Clock, Users, Trash2, UserPlus, Edit } from 'lucide-react';

interface BookingCardProps {
    booking: Booking;
    userEmail: string;
    userRole: 'admin' | 'user' | null;
    onDelete?: () => void;
    onEdit?: () => void;
    onJoin?: () => void;
}

export function BookingCard({
    booking,
    userEmail,
    userRole,
    onDelete,
    onEdit,
    onJoin
}: BookingCardProps) {
    const isOwner = booking.createdByEmail === userEmail;
    const isParticipant = booking.participants?.includes(userEmail);
    const canDelete = isOwner || userRole === 'admin';
    const canEdit = isOwner || userRole === 'admin';
    const canJoin = !isOwner && !isParticipant;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-lg">{booking.title}</h4>
                <div className="flex gap-2">
                    {canJoin && onJoin && (
                        <button
                            onClick={onJoin}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Приєднатися"
                        >
                            <UserPlus size={18} />
                        </button>
                    )}
                    {canEdit && onEdit && (
                        <button
                            onClick={onEdit}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Редагувати"
                        >
                            <Edit size={18} />
                        </button>
                    )}
                    {canDelete && onDelete && (
                        <button
                            onClick={onDelete}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Видалити"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {booking.description && (
                <p className="text-gray-600 text-sm mb-3">{booking.description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>
                        {format(booking.startTime, 'dd MMM, HH:mm', { locale: uk })} -
                        {format(booking.endTime, 'HH:mm', { locale: uk })}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{(booking.participants?.length || 0) + 1} учасників</span>
                </div>
            </div>

            <div className="mt-2 text-xs text-gray-400">
                Створив: {booking.createdByEmail}
            </div>
        </div>
    );
}
