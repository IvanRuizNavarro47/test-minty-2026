import { defineStore } from 'pinia';

export const useMintyTestStore = defineStore('minty-test', {
  state: () => ({
    testUser: 'Candidato/a', // Nombre de usuario de prueba
    bookings: [],            // Array que contendrá todos los bookings con sus guests
  }),

  actions: {
    /**
     * Trae todos los bookings desde la API.
     * Almacena los datos en this.bookings.
     */
    async fetchBookings() {
      try {
        const response = await fetch('/api/bookings');

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        this.bookings = data; // Guardamos los bookings en el estado
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    },

    /**
     * Trae todos los guests asociados a un booking específico.
     * @param {number} bookingId - ID del booking
     */
    async getGuests(bookingId) {
      try {
        const response = await fetch(`/api/bookings/${bookingId}/guests`);
        if (!response.ok) throw new Error('Failed to fetch guests');
        const data = await response.json();

        // Añadimos los guests al booking correspondiente en el estado
        const booking = this.bookings.find((b) => b.id === bookingId);
        if (booking) booking.guests = data;
      } catch (err) {
        console.error('Error fetching guests:', err);
      }
    },

    /**
     * Añade un nuevo guest a un booking.
     * @param {number} bookingId - ID del booking
     * @param {object} guestData - Datos del guest {name, email, phone}
     */
    async addGuest(bookingId, guestData) {
      try {
        const response = await fetch('/api/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...guestData, booking_id: bookingId }),
        });
        if (!response.ok) throw new Error('Failed to add guest');

        const newGuest = await response.json();

        // Añadimos el guest al booking correspondiente en el estado
        const booking = this.bookings.find((b) => b.id === bookingId);
        if (booking) booking.guests = booking.guests || [];
        booking.guests.push(newGuest);
      } catch (err) {
        console.error('Error adding guest:', err);
      }
    },

    /**
     * Actualiza un guest existente.
     * @param {number} guestId - ID del guest a actualizar
     * @param {object} guestData - Nuevos datos del guest
     */
    async updateGuest(guestId, guestData) {
      try {
        const response = await fetch(`/api/guests/${guestId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(guestData),
        });
        if (!response.ok) throw new Error('Failed to update guest');

        const updatedGuest = await response.json();

        // Actualizamos el guest dentro del booking correspondiente en el estado
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

    /**
     * Elimina un guest de un booking.
     * @param {number} guestId - ID del guest a eliminar
     */
    async deleteGuest(guestId) {
      try {
        const response = await fetch(`/api/guests/${guestId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete guest');

        // Eliminamos el guest del booking correspondiente en el estado
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
