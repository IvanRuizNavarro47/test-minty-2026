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
  successMessage.value = 'Se ha actualizado con éxito'
  showMessage.value = true
  setTimeout(() => showMessage.value = false, 2000)
  editingGuest.value = null
}

function cancelEdit() {
  editingGuest.value = null
}

async function addGuestToBooking(bookingId) {
  // Inicializamos si no existía
  if (!newGuests[bookingId]) newGuests[bookingId] = { name: '', email: '', phone: '' }

  const guestData = newGuests[bookingId]
  if (!guestData.name) return alert('El nombre es obligatorio')
  await store.addGuest(bookingId, guestData)
  // Reiniciamos formulario
  newGuests[bookingId] = { name: '', email: '', phone: '' }
}

// Modal de confirmación de eliminación
const guestToDelete = ref(null)

// Mensaje de éxito
const successMessage = ref('')
const showMessage = ref(false)

function confirmDeleteGuest(guest) {
  guestToDelete.value = guest
}

async function deleteConfirmedGuest() {
  if (!guestToDelete.value) return
  await store.deleteGuest(guestToDelete.value.id)
  successMessage.value = 'Eliminado con éxito'
  showMessage.value = true
  guestToDelete.value = null
  setTimeout(() => showMessage.value = false, 2000)
}

// Al montar, obtenemos bookings y guests
onMounted(async () => {
  await store.fetchBookings()
  for (const booking of store.bookings) {
    await store.getGuests(booking.id)
    // Aseguramos que siempre existe un objeto para añadir nuevo guest
    if (!newGuests[booking.id]) newGuests[booking.id] = { name: '', email: '', phone: '' }
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
        class="bg-white rounded-xl shadow p-5 border relative"
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
              @click="confirmDeleteGuest(guest)"
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

        <!-- Mensaje de éxito sobre cada booking -->
        <div v-if="showMessage" class="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded shadow">
          {{ successMessage }}
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

    <!-- Modal de confirmación de eliminación -->
    <div v-if="guestToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-96">
        <h3 class="text-lg font-semibold mb-4">Confirmar eliminación</h3>
        <p class="mb-4">¿Seguro que quieres eliminar a <strong>{{ guestToDelete.name }}</strong>?</p>
        <div class="flex justify-end space-x-2">
          <button @click="guestToDelete = null" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
          <button @click="deleteConfirmedGuest" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>
