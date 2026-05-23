<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">{{ isEdit ? 'Edit Video' : 'New Video' }}</h1>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm text-gray-300 mb-1">Title *</label>
          <input v-model="form.title" type="text" required class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1">Description</label>
          <textarea v-model="form.description" rows="3" class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1">Pokkit URL *</label>
          <input v-model="form.pokkit_url" type="url" required class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://pokkit.example.com/files/...">
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1">Thumbnail URL</label>
          <input v-model="form.thumbnail_url" type="url" class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-300 mb-1">Duration (seconds)</label>
            <input v-model.number="form.duration" type="number" min="0" class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-sm text-gray-300 mb-1">Sort Order</label>
            <input v-model.number="form.sort_order" type="number" class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1">Person</label>
          <select v-model="form.person_id" class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">-- None --</option>
            <option v-for="p in persons" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1">Category</label>
          <input v-model="form.category" type="text" class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1">Tags (comma separated)</label>
          <input v-model="form.tags" type="text" class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="tag1, tag2, tag3">
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1">Source URL</label>
          <input v-model="form.source_url" type="url" class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1">Status</label>
          <select v-model="form.status" class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </div>

        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
          >
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
          <router-link
            to="/admin/videos"
            class="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPersons, createVideo, updateVideo } from '../../helpers/api/local.js'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const persons = ref([])
const saving = ref(false)
const error = ref('')

const form = reactive({
  title: '',
  description: '',
  pokkit_url: '',
  thumbnail_url: '',
  duration: 0,
  person_id: '',
  category: '',
  tags: '',
  source_url: '',
  status: 'draft',
  sort_order: 0,
})

onMounted(async () => {
  try {
    const pData = await getPersons()
    persons.value = pData.persons || []
  } catch {
    // ignore
  }

  if (isEdit.value) {
    try {
      const res = await fetch(`/api/v1/admin/videos/${route.params.id}`, { credentials: 'include' })
      const json = await res.json()
      const v = json.data
      if (v) {
        form.title = v.title || ''
        form.description = v.description || ''
        form.pokkit_url = v.pokkit_url || ''
        form.thumbnail_url = v.thumbnail_url || ''
        form.duration = v.duration || 0
        form.person_id = v.person_id || ''
        form.category = v.category || ''
        form.tags = Array.isArray(v.tags) ? v.tags.join(', ') : v.tags || ''
        form.source_url = v.source_url || ''
        form.status = v.status || 'draft'
        form.sort_order = v.sort_order || 0
      }
    } catch (err) {
      error.value = 'Failed to load video: ' + err.message
    }
  }
})

async function handleSubmit() {
  error.value = ''
  saving.value = true

  const payload = {
    ...form,
    tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    person_id: form.person_id || null,
  }

  try {
    if (isEdit.value) {
      await updateVideo(route.params.id, payload)
    } else {
      await createVideo(payload)
    }
    router.push('/admin/videos')
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}
</script>
