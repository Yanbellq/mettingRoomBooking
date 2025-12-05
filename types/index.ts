export interface User {
    uid: string;
    email: string;
    name: string;
    createdAt: Date;
}

export interface Room {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt: Date;
    members: RoomMember[];
}

export interface RoomMember {
    email: string;
    role: 'admin' | 'user';
    addedAt: Date;
}

export interface Booking {
    id: string;
    roomId: string;
    roomName: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    createdBy: string;
    createdByEmail: string;
    participants: string[];
    createdAt: Date;
}

export type UserRole = 'admin' | 'user';
