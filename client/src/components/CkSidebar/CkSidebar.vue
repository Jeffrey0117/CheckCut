<template>
  <aside
    class="fixed left-0 top-14 bottom-0 z-40 w-56 bg-gray-900 border-r border-gray-800 transform transition-transform duration-200 lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <nav class="flex flex-col py-4 px-3 gap-1">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        active-class="bg-gray-800 text-white"
        @click="$emit('close')"
      >
        <span class="w-5 text-center" v-html="item.icon"></span>
        <span>{{ item.label }}</span>
      </router-link>

      <template v-if="isAdmin">
        <hr class="border-gray-700 my-2">
        <router-link
          to="/admin"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-gray-800 text-white"
          @click="$emit('close')"
        >
          <span class="w-5 text-center">&#9881;</span>
          <span>Admin</span>
        </router-link>
      </template>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

defineProps({
  open: { type: Boolean, default: false },
})

defineEmits(['close'])

const store = useStore()
const isAdmin = computed(() => store.getters['user/getIsAdmin'])

const navItems = [
  { to: '/', label: 'Home', icon: '&#127968;' },
  { to: '/search', label: 'Search', icon: '&#128269;' },
  { to: '/favorites', label: 'Favorites', icon: '&#9829;' },
  { to: '/history', label: 'History', icon: '&#128337;' },
]
</script>
