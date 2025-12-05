'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { roomService } from '@/services/roomService';
import { Room } from '@/types';
import { RoomCard } from '@/components/rooms/RoomCard';
import { RoomForm } from '@/components/rooms/RoomForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchRooms = async () => {
        if (!user?.email) return;
        try {
            const data = await roomService.getRooms(user.email);
            setRooms(data);
        } catch (error) {
            toast.error('Помилка завантаження кімнат');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [user]);

    const handleCreateRoom = async (name: string, description: string) => {
        if (!user?.email || !user?.uid) return;

        try {
            await roomService.createRoom(name, description, user.email, user.uid);
            toast.success('Кімнату створено!');
            setIsModalOpen(false);
            fetchRooms();
        } catch (error) {
            toast.error('Помилка створення кімнати');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Переговорні кімнати</h1>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                    <Plus size={20} />
                    Нова кімната
                </Button>
            </div>

            {rooms.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">У вас ще немає кімнат</p>
                    <Button onClick={() => setIsModalOpen(true)}>
                        Створити першу кімнату
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rooms.map((room) => (
                        <RoomCard key={room.id} room={room} />
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Створити кімнату"
            >
                <RoomForm onSubmit={handleCreateRoom} />
            </Modal>
        </div>
    );
}
