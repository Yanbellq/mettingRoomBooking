'use client';

import Link from 'next/link';
import { Room } from '@/types';
import { Users, Calendar } from 'lucide-react';

interface RoomCardProps {
    room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
    return (
        <Link href={`/rooms/${room.id}`}>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
                <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{room.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{room.members.length} учасників</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>
                            {room.createdAt?.toLocaleDateString('uk-UA')}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
