import { defineStore } from 'pinia';

export const useMintyTestStore = defineStore('minty-test', {
    state: () => ({
        testUser: 'Candidato/a',
        bookings: [],
    }),

    actions: {
        async fetchBookings() {
            try {
                const response = await fetch('/api/bookings');

                if (!response.ok) {
                    throw new Error('Failed to fetch bookings');
                }

                const data = await response.json();
                this.bookings = data;
            } catch (err) {
                console.error('Error fetching bookings:', err);
            }
        },


        async getGuests(bookingId) {
            try {
                const response = await fetch(`/api/bookings/${bookingId}/guests`);
                if (!response.ok) throw new Error('Failed to fetch guests');
                const data = await response.json();

                // Añadimos guests al booking correspondiente
                const booking = this.bookings.find((b) => b.id === bookingId);
                if (booking) booking.guests = data;
            } catch (err) {
                console.error('Error fetching guests:', err);
            }
        },

        async addGuest(bookingId, guestData) {
            try {
                const response = await fetch('/api/guests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...guestData, booking_id: bookingId }),
                });
                if (!response.ok) throw new Error('Failed to add guest');
                const newGuest = await response.json();

                const booking = this.bookings.find((b) => b.id === bookingId);
                if (booking) booking.guests = booking.guests || [];
                booking.guests.push(newGuest);
            } catch (err) {
                console.error('Error adding guest:', err);
            }
        },

        async updateGuest(guestId, guestData) {
            try {
                const response = await fetch(`/api/guests/${guestId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(guestData),
                });
                if (!response.ok) throw new Error('Failed to update guest');
                const updatedGuest = await response.json();

                // Actualizamos el guest en el booking correspondiente
                this.bookings.forEach((booking) => {
                    if (booking.guests) {
                        const index = booking.guests.findIndex((g) => g.id === guestId);
                        if (index !== -1) booking.guests[index] = updatedGuest;
                    }
                });
            } catch (err) {
                console.error('Error updating guest:', err);
            }
        },

        async deleteGuest(guestId) {
            try {
                const response = await fetch(`/api/guests/${guestId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete guest');

                // Eliminamos el guest de su booking
                this.bookings.forEach((booking) => {
                    if (booking.guests) {
                        booking.guests = booking.guests.filter((g) => g.id !== guestId);
                    }
                });
            } catch (err) {
                console.error('Error deleting guest:', err);
            }
        },
    },
});
