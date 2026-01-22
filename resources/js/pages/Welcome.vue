<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useMintyTestStore } from '@/stores/minty-test'

const store = useMintyTestStore()

// Formatear fechas
function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

// Formulario de nuevos guests por booking
const newGuests = reactive({}) // { bookingId: { name, email, phone } }

// Modal de edición
const editingGuest = ref(null)
const editForm = reactive({ name: '', email: '', phone: '' })

function openEditModal(guest) {
  editingGuest.value = guest
  editForm.name = guest.name
  editForm.email = guest.email
  editForm.phone = guest.phone
}

async function saveGuest() {
  if (!editingGuest.value) return
  await store.updateGuest(editingGuest.value.id, editForm)
  editingGuest.value = null
}

// Cancelar edición
function cancelEdit() {
  editingGuest.value = null
}

// Añadir guest a booking
async function addGuestToBooking(bookingId) {
  const guestData = newGuests[bookingId]
  if (!guestData.name) return alert('El nombre es obligatorio')
  await store.addGuest(bookingId, guestData)
  newGuests[bookingId] = { name: '', email: '', phone: '' }
}

// Al montar, obtenemos bookings y guests
onMounted(async () => {
  await store.fetchBookings()
  for (const booking of store.bookings) {
    await store.getGuests(booking.id)
    newGuests[booking.id] = { name: '', email: '', phone: '' }
  }
})
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Bookings</h1>

    <div v-if="store.loading" class="text-gray-500">
      Cargando bookings...
    </div>

    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="booking in store.bookings"
        :key="booking.id"
        class="bg-white rounded-xl shadow p-5 border"
      >
        <h2 class="text-lg font-semibold mb-2">Booking #{{ booking.id }}</h2>

        <p class="text-sm text-gray-600">
          <span class="font-medium">Check-in:</span>
          {{ formatDate(booking.checkin_at) }}
        </p>

        <p class="text-sm text-gray-600 mb-4">
          <span class="font-medium">Check-out:</span>
          {{ formatDate(booking.checkout_at) }}
        </p>

        <!-- Guests existentes -->
        <div v-for="guest in booking.guests || []" :key="guest.id" class="mt-2 p-2 border rounded bg-gray-50">
          <p><span class="font-medium">Nombre:</span> {{ guest.name }}</p>
          <p><span class="font-medium">Email:</span> {{ guest.email }}</p>
          <p><span class="font-medium">Teléfono:</span> {{ guest.phone }}</p>

          <div class="mt-2 space-x-2">
            <button
              @click="openEditModal(guest)"
              class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Editar
            </button>
            <button
              @click="store.deleteGuest(guest.id)"
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        </div>

        <!-- Formulario para añadir nuevo guest -->
        <div class="mt-4 p-3 border rounded bg-gray-100">
          <h3 class="text-sm font-semibold mb-2">Añadir Guest</h3>
          <input v-model="newGuests[booking.id].name" type="text" placeholder="Nombre" class="w-full mb-2 p-2 border rounded" />
          <input v-model="newGuests[booking.id].email" type="email" placeholder="Email" class="w-full mb-2 p-2 border rounded" />
          <input v-model="newGuests[booking.id].phone" type="text" placeholder="Teléfono" class="w-full mb-2 p-2 border rounded" />
          <button @click="addGuestToBooking(booking.id)" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Añadir
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de edición -->
    <div v-if="editingGuest" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-96">
        <h3 class="text-lg font-semibold mb-4">Editar Guest</h3>
        <input v-model="editForm.name" type="text" placeholder="Nombre" class="w-full mb-2 p-2 border rounded" />
        <input v-model="editForm.email" type="email" placeholder="Email" class="w-full mb-2 p-2 border rounded" />
        <input v-model="editForm.phone" type="text" placeholder="Teléfono" class="w-full mb-2 p-2 border rounded" />
        <div class="mt-4 flex justify-end space-x-2">
          <button @click="cancelEdit" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
          <button @click="saveGuest" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>
