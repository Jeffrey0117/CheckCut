<template>
  <div class="min-h-screen page-root">
    <div class="max-w-3xl mx-auto px-4 py-8">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-2xl font-bold flex items-center gap-3">
          <font-awesome-icon :icon="['fas', 'video']" class="accent-icon" />
          影片工作室
        </h1>
        <p class="subtitle mt-2 text-sm">
          上傳你自己的影片，或貼 YouTube 網址一鍵轉成自架
        </p>
      </header>

      <!-- ============ Section A：上傳檔案 ============ -->
      <section class="card mb-8 p-6 rounded-xl">
        <h2 class="text-lg font-semibold flex items-center gap-2 mb-1">
          <font-awesome-icon :icon="['fas', 'cloud-arrow-up']" class="accent-icon" />
          上傳檔案
        </h2>
        <p class="subtitle text-sm mb-4">支援 mp4/ mov / webm 影片格式</p>

        <form class="space-y-4" @submit.prevent="handleUpload">
          <!-- Drop zone -->
          <div
            class="drop-zone rounded-xl px-4 py-10 text-center cursor-pointer transition-colors"
            :class="{ 'drop-zone--active': dragOver, 'drop-zone--has-file': !!uploadFile }"
            role="button"
            tabindex="0"
            @click="triggerFilePick"
            @keydown.enter.prevent="triggerFilePick"
            @keydown.space.prevent="triggerFilePick"
            @dragover.prevent="dragOver = true"
            @dragenter.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="handleDrop"
          >
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
              @change="handleFileChange"
            >
            <template v-if="!uploadFile">
              <font-awesome-icon :icon="['fas', 'cloud-arrow-up']" class="drop-icon mb-3" />
              <p class="font-medium">拖曳影片到這裡，或點擊選擇檔案</p>
              <p class="subtitle text-xs mt-1">mp4 / mov / webm</p>
            </template>
            <template v-else>
              <font-awesome-icon :icon="['fas', 'file-video']" class="drop-icon mb-3" />
              <p class="font-medium break-all">{{ uploadFile.name }}</p>
              <p class="subtitle text-xs mt-1">{{ formatSize(uploadFile.size) }} ・ 點擊可重新選擇</p>
            </template>
          </div>

          <div>
            <label class="block text-sm field-label mb-1">標題</label>
            <input
              v-model="uploadForm.title"
              type="text"
              class="themed-input w-full px-4 py-2 rounded-lg focus:outline-none"
              placeholder="（選填）"
            >
          </div>

          <div>
            <label class="block text-sm field-label mb-2">可見性</label>
            <div class="flex gap-6">
              <label class="radio-label">
                <input v-model="uploadForm.visibility" type="radio" value="public">
                <span>公開</span>
              </label>
              <label class="radio-label">
                <input v-model="uploadForm.visibility" type="radio" value="private">
                <span>私有</span>
              </label>
            </div>
          </div>

          <!-- Progress bar -->
          <div v-if="uploading" class="space-y-1">
            <div class="progress-track rounded-full overflow-hidden">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
            </div>
            <p class="subtitle text-xs">上傳中… {{ uploadProgress }}%</p>
          </div>

          <p v-if="uploadError" class="error-text text-sm flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
            {{ uploadError }}
          </p>

          <!-- Success card -->
          <div v-if="uploadResult" class="success-card rounded-lg p-4">
            <p class="font-medium flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'circle-check']" class="success-icon" />
              上傳成功！
            </p>
            <p class="subtitle text-sm mt-2">
              上傳後伺服器會自動轉檔，稍候即可播放（目前狀態：{{ uploadResult.status }}）
            </p>
            <div class="flex flex-wrap gap-3 mt-3">
              <a :href="`#/watch/${uploadResult.id}`" class="link-btn">
                <font-awesome-icon :icon="['fas', 'play']" /> 前往播放頁
              </a>
              <a :href="`#/admin/videos/${uploadResult.id}`" class="link-btn">
                <font-awesome-icon :icon="['fas', 'pen']" /> 編輯影片
              </a>
            </div>
          </div>

          <button
            type="submit"
            :disabled="uploading || !uploadFile"
            class="primary-btn px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <font-awesome-icon :icon="['fas', 'cloud-arrow-up']" class="mr-2" />
            {{ uploading ? '上傳中…' : '開始上傳' }}
          </button>
        </form>
      </section>

      <!-- ============ Section B：YouTube 匯入 ============ -->
      <section class="card p-6 rounded-xl">
        <h2 class="text-lg font-semibold flex items-center gap-2 mb-1">
          <font-awesome-icon :icon="['fas', 'link']" class="accent-icon" />
          YouTube 匯入
        </h2>
        <p class="subtitle text-sm mb-4">貼上 YouTube 網址，自動下載並轉成自架影片</p>

        <form class="space-y-4" @submit.prevent="handleImport">
          <div>
            <label class="block text-sm field-label mb-1">YouTube 網址 *</label>
            <input
              v-model="importForm.url"
              type="url"
              required
              :disabled="importing"
              class="themed-input w-full px-4 py-2 rounded-lg focus:outline-none disabled:opacity-50"
              placeholder="https://www.youtube.com/watch?v=..."
            >
          </div>

          <div>
            <label class="block text-sm field-label mb-1">標題</label>
            <input
              v-model="importForm.title"
              type="text"
              :disabled="importing"
              class="themed-input w-full px-4 py-2 rounded-lg focus:outline-none disabled:opacity-50"
              placeholder="（選填，留空則用 YouTube 原標題）"
            >
          </div>

          <div>
            <label class="block text-sm field-label mb-2">可見性</label>
            <div class="flex gap-6">
              <label class="radio-label">
                <input v-model="importForm.visibility" type="radio" value="public" :disabled="importing">
                <span>公開</span>
              </label>
              <label class="radio-label">
                <input v-model="importForm.visibility" type="radio" value="private" :disabled="importing">
                <span>私有</span>
              </label>
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="importing" class="loading-box rounded-lg p-4 flex items-center gap-3">
            <font-awesome-icon :icon="['fas', 'spinner']" spin class="loading-icon" />
            <p class="text-sm">匯入中，正在從 YouTube 下載並轉檔，可能需要幾分鐘…</p>
          </div>

          <p v-if="importError" class="error-text text-sm flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
            {{ importError }}
          </p>

          <!-- Success card -->
          <div v-if="importResult" class="success-card rounded-lg p-4">
            <p class="font-medium flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'circle-check']" class="success-icon" />
              匯入成功！
            </p>
            <p class="subtitle text-sm mt-2">
              來源：{{ importResult.source_url }}（目前狀態：{{ importResult.status }}）
            </p>
            <div class="flex flex-wrap gap-3 mt-3">
              <a :href="`#/watch/${importResult.id}`" class="link-btn">
                <font-awesome-icon :icon="['fas', 'play']" /> 前往播放頁
              </a>
              <a :href="`#/admin/videos/${importResult.id}`" class="link-btn">
                <font-awesome-icon :icon="['fas', 'pen']" /> 編輯影片
              </a>
            </div>
          </div>

          <button
            type="submit"
            :disabled="importing || !importForm.url"
            class="primary-btn px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <font-awesome-icon :icon="['fas', importing ? 'spinner' : 'link']" :spin="importing" class="mr-2" />
            {{ importing ? '匯入中…' : '開始匯入' }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// ---------- Section A：檔案上傳 ----------
const fileInput = ref(null)
const uploadFile = ref(null)
const dragOver = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref('')
const uploadResult = ref(null)

const uploadForm = reactive({
  title: '',
  visibility: 'public',
})

const ALLOWED = ['video/mp4', 'video/quicktime', 'video/webm']

function triggerFilePick() {
  fileInput.value?.click()
}

function acceptFile(file) {
  if (!file) return
  const okType = ALLOWED.includes(file.type) || /\.(mp4|mov|webm)$/i.test(file.name)
  if (!okType) {
    uploadError.value = '檔案格式不支援，請選擇 mp4 / mov / webm 影片'
    return
  }
  uploadError.value = ''
  uploadFile.value = file
}

function handleFileChange(e) {
  acceptFile(e.target.files?.[0])
}

function handleDrop(e) {
  dragOver.value = false
  acceptFile(e.dataTransfer?.files?.[0])
}

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) return mb.toFixed(1) + ' MB'
  return (bytes / 1024).toFixed(0) + ' KB'
}

function handleUpload() {
  if (!uploadFile.value) {
    uploadError.value = '請先選擇要上傳的影片檔案'
    return
  }
  uploadError.value = ''
  uploadResult.value = null
  uploading.value = true
  uploadProgress.value = 0

  const formData = new FormData()
  formData.append('file', uploadFile.value)
  formData.append('title', uploadForm.title)
  formData.append('visibility', uploadForm.visibility)

  // 用 XMLHttpRequest 才能取得上傳進度
  const xhr = new XMLHttpRequest()
  xhr.open('POST', '/api/v1/studio/upload', true)
  xhr.withCredentials = true // 等同 fetch credentials: 'include'

  xhr.upload.onprogress = (evt) => {
    if (evt.lengthComputable) {
      uploadProgress.value = Math.round((evt.loaded / evt.total) * 100)
    }
  }

  xhr.onload = () => {
    uploading.value = false
    let json = null
    try {
      json = JSON.parse(xhr.responseText)
    } catch {
      json = null
    }

    if (xhr.status >= 200 && xhr.status < 300 && json?.success) {
      uploadResult.value = json.data
    } else if (xhr.status === 401) {
      uploadError.value = json?.error || '尚未登入，請先登入後再上傳'
    } else {
      uploadError.value = json?.error || `上傳失敗（HTTP ${xhr.status}）`
    }
  }

  xhr.onerror = () => {
    uploading.value = false
    uploadError.value = '上傳發生網路錯誤，請稍後再試'
  }

  xhr.send(formData)
}

// ---------- Section B：YouTube 匯入 ----------
const importing = ref(false)
const importError = ref('')
const importResult = ref(null)

const importForm = reactive({
  url: '',
  title: '',
  visibility: 'public',
})

async function handleImport() {
  if (!importForm.url.trim()) {
    importError.value = '請輸入 YouTube 網址'
    return
  }
  importError.value = ''
  importResult.value = null
  importing.value = true

  try {
    // 長時間任務：伺服器會以 yt-dlp 下載並轉檔，不設前端 timeout，耐心等待
    const res = await fetch('/api/v1/studio/import-yt', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: importForm.url.trim(),
        title: importForm.title,
        visibility: importForm.visibility,
      }),
    })

    let json = null
    try {
      json = await res.json()
    } catch {
      json = null
    }

    if (res.ok && json?.success) {
      importResult.value = json.data
    } else if (res.status === 401) {
      importError.value = json?.error || '尚未登入，請先登入後再匯入'
    } else {
      importError.value = json?.error || `匯入失敗（HTTP ${res.status}）`
    }
  } catch (err) {
    importError.value = '匯入發生錯誤：' + (err?.message || '未知錯誤')
  } finally {
    importing.value = false
  }
}
</script>

<style scoped>
.page-root {
  background-color: var(--bg-color);
  color: var(--primary-text-color);
}

.subtitle {
  color: var(--secondary-text-color);
}

.field-label {
  color: var(--secondary-text-color);
}

.accent-icon {
  color: var(--primary-color);
}

.error-text {
  color: var(--destructive-color);
}

/* Cards */
.card {
  background-color: var(--card-bg-color);
  border: 1px solid color-mix(in srgb, var(--primary-text-color) 8%, transparent);
}

/* Inputs (matches AdminVideoEdit) */
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

/* Drop zone */
.drop-zone {
  background-color: var(--search-bar-color);
  border: 2px dashed color-mix(in srgb, var(--primary-text-color) 20%, transparent);
}

.drop-zone:hover {
  border-color: var(--primary-color);
}

.drop-zone--active {
  border-color: var(--primary-color);
  background-color: color-mix(in srgb, var(--primary-color) 8%, var(--search-bar-color));
}

.drop-zone--has-file {
  border-style: solid;
  border-color: var(--primary-color);
}

.drop-icon {
  font-size: 2rem;
  color: var(--primary-color);
}

/* Radio */
.radio-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  color: var(--primary-text-color);
}

.radio-label input[type='radio'] {
  accent-color: var(--primary-color);
  width: 1rem;
  height: 1rem;
}

/* Progress bar */
.progress-track {
  height: 0.5rem;
  background-color: color-mix(in srgb, var(--primary-text-color) 12%, transparent);
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.2s ease;
}

/* Loading box */
.loading-box {
  background-color: var(--search-bar-color);
  border: 1px solid color-mix(in srgb, var(--primary-color) 30%, transparent);
}

.loading-icon {
  font-size: 1.25rem;
  color: var(--primary-color);
}

/* Success card */
.success-card {
  background-color: color-mix(in srgb, var(--primary-color) 8%, var(--card-bg-color));
  border: 1px solid color-mix(in srgb, var(--primary-color) 30%, transparent);
}

.success-icon {
  color: var(--primary-color);
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-color);
  text-decoration: none;
}

.link-btn:hover {
  text-decoration: underline;
}

/* Buttons */
.primary-btn {
  background-color: var(--primary-color);
  color: var(--text-with-main-color);
}

.primary-btn:hover:not(:disabled) {
  background-color: var(--primary-color-hover);
}
</style>
