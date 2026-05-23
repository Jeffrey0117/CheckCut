<template>
  <router-link
    :to="`/watch/${video.id}`"
    class="group block rounded-lg overflow-hidden bg-gray-800 hover:bg-gray-750 transition-colors"
  >
    <!-- Thumbnail -->
    <div class="relative aspect-video bg-gray-700">
      <img
        v-if="video.thumbnail_url"
        :src="video.thumbnail_url"
        :alt="video.title"
        class="w-full h-full object-cover"
        loading="lazy"
      >
      <div
        v-if="video.duration"
        class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded"
      >
        {{ formatDuration(video.duration) }}
      </div>
    </div>

    <!-- Info -->
    <div class="p-3">
      <h3 class="text-sm font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">
        {{ video.title }}
      </h3>
      <p v-if="video.person_name" class="mt-1 text-xs text-gray-400 truncate">
        {{ video.person_name }}
      </p>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  video: {
    type: Object,
    required: true,
  },
})

function formatDuration(seconds) {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>
