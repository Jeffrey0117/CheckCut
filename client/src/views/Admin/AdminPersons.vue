<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Manage Persons</h1>
        <router-link
          to="/admin/persons/new"
          class="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
        >
          + New Person
        </router-link>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>

      <div v-else-if="persons.length === 0" class="text-center py-12 text-gray-400">
        No persons yet.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="person in persons"
          :key="person.id"
          class="flex items-center gap-4 p-4 rounded-lg bg-gray-800"
        >
          <img
            :src="person.avatar_url || '/placeholder-avatar.png'"
            :alt="person.name"
            class="w-12 h-12 rounded-full object-cover bg-gray-700 flex-shrink-0"
          >
          <div class="flex-1 min-w-0">
            <p class="font-medium">{{ person.name }}</p>
            <p class="text-sm text-gray-400">{{ person.slug }}</p>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <router-link
              :to="`/admin/persons/${person.id}`"
              class="px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Edit
            </router-link>
            <button
              class="px-3 py-1.5 text-sm rounded bg-red-700 hover:bg-red-600 transition-colors"
              @click="handleDelete(person.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPersons, deletePerson } from '../../helpers/api/local.js'

const persons = ref([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const data = await getPersons()
    persons.value = data.persons || []
  } catch (err) {
    console.error('Failed to load persons:', err)
  } finally {
    loading.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('Delete this person?')) return
  try {
    await deletePerson(id)
    persons.value = persons.value.filter((p) => p.id !== id)
  } catch (err) {
    alert('Failed to delete: ' + err.message)
  }
}

onMounted(load)
</script>
