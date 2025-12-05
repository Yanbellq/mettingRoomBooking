'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { roomService } from '@/services/roomService';
import { bookingService } from '@/services/bookingService';
import { Room, Booking } from '@/types';
import { BookingFormWithValidation } from '@/components/bookings/BookingFormWithValidation';
import { BookingCard } from '@/components/bookings/BookingCard';
import { Modal } from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EditRoomModal } from '@/components/rooms/EditRoomModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Plus, UserPlus, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function RoomDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const roomId = params.roomId as string;

    const [room, setRoom] = useState<Room | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);
    const [isEditBookingModalOpen, setIsEditBookingModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeleteBookingConfirmOpen, setIsDeleteBookingConfirmOpen] = useState(false);

    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<'admin' | 'user'>('user');

    const userRole = room && user?.email ? roomService.getUserRole(room, user.email) : null;

    const fetchData = async () => {
        try {
            const [roomData, bookingsData] = await Promise.all([
                roomService.getRoom(roomId),
                bookingService.getBookingsByRoom(roomId)
            ]);
            setRoom(roomData);
            setBookings(bookingsData);
        } catch (error) {
            toast.error('Помилка завантаження даних');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [roomId]);

    const handleCreateBooking = async (data: {
        title: string;
        description: string;
        date: string;
        startTime: string;
        endTime: string;
    }) => {
        if (!user?.email || !user?.uid || !room) return;

        const startDateTime = new Date(`${data.date}T${data.startTime}`);
        const endDateTime = new Date(`${data.date}T${data.endTime}`);

        try {
            await bookingService.createBooking({
                roomId,
                roomName: room.name,
                title: data.title,
                description: data.description,
                startTime: startDateTime,
                endTime: endDateTime,
                createdBy: user.uid,
                createdByEmail: user.email,
                participants: []
            });
            toast.success('Бронювання створено!');
            setIsBookingModalOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Помилка створення бронювання');
        }
    };

    const handleEditBooking = async (data: {
        title: string;
        description: string;
        date: string;
        startTime: string;
        endTime: string;
    }) => {
        if (!editingBooking) return;

        const startDateTime = new Date(`${data.date}T${data.startTime}`);
        const endDateTime = new Date(`${data.date}T${data.endTime}`);

        try {
            await bookingService.updateBooking(editingBooking.id, {
                title: data.title,
                description: data.description,
                startTime: startDateTime,
                endTime: endDateTime
            });
            toast.success('Бронювання оновлено!');
            setIsEditBookingModalOpen(false);
            setEditingBooking(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Помилка оновлення');
        }
    };

    const handleDeleteBooking = async () => {
        if (!deletingBookingId) return;

        setDeleteLoading(true);
        try {
            await bookingService.deleteBooking(deletingBookingId);
            toast.success('Бронювання скасовано');
            setIsDeleteBookingConfirmOpen(false);
            setDeletingBookingId(null);
            fetchData();
        } catch (error) {
            toast.error('Помилка скасування бронювання');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleJoinBooking = async (bookingId: string) => {
        if (!user?.email) return;

        try {
            await bookingService.joinBooking(bookingId, user.email);
            toast.success('Ви приєднались до зустрічі');
            fetchData();
        } catch (error) {
            toast.error('Помилка приєднання');
        }
    };

    const handleUpdateRoom = async (name: string, description: string) => {
        try {
            await roomService.updateRoom(roomId, name, description);
            toast.success('Кімнату оновлено!');
            fetchData();
        } catch (error) {
            toast.error('Помилка оновлення кімнати');
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberEmail) return;

        try {
            await roomService.addMember(roomId, newMemberEmail, newMemberRole);
            toast.success('Учасника додано!');
            setNewMemberEmail('');
            setIsMemberModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Помилка додавання учасника');
        }
    };

    const handleDeleteRoom = async () => {
        setDeleteLoading(true);
        try {
            await roomService.deleteRoom(roomId);
            toast.success('Кімнату видалено');
            router.push('/rooms');
        } catch (error) {
            toast.error('Помилка видалення кімнати');
        } finally {
            setDeleteLoading(false);
        }
    };

    const openEditBookingModal = (booking: Booking) => {
        setEditingBooking(booking);
        setIsEditBookingModalOpen(true);
    };

    const openDeleteBookingConfirm = (bookingId: string) => {
        setDeletingBookingId(bookingId);
        setIsDeleteBookingConfirmOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!room) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Кімнату не знайдено</p>
                <Link href="/rooms" className="text-blue-600 hover:underline">
                    Повернутися до списку
                </Link>
            </div>
        );
    }

    return (
        <div>
            <Link
                href="/rooms"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft size={20} />
                Назад до кімнат
            </Link>

            <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
                        <p className="text-gray-600 mt-1">{room.description}</p>
                    </div>

                    {userRole === 'admin' && (
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => setIsEditRoomModalOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <Edit size={16} />
                                Редагувати
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setIsMemberModalOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <UserPlus size={16} />
                                Додати учасника
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => setIsDeleteConfirmOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    {room.members.map((member) => (
                        <span
                            key={member.email}
                            className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                        >
                            {member.email}
                            <span className="text-gray-500 ml-1">
                                ({member.role === 'admin' ? 'Адмін' : 'Користувач'})
                            </span>
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Бронювання</h2>
                {userRole === 'admin' && (
                    <Button
                        onClick={() => setIsBookingModalOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Нове бронювання
                    </Button>
                )}
            </div>

            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border">
                    <p className="text-gray-500">Немає активних бронювань</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            userEmail={user?.email || ''}
                            userRole={userRole}
                            onDelete={() => openDeleteBookingConfirm(booking.id)}
                            onEdit={() => openEditBookingModal(booking)}
                            onJoin={() => handleJoinBooking(booking.id)}
                        />
                    ))}
                </div>
            )}

            <Modal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                title="Нове бронювання"
            >
                <BookingFormWithValidation
                    roomId={roomId}
                    onSubmit={handleCreateBooking}
                />
            </Modal>

            <Modal
                isOpen={isEditBookingModalOpen}
                onClose={() => {
                    setIsEditBookingModalOpen(false);
                    setEditingBooking(null);
                }}
                title="Редагувати бронювання"
            >
                {editingBooking && (
                    <BookingFormWithValidation
                        roomId={roomId}
                        onSubmit={handleEditBooking}
                        initialData={{
                            title: editingBooking.title,
                            description: editingBooking.description || '',
                            date: editingBooking.startTime.toISOString().split('T')[0],
                            startTime: editingBooking.startTime.toTimeString().slice(0, 5),
                            endTime: editingBooking.endTime.toTimeString().slice(0, 5)
                        }}
                        excludeBookingId={editingBooking.id}
                    />
                )}
            </Modal>

            {room && (
                <EditRoomModal
                    isOpen={isEditRoomModalOpen}
                    onClose={() => setIsEditRoomModalOpen(false)}
                    room={room}
                    onUpdate={handleUpdateRoom}
                />
            )}

            <Modal
                isOpen={isMemberModalOpen}
                onClose={() => setIsMemberModalOpen(false)}
                title="Додати учасника"
            >
                <form onSubmit={handleAddMember} className="space-y-4">
                    <Input
                        label="Email учасника"
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="user@example.com"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Роль
                        </label>
                        <select
                            value={newMemberRole}
                            onChange={(e) => setNewMemberRole(e.target.value as 'admin' | 'user')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="user">Користувач (перегляд та приєднання)</option>
                            <option value="admin">Адмін (повний доступ)</option>
                        </select>
                    </div>

                    <Button type="submit" className="w-full">
                        Додати
                    </Button>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDeleteRoom}
                title="Видалити кімнату?"
                message="Ця дія незворотна. Всі бронювання також будуть видалені."
                confirmText="Видалити"
                loading={deleteLoading}
            />

            <ConfirmModal
                isOpen={isDeleteBookingConfirmOpen}
                onClose={() => {
                    setIsDeleteBookingConfirmOpen(false);
                    setDeletingBookingId(null);
                }}
                onConfirm={handleDeleteBooking}
                title="Скасувати бронювання?"
                message="Ви впевнені, що хочете скасувати це бронювання?"
                confirmText="Скасувати бронювання"
                loading={deleteLoading}
            />
        </div>
    );
}
