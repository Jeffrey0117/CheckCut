<template>
  <router-link
    :to="`/watch/${video.id}`"
    class="video-card group block rounded-lg overflow-hidden transition-colors"
  >
    <!-- Thumbnail -->
    <div class="thumb relative aspect-video">
      <img
        v-if="video.thumbnail_url"
        :src="video.thumbnail_url"
        :alt="video.title"
        class="w-full h-full object-cover"
        loading="lazy"
      >
      <div
        v-if="video.duration"
        class="duration-badge absolute bottom-1.5 right-1.5 px-1.5 py-0.5 text-xs rounded"
      >
        {{ formatDuration(video.duration) }}
      </div>
    </div>

    <!-- Info -->
    <div class="p-3">
      <h3 class="title text-sm font-medium line-clamp-2 transition-colors">
        {{ video.title }}
      </h3>
      <p v-if="video.person_name" class="meta mt-1 text-xs truncate">
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

<style scoped>
.video-card {
  background: var(--card-bg-color);
}

.video-card:hover {
  background: var(--yt-bg-hover);
}

.thumb {
  background: var(--secondary-card-bg-color);
}

.duration-badge {
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
}

.title {
  color: var(--primary-text-color);
}

.video-card:hover .title {
  color: var(--primary-color);
}

.meta {
  color: var(--secondary-text-color);
}
</style>
