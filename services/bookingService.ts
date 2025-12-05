import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    Timestamp,
    orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types';

const BOOKINGS_COLLECTION = 'bookings';

export const bookingService = {
    async createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<string> {
        const hasConflict = await this.checkConflict(
            booking.roomId,
            booking.startTime,
            booking.endTime
        );

        if (hasConflict) {
            throw new Error('Цей час вже заброньовано');
        }

        const bookingData = {
            ...booking,
            startTime: Timestamp.fromDate(booking.startTime),
            endTime: Timestamp.fromDate(booking.endTime),
            createdAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), bookingData);
        return docRef.id;
    },

    async getBookingsByRoom(roomId: string): Promise<Booking[]> {
        const q = query(
            collection(db, BOOKINGS_COLLECTION),
            where('roomId', '==', roomId),
            orderBy('startTime', 'asc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startTime: doc.data().startTime.toDate(),
            endTime: doc.data().endTime.toDate(),
            createdAt: doc.data().createdAt.toDate()
        })) as Booking[];
    },

    async getBookingsByUser(userEmail: string): Promise<Booking[]> {
        const q = query(
            collection(db, BOOKINGS_COLLECTION),
            where('createdByEmail', '==', userEmail),
            orderBy('startTime', 'asc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startTime: doc.data().startTime.toDate(),
            endTime: doc.data().endTime.toDate(),
            createdAt: doc.data().createdAt.toDate()
        })) as Booking[];
    },

    async updateBooking(
        bookingId: string,
        updates: Partial<Pick<Booking, 'title' | 'description' | 'startTime' | 'endTime'>>
    ): Promise<void> {
        const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);

        const updateData: any = {};
        if (updates.title) updateData.title = updates.title;
        if (updates.description) updateData.description = updates.description;
        if (updates.startTime) updateData.startTime = Timestamp.fromDate(updates.startTime);
        if (updates.endTime) updateData.endTime = Timestamp.fromDate(updates.endTime);

        await updateDoc(docRef, updateData);
    },

    async deleteBooking(bookingId: string): Promise<void> {
        await deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
    },

    async joinBooking(bookingId: string, userEmail: string): Promise<void> {
        const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
        const snapshot = await getDocs(query(
            collection(db, BOOKINGS_COLLECTION),
            where('__name__', '==', bookingId)
        ));

        if (!snapshot.empty) {
            const booking = snapshot.docs[0].data();
            const participants = booking.participants || [];

            if (!participants.includes(userEmail)) {
                await updateDoc(docRef, {
                    participants: [...participants, userEmail]
                });
            }
        }
    },

    async checkConflict(
        roomId: string,
        startTime: Date,
        endTime: Date,
        excludeBookingId?: string
    ): Promise<boolean> {
        const bookings = await this.getBookingsByRoom(roomId);

        return bookings.some(booking => {
            if (excludeBookingId && booking.id === excludeBookingId) return false;

            const bookingStart = booking.startTime.getTime();
            const bookingEnd = booking.endTime.getTime();
            const newStart = startTime.getTime();
            const newEnd = endTime.getTime();

            return (newStart < bookingEnd && newEnd > bookingStart);
        });
    }
};
