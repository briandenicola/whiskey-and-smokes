<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usersApi, type User } from '../services/users'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const users = ref<User[]>([])
const isLoading = ref(true)
const searchQuery = ref('')

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u =>
    u.displayName.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q)
  )
})

onMounted(async () => {
  try {
    const { data } = await usersApi.listUsers()
    users.value = data
  } finally {
    isLoading.value = false
  }
})

async function toggleRole(user: User) {
  const newRole = user.role === 'admin' ? 'user' : 'admin'
  const { data } = await usersApi.updateRole(user.id, newRole)
  const index = users.value.findIndex(u => u.id === user.id)
  if (index !== -1) users.value[index] = data
}
</script>

<template>
  <div class="p-4 max-w-lg mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold">Admin Panel</h2>
      <router-link to="/profile" class="text-sm text-stone-400 hover:text-stone-200">← Back</router-link>
    </div>

    <!-- User count -->
    <div class="bg-stone-900 border border-stone-800 rounded-xl p-4 mb-4 flex justify-around text-center">
      <div>
        <p class="text-2xl font-bold text-amber-500">{{ users.length }}</p>
        <p class="text-xs text-stone-500">Total Users</p>
      </div>
      <div>
        <p class="text-2xl font-bold text-amber-500">{{ users.filter(u => u.role === 'admin').length }}</p>
        <p class="text-xs text-stone-500">Admins</p>
      </div>
    </div>

    <!-- Search -->
    <input
      v-model="searchQuery"
      placeholder="Search users..."
      class="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-700 mb-4"
    />

    <div v-if="isLoading" class="text-stone-500 text-center py-12">Loading...</div>

    <div v-else class="space-y-3">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="bg-stone-900 border border-stone-800 rounded-xl p-4"
      >
        <div class="flex items-center justify-between">
          <div class="min-w-0 flex-1 mr-3">
            <p class="font-medium text-stone-100 truncate">{{ user.displayName }}</p>
            <p class="text-sm text-stone-500 truncate">{{ user.email }}</p>
            <p class="text-xs text-stone-600 mt-1">
              Joined {{ new Date(user.createdAt).toLocaleDateString() }}
            </p>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button
              @click="toggleRole(user)"
              :disabled="user.id === auth.user?.id"
              class="text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50"
              :class="user.role === 'admin'
                ? 'border-amber-600 text-amber-500 hover:bg-amber-700/20'
                : 'border-stone-700 text-stone-400 hover:bg-stone-800'"
            >
              {{ user.role }}
            </button>
          </div>
        </div>
      </div>

      <p v-if="filteredUsers.length === 0" class="text-stone-500 text-center py-8">
        No users match your search
      </p>
    </div>
  </div>
</template>
