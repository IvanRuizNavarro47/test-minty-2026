<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useMintyTestStore } from '@/stores/minty-test'

const store = useMintyTestStore()

const deleteMessage = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 6

// Formatear fechas
function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

// Formulario de nuevos guests por booking
const newGuests = reactive({}) // { bookingId: { name, email, phone } }
// Errores de add guest
const addErrors = reactive({}) // { bookingId: { name, email, phone } }

// Modal de edición
const editingGuest = ref(null)
const editForm = reactive({ name: '', email: '', phone: '' })
const editErrors = reactive({ name: '', email: '', phone: '' })
const successMessage = ref('')

// Modal de confirmación de eliminación
const confirmDelete = ref(false)
const guestToDelete = ref(null)

// Funciones de validación
function isValidName(name) {
  return /^[a-zA-ZÀ-ÿ\s]+$/.test(name)
}
function isValidEmail(email) {
  return /^[a-zA-Z0-9@.]+$/.test(email)
}
function isValidPhone(phone) {
  return /^[0-9]+$/.test(phone)
}

// Filtrar bookings por nombre de guest
const filteredBookings = computed(() => {
  if (!searchQuery.value.trim()) {
    return store.bookings
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  
  return store.bookings.filter(booking => {
    // Si el booking tiene guests, buscar en sus nombres
    if (booking.guests && booking.guests.length > 0) {
      return booking.guests.some(guest => 
        guest.name.toLowerCase().includes(query)
      )
    }
    return false
  })
})

// Paginación
const totalPages = computed(() => {
  return Math.ceil(filteredBookings.value.length / itemsPerPage)
})

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredBookings.value.slice(start, end)
})

// Cambiar de página
function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Resetear página cuando cambia la búsqueda
function handleSearchChange() {
  currentPage.value = 1
}

// Abrir modal de edición
function openEditModal(guest) {
  editingGuest.value = guest
  editForm.name = guest.name
  editForm.email = guest.email
  editForm.phone = guest.phone
  editErrors.name = ''
  editErrors.email = ''
  editErrors.phone = ''
}

// Guardar cambios en edición
async function saveGuest() {
  if (!editingGuest.value) return

  // Limpiar errores
  editErrors.name = ''
  editErrors.email = ''
  editErrors.phone = ''

  // Validación
  if (!editForm.name) editErrors.name = 'El nombre es obligatorio'
  else if (!isValidName(editForm.name)) editErrors.name = 'Solo letras y espacios'

  if (!editForm.email) editErrors.email = 'El email es obligatorio'
  else if (!isValidEmail(editForm.email)) editErrors.email = 'Solo letras, números, @ y puntos'

  if (!editForm.phone) editErrors.phone = 'El teléfono es obligatorio'
  else if (!isValidPhone(editForm.phone)) editErrors.phone = 'Solo números'

  if (editErrors.name || editErrors.email || editErrors.phone) return

  await store.updateGuest(editingGuest.value.id, {
    name: editForm.name,
    email: editForm.email,
    phone: editForm.phone,
  })

  successMessage.value = 'Se ha actualizado con éxito'

  setTimeout(() => {
    successMessage.value = ''
    editingGuest.value = null
  }, 3000)
}

// Cancelar edición
function cancelEdit() {
  editingGuest.value = null
}

// Abrir modal de confirmación de eliminación
function openDeleteConfirm(guestId) {
  guestToDelete.value = guestId
  confirmDelete.value = true
}

// Cancelar eliminación
function cancelDelete() {
  confirmDelete.value = false
  guestToDelete.value = null
}

// Confirmar eliminación
async function confirmDeleteGuest() {
  if (!guestToDelete.value) return

  await store.deleteGuest(guestToDelete.value)
  deleteMessage.value = 'Guest eliminado con éxito'

  confirmDelete.value = false
  guestToDelete.value = null

  setTimeout(() => {
    deleteMessage.value = ''
  }, 3000)
}

// Añadir guest
async function addGuestToBooking(bookingId) {
  const guestData = newGuests[bookingId]
  // Limpiar errores
  addErrors[bookingId] = { name: '', email: '', phone: '' }

  // Validación
  if (!guestData.name) addErrors[bookingId].name = 'El nombre es obligatorio'
  else if (!isValidName(guestData.name)) addErrors[bookingId].name = 'Solo letras y espacios'

  if (!guestData.email) addErrors[bookingId].email = 'El email es obligatorio'
  else if (!isValidEmail(guestData.email)) addErrors[bookingId].email = 'Solo letras, números, @ y puntos'

  if (!guestData.phone) addErrors[bookingId].phone = 'El teléfono es obligatorio'
  else if (!isValidPhone(guestData.phone)) addErrors[bookingId].phone = 'Solo números'

  if (addErrors[bookingId].name || addErrors[bookingId].email || addErrors[bookingId].phone) return

  await store.addGuest(bookingId, guestData)
  newGuests[bookingId] = { name: '', email: '', phone: '' }
}

// Cargar bookings y guests al montar
onMounted(async () => {
  await store.fetchBookings()
  for (const booking of store.bookings) {
    await store.getGuests(booking.id)
    newGuests[booking.id] = { name: '', email: '', phone: '' }
    addErrors[booking.id] = { name: '', email: '', phone: '' }
  }
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Cabecera con imagen de fondo -->
    <header 
      class="w-full h-64 bg-contain bg-center bg-no-repeat flex items-center justify-center"
      :style="{ backgroundImage: 'url(/images/minty-logo.png)' }"
    >
    </header>

    <!-- Contenido principal con fondo gris -->
    <div class="bg-gray-200 min-h-screen p-6">
      <h1 class="text-4xl font-light tracking-wide mb-8 text-center text-gray-700" style="font-family: 'Georgia', serif;">Bookings</h1>

      <!-- Barra de búsqueda -->
      <div class="max-w-md mx-auto mb-6">
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="handleSearchChange"
            type="text"
            placeholder="Buscar por nombre de guest..."
            class="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <svg class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <p v-if="searchQuery && filteredBookings.length === 0" class="mt-2 text-sm text-gray-500 text-center">
          No se encontraron bookings con guests que coincidan con "{{ searchQuery }}"
        </p>
        <p v-else-if="searchQuery" class="mt-2 text-sm text-gray-500 text-center">
          {{ filteredBookings.length }} {{ filteredBookings.length === 1 ? 'resultado' : 'resultados' }}
        </p>
      </div>

      <div v-if="store.loading" class="text-gray-500 text-center">
        Cargando bookings...
      </div>

      <!-- Mensaje de éxito al eliminar -->
      <p v-if="deleteMessage" class="mb-4 text-center text-green-600">
        {{ deleteMessage }}
      </p>

      <div v-else>
        <!-- Grid de bookings -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div
            v-for="booking in paginatedBookings"
            :key="booking.id"
            class="bg-white rounded-xl shadow-md border-l-8 border-green-500 p-5"
          >
            <h2 class="text-lg font-semibold mb-2">Booking #{{ booking.id }}</h2>

            <p class="text-sm text-gray-600">
              <span class="font-medium">Check-in:</span> {{ formatDate(booking.checkin_at) }}
            </p>
            <p class="text-sm text-gray-600 mb-4">
              <span class="font-medium">Check-out:</span> {{ formatDate(booking.checkout_at) }}
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
                  @click="openDeleteConfirm(guest.id)"
                  class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <!-- Formulario para añadir nuevo guest -->
            <div class="mt-4 p-3 border rounded bg-gray-100">
              <h3 class="text-sm font-semibold mb-2">Añadir Guest</h3>
              <input
                v-model="newGuests[booking.id].name"
                type="text"
                placeholder="Nombre"
                class="w-full mb-2 p-2 border rounded"
                :class="addErrors[booking.id]?.name ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="addErrors[booking.id]?.name" class="mt-1 text-xs text-red-500">
                {{ addErrors[booking.id].name }}
              </p>

              <input
                v-model="newGuests[booking.id].email"
                type="email"
                placeholder="Email"
                class="w-full mb-2 p-2 border rounded"
                :class="addErrors[booking.id]?.email ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="addErrors[booking.id]?.email" class="mt-1 text-xs text-red-500">
                {{ addErrors[booking.id].email }}
              </p>

              <input
                v-model="newGuests[booking.id].phone"
                type="text"
                placeholder="Teléfono"
                class="w-full mb-2 p-2 border rounded"
                :class="addErrors[booking.id]?.phone ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="addErrors[booking.id]?.phone" class="mt-1 text-xs text-red-500">
                {{ addErrors[booking.id].phone }}
              </p>

              <button
                @click="addGuestToBooking(booking.id)"
                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 rounded bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Anterior
          </button>

          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-4 py-2 rounded transition',
              page === currentPage
                ? 'bg-green-500 text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 rounded bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Siguiente
          </button>
        </div>
      </div>

      <!-- Modal de confirmación de eliminación -->
      <div v-if="confirmDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white p-6 rounded-lg w-96 shadow-xl">
          <h3 class="text-lg font-semibold mb-4 text-gray-800">Confirmar Eliminación</h3>
          <p class="text-gray-600 mb-6">¿Seguro que quieres eliminar este guest?</p>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="cancelDelete" 
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
            <button 
              @click="confirmDeleteGuest" 
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de edición -->
      <div v-if="editingGuest" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white p-6 rounded-lg w-96">
          <h3 class="text-lg font-semibold mb-4">Editar Guest</h3>

          <!-- Mensaje de éxito -->
          <p v-if="successMessage" class="mb-2 text-sm text-green-600">
            {{ successMessage }}
          </p>

          <input
            v-model="editForm.name"
            type="text"
            placeholder="Nombre"
            class="w-full mb-2 p-2 border rounded"
            :class="editErrors.name ? 'border-red-500' : 'border-gray-300'"
          />
          <p v-if="editErrors.name" class="mt-1 text-xs text-red-500">
            {{ editErrors.name }}
          </p>

          <input
            v-model="editForm.email"
            type="text"
            placeholder="Email"
            class="w-full mb-2 p-2 border rounded"
            :class="editErrors.email ? 'border-red-500' : 'border-gray-300'"
          />
          <p v-if="editErrors.email" class="mt-1 text-xs text-red-500">
            {{ editErrors.email }}
          </p>

          <input
            v-model="editForm.phone"
            type="text"
            placeholder="Teléfono"
            class="w-full mb-2 p-2 border rounded"
            :class="editErrors.phone ? 'border-red-500' : 'border-gray-300'"
          />
          <p v-if="editErrors.phone" class="mt-1 text-xs text-red-500">
            {{ editErrors.phone }}
          </p>

          <div class="mt-4 flex justify-end space-x-2">
            <button @click="cancelEdit" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
            <button @click="saveGuest" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>