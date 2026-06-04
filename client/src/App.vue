<template>
  <div class="app min-h-screen bg-gray-950 text-white">
    <CkHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <CkSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Overlay for mobile sidebar -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main content -->
    <main class="lg:ml-56 pt-0">
      <router-view v-slot="{ Component }">
        <transition mode="out-in" name="fade">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import CkHeader from './components/CkHeader/CkHeader.vue'
import CkSidebar from './components/CkSidebar/CkSidebar.vue'
import { applyTheme } from './store/modules/settings.js'

const route = useRoute()
const store = useStore()
const sidebarOpen = ref(false)

onMounted(async () => {
  store.dispatch('grabUserSettings')
  store.dispatch('user/initializeUser')
  store.dispatch('favorites/initFavorites')
  store.dispatch('history/initHistory')
  updateTheme()
})

function updateTheme() {
  // Default LIGHT for first-time / no-saved-preference visitors.
  const baseTheme = store.getters.getBaseTheme || 'light'
  applyTheme(baseTheme, store.getters.getMainColor, store.getters.getSecColor)
}

watch(() => route.path, () => {
  sidebarOpen.value = false
  const title = route.meta?.title || 'CheckCut'
  document.title = title === 'CheckCut' ? title : `${title} - CheckCut`
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
