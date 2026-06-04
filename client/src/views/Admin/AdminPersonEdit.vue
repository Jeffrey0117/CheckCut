<template>
  <div class="min-h-screen page-root">
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">{{ isEdit ? '編輯人物' : '新增人物' }}</h1>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm field-label mb-1">姓名 *</label>
          <input v-model="form.name" type="text" required class="themed-input w-full px-4 py-2 rounded-lg focus:outline-none" @input="autoSlug">
        </div>

        <div>
          <label class="block text-sm field-label mb-1">網址代稱 (Slug)</label>
          <input v-model="form.slug" type="text" class="themed-input w-full px-4 py-2 rounded-lg focus:outline-none" placeholder="留空將依姓名自動產生">
        </div>

        <div>
          <label class="block text-sm field-label mb-1">頭像網址</label>
          <input v-model="form.avatar_url" type="url" class="themed-input w-full px-4 py-2 rounded-lg focus:outline-none">
        </div>

        <div>
          <label class="block text-sm field-label mb-1">簡介</label>
          <textarea v-model="form.bio" rows="3" class="themed-input w-full px-4 py-2 rounded-lg focus:outline-none"></textarea>
        </div>

        <div>
          <label class="block text-sm field-label mb-1">SeedBlog 作者 ID</label>
          <input v-model="form.seedblog_author_id" type="text" class="themed-input w-full px-4 py-2 rounded-lg focus:outline-none">
        </div>

        <p v-if="error" class="error-text text-sm">{{ error }}</p>

        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="saving"
            class="primary-btn px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {{ saving ? '儲存中…' : '儲存' }}
          </button>
          <router-link
            to="/admin/persons"
            class="neutral-btn px-6 py-2 rounded-lg transition-colors"
          >
            取消
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
      error.value = '載入人物失敗:' + err.message
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

<style scoped>
.page-root {
  background-color: var(--bg-color);
  color: var(--primary-text-color);
}

.field-label {
  color: var(--secondary-text-color);
}

.error-text {
  color: var(--destructive-color);
}

.themed-input {
  background-color: var(--search-bar-color);
  color: var(--primary-text-color);
  border: 1px solid color-mix(in srgb, var(--primary-text-color) 12%, transparent);
}

.themed-input::placeholder {
  color: var(--tertiary-text-color);
}

.themed-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color);
}

.primary-btn {
  background-color: var(--primary-color);
  color: var(--text-with-main-color);
}

.primary-btn:hover:not(:disabled) {
  background-color: var(--primary-color-hover);
}

.neutral-btn {
  background-color: var(--secondary-card-bg-color);
  color: var(--primary-text-color);
}

.neutral-btn:hover {
  background-color: color-mix(in srgb, var(--primary-text-color) 12%, var(--secondary-card-bg-color));
}
</style>
