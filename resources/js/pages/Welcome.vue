<script setup>
import { reactive, ref, onMounted, computed } from 'vue';
import { useMintyTestStore } from '@/stores/minty-test';

// =======================
// 1️⃣ STORE
// =======================
const store = useMintyTestStore();

// =======================
// 2️⃣ ESTADO REACTIVO
// =======================
const deleteMessage = ref('');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 6;

const newGuests = reactive({});      // { bookingId: { name, email, phone } }
const addErrors = reactive({});      // { bookingId: { name, email, phone } }

const editingGuest = ref(null);
const editForm = reactive({ name: '', email: '', phone: '' });
const editErrors = reactive({ name: '', email: '', phone: '' });
const successMessage = ref('');

const confirmDelete = ref(false);
const guestToDelete = ref(null);

// =======================
// 3️⃣ COMPUTED
// =======================

// Filtrar bookings por nombre de guest
const filteredBookings = computed(() => {
    if (!searchQuery.value.trim()) return store.bookings;

    const query = searchQuery.value.toLowerCase().trim();
    return store.bookings.filter(booking =>
        booking.guests?.some(guest => guest.name.toLowerCase().includes(query))
    );
});

// Paginación
const totalPages = computed(() => Math.ceil(filteredBookings.value.length / itemsPerPage));

const paginatedBookings = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredBookings.value.slice(start, end);
});

// =======================
// 4️⃣ VALIDACIONES
// =======================
function isValidName(name) {
    return /^[a-zA-ZÀ-ÿ\s]+$/.test(name);
}
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhone(phone) {
    return /^[0-9]+$/.test(phone);
}

// =======================
// 5️⃣ FUNCIONES DE FORMULARIO / CRUD
// =======================

// Formatear fechas
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

// Abrir modal de edición
function openEditModal(guest) {
    editingGuest.value = guest;
    editForm.name = guest.name;
    editForm.email = guest.email;
    editForm.phone = guest.phone;
    editErrors.name = '';
    editErrors.email = '';
    editErrors.phone = '';
}

// Guardar cambios en edición
async function saveGuest() {
    if (!editingGuest.value) return;

    // Limpiar errores
    editErrors.name = '';
    editErrors.email = '';
    editErrors.phone = '';

    // Validación
    if (!editForm.name) editErrors.name = 'El nombre es obligatorio';
    else if (!isValidName(editForm.name)) editErrors.name = 'Solo letras y espacios';

    if (!editForm.email) editErrors.email = 'El email es obligatorio';
    else if (!isValidEmail(editForm.email)) editErrors.email = 'Formato de email inválido (ej: usuario@dominio.com)';

    if (!editForm.phone) editErrors.phone = 'El teléfono es obligatorio';
    else if (!isValidPhone(editForm.phone)) editErrors.phone = 'Solo números';

    if (editErrors.name || editErrors.email || editErrors.phone) return;

    await store.updateGuest(editingGuest.value.id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
    });

    successMessage.value = 'Se ha actualizado con éxito';

    setTimeout(() => {
        successMessage.value = '';
        editingGuest.value = null;
    }, 3000);
}

// Cancelar edición
function cancelEdit() {
    editingGuest.value = null;
}

// Abrir modal de confirmación de eliminación
function openDeleteConfirm(guestId) {
    guestToDelete.value = guestId;
    confirmDelete.value = true;
}

// Cancelar eliminación
function cancelDelete() {
    confirmDelete.value = false;
    guestToDelete.value = null;
}

// Confirmar eliminación
async function confirmDeleteGuest() {
    if (!guestToDelete.value) return;

    await store.deleteGuest(guestToDelete.value);
    deleteMessage.value = 'Guest eliminado con éxito';

    confirmDelete.value = false;
    guestToDelete.value = null;

    setTimeout(() => {
        deleteMessage.value = '';
    }, 3000);
}

// Añadir guest
async function addGuestToBooking(bookingId) {
    const guestData = newGuests[bookingId];
    addErrors[bookingId] = { name: '', email: '', phone: '' };

    if (!guestData.name) addErrors[bookingId].name = 'El nombre es obligatorio';
    else if (!isValidName(guestData.name)) addErrors[bookingId].name = 'Solo letras y espacios';

    if (!guestData.email) addErrors[bookingId].email = 'El email es obligatorio';
    else if (!isValidEmail(guestData.email)) addErrors[bookingId].email = 'Formato de email inválido (ej: usuario@dominio.com)';

    if (!guestData.phone) addErrors[bookingId].phone = 'El teléfono es obligatorio';
    else if (!isValidPhone(guestData.phone)) addErrors[bookingId].phone = 'Solo números';

    if (addErrors[bookingId].name || addErrors[bookingId].email || addErrors[bookingId].phone) return;

    await store.addGuest(bookingId, guestData);
    newGuests[bookingId] = { name: '', email: '', phone: '' };
}

// =======================
// 6️⃣ PAGINACIÓN / BÚSQUEDA
// =======================
function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) currentPage.value = page;
}

function handleSearchChange() {
    currentPage.value = 1;
}

// =======================
// 7️⃣ LIFECYCLE
// =======================
onMounted(async () => {
    await store.fetchBookings();

    for (const booking of store.bookings) {
        await store.getGuests(booking.id);
        newGuests[booking.id] = { name: '', email: '', phone: '' };
        addErrors[booking.id] = { name: '', email: '', phone: '' };
    }
});
</script>

<template>
  <div class="min-h-screen">
    <!-- Cabecera con imagen de fondo - Responsive -->
    <header 
      class="w-full h-40 sm:h-48 md:h-64 bg-contain bg-center bg-no-repeat flex items-center justify-center"
      :style="{ backgroundImage: 'url(/images/minty-logo.png)' }"
    >
    </header>

    <!-- Contenido principal con fondo gris - Responsive padding -->
    <div class="bg-gray-200 min-h-screen p-3 sm:p-4 md:p-6">
      <h1 class="text-2xl sm:text-3xl md:text-4xl font-light tracking-wide mb-6 sm:mb-8 text-center text-gray-700" style="font-family: 'Georgia', serif;">
        Bookings
      </h1>

      <!-- Barra de búsqueda - Responsive -->
      <div class="max-w-md mx-auto mb-4 sm:mb-6 px-2 sm:px-0">
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="handleSearchChange"
            type="text"
            placeholder="Buscar por nombre de guest..."
            class="w-full px-4 py-2 sm:py-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
          />
          <svg class="absolute left-3 top-2.5 sm:top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <p v-if="searchQuery && filteredBookings.length === 0" class="mt-2 text-xs sm:text-sm text-gray-500 text-center px-2">
          No se encontraron bookings con guests que coincidan con "{{ searchQuery }}"
        </p>
        <p v-else-if="searchQuery" class="mt-2 text-xs sm:text-sm text-gray-500 text-center">
          {{ filteredBookings.length }} {{ filteredBookings.length === 1 ? 'resultado' : 'resultados' }}
        </p>
      </div>

      <div v-if="store.loading" class="text-gray-500 text-center text-sm sm:text-base">
        Cargando bookings...
      </div>

      <!-- Mensaje de éxito al eliminar -->
      <p v-if="deleteMessage" class="mb-4 text-center text-green-600 text-sm sm:text-base px-2">
        {{ deleteMessage }}
      </p>

      <div v-else>
        <!-- Grid de bookings - Responsive -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6">
          <div
            v-for="booking in paginatedBookings"
            :key="booking.id"
            class="bg-white rounded-xl shadow-md border-l-8 border-green-500 p-4 sm:p-5"
          >
            <h2 class="text-base sm:text-lg font-semibold mb-2">Booking #{{ booking.id }}</h2>

            <p class="text-xs sm:text-sm text-gray-600">
              <span class="font-medium">Check-in:</span> {{ formatDate(booking.checkin_at) }}
            </p>
            <p class="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              <span class="font-medium">Check-out:</span> {{ formatDate(booking.checkout_at) }}
            </p>

            <!-- Guests existentes - Responsive -->
            <div v-for="guest in booking.guests || []" :key="guest.id" class="mt-2 p-2 sm:p-3 border rounded bg-gray-50">
              <p class="text-xs sm:text-sm break-words"><span class="font-medium">Nombre:</span> {{ guest.name }}</p>
              <p class="text-xs sm:text-sm break-words"><span class="font-medium">Email:</span> {{ guest.email }}</p>
              <p class="text-xs sm:text-sm break-words"><span class="font-medium">Teléfono:</span> {{ guest.phone }}</p>

              <div class="mt-2 flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:gap-0">
                <button
                  @click="openEditModal(guest)"
                  class="px-3 py-1.5 sm:py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs sm:text-sm transition"
                >
                  Editar
                </button>
                <button
                  @click="openDeleteConfirm(guest.id)"
                  class="px-3 py-1.5 sm:py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs sm:text-sm transition"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <!-- Formulario para añadir nuevo guest - Responsive -->
            <div class="mt-3 sm:mt-4 p-2 sm:p-3 border rounded bg-gray-100">
              <h3 class="text-xs sm:text-sm font-semibold mb-2">Añadir Guest</h3>
              <input
                v-model="newGuests[booking.id].name"
                type="text"
                placeholder="Nombre"
                class="w-full mb-2 p-2 border rounded text-xs sm:text-sm"
                :class="addErrors[booking.id]?.name ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="addErrors[booking.id]?.name" class="mt-1 text-xs text-red-500">
                {{ addErrors[booking.id].name }}
              </p>

              <input
                v-model="newGuests[booking.id].email"
                type="email"
                placeholder="Email"
                class="w-full mb-2 p-2 border rounded text-xs sm:text-sm"
                :class="addErrors[booking.id]?.email ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="addErrors[booking.id]?.email" class="mt-1 text-xs text-red-500">
                {{ addErrors[booking.id].email }}
              </p>

              <input
                v-model="newGuests[booking.id].phone"
                type="text"
                placeholder="Teléfono"
                class="w-full mb-2 p-2 border rounded text-xs sm:text-sm"
                :class="addErrors[booking.id]?.phone ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="addErrors[booking.id]?.phone" class="mt-1 text-xs text-red-500">
                {{ addErrors[booking.id].phone }}
              </p>

              <button
                @click="addGuestToBooking(booking.id)"
                class="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-xs sm:text-sm transition"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>

        <!-- Paginación - Responsive -->
        <div v-if="filteredBookings.length > itemsPerPage" class="flex flex-wrap justify-center items-center gap-2 mt-6 sm:mt-8 px-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 sm:px-4 py-2 rounded bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-xs sm:text-sm"
          >
            Anterior
          </button>

          <!-- En móvil, mostrar solo algunas páginas -->
          <template v-if="totalPages <= 5">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 sm:px-4 py-2 rounded transition text-xs sm:text-sm',
                page === currentPage
                  ? 'bg-green-500 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </template>
          <template v-else>
            <!-- Mostrar páginas cercanas a la actual -->
            <button
              v-for="page in [1, currentPage - 1, currentPage, currentPage + 1, totalPages].filter((p, i, arr) => p >= 1 && p <= totalPages && arr.indexOf(p) === i)"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 sm:px-4 py-2 rounded transition text-xs sm:text-sm',
                page === currentPage
                  ? 'bg-green-500 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </template>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 sm:px-4 py-2 rounded bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-xs sm:text-sm"
          >
            Siguiente
          </button>
        </div>
      </div>

      <!-- Modal de confirmación de eliminación - Responsive -->
      <div v-if="confirmDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white p-4 sm:p-6 rounded-lg w-full max-w-sm sm:max-w-md shadow-xl">
          <h3 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">Confirmar Eliminación</h3>
          <p class="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">¿Seguro que quieres eliminar este guest?</p>
          
          <div class="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-3 sm:gap-0">
            <button 
              @click="cancelDelete" 
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition text-sm sm:text-base order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button 
              @click="confirmDeleteGuest" 
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm sm:text-base order-1 sm:order-2"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de edición - Responsive -->
      <div v-if="editingGuest" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white p-4 sm:p-6 rounded-lg w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto">
          <h3 class="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Editar Guest</h3>

          <!-- Mensaje de éxito -->
          <p v-if="successMessage" class="mb-2 text-xs sm:text-sm text-green-600">
            {{ successMessage }}
          </p>

          <input
            v-model="editForm.name"
            type="text"
            placeholder="Nombre"
            class="w-full mb-2 p-2 border rounded text-sm"
            :class="editErrors.name ? 'border-red-500' : 'border-gray-300'"
          />
          <p v-if="editErrors.name" class="mt-1 mb-2 text-xs text-red-500">
            {{ editErrors.name }}
          </p>

          <input
            v-model="editForm.email"
            type="text"
            placeholder="Email"
            class="w-full mb-2 p-2 border rounded text-sm"
            :class="editErrors.email ? 'border-red-500' : 'border-gray-300'"
          />
          <p v-if="editErrors.email" class="mt-1 mb-2 text-xs text-red-500">
            {{ editErrors.email }}
          </p>

          <input
            v-model="editForm.phone"
            type="text"
            placeholder="Teléfono"
            class="w-full mb-2 p-2 border rounded text-sm"
            :class="editErrors.phone ? 'border-red-500' : 'border-gray-300'"
          />
          <p v-if="editErrors.phone" class="mt-1 mb-2 text-xs text-red-500">
            {{ editErrors.phone }}
          </p>

          <div class="mt-4 flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 sm:gap-0">
            <button 
              @click="cancelEdit" 
              class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button 
              @click="saveGuest" 
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm order-1 sm:order-2"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>