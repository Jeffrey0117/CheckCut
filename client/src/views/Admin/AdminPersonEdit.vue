<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">{{ isEdit ? 'Edit Person' : 'New Person' }}</h1>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm text-gray-300 mb-1">Name *</label>
          <input v-model="form.name" type="text" required class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" @input="autoSlug">
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1">Slug</label>
          <input v-model="form.slug" type="text" class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="auto-generated-from-name">
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1">Avatar URL</label>
          <input v-model="form.avatar_url" type="url" class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1">Bio</label>
          <textarea v-model="form.bio" rows="3" class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
        </div>

        <div>
          <label class="block text-sm text-gray-300 mb-1">SeedBlog Author ID</label>
          <input v-model="form.seedblog_author_id" type="text" class="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
          >
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
          <router-link
            to="/admin/persons"
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
import { getPersonById, createPerson, updatePerson } from '../../helpers/api/local.js'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const error = ref('')
const slugManuallyEdited = ref(false)

const form = reactive({
  name: '',
  slug: '',
  avatar_url: '',
  bio: '',
  seedblog_author_id: '',
})

function autoSlug() {
  if (!slugManuallyEdited.value) {
    form.slug = form.name
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
}

onMounted(async () => {
  if (isEdit.value) {
    try {
      const data = await getPersonById(route.params.id)
      const p = data.person
      if (p) {
        form.name = p.name || ''
        form.slug = p.slug || ''
        form.avatar_url = p.avatar_url || ''
        form.bio = p.bio || ''
        form.seedblog_author_id = p.seedblog_author_id || ''
        slugManuallyEdited.value = true
      }
    } catch (err) {
      error.value = 'Failed to load person: ' + err.message
    }
  }
})

async function handleSubmit() {
  error.value = ''
  saving.value = true
  try {
    if (isEdit.value) {
      await updatePerson(route.params.id, { ...form })
    } else {
      await createPerson({ ...form })
    }
    router.push('/admin/persons')
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}
</script>
