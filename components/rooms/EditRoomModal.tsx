'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { RoomForm } from './RoomForm';
import { Room } from '@/types';

interface EditRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: Room;
    onUpdate: (name: string, description: string) => Promise<void>;
}

export function EditRoomModal({ isOpen, onClose, room, onUpdate }: EditRoomModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Редагувати кімнату">
            <RoomForm
                onSubmit={async (name, description) => {
                    await onUpdate(name, description);
                    onClose();
                }}
                initialName={room.name}
                initialDescription={room.description}
                submitLabel="Зберегти"
            />
        </Modal>
    );
}
