<template>
  <aside
    class="ck-sidebar fixed left-0 top-14 bottom-0 z-40 w-56 lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <nav class="ck-sidebar__nav">
      <p class="ck-sidebar__section-label">選單</p>

      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="ck-sidebar__item"
        active-class="ck-sidebar__item--active"
        @click="$emit('close')"
      >
        <span class="ck-sidebar__icon">
          <font-awesome-icon :icon="item.icon" />
        </span>
        <span class="ck-sidebar__label">{{ item.label }}</span>
      </router-link>

      <template v-if="isAdmin">
        <hr class="ck-sidebar__divider">
        <p class="ck-sidebar__section-label">管理</p>
        <router-link
          to="/admin"
          class="ck-sidebar__item"
          active-class="ck-sidebar__item--active"
          @click="$emit('close')"
        >
          <span class="ck-sidebar__icon">
            <font-awesome-icon :icon="['fas', 'gear']" />
          </span>
          <span class="ck-sidebar__label">管理後台</span>
        </router-link>
        <router-link
          to="/admin/studio"
          class="ck-sidebar__item"
          active-class="ck-sidebar__item--active"
          @click="$emit('close')"
        >
          <span class="ck-sidebar__icon">
            <font-awesome-icon :icon="['fas', 'clapperboard']" />
          </span>
          <span class="ck-sidebar__label">影片工作室</span>
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
  { to: '/', label: '首頁', icon: ['fas', 'house'] },
  { to: '/search', label: '搜尋', icon: ['fas', 'magnifying-glass'] },
  { to: '/favorites', label: '收藏', icon: ['fas', 'heart'] },
  { to: '/history', label: '觀看紀錄', icon: ['fas', 'clock-rotate-left'] },
]
</script>

<style scoped>
.ck-sidebar {
  display: flex;
  flex-direction: column;
  background-color: var(--side-nav-color);
  /* Subtle hairline divider that reads in both light and dark themes */
  border-right: 1px solid color-mix(in srgb, var(--side-nav-active-color) 28%, transparent);
  transition:
    transform var(--transition-duration) ease,
    background-color var(--transition-duration) ease;
  overflow: hidden;
}

.ck-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 10px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-color) transparent;
}

.ck-sidebar__nav::-webkit-scrollbar {
  width: 8px;
}

.ck-sidebar__nav::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-color);
  border-radius: 999px;
}

/* Section / group label */
.ck-sidebar__section-label {
  margin: 8px 10px 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--tertiary-text-color);
  user-select: none;
}

/* Nav item: icon + label row */
.ck-sidebar__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: var(--secondary-text-color);
  text-decoration: none;
  transition:
    background-color var(--transition-duration) ease,
    color var(--transition-duration) ease,
    transform var(--transition-duration) ease;
}

/* Left accent bar (hidden until active) */
.ck-sidebar__item::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 50%;
  height: 0;
  width: 3px;
  border-radius: 999px;
  background-color: var(--primary-color);
  transform: translateY(-50%);
  transition:
    height var(--transition-duration) ease,
    opacity var(--transition-duration) ease;
  opacity: 0;
}

.ck-sidebar__item:hover {
  background-color: var(--side-nav-hover-color);
  color: var(--side-nav-hover-text-color);
}

.ck-sidebar__item:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: -2px;
}

.ck-sidebar__item:active {
  transform: scale(0.985);
}

/* Active / selected state: subtle accent-tinted pill + accent bar */
.ck-sidebar__item--active {
  color: var(--side-nav-active-text-color);
  font-weight: 600;
  background-color: color-mix(in srgb, var(--primary-color) 16%, var(--side-nav-color));
}

.ck-sidebar__item--active:hover {
  background-color: color-mix(in srgb, var(--primary-color) 24%, var(--side-nav-color));
}

.ck-sidebar__item--active::before {
  height: 60%;
  opacity: 1;
}

.ck-sidebar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 17px;
  line-height: 1;
  flex-shrink: 0;
  transition: transform var(--transition-duration) ease;
}

.ck-sidebar__item:hover .ck-sidebar__icon {
  transform: scale(1.08);
}

.ck-sidebar__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ck-sidebar__divider {
  height: 1px;
  margin: 10px 8px;
  border: 0;
  background-color: color-mix(in srgb, var(--side-nav-active-color) 30%, transparent);
}

/* Narrow widths: keep usable, tighten spacing */
@media (max-width: 480px) {
  .ck-sidebar__nav {
    padding: 10px 8px;
  }
}
</style>
