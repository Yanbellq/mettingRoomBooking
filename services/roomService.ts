import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    where,
    arrayUnion,
    arrayRemove,
    Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Room, RoomMember } from '@/types';

const ROOMS_COLLECTION = 'rooms';

export const roomService = {
    async createRoom(name: string, description: string, creatorEmail: string, creatorUid: string): Promise<string> {
        const roomData = {
            name,
            description,
            createdBy: creatorUid,
            createdAt: Timestamp.now(),
            members: [{
                email: creatorEmail,
                role: 'admin',
                addedAt: Timestamp.now()
            }]
        };

        const docRef = await addDoc(collection(db, ROOMS_COLLECTION), roomData);
        return docRef.id;
    },

    async getRooms(userEmail: string): Promise<Room[]> {
        const roomsRef = collection(db, ROOMS_COLLECTION);
        const snapshot = await getDocs(roomsRef);

        const rooms: Room[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            const isMember = data.members?.some((m: RoomMember) => m.email === userEmail);

            if (isMember) {
                rooms.push({
                    id: doc.id,
                    name: data.name,
                    description: data.description,
                    createdBy: data.createdBy,
                    createdAt: data.createdAt?.toDate(),
                    members: data.members
                });
            }
        });

        return rooms;
    },

    async getRoom(roomId: string): Promise<Room | null> {
        const docRef = doc(db, ROOMS_COLLECTION, roomId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        const data = docSnap.data();
        return {
            id: docSnap.id,
            name: data.name,
            description: data.description,
            createdBy: data.createdBy,
            createdAt: data.createdAt?.toDate(),
            members: data.members
        };
    },

    async updateRoom(roomId: string, name: string, description: string): Promise<void> {
        const docRef = doc(db, ROOMS_COLLECTION, roomId);
        await updateDoc(docRef, { name, description });
    },

    async deleteRoom(roomId: string): Promise<void> {
        await deleteDoc(doc(db, ROOMS_COLLECTION, roomId));
    },

    async addMember(roomId: string, email: string, role: 'admin' | 'user'): Promise<void> {
        const docRef = doc(db, ROOMS_COLLECTION, roomId);
        const newMember: RoomMember = {
            email,
            role,
            addedAt: new Date()
        };
        await updateDoc(docRef, {
            members: arrayUnion(newMember)
        });
    },

    async removeMember(roomId: string, memberEmail: string): Promise<void> {
        const room = await this.getRoom(roomId);
        if (!room) return;

        const updatedMembers = room.members.filter(m => m.email !== memberEmail);
        const docRef = doc(db, ROOMS_COLLECTION, roomId);
        await updateDoc(docRef, { members: updatedMembers });
    },

    getUserRole(room: Room, userEmail: string): 'admin' | 'user' | null {
        const member = room.members.find(m => m.email === userEmail);
        return member?.role || null;
    }
};
